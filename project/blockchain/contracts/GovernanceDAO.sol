// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IGovernanceDAO.sol";
import "./interfaces/IShieldNetToken.sol";

contract GovernanceDAO is IGovernanceDAO, AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant EMERGENCY_EXECUTOR_ROLE = keccak256("EMERGENCY_EXECUTOR_ROLE");
    bytes32 public constant TIMELOCK_ADMIN_ROLE = keccak256("TIMELOCK_ADMIN_ROLE");

    uint256 public constant MIN_PROPOSAL_DELAY = 1 days;
    uint256 public constant MAX_PROPOSAL_DELAY = 30 days;
    uint256 public constant MIN_QUORUM = 1;
    uint256 public constant MAX_QUORUM = 50;
    uint256 public constant MIN_TIMELOCK = 1 days;
    uint256 public constant MAX_TIMELOCK = 7 days;
    uint256 public constant BASIS_POINTS = 10000;

    IShieldNetToken public shieldNetToken;
    uint256 public votingPeriod;
    uint256 public quorum;
    uint256 public timelockDuration;
    uint256 private _proposalCount;

    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => mapping(address => Vote)) private _votes;
    mapping(address => address) private _delegations;
    mapping(address => uint256) private _delegatedPower;
    bool private _initialized;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_EXECUTOR_ROLE, msg.sender);
        _grantRole(TIMELOCK_ADMIN_ROLE, msg.sender);

        votingPeriod = 3 days;
        quorum = 4;
        timelockDuration = 2 days;
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

    modifier validProposal(uint256 proposalId) {
        if (proposalId == 0 || proposalId > _proposalCount) revert ProposalNotFound(proposalId);
        _;
    }

    function createProposal(
        string calldata title,
        string calldata description,
        address[] calldata targets,
        uint256[] calldata values,
        bytes[] calldata calldatas,
        ProposalType proposalType
    ) external onlyInitialized returns (uint256) {
        if (targets.length == 0) revert ProposalNotFound(0);
        if (targets.length != values.length || targets.length != calldatas.length) revert ProposalNotFound(0);

        _proposalCount++;

        uint256 quorumRequired = quorum;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + votingPeriod;

        _proposals[_proposalCount] = Proposal({
            id: _proposalCount,
            proposer: _msgSender(),
            title: title,
            description: description,
            calldatas: calldatas,
            targets: targets,
            values: values,
            proposalType: proposalType,
            state: ProposalState.Pending,
            startTime: startTime,
            endTime: endTime,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            quorum: quorumRequired,
            timelockId: 0,
            executed: false,
            cancelled: false
        });

        emit ProposalCreated(_proposalCount, _msgSender(), title, proposalType);
        return _proposalCount;
    }

    function castVote(uint256 proposalId, bool support) external validProposal(proposalId) onlyInitialized {
        _castVote(proposalId, support, "");
    }

    function castVoteWithReason(uint256 proposalId, bool support, string calldata reason) external validProposal(proposalId) onlyInitialized {
        _castVote(proposalId, support, reason);
    }

    function _castVote(uint256 proposalId, bool support, string memory reason) internal {
        Proposal storage proposal = _proposals[proposalId];
        if (block.timestamp < proposal.startTime) revert ProposalNotActive();
        if (block.timestamp >= proposal.endTime) revert VotingPeriodEnded();
        if (proposal.state != ProposalState.Pending && proposal.state != ProposalState.Active) revert ProposalNotActive();

        proposal.state = ProposalState.Active;

        Vote storage vote = _votes[proposalId][_msgSender()];
        if (vote.cast) revert AlreadyVoted();

        uint256 votingPower = getVotingPower(_msgSender());
        if (votingPower == 0) revert InsufficientVotingPower(0, 1);

        vote.support = support;
        vote.votes = votingPower;
        vote.cast = true;

        if (support) {
            proposal.forVotes += votingPower;
        } else {
            proposal.againstVotes += votingPower;
        }

        emit VoteCast(proposalId, _msgSender(), support, votingPower);
    }

    function queueProposal(uint256 proposalId) external onlyRole(TIMELOCK_ADMIN_ROLE) validProposal(proposalId) onlyInitialized {
        Proposal storage proposal = _proposals[proposalId];
        if (block.timestamp < proposal.endTime) revert VotingPeriodNotEnded();
        if (proposal.state != ProposalState.Active && proposal.state != ProposalState.Pending) revert ProposalNotActive();
        if (proposal.cancelled) revert ProposalAlreadyCancelled();

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        if (totalVotes < proposal.quorum) revert QuorumNotMet(totalVotes, proposal.quorum);
        if (proposal.forVotes <= proposal.againstVotes) {
            proposal.state = ProposalState.Defeated;
            return;
        }

        proposal.state = ProposalState.Succeeded;
        emit ProposalQueued(proposalId, block.timestamp + timelockDuration);
    }

    function executeProposal(uint256 proposalId) external nonReentrant validProposal(proposalId) onlyInitialized {
        Proposal storage proposal = _proposals[proposalId];
        if (proposal.state != ProposalState.Succeeded) revert ProposalNotActive();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalAlreadyCancelled();

        proposal.state = ProposalState.Queued;
        proposal.executed = true;

        for (uint256 i = 0; i < proposal.targets.length; i++) {
            (bool success, ) = proposal.targets[i].call{value: proposal.values[i]}(proposal.calldatas[i]);
            if (!success) revert ProposalNotFound(proposalId);
        }

        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external validProposal(proposalId) {
        Proposal storage proposal = _proposals[proposalId];
        if (!hasRole(ADMIN_ROLE, _msgSender()) && proposal.proposer != _msgSender()) revert NotProposer();
        if (proposal.executed) revert ProposalAlreadyExecuted();
        if (proposal.cancelled) revert ProposalAlreadyCancelled();
        if (proposal.state == ProposalState.Executed) revert ProposalAlreadyExecuted();

        proposal.cancelled = true;
        proposal.state = ProposalState.Cancelled;

        emit ProposalCancelled(proposalId);
    }

    function delegate(address delegatee) external onlyInitialized {
        if (delegatee == address(0)) revert InvalidDelegate();
        if (delegatee == _msgSender()) revert InvalidDelegate();

        _delegations[_msgSender()] = delegatee;
        emit Delegated(_msgSender(), delegatee);
    }

    function revokeDelegation() external onlyInitialized {
        delete _delegations[_msgSender()];
        emit DelegationRevoked(_msgSender(), _msgSender());
    }

    function emergencyExecute(address target, uint256 value, bytes calldata data) external onlyRole(EMERGENCY_EXECUTOR_ROLE) nonReentrant onlyInitialized {
        (bool success, ) = target.call{value: value}(data);
        if (!success) revert EmergencyExecutionFailed();

        emit ProposalExecuted(0);
    }

    function updateVotingPeriod(uint256 newVotingPeriod) external onlyRole(ADMIN_ROLE) onlyInitialized {
        if (newVotingPeriod < MIN_PROPOSAL_DELAY || newVotingPeriod > MAX_PROPOSAL_DELAY) revert InvalidDelegate();
        uint256 oldPeriod = votingPeriod;
        votingPeriod = newVotingPeriod;
        emit VotingPeriodUpdated(oldPeriod, newVotingPeriod);
    }

    function updateQuorum(uint256 newQuorum) external onlyRole(ADMIN_ROLE) onlyInitialized {
        if (newQuorum < MIN_QUORUM || newQuorum > MAX_QUORUM) revert InvalidDelegate();
        uint256 oldQuorum = quorum;
        quorum = newQuorum;
        emit QuorumUpdated(oldQuorum, newQuorum);
    }

    function updateTimelockDuration(uint256 newDuration) external onlyRole(ADMIN_ROLE) onlyInitialized {
        if (newDuration < MIN_TIMELOCK || newDuration > MAX_TIMELOCK) revert InvalidDelegate();
        uint256 oldDuration = timelockDuration;
        timelockDuration = newDuration;
        emit TimelockDurationUpdated(oldDuration, newDuration);
    }

    function withdrawTreasury(address to, uint256 amount) external onlyRole(ADMIN_ROLE) nonReentrant onlyInitialized {
        if (address(this).balance < amount) revert NotAuthorized();

        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) revert NotAuthorized();

        emit TreasuryWithdrawal(to, amount);
    }

    function getProposal(uint256 proposalId) external view validProposal(proposalId) returns (Proposal memory) {
        return _proposals[proposalId];
    }

    function getVote(uint256 proposalId, address voter) external view validProposal(proposalId) returns (Vote memory) {
        return _votes[proposalId][voter];
    }

    function getDelegate(address delegator) external view returns (address) {
        return _delegations[delegator];
    }

    function getVotingPower(address account) public view returns (uint256) {
        address delegatee = _delegations[account];
        if (delegatee != address(0) && delegatee != account) {
            return 0;
        }
        return shieldNetToken.balanceOf(account);
    }

    function getProposalCount() external view returns (uint256) {
        return _proposalCount;
    }

    function getQuorum() external view returns (uint256) {
        return quorum;
    }

    function getVotingPeriod() external view returns (uint256) {
        return votingPeriod;
    }

    function getTimelockDuration() external view returns (uint256) {
        return timelockDuration;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    receive() external payable {}
}
