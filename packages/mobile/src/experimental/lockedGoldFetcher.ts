import { ContractKit } from '@celo/contractkit'
import BigNumber from 'bignumber.js'
import { unlockAccount } from 'src/experimental/utils'
import { divideByWei } from 'src/utils/formatting'
import { getContractKitAsync } from 'src/web3/contracts'

export const getBalances = async (account: string) => {
  const kit: ContractKit = await getContractKitAsync()
  const balance = await kit.getTotalBalance(account)
  return {
    celo: divideByWei(balance.CELO).toString(),
    cUSD: divideByWei(balance.cUSD).toString(),
    lockedCELO: divideByWei(balance.lockedCELO).toString(),
    pending: divideByWei(balance.pending).toString(),
  }
}

export const getAccountSummary = async (account: string) => {
  const kit: ContractKit = await getContractKitAsync()
  const lockedGold = await kit.contracts.getLockedGold()
  return await lockedGold.getAccountSummary(account)
}

export const lockCelo = async (account: string, amount: string) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const lockedGold = await kit.contracts.getLockedGold()
  const tx = lockedGold.lock()
  const txResult = await tx.send({ value: amount, from: account })

  console.log('Receipt: ', await txResult.waitReceipt())
}

export const unlockCelo = async (account: string, amount: BigNumber) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const lockedGold = await kit.contracts.getLockedGold()
  const tx = lockedGold.unlock(amount)
  const txResult = await tx.send({ from: account })

  console.log('Receipt: ', await txResult.waitReceipt())
}

export const withdrawCelo = async (account: string, index: number) => {
  await unlockAccount(account)

  const kit: ContractKit = await getContractKitAsync()

  const lockedGold = await kit.contracts.getLockedGold()
  const tx = lockedGold.withdraw(index)
  const txResult = await tx.send({ from: account })

  console.log('Receipt: ', await txResult.waitReceipt())
}
