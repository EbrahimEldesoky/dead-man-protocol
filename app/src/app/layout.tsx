import type { Metadata } from 'next';
import './globals.css';
import SolanaProviders from './providers';

export const metadata: Metadata = {
  title: 'DeadMan Protocol | Trustless Digital Inheritance on Solana',
  description:
    'On-chain, permissionless digital inheritance protocol. Your keys die with you — your assets don\'t have to.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;500;600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
