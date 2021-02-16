import colors from '@celo/react-components/styles/colors'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { getNumberFormatSettings } from 'react-native-localize'
import { useSelector } from 'react-redux'
import { listGovernance } from 'src/experimental/governanceFetcher'
import { GovernanceProposals } from 'src/experimental/types'
import { errorHandler } from 'src/experimental/utils'
import { currentAccountSelector } from 'src/web3/selectors'

type Props = {
  setLoading: (loading: boolean) => void
}

const { decimalSeparator } = getNumberFormatSettings()

function Governance({ setLoading }: Props) {
  const [proposals, setProposals] = useState<GovernanceProposals | null>(null)
  const account = useSelector(currentAccountSelector) || ''
  const onListGovernance = errorHandler(setLoading, async () => {
    const governance = await listGovernance()
    setProposals(governance)
  })

  useEffect(() => {
    onListGovernance()
  }, [])

  if (!proposals) {
    return null
  }

  return (
    <ScrollView style={styles.container}>
      {proposals.queued.length > 0 && <Text style={styles.title}>Queued Proposals</Text>}
      {proposals.queued.map((proposal) => (
        <View style={styles.itemContainer}>
          <Text style={styles.item}>ID: {proposal.proposalID.toFixed()}</Text>
          <Text style={styles.item}>Upvotes: {proposal.upvotes.toFixed()}</Text>
        </View>
      ))}
      {proposals.dequeued.length > 0 && <Text style={styles.title}>Dequeued Proposals</Text>}
      {proposals.dequeued.map((proposal) => (
        <View style={styles.itemContainer}>
          <Text style={styles.item}>ID: {proposal.proposalID.toFixed()}</Text>
        </View>
      ))}
      {proposals.expired.length > 0 && <Text style={styles.title}>Expired Proposals</Text>}
      {proposals.expired.map((proposalId) => (
        <View style={styles.itemContainer}>
          <Text style={styles.item}>ID: {proposalId.toFixed()}</Text>
        </View>
      ))}
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
  itemContainer: {
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  title: {},
  item: {},
  button: {
    width: 200,
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.gray3,
  },
})

export default Governance
