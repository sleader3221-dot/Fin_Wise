// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IShieldNetToken {
    error InsufficientBalance(uint256 available, uint256 required);
    error InsufficientAllowance(uint256 available, uint256 required);
    error TransferFailed();
    error ZeroAddressNotAllowed();
    error ExceedsMaxSupply(uint256 maxSupply);
    error AlreadyInitialized();
    error NotInMerkleTree();
    error AirdropAlreadyClaimed();

    event TransferFeeUpdated(uint256 oldFee, uint256 newFee);
    event TaxBurnRateUpdated(uint256 oldRate, uint256 newRate);
    event TokensBurned(address indexed burner, uint256 amount);
    event TokensMinted(address indexed minter, address indexed to, uint256 amount);
    event AirdropClaimed(address indexed claimant, uint256 amount, bytes32[] merkleProof);
    event MerkleRootUpdated(bytes32 indexed oldRoot, bytes32 indexed newRoot);

    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    function pause() external;
    function unpause() external;
    function setTransferFee(uint256 newFee) external;
    function setTaxBurnRate(uint256 newRate) external;
    function updateMerkleRoot(bytes32 newMerkleRoot) external;
    function claimAirdrop(uint256 amount, bytes32[] calldata merkleProof) external;
    function hasClaimedAirdrop(address account) external view returns (bool);
    function getMaxSupply() external view returns (uint256);
    function getTransferFee() external view returns (uint256);
    function getTaxBurnRate() external view returns (uint256);
    function circulatingSupply() external view returns (uint256);
}
