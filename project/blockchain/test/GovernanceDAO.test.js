const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GovernanceDAO", function () {
  let token, dao;
  let owner, admin, executor, user1, user2, user3;
  const VOTING_PERIOD = 3 * 24 * 60 * 60;
  const QUORUM = 4;
  const TIMELOCK = 2 * 24 * 60 * 60;

  beforeEach(async function () {
    [owner, admin, executor, user1, user2, user3] = await ethers.getSigners();

    const ShieldNetToken = await ethers.getContractFactory("ShieldNetToken");
    token = await ShieldNetToken.deploy();
    await token.waitForDeployment();

    const GovernanceDAO = await ethers.getContractFactory("GovernanceDAO");
    dao = await GovernanceDAO.deploy();
    await dao.waitForDeployment();

    await dao.initialize(await token.getAddress());

    // Grant tokens for voting
    await token.transfer(user1.address, ethers.parseEther("1000"));
    await token.transfer(user2.address, ethers.parseEther("500"));
    await token.transfer(user3.address, ethers.parseEther("250"));
  });

  describe("Proposal Creation", function () {
    it("should create a proposal", async function () {
      const tx = await dao.createProposal(
        "Test Proposal",
        "Description",
        [owner.address],
        [0],
        ["0x"],
        0
      );

      const proposal = await dao.getProposal(1);
      expect(proposal.id).to.equal(1);
      expect(proposal.proposer).to.equal(owner.address);
      expect(proposal.title).to.equal("Test Proposal");
      expect(proposal.state).to.equal(0);
    });

    it("should fail creating proposal with empty targets", async function () {
      await expect(
        dao.createProposal("Test", "Desc", [], [], [], 0)
      ).to.be.revertedWithCustomError(dao, "ProposalNotFound");
    });

    it("should emit ProposalCreated event", async function () {
      await expect(
        dao.createProposal("Test", "Desc", [owner.address], [0], ["0x"], 0)
      ).to.emit(dao, "ProposalCreated");
    });

    it("should increment proposal counter", async function () {
      await dao.createProposal("P1", "D1", [owner.address], [0], ["0x"], 0);
      await dao.createProposal("P2", "D2", [owner.address], [0], ["0x"], 0);
      expect(await dao.getProposalCount()).to.equal(2);
    });
  });

  describe("Voting", function () {
    let proposalId;

    beforeEach(async function () {
      const tx = await dao.createProposal(
        "Test Proposal",
        "Description",
        [owner.address],
        [0],
        ["0x"],
        0
      );
      const receipt = await tx.wait();
      proposalId = 1;
    });

    it("should cast votes", async function () {
      await dao.connect(user1).castVote(proposalId, true);

      const vote = await dao.getVote(proposalId, user1.address);
      expect(vote.support).to.be.true;
      expect(vote.cast).to.be.true;
    });

    it("should record voting power correctly", async function () {
      await dao.connect(user1).castVote(proposalId, true);

      const proposal = await dao.getProposal(proposalId);
      expect(proposal.forVotes).to.equal(ethers.parseEther("1000"));
    });

    it("should fail double voting", async function () {
      await dao.connect(user1).castVote(proposalId, true);
      await expect(
        dao.connect(user1).castVote(proposalId, true)
      ).to.be.revertedWithCustomError(dao, "AlreadyVoted");
    });

    it("should count against votes", async function () {
      await dao.connect(user1).castVote(proposalId, false);

      const proposal = await dao.getProposal(proposalId);
      expect(proposal.againstVotes).to.equal(ethers.parseEther("1000"));
    });

    it("should allow voting with reason", async function () {
      await expect(
        dao.connect(user1).castVoteWithReason(proposalId, true, "Good proposal")
      ).to.emit(dao, "VoteCast");
    });

    it("should fail voting after period ends", async function () {
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        dao.connect(user1).castVote(proposalId, true)
      ).to.be.revertedWithCustomError(dao, "VotingPeriodEnded");
    });
  });

  describe("Delegation", function () {
    it("should delegate voting power", async function () {
      await dao.connect(user1).delegate(user2.address);
      expect(await dao.getDelegate(user1.address)).to.equal(user2.address);
    });

    it("should fail delegating to self", async function () {
      await expect(
        dao.connect(user1).delegate(user1.address)
      ).to.be.revertedWithCustomError(dao, "InvalidDelegate");
    });

    it("should revoke delegation", async function () {
      await dao.connect(user1).delegate(user2.address);
      await dao.connect(user1).revokeDelegation();
      expect(await dao.getDelegate(user1.address)).to.equal(ethers.ZeroAddress);
    });

    it("should emit Delegated event", async function () {
      await expect(dao.connect(user1).delegate(user2.address))
        .to.emit(dao, "Delegated")
        .withArgs(user1.address, user2.address);
    });
  });

  describe("Quorum", function () {
    let proposalId;

    beforeEach(async function () {
      const tx = await dao.createProposal(
        "Test Proposal",
        "Description",
        [owner.address],
        [0],
        ["0x"],
        0
      );
      const receipt = await tx.wait();
      proposalId = 1;
    });

    it("should require quorum to pass", async function () {
      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        dao.queueProposal(proposalId)
      ).to.be.revertedWithCustomError(dao, "QuorumNotMet");
    });

    it("should queue proposal when quorum is met", async function () {
      await dao.connect(user1).castVote(proposalId, true);
      await dao.connect(user2).castVote(proposalId, true);
      await dao.connect(user3).castVote(proposalId, true);

      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await dao.queueProposal(proposalId);
      const proposal = await dao.getProposal(proposalId);
      expect(proposal.state).to.equal(3);
    });
  });

  describe("Timelock Execution", function () {
    let proposalId;

    beforeEach(async function () {
      const tx = await dao.createProposal(
        "Test Proposal",
        "Description",
        [owner.address],
        [0],
        ["0x"],
        0
      );
      const receipt = await tx.wait();
      proposalId = 1;

      await dao.connect(user1).castVote(proposalId, true);
      await dao.connect(user2).castVote(proposalId, true);
      await dao.connect(user3).castVote(proposalId, true);

      await ethers.provider.send("evm_increaseTime", [VOTING_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await dao.queueProposal(proposalId);
    });

    it("should execute proposal after timelock", async function () {
      await ethers.provider.send("evm_increaseTime", [TIMELOCK + 1]);
      await ethers.provider.send("evm_mine", []);

      await dao.executeProposal(proposalId);
      const proposal = await dao.getProposal(proposalId);
      expect(proposal.executed).to.be.true;
    });
  });

  describe("Proposal Cancellation", function () {
    let proposalId;

    beforeEach(async function () {
      const tx = await dao.createProposal(
        "Test Proposal",
        "Description",
        [owner.address],
        [0],
        ["0x"],
        0
      );
      const receipt = await tx.wait();
      proposalId = 1;
    });

    it("should cancel proposal by proposer", async function () {
      await dao.cancelProposal(proposalId);
      const proposal = await dao.getProposal(proposalId);
      expect(proposal.cancelled).to.be.true;
      expect(proposal.state).to.equal(6);
    });

    it("should cancel proposal by admin", async function () {
      await dao.connect(admin).cancelProposal(proposalId);
      const proposal = await dao.getProposal(proposalId);
      expect(proposal.cancelled).to.be.true;
    });

    it("should fail cancelling by non-proposer non-admin", async function () {
      await expect(
        dao.connect(user1).cancelProposal(proposalId)
      ).to.be.revertedWithCustomError(dao, "NotProposer");
    });
  });

  describe("Emergency Execution", function () {
    it("should execute emergency proposal", async function () {
      await dao.emergencyExecute(owner.address, 0, "0x");
    });

    it("should fail emergency execution without role", async function () {
      await expect(
        dao.connect(user1).emergencyExecute(owner.address, 0, "0x")
      ).to.be.reverted;
    });
  });

  describe("Parameter Updates", function () {
    it("should update voting period", async function () {
      await dao.updateVotingPeriod(5 * 24 * 60 * 60);
      expect(await dao.getVotingPeriod()).to.equal(5 * 24 * 60 * 60);
    });

    it("should update quorum", async function () {
      await dao.updateQuorum(10);
      expect(await dao.getQuorum()).to.equal(10);
    });

    it("should update timelock duration", async function () {
      await dao.updateTimelockDuration(3 * 24 * 60 * 60);
      expect(await dao.getTimelockDuration()).to.equal(3 * 24 * 60 * 60);
    });

    it("should fail updating voting period outside bounds", async function () {
      await expect(
        dao.updateVotingPeriod(0)
      ).to.be.revertedWithCustomError(dao, "InvalidDelegate");
    });
  });

  describe("Treasury", function () {
    it("should receive ETH", async function () {
      await owner.sendTransaction({ to: await dao.getAddress(), value: ethers.parseEther("10") });
      expect(await ethers.provider.getBalance(await dao.getAddress())).to.equal(ethers.parseEther("10"));
    });

    it("should withdraw ETH from treasury", async function () {
      await owner.sendTransaction({ to: await dao.getAddress(), value: ethers.parseEther("10") });
      await dao.withdrawTreasury(user1.address, ethers.parseEther("5"));
      expect(await ethers.provider.getBalance(user1.address)).to.equal(ethers.parseEther("10005"));
    });
  });

  describe("Pausing", function () {
    it("should pause and unpause", async function () {
      await dao.pause();
      expect(await dao.paused()).to.be.true;
      await dao.unpause();
      expect(await dao.paused()).to.be.false;
    });
  });
});
