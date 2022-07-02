import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import verify from "../helper-functions"
import { networkConfig, developmentChains, ADDRESS_ZERO } from "../helper-hardhat-config"
import { ethers } from "hardhat"

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre
  const { log } = deployments
  const { deployer } = await getNamedAccounts()
  const governanceToken = await ethers.getContract("GovernanceToken", deployer)
  const timeLock = await ethers.getContract("TimeLock", deployer)
  const governor = await ethers.getContract("GovernorContract", deployer)

  log("----------------------------------------------------")
  log("Setting up contracts for roles...")
  // would be great to use multicall here...
  const proposerRole = await timeLock.PROPOSER_ROLE()
  const executorRole = await timeLock.EXECUTOR_ROLE()
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE()

  const proposerTransaction = await timeLock.grantRole(proposerRole, governor.address)
  await proposerTransaction.wait(1)
  const executorTransaction = await timeLock.grantRole(executorRole, ADDRESS_ZERO)
  await executorTransaction.wait(1)
  const revokeTransaction = await timeLock.revokeRole(adminRole, deployer)
  await revokeTransaction.wait(1)

  // Anything the timelock wants to do has to go through the governance process first
}

export default setupContracts
setupContracts.tags = ["all", "setup"]
