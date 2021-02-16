import colors from '@celo/react-components/styles/colors'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import Balances, { UpdateBalances } from 'src/experimental/Balances'
import Governance from 'src/experimental/Governance'
import LockedGold from 'src/experimental/LockedGold'
import { getAccountSummary } from 'src/experimental/lockedGoldFetcher'
import { AccountSummary } from 'src/experimental/types'
import { errorHandler } from 'src/experimental/utils'
import Validators from 'src/experimental/Validators'
import { headerWithBackButton } from 'src/navigator/Headers'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import { currentAccountSelector } from 'src/web3/selectors'

type Props = StackScreenProps<StackParamList, Screens.ExperimentalScreen>

enum Tab {
  LOCKED_GOLD,
  VALIDATORS,
  GOVERNANCE,
}
function ExperimentalScreen({}: Props) {
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null)
  const [loadingCount, setLoadingCount] = useState(0)
  const balanceRef = useRef<UpdateBalances>(null)
  const [currentTab, setCurrentTab] = useState(Tab.LOCKED_GOLD)
  const updateLoading = (loading: boolean) => setLoadingCount((count) => count + (loading ? 1 : -1))
  const account = useSelector(currentAccountSelector) || ''

  const fetchAccountSummary = errorHandler(updateLoading, async () => {
    setAccountSummary(await getAccountSummary(account))
  })

  useEffect(() => {
    fetchAccountSummary()
  }, [])

  const onSelectTab = (tab: Tab) => () => {
    setCurrentTab(tab)
  }

  const updateBalances = () => {
    balanceRef.current?.updateBalances()
    fetchAccountSummary()
  }

  console.log(currentTab)

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <View style={styles.container}>
        {loadingCount > 0 && <ActivityIndicator size="large" color={colors.greenBrand} />}
        <Balances
          ref={balanceRef}
          lockedGold={accountSummary?.lockedGold}
          setLoading={updateLoading}
        />
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tab} onPress={onSelectTab(Tab.LOCKED_GOLD)}>
            <Text>Locked Gold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={onSelectTab(Tab.VALIDATORS)}>
            <Text>Validators</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={onSelectTab(Tab.GOVERNANCE)}>
            <Text>Governance</Text>
          </TouchableOpacity>
        </View>
        {currentTab === Tab.LOCKED_GOLD && (
          <LockedGold
            setLoading={updateLoading}
            updateBalances={updateBalances}
            pendingWithdrawals={accountSummary?.pendingWithdrawals}
          />
        )}
        {currentTab === Tab.VALIDATORS && (
          <Validators setLoading={updateLoading} updateBalances={updateBalances} />
        )}
        {currentTab === Tab.GOVERNANCE && <Governance setLoading={updateLoading} />}
      </View>
    </SafeAreaView>
  )
}

ExperimentalScreen.navigationOptions = {
  ...headerWithBackButton,
  headerTitle: 'Experimental Screen',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    color: colors.dark,
  },
})

export default ExperimentalScreen
