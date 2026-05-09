'use client';

import { VaultData, CountdownData } from '@/hooks/useVault';
import TypewriterText from './TypewriterText';

interface VaultPulseProps {
  vault: VaultData | null;
  countdown: CountdownData;
  vaultBalance: number;
  solPrice: number | null;
  loading: boolean;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(ts: number): string {
  if (!ts) return 'N/A';
  return new Date(ts * 1000).toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

function getStatusLabel(vault: VaultData | null, countdown: CountdownData) {
  if (!vault) return { text: 'NO VAULT', cls: '' };
  if (vault.isCancelled) return { text: 'CANCELLED', cls: 'triggered' };
  if (vault.isExecuted) return { text: 'EXECUTED', cls: 'triggered' };
  if (countdown.isTriggered) return { text: 'TRIGGERED', cls: 'triggered' };
  if (countdown.inGracePeriod) return { text: 'GRACE PERIOD', cls: 'warning' };
  return { text: 'ACTIVE', cls: 'active' };
}

export default function VaultPulse({
  vault,
  countdown,
  vaultBalance,
  solPrice,
  loading,
}: VaultPulseProps) {
  const status = getStatusLabel(vault, countdown);
  const usdValue = solPrice ? (vaultBalance * solPrice).toFixed(2) : '—';

  if (!vault) {
    return (
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            <TypewriterText text="◉ THE PULSE — VAULT STATUS" speed={40} />
          </span>
        </div>
        <div className="panel-body">
          <div className="empty-state">
            <div className="empty-icon">💀</div>
            <div className="empty-text">
              {loading ? 'Scanning blockchain...' : 'No vault detected for this wallet.'}
            </div>
            {!loading && (
              <div style={{ color: 'var(--text-dim)', fontSize: 'var(--font-size-xs)' }}>
                Initialize a vault to begin your inheritance protocol.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">
          <TypewriterText text="◉ THE PULSE — VAULT STATUS" speed={40} />
        </span>
        <span className={`panel-status ${status.cls}`}>{status.text}</span>
      </div>

      <div className="panel-body">
        {/* Countdown Timer */}
        <div className="countdown-container">
          <div className="countdown-segment">
            <div className="countdown-value glow-text">{pad(countdown.days)}</div>
            <div className="countdown-label">Days</div>
          </div>
          <div className="countdown-separator">:</div>
          <div className="countdown-segment">
            <div className="countdown-value glow-text">{pad(countdown.hours)}</div>
            <div className="countdown-label">Hours</div>
          </div>
          <div className="countdown-separator">:</div>
          <div className="countdown-segment">
            <div className="countdown-value glow-text">{pad(countdown.minutes)}</div>
            <div className="countdown-label">Mins</div>
          </div>
          <div className="countdown-separator">:</div>
          <div className="countdown-segment">
            <div className="countdown-value glow-text">{pad(countdown.seconds)}</div>
            <div className="countdown-label">Secs</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container" style={{ marginBottom: '16px' }}>
          <div
            className={`progress-bar-fill ${countdown.percentRemaining < 10
                ? 'danger'
                : countdown.percentRemaining < 30
                  ? 'warning'
                  : ''
              }`}
            style={{ width: `${countdown.percentRemaining}%` }}
          />
        </div>

        <div className="ascii-divider">
          ═══════════════════════════════════════════════
        </div>

        {/* Stats Grid */}
        <div className="grid-3" style={{ marginTop: '12px' }}>
          <div className="stat-block">
            <div className="stat-label">Vault Balance</div>
            <div className="stat-value accent">{vaultBalance.toFixed(4)} SOL</div>
            <div className="stat-sub">≈ ${usdValue} USD</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Last Heartbeat</div>
            <div className="stat-value" style={{ fontSize: 'var(--font-size-sm)' }}>
              {formatDate(vault.lastHeartbeat)}
            </div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Deadline Window</div>
            <div className="stat-value">
              {Math.floor(vault.deadlineSeconds / 86400)}d
            </div>
            <div className="stat-sub">
              + {Math.floor(vault.gracePeriodSeconds / 86400)}d grace
            </div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Beneficiaries</div>
            <div className="stat-value accent">{vault.beneficiaryCount}</div>
            <div className="stat-sub">/ 10 max</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Shares Allocated</div>
            <div className="stat-value">
              {(vault.totalShares / 100).toFixed(2)}%
            </div>
            <div className="stat-sub">{vault.totalShares} / 10000 bps</div>
          </div>

          <div className="stat-block">
            <div className="stat-label">Will on IPFS</div>
            <div className="stat-value" style={{ fontSize: 'var(--font-size-xs)' }}>
              {vault.encryptedWillCid.length > 0 ? '✓ STORED' : '✗ NONE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
