'use client';

import { useState, useCallback } from 'react';
import TerminalLog, { LogEntry } from './TerminalLog';
import TypewriterText from './TypewriterText';

interface HeartbeatTriggerProps {
  onSendHeartbeat: () => Promise<string>;
  connected: boolean;
  hasVault: boolean;
}

function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(11, 19);
}

export default function HeartbeatTrigger({
  onSendHeartbeat,
  connected,
  hasVault,
}: HeartbeatTriggerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [processing, setProcessing] = useState(false);

  const addLog = useCallback((message: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { timestamp: getTimestamp(), message, type }]);
  }, []);

  const handleHeartbeat = useCallback(async () => {
    if (!connected || !hasVault || processing) return;

    setProcessing(true);
    addLog('Initiating heartbeat transaction...', 'info');
    addLog('Signing with Solflare wallet...', 'info');

    try {
      const txSig = await onSendHeartbeat();
      addLog('Transaction submitted to Solana cluster.', 'info');
      addLog(`TX CONFIRMED: ${txSig}`, 'success');
      addLog('Heartbeat recorded. Deadline clock reset.', 'success');
      addLog('════════════════════════════════════════', 'info');
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      addLog(`ERROR: ${msg}`, 'error');
      if (msg.includes('User rejected')) {
        addLog('Transaction was rejected by the user.', 'warning');
      }
    } finally {
      setProcessing(false);
    }
  }, [connected, hasVault, processing, onSendHeartbeat, addLog]);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">
          <TypewriterText text="♥ HEARTBEAT TRIGGER" speed={40} />
        </span>
        {processing && <span className="spinner" />}
      </div>

      <div className="panel-body">
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-xs)', marginBottom: '12px' }}>
            Send a proof-of-life heartbeat to reset your vault&apos;s deadline clock.
            <br />
            This is the only action keeping your vault from triggering.
          </p>

          <button
            className="btn btn-large"
            onClick={handleHeartbeat}
            disabled={!connected || !hasVault || processing}
            style={{ maxWidth: '400px' }}
          >
            {processing ? 'PROCESSING...' : 'SEND_HEARTBEAT'}
          </button>

          {!connected && (
            <p style={{ color: 'var(--yellow)', fontSize: 'var(--font-size-xs)', marginTop: '8px' }}>
              ⚠ Connect your wallet first
            </p>
          )}
          {connected && !hasVault && (
            <p style={{ color: 'var(--yellow)', fontSize: 'var(--font-size-xs)', marginTop: '8px' }}>
              ⚠ No vault found — initialize one first
            </p>
          )}
        </div>

        <div className="ascii-divider">
          ─── TRANSACTION LOG ────────────────────────
        </div>

        <TerminalLog logs={logs} showCursor={!processing} />
      </div>
    </div>
  );
}
