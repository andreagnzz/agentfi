"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function WalletConnect() {
  return (
    <ConnectButton
      label="Connect Wallet"
      accountStatus="address"
      chainStatus="none"
      showBalance={false}
    />
  )
}
