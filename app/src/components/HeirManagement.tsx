'use client';

import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import TypewriterText from './TypewriterText';

interface Beneficiary {
  wallet: string;
  shareBps: number;
  isClaimed: boolean;
  claimedAt: number;
}

interface HeirManagementProps {
  beneficiaries: Beneficiary[];
  totalShares: number;
  connected: boolean;
  hasVault: boolean;
  ownerWallet?: string;
  onAddBeneficiary: (
    wallet: PublicKey,
    shareBps: number,
    encryptedSecretCid: Uint8Array
  ) => Promise<string>;
  onRefresh: () => void;
}

function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function HeirManagement({
  beneficiaries,
  totalShares,
  connected,
  hasVault,
  ownerWallet,
  onAddBeneficiary,
  onRefresh,
}: HeirManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [walletInput, setWalletInput] = useState('');
  const [shareInput, setShareInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [quantumStatus, setQuantumStatus] = useState('');

  const handleAdd = useCallback(async () => {
    setAddError('');
    setQuantumStatus('');

    if (!walletInput || !shareInput) {
      setAddError('Wallet address and share percentage are required.');
      return;
    }

    try {
      const pk = new PublicKey(walletInput);
      const sharePct = parseFloat(shareInput);
      if (isNaN(sharePct) || sharePct <= 0 || sharePct > 100) {
        setAddError('Share must be between 0.01 and 100.');
        return;
      }
      const shareBps = Math.round(sharePct * 100);
      const secretBytes = new TextEncoder().encode(secretInput || 'No secret provided');

      setAdding(true);

      // Step 1: Register heir on-chain via Anchor
      await onAddBeneficiary(pk, shareBps, secretBytes);

      // Step 2: If email provided, securely register it via Quantum API
      if (emailInput) {
        setQuantumStatus('🔐 Encrypting message with Quantum Key Distribution...');
        const res = await fetch('/api/heirs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerWallet: ownerWallet || 'anonymous',
            heirWallet: walletInput,
            heirEmail: emailInput,
            message: messageInput || `You have been designated as a beneficiary with ${sharePct.toFixed(2)}% share of the vault.`,
            shareBps,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Quantum API failed.');
        setQuantumStatus(`✓ Quantum Key: ${data.data.quantumKeyId}`);
      }

      setShowModal(false);
      setWalletInput('');
      setShareInput('');
      setSecretInput('');
      setEmailInput('');
      setMessageInput('');
      onRefresh();
    } catch (err: any) {
      setAddError(err.message || 'Failed to add beneficiary');
    } finally {
      setAdding(false);
    }
  }, [walletInput, shareInput, secretInput, emailInput, messageInput, ownerWallet, onAddBeneficiary, onRefresh]);

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">
            <TypewriterText text="⧉ HEIR MANAGEMENT" speed={40} />
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)' }}>
            {totalShares / 100}% / 100% allocated
          </span>
        </div>

        <div className="panel-body">
          {beneficiaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⧉</div>
              <div className="empty-text">No beneficiaries registered.</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)', marginTop: 6 }}>
                Add a wallet address, share %, email, and a personal message.
              </div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Wallet</th>
                  <th>Share</th>
                  <th>BPS</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaries.map((b, i) => (
                  <tr key={b.wallet}>
                    <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                    <td className="address-cell">{truncateAddress(b.wallet)}</td>
                    <td className="share-cell">{(b.shareBps / 100).toFixed(2)}%</td>
                    <td style={{ color: 'var(--text-dim)' }}>{b.shareBps}</td>
                    <td>
                      <span className={b.isClaimed ? 'status-claimed' : 'status-pending'}>
                        {b.isClaimed ? '✓ CLAIMED' : '◌ PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Share Allocation Bar */}
          <div style={{ marginTop: '12px' }}>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${totalShares / 100}%` }}
              />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 'var(--font-size-xs)', color: 'var(--text-dim)', marginTop: '4px',
            }}>
              <span>0%</span>
              <span>{(totalShares / 100).toFixed(2)}% allocated</span>
              <span>100%</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            {!hasVault ? (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(228,119,84,0.08)',
                border: '1px dashed var(--accent)',
                borderRadius: 8,
                fontSize: 'var(--font-size-xs)',
                color: 'var(--accent)',
              }}>
                ⚠ Initialize your Vault first to start adding heirs
              </div>
            ) : (
              <button
                className="btn"
                onClick={() => setShowModal(true)}
                disabled={!connected}
                style={{
                  padding: '10px 28px',
                  fontSize: 'var(--font-size-sm)',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  letterSpacing: 2,
                }}
              >
                + ADD HEIR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Heir Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div className="modal-header">
              <span className="modal-title">🔐 ADD BENEFICIARY</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Quantum security badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(228,119,84,0.08)', border: '1px solid var(--accent)',
                borderRadius: 8, padding: '8px 12px', marginBottom: 20,
                fontSize: 'var(--font-size-xs)', color: 'var(--accent)',
              }}>
                ⚛ Heir email and message will be encrypted using IBM Quantum Key Distribution (QKD)
              </div>

              <div className="input-group">
                <label className="input-label">Heir Wallet Address *</label>
                <input
                  className="input-field"
                  placeholder="Solana public key (e.g. 7xKXt...)"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Share Percentage *</label>
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. 60 for 60%"
                  value={shareInput}
                  onChange={(e) => setShareInput(e.target.value)}
                  min="0.01" max="100" step="0.01"
                />
              </div>

              {/* ── Email Section ── */}
              <div style={{
                borderTop: '1px solid var(--border-dim)', margin: '16px 0',
                paddingTop: 16,
              }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>
                  📧 NOTIFICATION & MESSAGE (secured via QKD)
                </div>

                <div className="input-group">
                  <label className="input-label">Heir Email Address</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="heir@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4, display: 'block' }}>
                    Stored encrypted — never exposed in plaintext
                  </span>
                </div>

                <div className="input-group">
                  <label className="input-label">Personal Message to Heir</label>
                  <textarea
                    className="input-field"
                    placeholder="Write a personal message, instructions, or last wishes for this heir..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Secret / Seed Phrase (Optional)</label>
                <textarea
                  className="input-field"
                  placeholder="Private key, seed phrase, or vault code for this heir..."
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {quantumStatus && (
                <p style={{ color: 'var(--accent)', fontSize: 'var(--font-size-xs)', marginTop: 8 }}>
                  {quantumStatus}
                </p>
              )}
              {addError && (
                <p style={{ color: 'var(--red)', fontSize: 'var(--font-size-xs)', marginTop: 8 }}>
                  ✗ {addError}
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn" onClick={() => setShowModal(false)}>CANCEL</button>
              <button className="btn btn-large" onClick={handleAdd} disabled={adding}
                style={{ padding: '10px 24px', fontSize: 'var(--font-size-sm)' }}>
                {adding ? '⏳ SECURING...' : '🔐 CONFIRM & ENCRYPT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
