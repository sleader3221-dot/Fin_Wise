// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IThreatIntelligence {
    enum Severity { Low, Medium, High, Critical }
    enum ReportState { Submitted, Verified, Rejected, Disputed }

    struct ThreatReport {
        uint256 id;
        address reporter;
        string threatType;
        string description;
        string evidenceURI;
        Severity severity;
        ReportState state;
        uint256 timestamp;
        uint256 validatorCount;
        uint256 rewardAmount;
        bool frozen;
    }

    struct Validator {
        address validator;
        uint256 stake;
        uint256 reputation;
        uint256 totalReportsValidated;
        uint256 correctValidations;
        uint256 incorrectValidations;
        bool isActive;
    }

    error ReportNotFound(uint256 reportId);
    error InsufficientStake(uint256 required, uint256 actual);
    error AlreadySubmitted();
    error NotValidator();
    error ReportAlreadyProcessed();
    error InsufficientPayment(uint256 required, uint256 sent);
    error DataFrozen();
    error SlashingFailed();
    error AlreadyInitialized();

    event ThreatReported(uint256 indexed reportId, address indexed reporter, string threatType, Severity severity);
    event ReportVerified(uint256 indexed reportId, address indexed validator, bool valid);
    event ReportRejected(uint256 indexed reportId, address indexed validator, string reason);
    event ReporterRewarded(uint256 indexed reportId, address indexed reporter, uint256 amount);
    event ValidatorStaked(address indexed validator, uint256 amount);
    event ValidatorSlashed(address indexed validator, uint256 amount, string reason);
    event ReputationUpdated(address indexed reporter, uint256 newReputation);
    event DataFreezeToggled(bool frozen);
    event ThreatDataQueried(address indexed querier, uint256 reportId, uint256 payment);

    function submitThreatReport(string calldata threatType, string calldata description, string calldata evidenceURI, Severity severity) external returns (uint256);
    function verifyReport(uint256 reportId, bool isValid) external;
    function rejectReport(uint256 reportId, string calldata reason) external;
    function queryThreatData(uint256 reportId) external payable returns (ThreatReport memory);
    function stakeTokens(uint256 amount) external;
    function unstakeTokens(uint256 amount) external;
    function toggleDataFreeze() external;
    function getReport(uint256 reportId) external view returns (ThreatReport memory);
    function getValidator(address validator) external view returns (Validator memory);
    function getReputation(address reporter) external view returns (uint256);
    function isDataFrozen() external view returns (bool);
    function getTotalReports() external view returns (uint256);
}
