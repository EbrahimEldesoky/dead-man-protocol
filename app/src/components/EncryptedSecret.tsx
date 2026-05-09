'use client';

import { useState, useRef, useCallback } from 'react';
import TypewriterText from './TypewriterText';

interface EncryptedSecretProps {
  willCid: number[];
  willHash: number[];
  connected: boolean;
  hasVault: boolean;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToString(bytes: number[]): string {
  try {
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return bytesToHex(bytes);
  }
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '...';
}

export default function EncryptedSecret({
  willCid,
  willHash,
  connected,
  hasVault,
}: EncryptedSecretProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const cidString = willCid.length > 0 ? bytesToString(willCid) : '';
  const hashString = willHash.length > 0 ? bytesToHex(willHash) : '';

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const copyToClipboard = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* clipboard can fail silently */ }
  }, []);

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">
          <TypewriterText text="⚿ ENCRYPTED SECRET VAULT" speed={40} />
        </span>
        <span className={`panel-status ${willCid.length > 0 ? 'active' : ''}`}>
          {willCid.length > 0 ? 'ENCRYPTED' : 'EMPTY'}
        </span>
      </div>

      <div className="panel-body">
        {/* Current Will Info */}
        {willCid.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div className="stat-label" style={{ marginBottom: '6px' }}>
              IPFS CID
            </div>
            <div className="cid-display">
              <span style={{ flex: 1 }}>{truncate(cidString, 48)}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(cidString, 'cid')}
              >
                {copied === 'cid' ? '✓' : 'COPY'}
              </button>
            </div>

            <div className="stat-label" style={{ marginTop: '12px', marginBottom: '6px' }}>
              SHA-256 INTEGRITY HASH
            </div>
            <div className="cid-display">
              <span style={{ flex: 1 }}>{truncate(hashString, 48)}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(hashString, 'hash')}
              >
                {copied === 'hash' ? '✓' : 'COPY'}
              </button>
            </div>
          </div>
        )}

        <div className="ascii-divider">
          ─── UPLOAD LAST WILL ───────────────────────
        </div>

        {/* Upload Zone */}
        <div
          className="upload-zone"
          onClick={() => fileRef.current?.click()}
          style={{ marginTop: '12px' }}
        >
          <input
            type="file"
            ref={fileRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".json,.txt,.pdf,.doc,.docx"
          />
          <div className="upload-icon">📄</div>
          <div className="upload-text">
            {selectedFile
              ? `Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
              : 'Click to upload your Last Will document'}
          </div>
          <div className="upload-text" style={{ marginTop: '4px' }}>
            File will be encrypted with AES-256-GCM before IPFS upload
          </div>
        </div>

        {selectedFile && (
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <button
              className="btn"
              disabled={!connected || !hasVault}
            >
              UPDATE_WILL
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div
          style={{
            marginTop: '16px',
            padding: '10px',
            border: '1px solid var(--border-dim)',
            background: 'var(--bg-secondary)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-dim)',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>⚿ SECURITY NOTE:</span> Your will is
          encrypted client-side before upload. The encryption key never touches the
          blockchain. Each heir&apos;s secret is encrypted individually using their public
          key. Only they can decrypt their designated secret.
        </div>
      </div>
    </div>
  );
}
