'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export default function WalletButton() {
  const { publicKey, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  if (publicKey) {
    return (
      <button
        className="wallet-btn connected"
        onClick={disconnect}
        title={publicKey.toBase58()}
      >
        {truncateAddress(publicKey.toBase58())} — DISCONNECT
      </button>
    );
  }

  return (
    <button
      className="wallet-btn"
      onClick={() => setVisible(true)}
      disabled={connecting}
    >
      {connecting ? 'CONNECTING...' : 'CONNECT_WALLET'}
    </button>
  );
}
