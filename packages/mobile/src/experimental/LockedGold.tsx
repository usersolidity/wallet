import { PendingWithdrawal } from '@celo/contractkit/lib/wrappers/LockedGold'
import colors from '@celo/react-components/styles/colors'
import { parseInputAmount } from '@celo/utils/lib/parsing'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { getNumberFormatSettings } from 'react-native-localize'
import { useSelector } from 'react-redux'
import { lockCelo, unlockCelo, withdrawCelo } from 'src/experimental/lockedGoldFetcher'
import { errorHandler } from 'src/experimental/utils'
import { WEI_PER_CELO } from 'src/geth/consts'
import { divideByWei } from 'src/utils/formatting'
import { timeDeltaInHours } from 'src/utils/time'
import { currentAccountSelector } from 'src/web3/selectors'

type Props = {
  setLoading: (loading: boolean) => void
  updateBalances: () => void
  pendingWithdrawals?: PendingWithdrawal[]
}

const { decimalSeparator } = getNumberFormatSettings()

function LockedGold({ setLoading, updateBalances, pendingWithdrawals }: Props) {
  const [celoToLockInput, setCeloToLock] = useState('')
  const celoToLock = parseInputAmount(celoToLockInput, decimalSeparator).multipliedBy(WEI_PER_CELO)
  const [celoToUnlockInput, setCeloToUnlock] = useState('')
  const celoToUnlock = parseInputAmount(celoToUnlockInput, decimalSeparator).multipliedBy(
    WEI_PER_CELO
  )
  const account = useSelector(currentAccountSelector) || ''

  const onLockCelo = errorHandler(setLoading, async () => {
    setCeloToLock('')
    await lockCelo(account, celoToLock.toString())
    updateBalances()
  })

  const onUnlockCelo = errorHandler(setLoading, async () => {
    setCeloToUnlock('')
    await unlockCelo(account, celoToUnlock)
    updateBalances()
  })

  const onWithdraw = (index: number) =>
    errorHandler(setLoading, async () => {
      await withdrawCelo(account, index)
      updateBalances()
    })

  return (
    <ScrollView style={styles.container}>
      <View>
        <Text style={styles.celoToLockLabel}>Celo to lock:</Text>
        <TextInput
          style={styles.inputContainer}
          value={celoToLockInput}
          onChangeText={setCeloToLock}
        />
        <TouchableOpacity style={styles.lockCeloButton} onPress={onLockCelo}>
          <Text>Lock CELO</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.celoToLockLabel}>Celo to unlock:</Text>
        <TextInput
          style={styles.inputContainer}
          value={celoToUnlockInput}
          onChangeText={setCeloToUnlock}
        />
        <TouchableOpacity style={styles.button} onPress={onUnlockCelo}>
          <Text>Unlock CELO</Text>
        </TouchableOpacity>
        {pendingWithdrawals && (
          <>
            <Text style={styles.celoToLockLabel}>Pending Withdrawals:</Text>
            {pendingWithdrawals.map((withdrawal, index) => {
              const timeDiffInHours = timeDeltaInHours(withdrawal.time.toNumber(), Date.now())
              return (
                <View style={styles.withdrawalContainer}>
                  <Text style={styles.item}>
                    {timeDiffInHours > 0
                      ? `Time remaining: ${timeDiffInHours.toFixed(2)} hours`
                      : 'Ready'}
                  </Text>
                  <Text style={styles.item}>Value: {divideByWei(withdrawal.value).toString()}</Text>
                  <TouchableOpacity style={styles.button} onPress={onWithdraw(index)}>
                    <Text>Withdraw</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {},
  inputContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.gray3,
  },
  celoToLockLabel: {
    marginTop: 20,
  },
  withdrawalContainer: {
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  lockCeloButton: {
    width: 100,
    marginTop: 5,
    padding: 10,
    backgroundColor: colors.gray3,
  },
  item: {},
  button: {
    width: 200,
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.gray3,
  },
})

export default LockedGold
