import { GroupVote, ValidatorGroupVote } from '@celo/contractkit/lib/wrappers/Election'
import colors from '@celo/react-components/styles/colors'
import { parseInputAmount } from '@celo/utils/lib/parsing'
import Clipboard from '@react-native-community/clipboard'
import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { getNumberFormatSettings } from 'react-native-localize'
import { useSelector } from 'react-redux'
import { errorHandler } from 'src/experimental/utils'
import {
  activateVotes,
  getValidators,
  getVotes,
  revokeVotes,
  voteForValidator,
} from 'src/experimental/validatorsFetcher'
import { WEI_PER_CELO } from 'src/geth/consts'
import i18n from 'src/i18n'
import Logger from 'src/utils/Logger'
import { currentAccountSelector } from 'src/web3/selectors'

const { decimalSeparator } = getNumberFormatSettings()

interface Props {
  updateBalances: () => void
  setLoading: (loading: boolean) => void
}

function Validators({ setLoading, updateBalances }: Props) {
  const [validatorToVote, setValidatorToVote] = useState('')
  const [validators, setValidators] = useState<ValidatorGroupVote[]>([])
  const [votes, setVotes] = useState<GroupVote[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [amountToVoteInput, setAmountToVote] = useState('')
  const amountToVote = parseInputAmount(amountToVoteInput, decimalSeparator).multipliedBy(
    WEI_PER_CELO
  )
  const account = useSelector(currentAccountSelector) || ''

  const fetchValidators = errorHandler(setLoading, async () => {
    const validators = await getValidators()
    setValidators(validators)
  })

  const fetchVotes = async () => {
    setLoading(true)
    const votes = await getVotes(account)
    setVotes(votes.votes)
    setLoading(false)
  }

  useEffect(() => {
    fetchVotes()
    fetchValidators()
  }, [])

  const onCopyAddress = (address: string) => () => {
    Clipboard.setString(address)
    Logger.showMessage(i18n.t('accountScreen10:addressCopied'))
  }

  const onVoteValidator = errorHandler(setLoading, async () => {
    await voteForValidator(account, validatorToVote, amountToVote)
    updateBalances()
    fetchVotes()
    setValidatorToVote('')
    setAmountToVote('')
  })

  const onActivateVotes = errorHandler(setLoading, async () => {
    await activateVotes(account)
    updateBalances()
    fetchVotes()
  })

  const onRevokeVotes = (votes: GroupVote) =>
    errorHandler(setLoading, async () => {
      await revokeVotes(account, votes.group, votes.active, votes.pending)
      updateBalances()
      fetchVotes()
    })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.votingContainer}>
        <Text>Vote for validator:</Text>
        <TextInput
          style={styles.inputContainer}
          value={validatorToVote}
          onChangeText={setValidatorToVote}
        />
        <Text>Amount to vote: (will be multiplied by 1^18)</Text>
        <TextInput
          style={styles.inputContainer}
          value={amountToVoteInput}
          onChangeText={setAmountToVote}
        />
        <TouchableOpacity style={styles.button} onPress={onVoteValidator}>
          <Text>Vote</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onActivateVotes}>
          <Text>Activate Votes</Text>
        </TouchableOpacity>
      </View>
      {votes.length > 0 && <Text style={styles.title}>Votes</Text>}
      {votes.map((vote) => (
        <View style={styles.itemContainer} key={vote.group}>
          <Text style={styles.item}>Validator: {vote.group}</Text>
          <Text style={styles.item}>
            Active: {vote.active.dividedBy(WEI_PER_CELO).toFixed()} ({vote.active.toFixed()})
          </Text>
          <Text style={styles.item}>
            Pending: {vote.pending.dividedBy(WEI_PER_CELO).toFixed()} ({vote.pending.toFixed()})
          </Text>
          <TouchableOpacity style={styles.button} onPress={onCopyAddress(vote.group)}>
            <Text>Copy Address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onRevokeVotes(vote)}>
            <Text>Revoke Votes</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.title}>Validators</Text>
      <Text>Search by name:</Text>
      <TextInput style={styles.inputContainer} value={searchTerm} onChangeText={setSearchTerm} />
      {validators
        .filter((validator) => !searchTerm || validator.name.indexOf(searchTerm) >= 0)
        .map((validator) => (
          <View style={styles.itemContainer} key={validator.address}>
            <Text style={styles.item}>Address: {validator.address}</Text>
            <Text style={styles.item}>Name: {validator.name}</Text>
            <Text style={styles.item}>Votes: {validator.votes.toFixed()}</Text>
            <Text style={styles.item}>Capacity: {validator.capacity.toFixed()}</Text>
            <Text style={styles.item}>Eligible: {validator.eligible.toString()}</Text>
            <TouchableOpacity style={styles.button} onPress={onCopyAddress(validator.address)}>
              <Text>Copy Address</Text>
            </TouchableOpacity>
          </View>
        ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  votingContainer: {
    marginVertical: 20,
  },
  title: {
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 15,
  },
  inputContainer: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colors.gray3,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
  },
  item: {
    marginVertical: 2,
  },
  button: {
    width: 200,
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.gray3,
  },
})

export default Validators
