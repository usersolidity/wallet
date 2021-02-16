import { UnlockableWallet } from '@celo/wallet-base'
import { UNLOCK_DURATION } from 'src/geth/consts'
import { getPassword } from 'src/pincode/authentication'
import { getWalletAsync } from 'src/web3/contracts'

export const unlockAccount = async (account: string) => {
  const wallet: UnlockableWallet = await getWalletAsync()
  if (wallet.isAccountUnlocked(account)) {
    return
  }

  const password: string = await getPassword(account)
  const result = await wallet.unlockAccount(account, password, UNLOCK_DURATION)
  if (!result) {
    throw new Error('Unlock account result false')
  }
}

export const errorHandler = (
  setLoading: (loading: boolean) => void,
  fx: () => Promise<any>
) => async () => {
  try {
    setLoading(true)
    await fx()
    setLoading(false)
  } catch (error) {
    console.error('Error on experimental screen', error)
    setLoading(false)
  }
}
