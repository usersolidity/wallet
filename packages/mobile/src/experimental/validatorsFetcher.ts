import { ContractKit } from '@celo/contractkit'
import BigNumber from 'bignumber.js'
import { unlockAccount } from 'src/experimental/utils'
import { getContractKitAsync } from 'src/web3/contracts'

export const getValidators = async () => {
  const kit: ContractKit = await getContractKitAsync()

  const election = await kit.contracts.getElection()
  const groupVotes = await election.getValidatorGroupsVotes()

  return groupVotes
}

export const getVotes = async (account: string) => {
  const kit: ContractKit = await getContractKitAsync()

  const election = await kit.contracts.getElection()

  return await election.getVoter(account)
}

export const voteForValidator = async (account: string, validator: string, amount: BigNumber) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const election = await kit.contracts.getElection()
  const tx = await election.vote(validator, amount)

  const txResult = await tx.send({ from: account })
  console.log('Receipt: ', await txResult.waitReceipt())
}

export const activateVotes = async (account: string) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const election = await kit.contracts.getElection()
  const txArray = await election.activate(account)

  await Promise.all(
    txArray.map(async (tx) => {
      const txResult = await tx.send({ from: account })
      await txResult.waitReceipt()
    })
  )
}

export const revokeVotes = async (
  account: string,
  validator: string,
  activeAmount: BigNumber,
  pendingAmount: BigNumber
) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const election = await kit.contracts.getElection()
  if (activeAmount.gt(0)) {
    const tx = await election.revokeActive(account, validator, activeAmount)
    const txResult = await tx.send({ from: account })
    await txResult.waitReceipt()
  }
  if (pendingAmount.gt(0)) {
    const tx = await election.revokePending(account, validator, pendingAmount)
    const txResult = await tx.send({ from: account })
    await txResult.waitReceipt()
  }
}
