import '../styles/globals.css'

import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { initWeb3Onboard } from '../utils/services'
import {
  useAccountCenter,
  useConnectWallet,
  useNotifications,
  useSetChain,
  useWallets,
  useSetLocale
} from '@web3-onboard/react'
// import './App.css'
// import Header from './views/Header/Header.js'
// import Footer from './views/Footer/Footer.js'

let provider

const internalTransferABI = [
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'to',
        type: 'address'
      }
    ],
    name: 'internalTransfer',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  }
]

let internalTransferContract

function MyApp({ Component, pageProps }) {
  const [{ wallet }, connect, disconnect, updateBalances, setWalletModules] =
  useConnectWallet()
const [{ chains, connectedChain, settingChain }, setChain] = useSetChain()
const [notifications, customNotification, updateNotify] = useNotifications()
const connectedWallets = useWallets()
const updateAccountCenter = useAccountCenter()
const updateLocale = useSetLocale()

const [web3Onboard, setWeb3Onboard] = useState(null)

const [toAddress, setToAddress] = useState('')
const [accountCenterPosition, setAccountCenterPosition] = useState('topRight')
const [notifyPosition, setNotifyPosition] = useState('bottomRight')
const [locale, setLocale] = useState('en')
const [accountCenterSize, setAccountCenterSize] = useState('normal')
const [accountCenterExpanded, setAccountCenterExpanded] = useState(false)

useEffect(() => {
  setWeb3Onboard(initWeb3Onboard)
}, [])

useEffect(() => {
  console.log(notifications)
}, [notifications])

useEffect(() => {
  if (!connectedWallets.length) return

  const connectedWalletsLabelArray = connectedWallets.map(
    ({ label }) => label
  )
  window.localStorage.setItem(
    'connectedWallets',
    JSON.stringify(connectedWalletsLabelArray)
  )

  // Check for Magic Wallet user session
  if (connectedWalletsLabelArray.includes('Magic Wallet')) {
    const [magicWalletProvider] = connectedWallets.filter(
      provider => provider.label === 'Magic Wallet'
    )
    async function setMagicUser() {
      try {
        const { email } =
          await magicWalletProvider.instance.user.getMetadata()
        const magicUserEmail = localStorage.getItem('magicUserEmail')
        if (!magicUserEmail || magicUserEmail !== email)
          localStorage.setItem('magicUserEmail', email)
      } catch (err) {
        throw err
      }
    }
    setMagicUser()
  }
}, [connectedWallets, wallet])

useEffect(() => {
  if (!wallet?.provider) {
    provider = null
  } else {
    provider = new ethers.providers.Web3Provider(wallet.provider, 'any')

    internalTransferContract = new ethers.Contract(
      '0xb8c12850827ded46b9ded8c1b6373da0c4d60370',
      internalTransferABI,
      provider.getUncheckedSigner()
    )
  }
}, [wallet])

useEffect(() => {
  const previouslyConnectedWallets = JSON.parse(
    window.localStorage.getItem('connectedWallets')
  )

  if (previouslyConnectedWallets?.length) {
    async function setWalletFromLocalStorage() {
      await connect({ autoSelect: previouslyConnectedWallets[0] })
    }
    setWalletFromLocalStorage()
  }
}, [web3Onboard, connect])

const readyToTransact = async () => {
  if (!wallet) {
    const walletSelected = await connect()
    if (!walletSelected) return false
  }
  // prompt user to switch to Rinkeby for test
  await setChain({ chainId: '0x4' })

  return true
}

const sendHash = async () => {
  if (!toAddress) {
    alert('An Ethereum address to send Eth to is required.')
    return
  }

  const signer = provider.getUncheckedSigner()

  await signer.sendTransaction({
    to: toAddress,
    value: 1000000000000000
  })
}

const sendInternalTransaction = async () => {
  if (!toAddress) {
    alert('An Ethereum address to send Eth to is required.')
    return
  }

  await internalTransferContract.internalTransfer(toAddress, {
    value: 1000000000000000
  })
}

const sendTransaction = async () => {
  if (!toAddress) {
    alert('An Ethereum address to send Eth to is required.')
  }

  const signer = provider.getUncheckedSigner()

  const txDetails = {
    to: toAddress,
    value: 1000000000000000
  }
  signer.sendTransaction(txDetails)
}

const renderNotifySettings = () => {
  if (window.innerWidth < 425) {
    return (
      <div className={'conditional-ui-settings'}>
        <h3>Notify Mobile Positioning</h3>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'topRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('topRight')
            updateNotify({ position: 'topRight' })
          }}
        >
          Top
        </button>
        <button
          className={`bn-demo-button ${
            notifyPosition === 'bottomRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setNotifyPosition('bottomRight')
            updateNotify({ position: 'bottomRight' })
          }}
        >
          Bottom
        </button>
      </div>
    )
  }
  return (
    <div className={'conditional-ui-settings'}>
      {' '}
      <h3>Notify Positioning</h3>
      <button
        className={`bn-demo-button ${
          notifyPosition === 'topLeft'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setNotifyPosition('topLeft')
          updateNotify({ position: 'topLeft' })
        }}
      >
        Top Left
      </button>
      <button
        className={`bn-demo-button ${
          notifyPosition === 'topRight'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setNotifyPosition('topRight')
          updateNotify({ position: 'topRight' })
        }}
      >
        Top Right
      </button>
      <button
        className={`bn-demo-button ${
          notifyPosition === 'bottomRight'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setNotifyPosition('bottomRight')
          updateNotify({ position: 'bottomRight' })
        }}
      >
        Bottom Right
      </button>
      <button
        className={`bn-demo-button ${
          notifyPosition === 'bottomLeft'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setNotifyPosition('bottomLeft')
          updateNotify({ position: 'bottomLeft' })
        }}
      >
        Bottom Left
      </button>
    </div>
  )
}
const renderAccountCenterSettings = () => {
  if (window.innerWidth < 425) {
    return (
      <div className={'conditional-ui-settings'}>
        <h3>Account Center Mobile Positioning</h3>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'topRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('topRight')
            updateAccountCenter({
              position: 'topRight'
            })
          }}
        >
          Top
        </button>
        <button
          className={`bn-demo-button ${
            accountCenterPosition === 'bottomRight'
              ? 'selected-toggle-btn'
              : 'unselected-toggle-btn'
          }`}
          onClick={() => {
            setAccountCenterPosition('bottomRight')
            updateAccountCenter({
              position: 'bottomRight'
            })
          }}
        >
          Bottom
        </button>
      </div>
    )
  }
  return (
    <div className={'conditional-ui-settings'}>
      {' '}
      <h3>Account Center Positioning</h3>
      <button
        className={`bn-demo-button ${
          accountCenterPosition === 'topLeft'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setAccountCenterPosition('topLeft')
          updateAccountCenter({
            position: 'topLeft'
          })
        }}
      >
        Top Left
      </button>
      <button
        className={`bn-demo-button ${
          accountCenterPosition === 'topRight'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setAccountCenterPosition('topRight')
          updateAccountCenter({
            position: 'topRight'
          })
        }}
      >
        Top Right
      </button>
      <button
        className={`bn-demo-button ${
          accountCenterPosition === 'bottomRight'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setAccountCenterPosition('bottomRight')
          updateAccountCenter({
            position: 'bottomRight'
          })
        }}
      >
        Bottom Right
      </button>
      <button
        className={`bn-demo-button ${
          accountCenterPosition === 'bottomLeft'
            ? 'selected-toggle-btn'
            : 'unselected-toggle-btn'
        }`}
        onClick={() => {
          setAccountCenterPosition('bottomLeft')
          updateAccountCenter({
            position: 'bottomLeft'
          })
        }}
      >
        Bottom Left
      </button>
    </div>
  )
}

// if (!web3Onboard) return <div>Loading...</div>

  return <Component {...pageProps} />
}

export default MyApp
