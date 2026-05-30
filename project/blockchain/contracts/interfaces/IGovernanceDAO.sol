// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IGovernanceDAO {
    enum ProposalType { ParameterChange, FundAllocation, ContractUpgrade, Emergency }
    enum ProposalState { Pending, Active, Defeated, Succeeded, Queued, Executed, Cancelled, Expired }

    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        bytes[] calldatas;
        address[] targets;
        uint256[] values;
        ProposalType proposalType;
        ProposalState state;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 quorum;
        uint256 timelockId;
        bool executed;
        bool cancelled;
    }

    struct Vote {
        bool support;
        uint256 votes;
        bool cast;
    }

    error ProposalNotFound(uint256 proposalId);
    error ProposalNotActive();
    error ProposalAlreadyExecuted();
    error ProposalAlreadyCancelled();
    error InsufficientVotingPower(uint256 has, uint256 required);
    error AlreadyVoted();
    error QuorumNotMet(uint256 currentVotes, uint256 quorum);
    error VotingPeriodEnded();
    error VotingPeriodNotEnded();
    error NotProposer();
    error InvalidDelegate();
    error TimelockNotCompleted();
    error EmergencyExecutionFailed();
    error AlreadyInitialized();

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title, ProposalType proposalType);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event ProposalQueued(uint256 indexed proposalId, uint256 timelockId);
    event Delegated(address indexed delegator, address indexed delegatee);
    event DelegationRevoked(address indexed delegator, address indexed delegatee);
    event VotingPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event QuorumUpdated(uint256 oldQuorum, uint256 newQuorum);
    event TimelockDurationUpdated(uint256 oldDuration, uint256 newDuration);
    event TreasuryWithdrawal(address indexed to, uint256 amount);

    function createProposal(string calldata title, string calldata description, address[] calldata targets, uint256[] calldata values, bytes[] calldata calldatas, ProposalType proposalType) external returns (uint256);
    function castVote(uint256 proposalId, bool support) external;
    function castVoteWithReason(uint256 proposalId, bool support, string calldata reason) external;
    function queueProposal(uint256 proposalId) external;
    function executeProposal(uint256 proposalId) external;
    function cancelProposal(uint256 proposalId) external;
    function delegate(address delegatee) external;
    function revokeDelegation() external;
    function emergencyExecute(address target, uint256 value, bytes calldata data) external;
    function updateVotingPeriod(uint256 newVotingPeriod) external;
    function updateQuorum(uint256 newQuorum) external;
    function updateTimelockDuration(uint256 newDuration) external;
    function withdrawTreasury(address to, uint256 amount) external;
    function getProposal(uint256 proposalId) external view returns (Proposal memory);
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory);
    function getDelegate(address delegator) external view returns (address);
    function getVotingPower(address account) external view returns (uint256);
    function getProposalCount() external view returns (uint256);
    function getQuorum() external view returns (uint256);
    function getVotingPeriod() external view returns (uint256);
    function getTimelockDuration() external view returns (uint256);
}
