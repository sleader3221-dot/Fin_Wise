const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CyberInsurance", function () {
  let token, insurance;
  let owner, admin, approver, oracle, user1, user2;
  const COVERAGE_AMOUNT = ethers.parseEther("100");
  const PERIOD = 90 * 24 * 60 * 60;
  const RISK_SCORE = 50;
  const MIN_PREMIUM = ethers.parseEther("0.001");

  beforeEach(async function () {
    [owner, admin, approver, oracle, user1, user2] = await ethers.getSigners();

    const ShieldNetToken = await ethers.getContractFactory("ShieldNetToken");
    token = await ShieldNetToken.deploy();
    await token.waitForDeployment();

    const CyberInsurance = await ethers.getContractFactory("CyberInsurance");
    insurance = await CyberInsurance.deploy();
    await insurance.waitForDeployment();

    await insurance.initialize(await token.getAddress(), await insurance.getAddress());

    await insurance.grantRole(await insurance.ADMIN_ROLE(), admin.address);
    await insurance.grantRole(await insurance.CLAIM_APPROVER_ROLE(), approver.address);
    await insurance.grantRole(await insurance.RISK_ORACLE_ROLE(), oracle.address);
  });

  describe("Policy Creation", function () {
    it("should create a policy", async function () {
      const tx = await insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE);
      const receipt = await tx.wait();

      const policy = await insurance.getPolicyDetails(1);
      expect(policy.holder).to.equal(user1.address);
      expect(policy.coverageAmount).to.equal(COVERAGE_AMOUNT);
      expect(policy.riskScore).to.equal(RISK_SCORE);
      expect(policy.state).to.equal(0);
    });

    it("should fail creating policy with invalid risk score", async function () {
      await expect(
        insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, 0)
      ).to.be.revertedWithCustomError(insurance, "RiskScoreOutOfBounds");

      await expect(
        insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, 101)
      ).to.be.revertedWithCustomError(insurance, "RiskScoreOutOfBounds");
    });

    it("should fail creating policy with invalid duration", async function () {
      await expect(
        insurance.createPolicy(user1.address, COVERAGE_AMOUNT, 100, RISK_SCORE)
      ).to.be.revertedWithCustomError(insurance, "InvalidDuration");
    });

    it("should emit PolicyCreated event", async function () {
      await expect(insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE))
        .to.emit(insurance, "PolicyCreated")
        .withArgs(1, user1.address, COVERAGE_AMOUNT, await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD));
    });

    it("should only allow admin to create policies", async function () {
      await expect(
        insurance.connect(user1).createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE)
      ).to.be.reverted;
    });
  });

  describe("Premium Calculation", function () {
    it("should calculate premium correctly", async function () {
      const premium = await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD);
      expect(premium).to.be.gt(0);
    });

    it("should calculate higher premium for higher risk", async function () {
      const lowRiskPremium = await insurance.calculatePremium(COVERAGE_AMOUNT, 10, PERIOD);
      const highRiskPremium = await insurance.calculatePremium(COVERAGE_AMOUNT, 90, PERIOD);
      expect(highRiskPremium).to.be.gt(lowRiskPremium);
    });

    it("should return minimum premium for very low values", async function () {
      const premium = await insurance.calculatePremium(ethers.parseEther("0.01"), 1, 30 * 24 * 60 * 60);
      expect(premium).to.be.gte(MIN_PREMIUM);
    });
  });

  describe("Premium Payment", function () {
    let policyId;

    beforeEach(async function () {
      const tx = await insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE);
      const receipt = await tx.wait();
      policyId = 1;
    });

    it("should pay premium", async function () {
      const premium = await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD);
      await insurance.connect(user1).payPremium(policyId, { value: premium });
    });

    it("should fail paying premium with insufficient funds", async function () {
      const premium = await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD);
      await expect(
        insurance.connect(user1).payPremium(policyId, { value: premium - 1n })
      ).to.be.revertedWithCustomError(insurance, "PremiumPaymentFailed");
    });

    it("should emit PremiumPaid event", async function () {
      const premium = await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD);
      await expect(insurance.connect(user1).payPremium(policyId, { value: premium }))
        .to.emit(insurance, "PremiumPaid")
        .withArgs(policyId, premium);
    });
  });

  describe("Claim Submission and Processing", function () {
    let policyId;
    const claimAmount = ethers.parseEther("50");

    beforeEach(async function () {
      const tx = await insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE);
      const receipt = await tx.wait();
      policyId = 1;

      const premium = await insurance.calculatePremium(COVERAGE_AMOUNT, RISK_SCORE, PERIOD);
      await insurance.connect(user1).payPremium(policyId, { value: premium });
    });

    it("should submit a claim", async function () {
      await insurance.connect(user1).submitClaim(policyId, claimAmount, "Test claim", "https://evidence.uri");
      const claim = await insurance.getClaimDetails(1);
      expect(claim.policyId).to.equal(policyId);
      expect(claim.claimant).to.equal(user1.address);
      expect(claim.amount).to.equal(claimAmount);
    });

    it("should fail submitting claim for non-holder", async function () {
      await expect(
        insurance.connect(user2).submitClaim(policyId, claimAmount, "Test", "uri")
      ).to.be.revertedWithCustomError(insurance, "NotPolicyHolder");
    });

    it("should fail submitting claim exceeding coverage", async function () {
      await expect(
        insurance.connect(user1).submitClaim(policyId, COVERAGE_AMOUNT + 1n, "Test", "uri")
      ).to.be.revertedWithCustomError(insurance, "InsufficientCoverage");
    });

    it("should approve claim with sufficient approvals", async function () {
      await insurance.connect(user1).submitClaim(policyId, claimAmount, "Test", "uri");

      await insurance.connect(approver).approveClaim(1);

      const claim = await insurance.getClaimDetails(1);
      expect(claim.state).to.equal(2);
    });

    it("should reject claim", async function () {
      await insurance.connect(user1).submitClaim(policyId, claimAmount, "Test", "uri");
      await insurance.connect(approver).rejectClaim(1, "Insufficient evidence");

      const claim = await insurance.getClaimDetails(1);
      expect(claim.state).to.equal(3);
    });

    it("should allow claim dispute", async function () {
      await insurance.connect(user1).submitClaim(policyId, claimAmount, "Test", "uri");
      await insurance.connect(approver).rejectClaim(1, "Insufficient evidence");
      await insurance.connect(user1).disputeClaim(1, "Evidence is valid");

      const claim = await insurance.getClaimDetails(1);
      expect(claim.disputed).to.be.true;
      expect(claim.state).to.equal(4);
    });

    it("should resolve dispute", async function () {
      await insurance.connect(user1).submitClaim(policyId, claimAmount, "Test", "uri");
      await insurance.connect(approver).rejectClaim(1, "Insufficient evidence");
      await insurance.connect(user1).disputeClaim(1, "Evidence is valid");
      await insurance.resolveDispute(1, true);

      const claim = await insurance.getClaimDetails(1);
      expect(claim.state).to.equal(5);
    });

    it("should emit ClaimSubmitted event", async function () {
      await expect(insurance.connect(user1).submitClaim(policyId, claimAmount, "Test", "uri"))
        .to.emit(insurance, "ClaimSubmitted")
        .withArgs(1, policyId, user1.address, claimAmount);
    });
  });

  describe("Policy Management", function () {
    let policyId;

    beforeEach(async function () {
      const tx = await insurance.createPolicy(user1.address, COVERAGE_AMOUNT, PERIOD, RISK_SCORE);
      const receipt = await tx.wait();
      policyId = 1;
    });

    it("should cancel policy", async function () {
      await insurance.connect(admin).cancelPolicy(policyId);
      const policy = await insurance.getPolicyDetails(policyId);
      expect(policy.state).to.equal(2);
    });

    it("should cancel policy by holder", async function () {
      await insurance.connect(user1).cancelPolicy(policyId);
      const policy = await insurance.getPolicyDetails(policyId);
      expect(policy.state).to.equal(2);
    });

    it("should update risk score", async function () {
      await insurance.connect(oracle).updateRiskScore(policyId, 75);
      const policy = await insurance.getPolicyDetails(policyId);
      expect(policy.riskScore).to.equal(75);
    });

    it("should update good behavior discount", async function () {
      await insurance.connect(admin).updateGoodBehavior(policyId, 10);
      const policy = await insurance.getPolicyDetails(policyId);
      expect(policy.goodBehaviorDiscount).to.equal(10);
    });
  });

  describe("Emergency Pause", function () {
    it("should pause and unpause contract", async function () {
      await insurance.pause();
      expect(await insurance.paused()).to.be.true;
      await insurance.unpause();
      expect(await insurance.paused()).to.be.false;
    });
  });
});
