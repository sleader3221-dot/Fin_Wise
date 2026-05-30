// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IDecentralizedIdentity.sol";

contract DecentralizedIdentity is IDecentralizedIdentity, AccessControl, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    uint256 public constant MAX_GUARDIANS = 10;
    uint256 public constant MIN_GUARDIANS = 3;
    uint256 public constant RECOVERY_DELAY = 2 days;
    uint256 public constant DEFAULT_EXPIRY = 365 days;

    mapping(address => Identity) private _identities;
    mapping(address => mapping(bytes32 => Attestation)) private _attestations;
    mapping(address => address[]) private _guardians;
    mapping(address => RecoveryConfig) private _recoveryConfigs;
    mapping(address => mapping(address => bool)) private _guardianSet;
    mapping(address => address) private _pendingRecovery;
    mapping(address => uint256) private _recoveryStartTime;
    mapping(address => uint256) private _recoveryConfirmations;
    mapping(address => mapping(address => bool)) private _recoveryConfirmed;

    bool private _initialized;
    uint256 private _identityCount;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ATTESTOR_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    modifier onlyInitialized() {
        if (!_initialized) revert AlreadyInitialized();
        _;
    }

    modifier identityExists(address account) {
        if (!_identities[account].initialized) revert IdentityNotFound(account);
        _;
    }

    modifier identityNotRevoked(address account) {
        if (_identities[account].revoked) revert IdentityRevoked();
        _;
    }

    modifier onlyIdentityOwner(address account) {
        if (_identities[account].owner != _msgSender()) revert NotIdentityOwner();
        _;
    }

    function initialize() external onlyRole(ADMIN_ROLE) {
        if (_initialized) revert AlreadyInitialized();
        _initialized = true;
    }

    function registerIdentity(bytes32 didHash, bytes32 ipfsHash, uint256 expiryAt) external {
        if (_identities[_msgSender()].initialized) revert IdentityAlreadyExists(_msgSender());
        if (expiryAt == 0) expiryAt = block.timestamp + DEFAULT_EXPIRY;

        _identities[_msgSender()] = Identity({
            owner: _msgSender(),
            didHash: didHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp,
            expiryAt: expiryAt,
            revoked: false,
            initialized: true,
            ipfsHash: ipfsHash
        });

        _identityCount++;
        emit IdentityRegistered(_msgSender(), didHash, ipfsHash);
    }

    function updateIdentity(bytes32 didHash, bytes32 ipfsHash, uint256 expiryAt) external identityExists(_msgSender()) identityNotRevoked(_msgSender()) {
        Identity storage identity = _identities[_msgSender()];
        identity.didHash = didHash;
        identity.ipfsHash = ipfsHash;
        identity.updatedAt = block.timestamp;
        if (expiryAt > 0) identity.expiryAt = expiryAt;

        emit IdentityUpdated(_msgSender(), didHash);
    }

    function revokeIdentity() external identityExists(_msgSender()) onlyIdentityOwner(_msgSender()) {
        _identities[_msgSender()].revoked = true;
        emit IdentityRevoked(_msgSender());
    }

    function addAttestation(bytes32 key, bytes32 value, uint256 expiryAt) external onlyRole(ATTESTOR_ROLE) onlyInitialized {
        if (expiryAt == 0) expiryAt = block.timestamp + DEFAULT_EXPIRY;

        _attestations[_msgSender()][key] = Attestation({
            key: key,
            value: value,
            issuer: _msgSender(),
            timestamp: block.timestamp,
            expiryAt: expiryAt,
            revoked: false
        });

        emit AttestationAdded(_msgSender(), key, value, _msgSender());
    }

    function revokeAttestation(bytes32 key) external onlyRole(ATTESTOR_ROLE) onlyInitialized {
        Attestation storage attestation = _attestations[_msgSender()][key];
        if (attestation.timestamp == 0) revert IdentityNotFound(_msgSender());
        attestation.revoked = true;

        emit AttestationRevoked(_msgSender(), key);
    }

    function rotateKey(bytes32 newDidHash) external identityExists(_msgSender()) identityNotRevoked(_msgSender()) onlyIdentityOwner(_msgSender()) {
        Identity storage identity = _identities[_msgSender()];
        identity.didHash = newDidHash;
        identity.updatedAt = block.timestamp;

        emit KeyRotated(_msgSender(), newDidHash);
    }

    function startRecovery(address candidate) external {
        if (!_identities[_msgSender()].initialized) revert IdentityNotFound(_msgSender());
        if (_identities[_msgSender()].revoked) revert IdentityRevoked();
        if (_guardians[_msgSender()].length < MIN_GUARDIANS) revert InvalidRecoveryConfig();
        if (_guardianSet[candidate][_msgSender()]) revert InvalidRecoveryConfig();

        _pendingRecovery[_msgSender()] = candidate;
        _recoveryStartTime[_msgSender()] = block.timestamp;
        _recoveryConfirmations[_msgSender()] = 0;

        emit RecoveryStarted(_msgSender(), candidate);
    }

    function confirmRecovery(address target, address candidate) external {
        if (!_guardianSet[target][_msgSender()]) revert NotIdentityOwner();
        if (_pendingRecovery[target] != candidate) revert InvalidRecoveryConfig();
        if (_recoveryConfirmed[target][_msgSender()]) revert InvalidRecoveryConfig();

        _recoveryConfirmed[target][_msgSender()] = true;
        _recoveryConfirmations[target]++;

        if (_recoveryConfirmations[target] >= _recoveryConfigs[target].requiredConfirmations) {
            _identities[candidate] = _identities[target];
            _identities[candidate].owner = candidate;
            _identities[candidate].updatedAt = block.timestamp;

            _identities[target].revoked = true;

            delete _pendingRecovery[target];
            delete _recoveryConfirmations[target];

            emit RecoveryCompleted(target, candidate);
        }
    }

    function completeRecovery(address target) external {
        if (_pendingRecovery[target] != _msgSender()) revert NotIdentityOwner();
        if (block.timestamp < _recoveryStartTime[target] + RECOVERY_DELAY) revert InvalidRecoveryConfig();
        if (_identities[_msgSender()].initialized) revert IdentityAlreadyExists(_msgSender());

        _identities[_msgSender()] = _identities[target];
        _identities[_msgSender()].owner = _msgSender();
        _identities[_msgSender()].updatedAt = block.timestamp;

        _identities[target].revoked = true;

        delete _pendingRecovery[target];
        delete _recoveryStartTime[target];
        delete _recoveryConfirmations[target];

        emit RecoveryCompleted(target, _msgSender());
    }

    function addGuardian(address guardian) external identityExists(_msgSender()) identityNotRevoked(_msgSender()) onlyIdentityOwner(_msgSender()) {
        if (_guardians[_msgSender()].length >= MAX_GUARDIANS) revert InvalidRecoveryConfig();
        if (_guardianSet[_msgSender()][guardian]) revert InvalidRecoveryConfig();

        _guardians[_msgSender()].push(guardian);
        _guardianSet[_msgSender()][guardian] = true;

        RecoveryConfig storage config = _recoveryConfigs[_msgSender()];
        if (config.requiredConfirmations == 0) {
            config.requiredConfirmations = _guardians[_msgSender()].length > 2 ? 2 : _guardians[_msgSender()].length;
        }

        emit GuardianAdded(_msgSender(), guardian);
    }

    function removeGuardian(address guardian) external identityExists(_msgSender()) identityNotRevoked(_msgSender()) onlyIdentityOwner(_msgSender()) {
        if (!_guardianSet[_msgSender()][guardian]) revert InvalidRecoveryConfig();

        address[] storage userGuardians = _guardians[_msgSender()];
        for (uint256 i = 0; i < userGuardians.length; i++) {
            if (userGuardians[i] == guardian) {
                userGuardians[i] = userGuardians[userGuardians.length - 1];
                userGuardians.pop();
                break;
            }
        }

        _guardianSet[_msgSender()][guardian] = false;

        if (_recoveryConfigs[_msgSender()].requiredConfirmations > userGuardians.length && userGuardians.length > 0) {
            _recoveryConfigs[_msgSender()].requiredConfirmations = userGuardians.length > 2 ? 2 : userGuardians.length;
        }

        emit GuardianRemoved(_msgSender(), guardian);
    }

    function getIdentity(address account) external view returns (Identity memory) {
        if (!_identities[account].initialized) revert IdentityNotFound(account);
        return _identities[account];
    }

    function getAttestation(address account, bytes32 key) external view returns (Attestation memory) {
        return _attestations[account][key];
    }

    function getGuardians(address account) external view returns (address[] memory) {
        return _guardians[account];
    }

    function verifyCredential(address account, bytes32 key, bytes32 value) external view returns (bool) {
        if (!_identities[account].initialized) return false;
        if (_identities[account].revoked) return false;
        if (block.timestamp > _identities[account].expiryAt) return false;

        Attestation storage attestation = _attestations[account][key];
        if (attestation.revoked) return false;
        if (block.timestamp > attestation.expiryAt) return false;
        if (attestation.value != value) return false;

        return true;
    }

    function getIdentityCount() external view returns (uint256) {
        return _identityCount;
    }

    function isIdentityActive(address account) external view returns (bool) {
        if (!_identities[account].initialized) return false;
        if (_identities[account].revoked) return false;
        if (block.timestamp > _identities[account].expiryAt) return false;
        return true;
    }
}
