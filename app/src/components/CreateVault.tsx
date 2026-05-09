'use client';

import { useState, useCallback } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import TypewriterText from './TypewriterText';

interface CreateVaultProps {
  connected: boolean;
  hasVault: boolean;
  onInitializeVault: (
    deadlineSeconds: number,
    gracePeriodSeconds: number,
    encryptedWillCid: Uint8Array,
    willHash: Uint8Array,
    depositLamports: number
  ) => Promise<string>;
  onRefresh: () => void;
}

export default function CreateVault({
  connected,
  hasVault,
  onInitializeVault,
  onRefresh,
}: CreateVaultProps) {
  const [deadlineDays, setDeadlineDays] = useState('30');
  const [graceDays, setGraceDays] = useState('7');
  const [depositAmount, setDepositAmount] = useState('0.1');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleCreate = useCallback(async () => {
    setError('');
    setTxHash('');
    try {
      setCreating(true);
      const deadlineSeconds = parseInt(deadlineDays) * 86400;
      const graceSeconds = parseInt(graceDays) * 86400;
      const lamports = Math.floor(parseFloat(depositAmount) * LAMPORTS_PER_SOL);

      // Placeholder will CID and hash
      const willCid = new TextEncoder().encode('pending-will-upload');
      const willHash = new Uint8Array(32); // zeros = no will uploaded yet

      const tx = await onInitializeVault(
        deadlineSeconds,
        graceSeconds,
        willCid,
        willHash,
        lamports
      );
      setTxHash(tx);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
    } finally {
      setCreating(false);
    }
  }, [deadlineDays, graceDays, depositAmount, onInitializeVault, onRefresh]);

  // Don't show if vault already exists
  if (hasVault) return null;

  return (
    <div className="panel" style={{ borderColor: 'var(--accent)' }}>
      <div className="panel-header" style={{ borderBottomColor: 'var(--accent)' }}>
        <span className="panel-title">
          <TypewriterText text="🔐 CREATE YOUR VAULT" speed={40} />
        </span>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent)' }}>
          REQUIRED
        </span>
      </div>

      <div className="panel-body">
        <div style={{
          background: 'rgba(228,119,84,0.08)',
          border: '1px solid var(--accent)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 'var(--font-size-xs)',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          ⚡ Initialize your on-chain vault to start managing heirs, depositing SOL,
          and setting your heartbeat deadlines. This is a one-time setup transaction.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="input-group">
            <label className="input-label">Deadline (days)</label>
            <input
              className="input-field"
              type="number"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              min="1" max="365"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2, display: 'block' }}>
              Time before vault triggers
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">Grace Period (days)</label>
            <input
              className="input-field"
              type="number"
              value={graceDays}
              onChange={(e) => setGraceDays(e.target.value)}
              min="1" max="90"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2, display: 'block' }}>
              Extra time before execution
            </span>
          </div>

          <div className="input-group">
            <label className="input-label">Initial Deposit (SOL)</label>
            <input
              className="input-field"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="0" step="0.01"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: 2, display: 'block' }}>
              Locked in your vault
            </span>
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--red)', fontSize: 'var(--font-size-xs)', marginTop: 12 }}>
            ✗ {error}
          </p>
        )}
        {txHash && (
          <p style={{ color: 'var(--green)', fontSize: 'var(--font-size-xs)', marginTop: 12 }}>
            ✓ Vault created! Tx: {txHash.slice(0, 16)}...
          </p>
        )}

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            className="btn"
            onClick={handleCreate}
            disabled={!connected || creating}
            style={{
              padding: '12px 32px',
              fontSize: 'var(--font-size-sm)',
              background: creating ? 'var(--bg-tertiary)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              letterSpacing: 2,
            }}
          >
            {creating ? '⏳ INITIALIZING VAULT...' : '🔐 INITIALIZE VAULT'}
          </button>
        </div>
      </div>
    </div>
  );
}
