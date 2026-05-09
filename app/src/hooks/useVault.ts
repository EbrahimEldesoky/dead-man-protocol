import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq');

export interface VaultData {
  owner: PublicKey;
  lastHeartbeat: number;
  deadlineSeconds: number;
  gracePeriodSeconds: number;
  encryptedWillCid: number[];
  willHash: number[];
  totalShares: number;
  beneficiaryCount: number;
  isExecuted: boolean;
  isCancelled: boolean;
  bump: number;
}

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isTriggered: boolean;
  inGracePeriod: boolean;
  percentRemaining: number;
}

export function useVault() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [vault, setVault] = useState<VaultData | null>(null);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isTriggered: false,
    inGracePeriod: false,
    percentRemaining: 100,
  });

  const getVaultPda = useCallback(
    (owner: PublicKey) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('vault'), owner.toBuffer()],
        PROGRAM_ID
      );
      return pda;
    },
    []
  );

  const fetchVault = useCallback(async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    setError(null);

    try {
      const vaultPda = getVaultPda(wallet.publicKey);
      const accountInfo = await connection.getAccountInfo(vaultPda);

      if (!accountInfo) {
        setVault(null);
        setVaultBalance(0);
        setLoading(false);
        return;
      }

      // Get vault SOL balance (account lamports minus rent)
      const balance = accountInfo.lamports / LAMPORTS_PER_SOL;
      setVaultBalance(balance);

      // Decode account data using Anchor discriminator + borsh layout
      const data = accountInfo.data;
      if (data.length < 8) {
        setVault(null);
        setLoading(false);
        return;
      }

      // Skip 8-byte discriminator
      let offset = 8;

      // owner: Pubkey (32 bytes)
      const owner = new PublicKey(data.slice(offset, offset + 32));
      offset += 32;

      // last_heartbeat: i64 (8 bytes)
      const lastHeartbeat = Number(data.readBigInt64LE(offset));
      offset += 8;

      // deadline_seconds: i64 (8 bytes)
      const deadlineSeconds = Number(data.readBigInt64LE(offset));
      offset += 8;

      // encrypted_will_cid: Vec<u8> (4-byte len + data)
      const cidLen = data.readUInt32LE(offset);
      offset += 4;
      const encryptedWillCid = Array.from(data.slice(offset, offset + cidLen));
      offset += cidLen;

      // will_hash: [u8; 32]
      const willHash = Array.from(data.slice(offset, offset + 32));
      offset += 32;

      // total_shares: u16
      const totalShares = data.readUInt16LE(offset);
      offset += 2;

      // beneficiary_count: u8
      const beneficiaryCount = data.readUInt8(offset);
      offset += 1;

      // is_executed: bool
      const isExecuted = data.readUInt8(offset) === 1;
      offset += 1;

      // is_cancelled: bool
      const isCancelled = data.readUInt8(offset) === 1;
      offset += 1;

      // grace_period_seconds: i64
      const gracePeriodSeconds = Number(data.readBigInt64LE(offset));
      offset += 8;

      // bump: u8
      const bump = data.readUInt8(offset);

      setVault({
        owner,
        lastHeartbeat,
        deadlineSeconds,
        gracePeriodSeconds,
        encryptedWillCid,
        willHash,
        totalShares,
        beneficiaryCount,
        isExecuted,
        isCancelled,
        bump,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vault');
      setVault(null);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey, connection, getVaultPda]);

  // Fetch on connect and periodically
  useEffect(() => {
    fetchVault();
    const interval = setInterval(fetchVault, 30000);
    return () => clearInterval(interval);
  }, [fetchVault]);

  // Countdown timer — ticks every second
  useEffect(() => {
    if (!vault) return;

    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = vault.lastHeartbeat + vault.deadlineSeconds;
      const graceEnd = deadline + vault.gracePeriodSeconds;
      const remaining = graceEnd - now;

      if (remaining <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isTriggered: true,
          inGracePeriod: false,
          percentRemaining: 0,
        });
        return;
      }

      const inGrace = now >= deadline && now < graceEnd;
      const totalWindow = vault.deadlineSeconds + vault.gracePeriodSeconds;
      const percentRemaining = Math.max(0, (remaining / totalWindow) * 100);

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        totalSeconds: remaining,
        isTriggered: false,
        inGracePeriod: inGrace,
        percentRemaining,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [vault]);

  return {
    vault,
    vaultBalance,
    countdown,
    loading,
    error,
    refetch: fetchVault,
  };
}
