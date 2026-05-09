'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Sidebar from '@/components/Sidebar';
import WalletButton from '@/components/WalletButton';
import CreateVault from '@/components/CreateVault';
import VaultPulse from '@/components/VaultPulse';
import HeartbeatTrigger from '@/components/HeartbeatTrigger';
import HeirManagement from '@/components/HeirManagement';
import EncryptedSecret from '@/components/EncryptedSecret';
import DepositPanel from '@/components/DepositPanel';
import { useVault } from '@/hooks/useVault';
import { useProgram } from '@/hooks/useProgram';
import { useBirdeye } from '@/hooks/useBirdeye';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('pulse');
  const [mounted, setMounted] = useState(false);
  const wallet = useWallet();
  const { vault, vaultBalance, countdown, loading, refetch } = useVault();
  const {
    sendHeartbeat,
    addBeneficiary,
    depositSol,
    initializeVault,
    connected,
  } = useProgram();
  const { solPrice } = useBirdeye();

  const hasVault = !!vault;

  const beneficiaries = useMemo(() => {
    if (!vault || vault.beneficiaryCount === 0) return [];
    return [];
  }, [vault]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💀</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
          color: 'var(--accent)', letterSpacing: 4,
        }}>DMB VAULT</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)',
          color: 'var(--text-dim)', marginTop: 8, letterSpacing: 2,
        }}>Initializing secure connection...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} onNavigate={scrollToSection} />

      <main className="main-content">
        {/* Header */}
        <div className="main-header">
          <WalletButton />
        </div>

        {/* Create Vault — shows only if no vault exists */}
        {!hasVault && connected && (
          <section id="section-create-vault">
            <CreateVault
              connected={connected}
              hasVault={hasVault}
              onInitializeVault={initializeVault}
              onRefresh={refetch}
            />
          </section>
        )}

        {/* The Pulse — Vault Status */}
        <section id="section-pulse">
          <VaultPulse
            vault={vault}
            countdown={countdown}
            vaultBalance={vaultBalance}
            solPrice={solPrice}
            loading={loading}
          />
        </section>

        {/* Heartbeat Trigger */}
        <section id="section-heartbeat">
          <HeartbeatTrigger
            onSendHeartbeat={sendHeartbeat}
            connected={connected}
            hasVault={hasVault}
          />
        </section>

        {/* Heir Management */}
        <section id="section-heirs">
          <div className="grid-2">
            <HeirManagement
              beneficiaries={beneficiaries}
              totalShares={vault?.totalShares || 0}
              connected={connected}
              hasVault={hasVault}
              ownerWallet={wallet.publicKey?.toBase58()}
              onAddBeneficiary={addBeneficiary}
              onRefresh={refetch}
            />

            {/* Encrypted Secret */}
            <EncryptedSecret
              willCid={vault?.encryptedWillCid || []}
              willHash={vault?.willHash || []}
              connected={connected}
              hasVault={hasVault}
            />
          </div>
        </section>

        {/* Deposit */}
        <section id="section-deposit">
          <DepositPanel
            vaultBalance={vaultBalance}
            solPrice={solPrice}
            connected={connected}
            hasVault={hasVault}
            onDepositSol={depositSol}
            onRefresh={refetch}
          />
        </section>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '24px 0',
            borderTop: '1px solid var(--border-dim)',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-dim)',
            }}
          >
            ╔══════════════════════════════════════════════╗
            <br />
            ║&nbsp;&nbsp;Your assets should outlive you.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║
            <br />
            ║&nbsp;&nbsp;Built on Solana&nbsp;&nbsp;•&nbsp;&nbsp;Secured by Math&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;║
            <br />
            ╚══════════════════════════════════════════════╝
          </div>
        </footer>
      </main>
    </div>
  );
}
