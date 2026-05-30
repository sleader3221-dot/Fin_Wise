// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IShieldNetToken.sol";

contract ShieldNetToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard, IShieldNetToken {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 private constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint256 private constant MAX_FEE_BPS = 1000;
    uint256 private constant MAX_BURN_RATE_BPS = 500;

    uint256 private _transferFeeBps;
    uint256 private _taxBurnRateBps;
    bytes32 private _merkleRoot;
    mapping(address => bool) private _airdropClaimed;
    bool private _initialized;

    constructor() ERC20("ShieldNet", "SHLD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

        _mint(msg.sender, 500_000_000 * 10 ** 18);
        _initialized = true;
    }

    modifier onlyInitialized() {
        if (!_initialized) revert AlreadyInitialized();
        _;
    }

    modifier validAddress(address account) {
        if (account == address(0)) revert ZeroAddressNotAllowed();
        _;
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) validAddress(to) onlyInitialized {
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply(MAX_SUPPLY);
        _mint(to, amount);
        emit TokensMinted(msg.sender, to, amount);
    }

    function burn(uint256 amount) public override onlyRole(BURNER_ROLE) onlyInitialized {
        _burn(_msgSender(), amount);
        emit TokensBurned(_msgSender(), amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyRole(BURNER_ROLE) onlyInitialized {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
        emit TokensBurned(account, amount);
    }

    function pause() external onlyRole(PAUSER_ROLE) onlyInitialized {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) onlyInitialized {
        _unpause();
    }

    function setTransferFee(uint256 newFee) external onlyRole(ADMIN_ROLE) onlyInitialized {
        if (newFee > MAX_FEE_BPS) revert TransferFailed();
        uint256 oldFee = _transferFeeBps;
        _transferFeeBps = newFee;
        emit TransferFeeUpdated(oldFee, newFee);
    }

    function setTaxBurnRate(uint256 newRate) external onlyRole(ADMIN_ROLE) onlyInitialized {
        if (newRate > MAX_BURN_RATE_BPS) revert TransferFailed();
        uint256 oldRate = _taxBurnRateBps;
        _taxBurnRateBps = newRate;
        emit TaxBurnRateUpdated(oldRate, newRate);
    }

    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyRole(ADMIN_ROLE) onlyInitialized {
        bytes32 oldRoot = _merkleRoot;
        _merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(oldRoot, newMerkleRoot);
    }

    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external nonReentrant onlyInitialized {
        if (_airdropClaimed[_msgSender()]) revert AirdropAlreadyClaimed();

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(_msgSender(), amount))));
        if (!MerkleProof.verify(merkleProof, _merkleRoot, leaf)) revert NotInMerkleTree();

        _airdropClaimed[_msgSender()] = true;

        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply(MAX_SUPPLY);
        _mint(_msgSender(), amount);

        emit AirdropClaimed(_msgSender(), amount, merkleProof);
    }

    function hasClaimedAirdrop(address account) external view returns (bool) {
        return _airdropClaimed[account];
    }

    function getMaxSupply() external view returns (uint256) {
        return MAX_SUPPLY;
    }

    function getTransferFee() external view returns (uint256) {
        return _transferFeeBps;
    }

    function getTaxBurnRate() external view returns (uint256) {
        return _taxBurnRateBps;
    }

    function circulatingSupply() external view returns (uint256) {
        return totalSupply();
    }

    function getMerkleRoot() external view returns (bytes32) {
        return _merkleRoot;
    }

    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);

        if (from != address(0) && to != address(0)) {
            uint256 feeAmount = 0;
            uint256 burnAmount = 0;

            if (_transferFeeBps > 0) {
                feeAmount = (value * _transferFeeBps) / 10000;
                if (feeAmount > 0) {
                    super._update(from, address(this), feeAmount);
                }
            }

            if (_taxBurnRateBps > 0 && feeAmount > 0) {
                burnAmount = (feeAmount * _taxBurnRateBps) / 10000;
                if (burnAmount > 0) {
                    _burn(address(this), burnAmount);
                }
            }
        }
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
