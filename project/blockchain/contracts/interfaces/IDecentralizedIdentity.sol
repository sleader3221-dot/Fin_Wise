// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDecentralizedIdentity {
    struct Identity {
        address owner;
        bytes32 didHash;
        uint256 createdAt;
        uint256 updatedAt;
        uint256 expiryAt;
        bool revoked;
        bool initialized;
        bytes32 ipfsHash;
    }

    struct Attestation {
        bytes32 key;
        bytes32 value;
        address issuer;
        uint256 timestamp;
        uint256 expiryAt;
        bool revoked;
    }

    struct RecoveryConfig {
        address[] guardians;
        uint256 requiredConfirmations;
        uint256 recoveryDelay;
    }

    error IdentityNotFound(address account);
    error IdentityAlreadyExists(address account);
    error IdentityExpired();
    error IdentityRevoked();
    error NotIdentityOwner();
    error AttestationExpired();
    error AttestationRevoked();
    error InvalidKeyRotation();
    error InvalidRecoveryConfig();
    error InsufficientGuardianConfirmations(uint256 provided, uint256 required);
    error AlreadyInitialized();

    event IdentityRegistered(address indexed account, bytes32 indexed didHash, bytes32 ipfsHash);
    event IdentityUpdated(address indexed account, bytes32 indexed didHash);
    event IdentityRevoked(address indexed account);
    event AttestationAdded(address indexed account, bytes32 indexed key, bytes32 value, address indexed issuer);
    event AttestationRevoked(address indexed account, bytes32 indexed key);
    event KeyRotated(address indexed account, bytes32 indexed newKey);
    event RecoveryStarted(address indexed account, address indexed candidate);
    event RecoveryCompleted(address indexed account, address indexed newOwner);
    event GuardianAdded(address indexed account, address indexed guardian);
    event GuardianRemoved(address indexed account, address indexed guardian);

    function registerIdentity(bytes32 didHash, bytes32 ipfsHash, uint256 expiryAt) external;
    function updateIdentity(bytes32 didHash, bytes32 ipfsHash, uint256 expiryAt) external;
    function revokeIdentity() external;
    function addAttestation(bytes32 key, bytes32 value, uint256 expiryAt) external;
    function revokeAttestation(bytes32 key) external;
    function rotateKey(bytes32 newDidHash) external;
    function startRecovery(address candidate) external;
    function confirmRecovery(address target, address candidate) external;
    function completeRecovery(address target) external;
    function addGuardian(address guardian) external;
    function removeGuardian(address guardian) external;
    function getIdentity(address account) external view returns (Identity memory);
    function getAttestation(address account, bytes32 key) external view returns (Attestation memory);
    function getGuardians(address account) external view returns (address[] memory);
    function verifyCredential(address account, bytes32 key, bytes32 value) external view returns (bool);
}
