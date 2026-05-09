import { useCallback, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  BN,
  setProvider,
} from '@coral-xyz/anchor';
import idlJson from '@/idl/dead_man_protocol.json';

const PROGRAM_ID = new PublicKey('FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq');

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions)
      return null;
    const p = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });
    setProvider(p);
    return p;
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idlJson as any, provider);
  }, [provider]);

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

  const getBeneficiaryPda = useCallback(
    (vault: PublicKey, wallet: PublicKey) => {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('beneficiary'), vault.toBuffer(), wallet.toBuffer()],
        PROGRAM_ID
      );
      return pda;
    },
    []
  );

  const sendHeartbeat = useCallback(async () => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');
    const vaultPda = getVaultPda(wallet.publicKey);
    const tx = await (program.methods as any)
      .heartbeat()
      .accounts({
        owner: wallet.publicKey,
        vault: vaultPda,
      })
      .rpc();
    return tx;
  }, [program, wallet.publicKey, getVaultPda]);

  const initializeVault = useCallback(
    async (
      deadlineSeconds: number,
      gracePeriodSeconds: number,
      encryptedWillCid: Uint8Array,
      willHash: Uint8Array,
      depositLamports: number
    ) => {
      if (!program || !wallet.publicKey)
        throw new Error('Wallet not connected');
      const vaultPda = getVaultPda(wallet.publicKey);
      const tx = await (program.methods as any)
        .initializeVault(
          new BN(deadlineSeconds),
          new BN(gracePeriodSeconds),
          Buffer.from(encryptedWillCid),
          Array.from(willHash),
          new BN(depositLamports)
        )
        .accounts({
          owner: wallet.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      return tx;
    },
    [program, wallet.publicKey, getVaultPda]
  );

  const addBeneficiary = useCallback(
    async (
      beneficiaryWallet: PublicKey,
      shareBps: number,
      encryptedSecretCid: Uint8Array
    ) => {
      if (!program || !wallet.publicKey)
        throw new Error('Wallet not connected');
      const vaultPda = getVaultPda(wallet.publicKey);
      const beneficiaryPda = getBeneficiaryPda(vaultPda, beneficiaryWallet);
      const tx = await (program.methods as any)
        .addBeneficiary(beneficiaryWallet, shareBps, Buffer.from(encryptedSecretCid))
        .accounts({
          owner: wallet.publicKey,
          vault: vaultPda,
          beneficiaryRecord: beneficiaryPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      return tx;
    },
    [program, wallet.publicKey, getVaultPda, getBeneficiaryPda]
  );

  const depositSol = useCallback(
    async (amountSol: number) => {
      if (!program || !wallet.publicKey)
        throw new Error('Wallet not connected');
      const vaultPda = getVaultPda(wallet.publicKey);
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
      const tx = await (program.methods as any)
        .depositSol(new BN(lamports))
        .accounts({
          depositor: wallet.publicKey,
          vault: vaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      return tx;
    },
    [program, wallet.publicKey, getVaultPda]
  );

  const emergencyCancel = useCallback(async () => {
    if (!program || !wallet.publicKey) throw new Error('Wallet not connected');
    const vaultPda = getVaultPda(wallet.publicKey);
    const tx = await (program.methods as any)
      .emergencyCancel()
      .accounts({
        owner: wallet.publicKey,
        vault: vaultPda,
      })
      .rpc();
    return tx;
  }, [program, wallet.publicKey, getVaultPda]);

  const extendDeadline = useCallback(
    async (newDeadlineSeconds: number) => {
      if (!program || !wallet.publicKey)
        throw new Error('Wallet not connected');
      const vaultPda = getVaultPda(wallet.publicKey);
      const tx = await (program.methods as any)
        .extendDeadline(new BN(newDeadlineSeconds))
        .accounts({
          owner: wallet.publicKey,
          vault: vaultPda,
        })
        .rpc();
      return tx;
    },
    [program, wallet.publicKey, getVaultPda]
  );

  return {
    program,
    provider,
    getVaultPda,
    getBeneficiaryPda,
    sendHeartbeat,
    initializeVault,
    addBeneficiary,
    depositSol,
    emergencyCancel,
    extendDeadline,
    connected: !!wallet.publicKey,
    publicKey: wallet.publicKey,
  };
}
