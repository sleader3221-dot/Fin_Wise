const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShieldNetToken", function () {
  let token;
  let owner, admin, minter, burner, user1, user2;
  const INITIAL_SUPPLY = ethers.parseEther("500000000");
  const MAX_SUPPLY = ethers.parseEther("1000000000");
  const ZERO_ADDRESS = ethers.ZeroAddress;

  beforeEach(async function () {
    [owner, admin, minter, burner, user1, user2] = await ethers.getSigners();

    const ShieldNetToken = await ethers.getContractFactory("ShieldNetToken");
    token = await ShieldNetToken.deploy();
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await token.name()).to.equal("ShieldNet");
      expect(await token.symbol()).to.equal("SHLD");
    });

    it("should set correct decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("should mint initial supply to deployer", async function () {
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("should set max supply correctly", async function () {
      expect(await token.getMaxSupply()).to.equal(MAX_SUPPLY);
    });

    it("should assign roles correctly", async function () {
      expect(await token.hasRole(await token.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(await token.ADMIN_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(await token.MINTER_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(await token.BURNER_ROLE(), owner.address)).to.be.true;
      expect(await token.hasRole(await token.PAUSER_ROLE(), owner.address)).to.be.true;
    });
  });

  describe("Transfer", function () {
    beforeEach(async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("should transfer tokens between accounts", async function () {
      await token.connect(user1).transfer(user2.address, ethers.parseEther("500"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("500"));
    });

    it("should fail when sender has insufficient balance", async function () {
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("2000"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("should fail when transferring to zero address", async function () {
      await expect(
        token.connect(user1).transfer(ZERO_ADDRESS, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
    });

    it("should emit Transfer event", async function () {
      await expect(token.connect(user1).transfer(user2.address, ethers.parseEther("100")))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, ethers.parseEther("100"));
    });
  });

  describe("Minting", function () {
    it("should mint tokens when called by minter role", async function () {
      await token.mint(user1.address, ethers.parseEther("1000"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should fail minting when not called by minter role", async function () {
      await expect(
        token.connect(user1).mint(user1.address, ethers.parseEther("1000"))
      ).to.be.reverted;
    });

    it("should fail minting beyond max supply", async function () {
      const remaining = MAX_SUPPLY - INITIAL_SUPPLY;
      await expect(
        token.mint(user1.address, remaining + 1n)
      ).to.be.revertedWithCustomError(token, "ExceedsMaxSupply");
    });

    it("should fail minting to zero address", async function () {
      await expect(
        token.mint(ZERO_ADDRESS, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("should emit TokensMinted event", async function () {
      await expect(token.mint(user1.address, ethers.parseEther("500")))
        .to.emit(token, "TokensMinted")
        .withArgs(owner.address, user1.address, ethers.parseEther("500"));
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
    });

    it("should burn tokens reducing total supply", async function () {
      const supplyBefore = await token.totalSupply();
      await token.connect(user1).burn(ethers.parseEther("500"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
      expect(await token.totalSupply()).to.equal(supplyBefore - ethers.parseEther("500"));
    });

    it("should fail burning more than balance", async function () {
      await expect(
        token.connect(user1).burn(ethers.parseEther("2000"))
      ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
    });

    it("should emit TokensBurned event", async function () {
      await expect(token.burn(ethers.parseEther("100")))
        .to.emit(token, "TokensBurned")
        .withArgs(owner.address, ethers.parseEther("100"));
    });
  });

  describe("Role-Based Access Control", function () {
    it("should allow admin to grant minter role", async function () {
      await token.grantRole(await token.MINTER_ROLE(), user1.address);
      expect(await token.hasRole(await token.MINTER_ROLE(), user1.address)).to.be.true;
    });

    it("should allow admin to revoke roles", async function () {
      await token.grantRole(await token.MINTER_ROLE(), user1.address);
      await token.revokeRole(await token.MINTER_ROLE(), user1.address);
      expect(await token.hasRole(await token.MINTER_ROLE(), user1.address)).to.be.false;
    });

    it("should prevent non-admin from granting roles", async function () {
      await expect(
        token.connect(user1).grantRole(await token.MINTER_ROLE(), user2.address)
      ).to.be.reverted;
    });
  });

  describe("Pausing", function () {
    it("should pause and unpause transfers", async function () {
      await token.pause();
      await expect(
        token.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");

      await token.unpause();
      await expect(token.transfer(user1.address, ethers.parseEther("100"))).to.not.be.reverted;
    });

    it("should fail pause when not called by pauser", async function () {
      await expect(token.connect(user1).pause()).to.be.reverted;
    });

    it("should fail unpause when not called by pauser", async function () {
      await token.pause();
      await expect(token.connect(user1).unpause()).to.be.reverted;
    });
  });

  describe("Transfer Fees", function () {
    it("should set transfer fee", async function () {
      await token.setTransferFee(100);
      expect(await token.getTransferFee()).to.equal(100);
    });

    it("should deduct fee on transfer when fee is set", async function () {
      await token.setTransferFee(100);
      await token.transfer(user1.address, ethers.parseEther("1000"));

      const balanceBefore = await token.balanceOf(user1.address);
      const feeAmount = ethers.parseEther("500") * 100n / 10000n;

      await token.connect(user1).transfer(user2.address, ethers.parseEther("500"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("500") - feeAmount);
    });

    it("should fail setting fee above max", async function () {
      await expect(token.setTransferFee(1001)).to.be.reverted;
    });

    it("should emit TransferFeeUpdated event", async function () {
      await expect(token.setTransferFee(50))
        .to.emit(token, "TransferFeeUpdated")
        .withArgs(0, 50);
    });
  });

  describe("Airdrop", function () {
    it("should allow claiming airdrop with valid merkle proof", async function () {
      const amount = ethers.parseEther("100");
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [user1.address, amount]
      );

      const merkleTree = await buildMerkleTree([{ account: user1.address, amount: amount.toString() }]);
      await token.updateMerkleRoot(merkleTree.root);

      const proof = merkleTree.getProof(leaf);
      await token.connect(user1).claimAirdrop(amount, proof);
      expect(await token.balanceOf(user1.address)).to.equal(amount);
    });

    it("should prevent double claiming airdrop", async function () {
      const amount = ethers.parseEther("100");
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [user1.address, amount]
      );

      const merkleTree = await buildMerkleTree([{ account: user1.address, amount: amount.toString() }]);
      await token.updateMerkleRoot(merkleTree.root);

      const proof = merkleTree.getProof(leaf);
      await token.connect(user1).claimAirdrop(amount, proof);
      await expect(
        token.connect(user1).claimAirdrop(amount, proof)
      ).to.be.revertedWithCustomError(token, "AirdropAlreadyClaimed");
    });
  });

  describe("Allowance and Approval", function () {
    it("should set allowance", async function () {
      await token.approve(user1.address, ethers.parseEther("500"));
      expect(await token.allowance(owner.address, user1.address)).to.equal(ethers.parseEther("500"));
    });

    it("should transfer from with allowance", async function () {
      await token.approve(user1.address, ethers.parseEther("500"));
      await token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseEther("300"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("300"));
    });

    it("should fail transferFrom with insufficient allowance", async function () {
      await token.approve(user1.address, ethers.parseEther("100"));
      await expect(
        token.connect(user1).transferFrom(owner.address, user2.address, ethers.parseEther("200"))
      ).to.be.reverted;
    });
  });

  describe("BurnFrom", function () {
    beforeEach(async function () {
      await token.transfer(user1.address, ethers.parseEther("1000"));
      await token.connect(user1).approve(owner.address, ethers.parseEther("500"));
    });

    it("should burn from account with allowance", async function () {
      await token.burnFrom(user1.address, ethers.parseEther("500"));
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("500"));
    });

    it("should fail burnFrom with insufficient allowance", async function () {
      await expect(
        token.burnFrom(user1.address, ethers.parseEther("1500"))
      ).to.be.reverted;
    });
  });
});

async function buildMerkleTree(claims) {
  const leaves = claims.map((c) =>
    ethers.solidityPackedKeccak256(
      ["address", "uint256"],
      [c.account, ethers.parseEther(c.amount.toString())]
    )
  );
  leaves.sort();

  return {
    root: ethers.solidityPackedKeccak256(["bytes32[]"], [leaves]),
    getProof: function (leaf) {
      const result = [];
      let currentLeaf = leaf;
      for (const l of leaves) {
        if (l !== currentLeaf) {
          result.push(l);
        }
      }
      return result;
    },
  };
}
