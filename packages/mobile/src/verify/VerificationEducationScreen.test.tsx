import * as React from 'react'
import 'react-native'
import { fireEvent, render } from 'react-native-testing-library'
import { Provider } from 'react-redux'
import { showError } from 'src/alert/actions'
import { ErrorMessages } from 'src/app/ErrorMessages'
import { features } from 'src/flags'
import { Screens } from 'src/navigator/Screens'
import VerificationEducationScreen from 'src/verify/VerificationEducationScreen'
import { createMockStore, getMockStackScreenProps } from 'test/utils'

describe('VerificationEducationScreen', () => {
  const komenciEnabled = features.KOMENCI

  beforeAll(() => {
    features.KOMENCI = false
  })

  afterAll(() => {
    features.KOMENCI = komenciEnabled
  })

  it('shows the `skip` button when already verified', () => {
    const store = createMockStore({
      app: { numberVerified: true },
    })
    const { toJSON, queryByTestId, queryByText } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    expect(toJSON()).toMatchSnapshot()
    expect(queryByText('verificationEducation.bodyInsufficientBalance')).toBeFalsy()
    expect(queryByTestId('VerificationEducationSkip')).toBeTruthy()
    expect(queryByTestId('VerificationEducationContinue')).toBeFalsy()
    expect(queryByTestId('VerificationEducationAlready')).toBeFalsy()
  })

  it('shows the `continue` button when the user is not already verified and has enough balance', () => {
    const store = createMockStore({
      stableToken: {
        balance: '50',
      },
    })
    const { toJSON, queryByTestId, queryByText } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    expect(toJSON()).toMatchSnapshot()
    expect(queryByText('verificationEducation.bodyInsufficientBalance')).toBeFalsy()
    expect(queryByTestId('VerificationEducationSkip')).toBeFalsy()
    expect(queryByTestId('VerificationEducationContinue')).toBeTruthy()
    expect(queryByTestId('VerificationEducationAlready')).toBeFalsy()
  })

  it('shows the `skip` button when user is not already verified and has NOT enough balance', () => {
    const store = createMockStore({
      stableToken: {
        balance: '0',
      },
    })
    const { toJSON, queryByTestId, queryByText } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    expect(toJSON()).toMatchSnapshot()
    expect(queryByText('verificationEducation.bodyInsufficientBalance')).toBeTruthy()
    expect(queryByTestId('VerificationEducationSkip')).toBeTruthy()
    expect(queryByTestId('VerificationEducationContinue')).toBeFalsy()
    expect(queryByTestId('VerificationEducationAlready')).toBeFalsy()
  })

  it('allows to skip if verification is loading', () => {
    const defaultVerificationState = {
      phoneHashDetails: {
        e164Number: '',
        phoneHash: '',
        pepper: '',
      },
      actionableAttestations: [],
      status: {
        isVerified: false,
        numAttestationsRemaining: 3,
        total: 0,
        completed: 0,
      },
      lastFetch: null,
    }
    const store = createMockStore({
      stableToken: {
        balance: '0',
      },
      identity: {
        verificationState: {
          ...defaultVerificationState,
          isLoading: true,
        },
      },
    })
    const { getByTestId, toJSON } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen, {
            showSkipDialog: true,
          })}
        />
      </Provider>
    )
    expect(toJSON()).toMatchSnapshot()
    expect(getByTestId('VerificationSkipDialog').props.isVisible).toBe(true)
  })
})

describe('VerificationEducationScreen with KOMENCI enabled', () => {
  const komenciEnabled = features.KOMENCI

  beforeAll(() => {
    features.KOMENCI = true
  })

  afterAll(() => {
    features.KOMENCI = komenciEnabled
  })

  it('shows the `continue` button when the user is not already verified and doesnt have enough balance', () => {
    const store = createMockStore({
      stableToken: {
        balance: '0',
      },
      identity: {
        feelessVerificationState: {
          komenci: {
            serviceAvailable: true,
          },
          status: {
            numAttestationsRemaining: 3,
          },
          actionableAttestations: [],
        },
      },
    })
    const { toJSON, queryByTestId, queryByText } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    expect(toJSON()).toMatchSnapshot()
    expect(queryByText('verificationEducation.bodyInsufficientBalance')).toBeFalsy()
    expect(queryByTestId('VerificationEducationSkip')).toBeFalsy()
    expect(queryByTestId('VerificationEducationContinue')).toBeTruthy()
    expect(queryByTestId('VerificationEducationAlready')).toBeFalsy()
  })

  it('shows banned country warning', () => {
    const store = createMockStore({
      account: {
        e164PhoneNumber: '51231234',
        defaultCountryCode: '+53',
      },
      stableToken: {
        balance: '0',
      },
      identity: {
        feelessVerificationState: {
          komenci: {
            serviceAvailable: true,
          },
          status: {
            numAttestationsRemaining: 3,
          },
          actionableAttestations: [],
        },
      },
    })
    const { getByTestId } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    fireEvent.press(getByTestId('VerificationEducationContinue'))
    expect(store.getActions()).toEqual(
      expect.arrayContaining([showError(ErrorMessages.COUNTRY_NOT_AVAILABLE)])
    )
  })

  it('continue button disabled when invalid number', () => {
    const store = createMockStore({
      account: {
        e164PhoneNumber: '51231234',
        defaultCountryCode: '+53',
      },
      stableToken: {
        balance: '0',
      },
      identity: {
        feelessVerificationState: {
          komenci: {
            serviceAvailable: true,
          },
          status: {
            numAttestationsRemaining: 3,
          },
          actionableAttestations: [],
        },
      },
    })
    const { getByTestId } = render(
      <Provider store={store}>
        <VerificationEducationScreen
          {...getMockStackScreenProps(Screens.VerificationEducationScreen)}
        />
      </Provider>
    )
    fireEvent.changeText(getByTestId('PhoneNumberField'), '12345')
    expect(getByTestId('VerificationEducationContinue').props.disabled).toBe(true)
    fireEvent.changeText(getByTestId('PhoneNumberField'), '51231234')
    expect(getByTestId('VerificationEducationContinue').props.disabled).toBe(false)
  })
})
