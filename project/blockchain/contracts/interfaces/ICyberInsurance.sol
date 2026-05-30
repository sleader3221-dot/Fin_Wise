// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICyberInsurance {
    enum PolicyState { Active, Expired, Cancelled, Claimed }
    enum ClaimState { Submitted, UnderReview, Approved, Rejected, Disputed, Resolved }
    enum RiskLevel { Low, Medium, High, Critical }

    struct Policy {
        uint256 id;
        address holder;
        uint256 coverageAmount;
        uint256 premium;
        uint256 riskScore;
        uint256 startDate;
        uint256 expiryDate;
        uint256 period;
        PolicyState state;
        RiskLevel riskLevel;
        uint256 claimCount;
        uint256 goodBehaviorDiscount;
    }

    struct Claim {
        uint256 id;
        uint256 policyId;
        address claimant;
        uint256 amount;
        string description;
        string evidenceURI;
        uint256 submissionDate;
        ClaimState state;
        uint256 approvalCount;
        bool disputed;
        string disputeReason;
        address resolver;
    }

    error PolicyNotFound(uint256 policyId);
    error ClaimNotFound(uint256 claimId);
    error NotPolicyHolder();
    error PolicyExpired();
    error PolicyNotActive();
    error InsufficientCoverage(uint256 requested, uint256 available);
    error PremiumPaymentFailed();
    error ClaimAlreadyProcessed();
    error InsufficientApprovals(uint256 current, uint256 required);
    error RiskScoreOutOfBounds(uint256 score);
    error ContractPaused();
    error AlreadyInitialized();
    error InvalidDuration();
    error NotAuthorized();

    event PolicyCreated(uint256 indexed policyId, address indexed holder, uint256 coverageAmount, uint256 premium);
    event PremiumPaid(uint256 indexed policyId, uint256 amount);
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant, uint256 amount);
    event ClaimApproved(uint256 indexed claimId, uint256 indexed policyId, uint256 amount);
    event ClaimRejected(uint256 indexed claimId, uint256 indexed policyId, string reason);
    event PolicyRenewed(uint256 indexed policyId, uint256 newExpiry);
    event PolicyCancelled(uint256 indexed policyId);
    event ClaimDisputed(uint256 indexed claimId, string reason);
    event DisputeResolved(uint256 indexed claimId, bool approved);
    event DiscountUpdated(uint256 indexed policyId, uint256 discount);
    event PremiumPoolUpdated(uint256 newBalance);

    function createPolicy(address holder, uint256 coverageAmount, uint256 period, uint256 riskScore) external returns (uint256);
    function payPremium(uint256 policyId) external payable;
    function submitClaim(uint256 policyId, uint256 amount, string calldata description, string calldata evidenceURI) external returns (uint256);
    function approveClaim(uint256 claimId) external;
    function rejectClaim(uint256 claimId, string calldata reason) external;
    function disputeClaim(uint256 claimId, string calldata reason) external;
    function resolveDispute(uint256 claimId, bool approveClaim) external;
    function renewPolicy(uint256 policyId) external;
    function cancelPolicy(uint256 policyId) external;
    function updateRiskScore(uint256 policyId, uint256 newRiskScore) external;
    function getPolicyDetails(uint256 policyId) external view returns (Policy memory);
    function getClaimDetails(uint256 claimId) external view returns (Claim memory);
    function calculatePremium(uint256 coverageAmount, uint256 riskScore, uint256 period) external pure returns (uint256);
    function getPremiumPoolBalance() external view returns (uint256);
}
