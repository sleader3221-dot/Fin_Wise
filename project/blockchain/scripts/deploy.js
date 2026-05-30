const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  console.log(`\n=== ShieldNet Blockchain Layer Deployment ===`);
  console.log(`Network: ${network}`);
  console.log(`Deployer: ${(await hre.ethers.getSigners())[0].address}\n`);

  const deployments = {};

  // Deploy ShieldNetToken
  console.log("[1/5] Deploying ShieldNetToken...");
  const ShieldNetToken = await hre.ethers.getContractFactory("ShieldNetToken");
  const shieldNetToken = await ShieldNetToken.deploy();
  await shieldNetToken.waitForDeployment();
  const tokenAddress = await shieldNetToken.getAddress();
  deployments.ShieldNetToken = tokenAddress;
  console.log(`  ShieldNetToken deployed to: ${tokenAddress}`);

  // Deploy CyberInsurance
  console.log("[2/5] Deploying CyberInsurance...");
  const CyberInsurance = await hre.ethers.getContractFactory("CyberInsurance");
  const cyberInsurance = await CyberInsurance.deploy();
  await cyberInsurance.waitForDeployment();
  const insuranceAddress = await cyberInsurance.getAddress();
  deployments.CyberInsurance = insuranceAddress;
  console.log(`  CyberInsurance deployed to: ${insuranceAddress}`);

  // Initialize CyberInsurance
  await cyberInsurance.initialize(tokenAddress, insuranceAddress);
  console.log("  CyberInsurance initialized");

  // Deploy ThreatIntelligence
  console.log("[3/5] Deploying ThreatIntelligence...");
  const ThreatIntelligence = await hre.ethers.getContractFactory("ThreatIntelligence");
  const threatIntelligence = await ThreatIntelligence.deploy();
  await threatIntelligence.waitForDeployment();
  const threatIntelAddress = await threatIntelligence.getAddress();
  deployments.ThreatIntelligence = threatIntelAddress;
  console.log(`  ThreatIntelligence deployed to: ${threatIntelAddress}`);

  // Initialize ThreatIntelligence
  await threatIntelligence.initialize(tokenAddress);
  console.log("  ThreatIntelligence initialized");

  // Deploy DecentralizedIdentity
  console.log("[4/5] Deploying DecentralizedIdentity...");
  const DecentralizedIdentity = await hre.ethers.getContractFactory("DecentralizedIdentity");
  const decentralizedIdentity = await DecentralizedIdentity.deploy();
  await decentralizedIdentity.waitForDeployment();
  const identityAddress = await decentralizedIdentity.getAddress();
  deployments.DecentralizedIdentity = identityAddress;
  console.log(`  DecentralizedIdentity deployed to: ${identityAddress}`);

  await decentralizedIdentity.initialize();
  console.log("  DecentralizedIdentity initialized");

  // Deploy GovernanceDAO
  console.log("[5/5] Deploying GovernanceDAO...");
  const GovernanceDAO = await hre.ethers.getContractFactory("GovernanceDAO");
  const governanceDAO = await GovernanceDAO.deploy();
  await governanceDAO.waitForDeployment();
  const daoAddress = await governanceDAO.getAddress();
  deployments.GovernanceDAO = daoAddress;
  console.log(`  GovernanceDAO deployed to: ${daoAddress}`);

  // Initialize GovernanceDAO
  await governanceDAO.initialize(tokenAddress);
  console.log("  GovernanceDAO initialized\n");

  // Configure Roles and Permissions
  console.log("--- Configuring Roles & Permissions ---");

  const DEFAULT_ADMIN_ROLE = await shieldNetToken.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await shieldNetToken.MINTER_ROLE();
  const BURNER_ROLE = await shieldNetToken.BURNER_ROLE();
  const PAUSER_ROLE = await shieldNetToken.PAUSER_ROLE();
  const ADMIN_ROLE = await shieldNetToken.ADMIN_ROLE();

  // Grant roles to contracts
  await shieldNetToken.grantRole(MINTER_ROLE, daoAddress);
  console.log(`  Granted MINTER_ROLE to GovernanceDAO`);

  await shieldNetToken.grantRole(MINTER_ROLE, threatIntelAddress);
  console.log(`  Granted MINTER_ROLE to ThreatIntelligence`);

  await shieldNetToken.grantRole(BURNER_ROLE, daoAddress);
  console.log(`  Granted BURNER_ROLE to GovernanceDAO`);

  // Token supply distribution
  const totalSupply = await shieldNetToken.totalSupply();
  console.log(`\n  Initial Supply: ${hre.ethers.formatEther(totalSupply)} SHLD`);

  // Deployment Summary
  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deployments, null, 2));

  // Save deployment artifacts
  const artifactDir = path.join(__dirname, "..", "deployments", network);
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const artifact = {
    network: network,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    deployments: deployments,
  };

  const artifactPath = path.join(artifactDir, "deployment.json");
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
  console.log(`\nDeployment artifacts saved to: ${artifactPath}`);

  // Auto-verify contracts on Etherscan
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n--- Verifying Contracts ---");
    const contractsToVerify = [
      { address: tokenAddress, contract: "contracts/ShieldNetToken.sol:ShieldNetToken" },
      { address: insuranceAddress, contract: "contracts/CyberInsurance.sol:CyberInsurance" },
      { address: threatIntelAddress, contract: "contracts/ThreatIntelligence.sol:ThreatIntelligence" },
      { address: identityAddress, contract: "contracts/DecentralizedIdentity.sol:DecentralizedIdentity" },
      { address: daoAddress, contract: "contracts/GovernanceDAO.sol:GovernanceDAO" },
    ];

    for (const c of contractsToVerify) {
      try {
        await hre.run("verify:verify", {
          address: c.address,
          contract: c.contract,
        });
        console.log(`  Verified: ${c.address}`);
      } catch (error) {
        console.log(`  Verification skipped for ${c.address}: ${error.message}`);
      }
    }
  }

  console.log("\n=== Deployment Complete ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
