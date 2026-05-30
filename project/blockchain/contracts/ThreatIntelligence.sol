// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IThreatIntelligence.sol";
import "./interfaces/IShieldNetToken.sol";

contract ThreatIntelligence is IThreatIntelligence, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant FREEZER_ROLE = keccak256("FREEZER_ROLE");

    uint256 public constant MIN_STAKE = 1000 * 10 ** 18;
    uint256 public constant SLASH_PERCENTAGE = 1000;
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant QUERY_FEE = 0.01 ether;
    uint256 public constant MAX_REPORTS_PER_VALIDATOR = 50;

    IShieldNetToken public shieldNetToken;
    uint256 private _reportCounter;
    bool private _dataFrozen;
    bool private _initialized;
    uint256 private _totalStaked;

    mapping(uint256 => ThreatReport) private _reports;
    mapping(address => Validator) private _validators;
    mapping(address => uint256) private _reputations;
    mapping(uint256 => mapping(address => bool)) private _reportValidations;
    mapping(address => uint256[]) private _validatorReports;
    address[] private _validatorList;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(FREEZER_ROLE, msg.sender);
    }

    function initialize(address tokenAddress) external onlyRole(ADMIN_ROLE) {
        if (_initialized) revert AlreadyInitialized();
        shieldNetToken = IShieldNetToken(tokenAddress);
        _initialized = true;
    }

    modifier onlyInitialized() {
        if (!_initialized) revert AlreadyInitialized();
        _;
    }

    modifier whenNotFrozen() {
        if (_dataFrozen) revert DataFrozen();
        _;
    }

    modifier onlyValidator() {
        if (!hasRole(VALIDATOR_ROLE, _msgSender())) revert NotValidator();
        _;
    }

    modifier validReport(uint256 reportId) {
        if (reportId == 0 || reportId > _reportCounter) revert ReportNotFound(reportId);
        _;
    }

    function submitThreatReport(string calldata threatType, string calldata description, string calldata evidenceURI, Severity severity) external whenNotFrozen onlyInitialized returns (uint256) {
        _reportCounter++;

        _reports[_reportCounter] = ThreatReport({
            id: _reportCounter,
            reporter: _msgSender(),
            threatType: threatType,
            description: description,
            evidenceURI: evidenceURI,
            severity: severity,
            state: ReportState.Submitted,
            timestamp: block.timestamp,
            validatorCount: 0,
            rewardAmount: 0,
            frozen: false
        });

        emit ThreatReported(_reportCounter, _msgSender(), threatType, severity);
        return _reportCounter;
    }

    function verifyReport(uint256 reportId, bool isValid) external onlyValidator nonReentrant validReport(reportId) whenNotFrozen onlyInitialized {
        ThreatReport storage report = _reports[reportId];
        if (report.state != ReportState.Submitted) revert ReportAlreadyProcessed();
        if (_reportValidations[reportId][_msgSender()]) revert AlreadySubmitted();

        _reportValidations[reportId][_msgSender()] = true;
        report.validatorCount++;

        Validator storage validator = _validators[_msgSender()];
        validator.totalReportsValidated++;

        uint256 rewardAmount = _calculateReward(report.severity);

        if (isValid) {
            validator.correctValidations++;
            _reputations[_msgSender()] += 10;

            if (report.validatorCount >= 3) {
                report.state = ReportState.Verified;
                report.rewardAmount = rewardAmount;

                if (rewardAmount > 0 && address(shieldNetToken) != address(0)) {
                    shieldNetToken.mint(report.reporter, rewardAmount);
                    emit ReporterRewarded(reportId, report.reporter, rewardAmount);
                }

                emit ReputationUpdated(report.reporter, _reputations[report.reporter]);
            }
        } else {
            validator.incorrectValidations++;
            _reputations[_msgSender()] -= 5;
        }

        emit ReportVerified(reportId, _msgSender(), isValid);
    }

    function rejectReport(uint256 reportId, string calldata reason) external onlyValidator validReport(reportId) whenNotFrozen onlyInitialized {
        ThreatReport storage report = _reports[reportId];
        if (report.state != ReportState.Submitted) revert ReportAlreadyProcessed();

        report.state = ReportState.Rejected;
        _reputations[report.reporter] -= 20;

        emit ReportRejected(reportId, _msgSender(), reason);
    }

    function queryThreatData(uint256 reportId) external payable validReport(reportId) whenNotFrozen onlyInitialized returns (ThreatReport memory) {
        if (msg.value < QUERY_FEE) revert InsufficientPayment(QUERY_FEE, msg.value);

        emit ThreatDataQueried(_msgSender(), reportId, msg.value);
        return _reports[reportId];
    }

    function stakeTokens(uint256 amount) external nonReentrant onlyInitialized {
        if (!hasRole(VALIDATOR_ROLE, _msgSender())) {
            _grantRole(VALIDATOR_ROLE, _msgSender());
        }

        Validator storage validator = _validators[_msgSender()];
        if (validator.stake == 0) {
            _validatorList.push(_msgSender());
        }

        shieldNetToken.transferFrom(_msgSender(), address(this), amount);
        validator.stake += amount;
        validator.isActive = true;
        _totalStaked += amount;

        emit ValidatorStaked(_msgSender(), amount);
    }

    function unstakeTokens(uint256 amount) external nonReentrant onlyInitialized {
        Validator storage validator = _validators[_msgSender()];
        if (validator.stake < amount) revert InsufficientStake(validator.stake, amount);

        uint256 remaining = validator.stake - amount;
        if (remaining < MIN_STAKE && remaining > 0) {
            revert InsufficientStake(MIN_STAKE, remaining);
        }

        validator.stake -= amount;
        _totalStaked -= amount;
        shieldNetToken.transfer(_msgSender(), amount);

        if (validator.stake == 0) {
            validator.isActive = false;
        }
    }

    function toggleDataFreeze() external onlyRole(FREEZER_ROLE) {
        _dataFrozen = !_dataFrozen;
        emit DataFreezeToggled(_dataFrozen);
    }

    function slashValidator(address validator, uint256 amount, string calldata reason) external onlyRole(ADMIN_ROLE) nonReentrant onlyInitialized {
        Validator storage v = _validators[validator];
        if (v.stake < amount) revert SlashingFailed();

        v.stake -= amount;
        _totalStaked -= amount;
        v.incorrectValidations++;

        uint256 burnAmount = amount / 2;
        uint256 rewardAmount = amount - burnAmount;

        shieldNetToken.transfer(address(this), amount);

        emit ValidatorSlashed(validator, amount, reason);
    }

    function getReport(uint256 reportId) external view validReport(reportId) returns (ThreatReport memory) {
        return _reports[reportId];
    }

    function getValidator(address validator) external view returns (Validator memory) {
        return _validators[validator];
    }

    function getReputation(address reporter) external view returns (uint256) {
        return _reputations[reporter];
    }

    function isDataFrozen() external view returns (bool) {
        return _dataFrozen;
    }

    function getTotalReports() external view returns (uint256) {
        return _reportCounter;
    }

    function getTotalStaked() external view returns (uint256) {
        return _totalStaked;
    }

    function getValidatorCount() external view returns (uint256) {
        return _validatorList.length;
    }

    function getValidatorAt(uint256 index) external view returns (address) {
        return _validatorList[index];
    }

    function pauseContract() external onlyRole(ADMIN_ROLE) {
        _dataFrozen = true;
        emit DataFreezeToggled(true);
    }

    function _calculateReward(Severity severity) internal pure returns (uint256) {
        if (severity == Severity.Low) return 10 * 10 ** 18;
        if (severity == Severity.Medium) return 50 * 10 ** 18;
        if (severity == Severity.High) return 200 * 10 ** 18;
        if (severity == Severity.Critical) return 500 * 10 ** 18;
        return 0;
    }
}
