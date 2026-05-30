// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ICyberInsurance.sol";
import "./interfaces/IShieldNetToken.sol";

contract CyberInsurance is ICyberInsurance, AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RISK_ORACLE_ROLE = keccak256("RISK_ORACLE_ROLE");
    bytes32 public constant CLAIM_APPROVER_ROLE = keccak256("CLAIM_APPROVER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_PREMIUM = 0.001 ether;
    uint256 public constant MAX_COVERAGE_RATIO = 100;
    uint256 public constant APPROVAL_THRESHOLD = 2;
    uint256 public constant MIN_PERIOD = 30 days;
    uint256 public constant MAX_PERIOD = 365 days;
    uint256 public constant MIN_RISK_SCORE = 1;
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant DISCOUNT_DENOMINATOR = 100;

    IShieldNetToken public shieldNetToken;
    address public premiumPool;
    uint256 private _policyCounter;
    uint256 private _claimCounter;
    bool private _initialized;

    mapping(uint256 => Policy) private _policies;
    mapping(uint256 => Claim) private _claims;
    mapping(uint256 => mapping(address => bool)) private _claimApprovals;
    mapping(uint256 => uint256) private _policyRiskScores;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }

    function initialize(address tokenAddress, address poolAddress) external onlyRole(ADMIN_ROLE) {
        if (_initialized) revert AlreadyInitialized();
        shieldNetToken = IShieldNetToken(tokenAddress);
        premiumPool = poolAddress;
        _initialized = true;
    }

    modifier onlyInitialized() {
        if (!_initialized) revert AlreadyInitialized();
        _;
    }

    modifier validPolicy(uint256 policyId) {
        if (policyId == 0 || policyId > _policyCounter) revert PolicyNotFound(policyId);
        _;
    }

    modifier validClaim(uint256 claimId) {
        if (claimId == 0 || claimId > _claimCounter) revert ClaimNotFound(claimId);
        _;
    }

    function createPolicy(address holder, uint256 coverageAmount, uint256 period, uint256 riskScore) external onlyRole(ADMIN_ROLE) onlyInitialized returns (uint256) {
        if (riskScore < MIN_RISK_SCORE || riskScore > MAX_RISK_SCORE) revert RiskScoreOutOfBounds(riskScore);
        if (period < MIN_PERIOD || period > MAX_PERIOD) revert InvalidDuration();
        if (holder == address(0)) revert NotPolicyHolder();

        uint256 premium = calculatePremium(coverageAmount, riskScore, period);
        _policyCounter++;

        RiskLevel riskLevel = _determineRiskLevel(riskScore);

        _policies[_policyCounter] = Policy({
            id: _policyCounter,
            holder: holder,
            coverageAmount: coverageAmount,
            premium: premium,
            riskScore: riskScore,
            startDate: block.timestamp,
            expiryDate: block.timestamp + period,
            period: period,
            state: PolicyState.Active,
            riskLevel: riskLevel,
            claimCount: 0,
            goodBehaviorDiscount: 0
        });

        _policyRiskScores[_policyCounter] = riskScore;

        emit PolicyCreated(_policyCounter, holder, coverageAmount, premium);
        return _policyCounter;
    }

    function payPremium(uint256 policyId) external payable nonReentrant validPolicy(policyId) onlyInitialized {
        Policy storage policy = _policies[policyId];
        if (policy.state != PolicyState.Active) revert PolicyNotActive();
        if (block.timestamp >= policy.expiryDate) revert PolicyExpired();
        if (msg.value < policy.premium) revert PremiumPaymentFailed();

        uint256 excess = msg.value - policy.premium;
        if (excess > 0) {
            (bool success, ) = payable(msg.sender).call{value: excess}("");
            if (!success) revert PremiumPaymentFailed();
        }

        emit PremiumPaid(policyId, policy.premium);
    }

    function submitClaim(uint256 policyId, uint256 amount, string calldata description, string calldata evidenceURI) external nonReentrant validPolicy(policyId) onlyInitialized returns (uint256) {
        Policy storage policy = _policies[policyId];
        if (policy.holder != _msgSender()) revert NotPolicyHolder();
        if (policy.state != PolicyState.Active) revert PolicyNotActive();
        if (block.timestamp >= policy.expiryDate) revert PolicyExpired();
        if (amount > policy.coverageAmount) revert InsufficientCoverage(amount, policy.coverageAmount);

        _claimCounter++;
        policy.state = PolicyState.Claimed;

        _claims[_claimCounter] = Claim({
            id: _claimCounter,
            policyId: policyId,
            claimant: _msgSender(),
            amount: amount,
            description: description,
            evidenceURI: evidenceURI,
            submissionDate: block.timestamp,
            state: ClaimState.Submitted,
            approvalCount: 0,
            disputed: false,
            disputeReason: "",
            resolver: address(0)
        });

        emit ClaimSubmitted(_claimCounter, policyId, _msgSender(), amount);
        return _claimCounter;
    }

    function approveClaim(uint256 claimId) external onlyRole(CLAIM_APPROVER_ROLE) nonReentrant validClaim(claimId) onlyInitialized {
        Claim storage claim = _claims[claimId];
        if (claim.state != ClaimState.Submitted && claim.state != ClaimState.UnderReview) revert ClaimAlreadyProcessed();
        if (_claimApprovals[claimId][_msgSender()]) revert ClaimAlreadyProcessed();

        _claimApprovals[claimId][_msgSender()] = true;
        claim.approvalCount++;
        claim.state = ClaimState.UnderReview;

        if (claim.approvalCount >= APPROVAL_THRESHOLD) {
            _processClaimApproval(claimId);
        }
    }

    function rejectClaim(uint256 claimId, string calldata reason) external onlyRole(CLAIM_APPROVER_ROLE) nonReentrant validClaim(claimId) onlyInitialized {
        Claim storage claim = _claims[claimId];
        if (claim.state != ClaimState.Submitted && claim.state != ClaimState.UnderReview) revert ClaimAlreadyProcessed();

        claim.state = ClaimState.Rejected;

        Policy storage policy = _policies[claim.policyId];
        policy.state = PolicyState.Active;

        emit ClaimRejected(claimId, claim.policyId, reason);
    }

    function disputeClaim(uint256 claimId, string calldata reason) external validClaim(claimId) onlyInitialized {
        Claim storage claim = _claims[claimId];
        Policy storage policy = _policies[claim.policyId];

        if (claim.claimant != _msgSender() && !hasRole(ADMIN_ROLE, _msgSender())) revert NotAuthorized();
        if (claim.state != ClaimState.Rejected) revert ClaimAlreadyProcessed();

        claim.disputed = true;
        claim.disputeReason = reason;
        claim.state = ClaimState.Disputed;

        emit ClaimDisputed(claimId, reason);
    }

    function resolveDispute(uint256 claimId, bool approveClaim_) external onlyRole(ADMIN_ROLE) validClaim(claimId) onlyInitialized {
        Claim storage claim = _claims[claimId];
        if (claim.state != ClaimState.Disputed) revert ClaimAlreadyProcessed();

        claim.resolver = _msgSender();

        if (approveClaim_) {
            claim.state = ClaimState.Resolved;
            _processClaimApproval(claimId);
        } else {
            claim.state = ClaimState.Rejected;
            Policy storage policy = _policies[claim.policyId];
            policy.state = PolicyState.Active;
        }

        emit DisputeResolved(claimId, approveClaim_);
    }

    function renewPolicy(uint256 policyId) external nonReentrant validPolicy(policyId) onlyInitialized {
        Policy storage policy = _policies[policyId];
        if (policy.holder != _msgSender()) revert NotPolicyHolder();
        if (policy.state != PolicyState.Expired && policy.state != PolicyState.Active) revert PolicyNotActive();

        if (block.timestamp >= policy.expiryDate) {
            policy.state = PolicyState.Expired;
        }

        uint256 discount = policy.goodBehaviorDiscount;
        uint256 newPremium = policy.premium;
        if (discount > 0) {
            newPremium = newPremium - (newPremium * discount / DISCOUNT_DENOMINATOR);
        }

        policy.startDate = block.timestamp;
        policy.expiryDate = block.timestamp + policy.period;
        policy.state = PolicyState.Active;

        emit PolicyRenewed(policyId, policy.expiryDate);
    }

    function cancelPolicy(uint256 policyId) external validPolicy(policyId) onlyInitialized {
        Policy storage policy = _policies[policyId];
        if (policy.holder != _msgSender() && !hasRole(ADMIN_ROLE, _msgSender())) revert NotAuthorized();
        if (policy.state != PolicyState.Active) revert PolicyNotActive();

        policy.state = PolicyState.Cancelled;
        emit PolicyCancelled(policyId);
    }

    function updateRiskScore(uint256 policyId, uint256 newRiskScore) external onlyRole(RISK_ORACLE_ROLE) validPolicy(policyId) onlyInitialized {
        if (newRiskScore < MIN_RISK_SCORE || newRiskScore > MAX_RISK_SCORE) revert RiskScoreOutOfBounds(newRiskScore);
        _policyRiskScores[policyId] = newRiskScore;
        _policies[policyId].riskScore = newRiskScore;
        _policies[policyId].riskLevel = _determineRiskLevel(newRiskScore);
    }

    function updateGoodBehavior(uint256 policyId, uint256 discount) external onlyRole(ADMIN_ROLE) validPolicy(policyId) onlyInitialized {
        if (discount > 50) revert NotAuthorized();
        _policies[policyId].goodBehaviorDiscount = discount;
        emit DiscountUpdated(policyId, discount);
    }

    function getPolicyDetails(uint256 policyId) external view validPolicy(policyId) returns (Policy memory) {
        return _policies[policyId];
    }

    function getClaimDetails(uint256 claimId) external view validClaim(claimId) returns (Claim memory) {
        return _claims[claimId];
    }

    function calculatePremium(uint256 coverageAmount, uint256 riskScore, uint256 period) public pure returns (uint256) {
        uint256 baseRate = (coverageAmount * 5) / 100;
        uint256 riskMultiplier = (BASIS_POINTS + (riskScore * 50)) / BASIS_POINTS;
        uint256 timeMultiplier = (BASIS_POINTS + ((period - MIN_PERIOD) * 10 / (MAX_PERIOD - MIN_PERIOD) * 50)) / BASIS_POINTS;
        uint256 premium = (baseRate * riskMultiplier * timeMultiplier) / 1e6;
        return premium < MIN_PREMIUM ? MIN_PREMIUM : premium;
    }

    function getPremiumPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    function _processClaimApproval(uint256 claimId) internal {
        Claim storage claim = _claims[claimId];
        Policy storage policy = _policies[claim.policyId];

        claim.state = ClaimState.Approved;
        policy.state = PolicyState.Claimed;

        (bool success, ) = payable(claim.claimant).call{value: claim.amount}("");
        if (!success) revert TransferFailed();

        policy.claimCount++;

        emit ClaimApproved(claimId, claim.policyId, claim.amount);
    }

    function _determineRiskLevel(uint256 riskScore) internal pure returns (RiskLevel) {
        if (riskScore <= 25) return RiskLevel.Low;
        if (riskScore <= 50) return RiskLevel.Medium;
        if (riskScore <= 75) return RiskLevel.High;
        return RiskLevel.Critical;
    }
}
