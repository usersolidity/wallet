import colors from '@celo/react-components/styles/colors'
import { StackScreenProps } from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { showError } from 'src/alert/actions'
import { ErrorMessages } from 'src/app/ErrorMessages'
import InAppBrowser from 'src/components/InAppBrowser'
import { CURRENCY_ENUM } from 'src/geth/consts'
import config from 'src/geth/networkConfig'
import i18n from 'src/i18n'
import { emptyHeader } from 'src/navigator/Headers'
import { navigateBack } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { TopBarTextButton } from 'src/navigator/TopBarButton'
import { StackParamList } from 'src/navigator/types'
import { currentAccountSelector } from 'src/web3/selectors'

const currencyToCode = {
  [CURRENCY_ENUM.GOLD]: 'celo',
  [CURRENCY_ENUM.DOLLAR]: 'cusd',
}

export const moonPayOptions = () => ({
  ...emptyHeader,
  headerLeft: () => <TopBarTextButton title={i18n.t('global:done')} onPress={navigateBack} />,
})

type RouteProps = StackScreenProps<StackParamList, Screens.MoonPayScreen>
type Props = RouteProps

function MoonPayScreen({ route }: Props) {
  const [uri, setUri] = React.useState('')
  const { localAmount, currencyCode, currencyToBuy } = route.params
  const account = useSelector(currentAccountSelector)

  React.useEffect(() => {
    const getSignedUrl = async () => {
      const response = await fetch(config.signMoonpayUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: currencyToCode[currencyToBuy],
          address: account,
          fiatCurrency: currencyCode,
          fiatAmount: new BigNumber(localAmount).toString(),
        }),
      })
      const json = await response.json()
      return json.url
    }

    getSignedUrl()
      .then(setUri)
      .catch(() => showError(ErrorMessages.FIREBASE_FAILED)) // Firebase signing function failed
  }, [])

  return (
    <>
      {uri === '' ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.greenBrand} />
        </View>
      ) : (
        <InAppBrowser uri={uri} onCancel={navigateBack} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    flex: 1,
    justifyContent: 'center',
  },
})

export default MoonPayScreen
