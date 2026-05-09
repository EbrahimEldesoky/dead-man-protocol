'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function SolanaProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = 'https://api.devnet.solana.com';

  // Solflare = explicit adapter (deep integration for hackathon)
  // Phantom, Backpack, Coinbase, etc. = auto-detected via Wallet Standard
  // All installed browser wallets will appear automatically!
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
