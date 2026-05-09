'use client';

import { useState, useCallback } from 'react';
import TerminalLog, { LogEntry } from './TerminalLog';
import TypewriterText from './TypewriterText';

interface DepositPanelProps {
  vaultBalance: number;
  solPrice: number | null;
  connected: boolean;
  hasVault: boolean;
  onDepositSol: (amount: number) => Promise<string>;
  onRefresh: () => void;
}

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(11, 19);
}

export default function DepositPanel({
  vaultBalance,
  solPrice,
  connected,
  hasVault,
  onDepositSol,
  onRefresh,
}: DepositPanelProps) {
  const [solAmount, setSolAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { timestamp: getTimestamp(), message, type }]);
  }, []);

  const handleDeposit = useCallback(async () => {
    const amount = parseFloat(solAmount);
    if (isNaN(amount) || amount <= 0) {
      addLog('ERROR: Invalid deposit amount.', 'error');
      return;
    }

    setProcessing(true);
    addLog(`Depositing ${amount} SOL to vault...`, 'info');

    try {
      const tx = await onDepositSol(amount);
      addLog(`TX CONFIRMED: ${tx}`, 'success');
      addLog(`Successfully deposited ${amount} SOL.`, 'success');
      setSolAmount('');
      onRefresh();
    } catch (err: any) {
      addLog(`ERROR: ${err.message || 'Deposit failed'}`, 'error');
    } finally {
      setProcessing(false);
    }
  }, [solAmount, onDepositSol, addLog, onRefresh]);

  const usdValue = solPrice ? (vaultBalance * solPrice).toFixed(2) : '—';

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">
          <TypewriterText text="◈ DEPOSIT CENTER" speed={40} />
        </span>
        {processing && <span className="spinner" />}
      </div>

      <div className="panel-body">
        {/* Current Balance */}
        <div className="grid-2" style={{ marginBottom: '16px' }}>
          <div className="stat-block">
            <div className="stat-label">Vault SOL Balance</div>
            <div className="stat-value accent">{vaultBalance.toFixed(4)} SOL</div>
            <div className="stat-sub">≈ ${usdValue} USD</div>
          </div>
          <div className="stat-block">
            <div className="stat-label">SOL/USD Price</div>
            <div className="stat-value">
              ${solPrice ? solPrice.toFixed(2) : '—'}
            </div>
            <div className="stat-sub">via Birdeye / CoinGecko</div>
          </div>
        </div>

        <div className="ascii-divider">
          ─── DEPOSIT SOL ───────────────────────────
        </div>

        {/* SOL Deposit */}
        <div style={{ marginTop: '12px' }}>
          <div className="input-group">
            <label className="input-label">Amount (SOL)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input-field"
                type="number"
                placeholder="0.00"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                min="0.001"
                step="0.001"
                style={{ flex: 1 }}
              />
              <button
                className="btn"
                onClick={handleDeposit}
                disabled={!connected || !hasVault || processing}
              >
                {processing ? 'SENDING...' : 'DEPOSIT_SOL'}
              </button>
            </div>
            {solAmount && solPrice && (
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-dim)',
                marginTop: '4px',
              }}>
                ≈ ${(parseFloat(solAmount) * solPrice).toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        {/* SPL Token Deposit (Coming Soon) */}
        <div className="ascii-divider" style={{ marginTop: '16px' }}>
          ─── DEPOSIT SPL TOKEN ─────────────────────
        </div>

        <div style={{
          marginTop: '12px',
          padding: '12px',
          border: '1px dashed var(--border-dim)',
          textAlign: 'center',
        }}>
          <div style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-xs)' }}>
            SPL Token deposits available via program.
            <br />
            Use the CLI for advanced token operations:
            <br />
            <code style={{ color: 'var(--accent)' }}>node dist/index.js deposit --token MINT_ADDRESS --amount VALUE</code>
          </div>
        </div>

        {/* Deposit Log */}
        {logs.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div className="ascii-divider">
              ─── TRANSACTION LOG ────────────────────────
            </div>
            <TerminalLog logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}
