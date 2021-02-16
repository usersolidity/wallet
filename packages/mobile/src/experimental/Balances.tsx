import React, { forwardRef, Ref, useEffect, useImperativeHandle, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { getBalances } from 'src/experimental/lockedGoldFetcher'
import { AccountLockedGold } from 'src/experimental/types'
import { errorHandler } from 'src/experimental/utils'
import { divideByWei } from 'src/utils/formatting'
import { currentAccountSelector } from 'src/web3/selectors'

export interface UpdateBalances {
  updateBalances: () => void
}

interface Props {
  setLoading: (loading: boolean) => void
  lockedGold?: AccountLockedGold
}

const Balances = forwardRef(({ setLoading, lockedGold }: Props, ref: Ref<UpdateBalances>) => {
  const [balances, setBalances] = useState({})
  const account = useSelector(currentAccountSelector) || ''

  const updateBalances = errorHandler(setLoading, async () => {
    const balances = await getBalances(account)
    setBalances(balances)
  })

  useImperativeHandle(ref, () => ({ updateBalances }))

  useEffect(() => {
    updateBalances()
  }, [])

  return (
    <View>
      <Text>CELO: {balances.celo}</Text>
      <Text>cUSD: {balances.cUSD}</Text>
      <Text>Locked CELO: {balances.lockedCELO}</Text>
      <Text>Pending: {balances.pending}</Text>
      {lockedGold && (
        <>
          <Text>Nonvoting: {divideByWei(lockedGold.nonvoting).toString()}</Text>
          <Text>Requirement: {divideByWei(lockedGold.requirement).toString()}</Text>
        </>
      )}
    </View>
  )
})

const styles = StyleSheet.create({})

export default Balances
