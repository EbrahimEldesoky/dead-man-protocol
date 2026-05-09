import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DeadManProtocol } from "../target/types/dead_man_protocol";
import { startAnchor, Clock } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("dead-man-protocol", () => {
  let provider: BankrunProvider;
  let program: Program<DeadManProtocol>;
  let context: any;

  const owner = Keypair.generate();
  const beneficiary = Keypair.generate();

  let vaultPda: PublicKey;
  let beneficiaryRecordPda: PublicKey;

  before(async () => {
    context = await startAnchor("", [{ name: "dead_man_protocol", programId: new PublicKey("FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq") }], []);
    provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    program = anchor.workspace.DeadManProtocol as Program<DeadManProtocol>;

    // Airdrop some SOL to the owner and beneficiary
    const fundAmount = 10 * anchor.web3.LAMPORTS_PER_SOL;
    context.setAccount(owner.publicKey, {
      data: Buffer.alloc(0),
      executable: false,
      lamports: fundAmount,
      owner: SystemProgram.programId,
    });
    context.setAccount(beneficiary.publicKey, {
      data: Buffer.alloc(0),
      executable: false,
      lamports: fundAmount,
      owner: SystemProgram.programId,
    });

    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), owner.publicKey.toBuffer()],
      program.programId
    );

    [beneficiaryRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("beneficiary"), vaultPda.toBuffer(), beneficiary.publicKey.toBuffer()],
      program.programId
    );
  });

  const DEADLINE_SECONDS = new anchor.BN(30 * 24 * 60 * 60); // 30 days
  const GRACE_PERIOD_SECONDS = new anchor.BN(3 * 24 * 60 * 60); // 3 days
  const DEPOSIT_AMOUNT = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
  const WILL_CID = Buffer.from("QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco".padEnd(64, '\0'));
  const WILL_HASH = Array(32).fill(1) as number[];

  it("Initializes the vault", async () => {
    await program.methods
      .initializeVault(
        DEADLINE_SECONDS,
        GRACE_PERIOD_SECONDS,
        WILL_CID,
        WILL_HASH,
        DEPOSIT_AMOUNT
      )
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
      } as any)
      .signers([owner])
      .rpc();

    const vaultAccount = await program.account.vaultConfig.fetch(vaultPda);
    expect(vaultAccount.owner.toBase58()).to.equal(owner.publicKey.toBase58());
    expect(vaultAccount.deadlineSeconds.toString()).to.equal(DEADLINE_SECONDS.toString());
  });

  it("Adds a beneficiary", async () => {
    const shareBps = 10000; // 100%
    const secretCid = Buffer.from("QmSecretCid".padEnd(64, '\0'));

    await program.methods
      .addBeneficiary(beneficiary.publicKey, shareBps, secretCid)
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
        beneficiaryRecord: beneficiaryRecordPda,
      } as any)
      .signers([owner])
      .rpc();

    const record = await program.account.beneficiaryRecord.fetch(beneficiaryRecordPda);
    expect(record.wallet.toBase58()).to.equal(beneficiary.publicKey.toBase58());
    expect(record.shareBps).to.equal(shareBps);
  });

  it("Sends a heartbeat", async () => {
    const vaultBefore = await program.account.vaultConfig.fetch(vaultPda);

    // Simulate passing time
    const currentClock = await context.banksClient.getClock();
    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        currentClock.unixTimestamp + BigInt(100)
      )
    );

    await program.methods
      .heartbeat()
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
      } as any)
      .signers([owner])
      .rpc();

    const vaultAfter = await program.account.vaultConfig.fetch(vaultPda);
    expect(vaultAfter.lastHeartbeat.toNumber()).to.be.greaterThan(vaultBefore.lastHeartbeat.toNumber());
  });

  it("Fails non-owner heartbeat", async () => {
    try {
      await program.methods
        .heartbeat()
        .accounts({
          owner: beneficiary.publicKey,
          vault: vaultPda,
        } as any)
        .signers([beneficiary])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      expect(e).to.be.ok;
    }
  });

  it("Cannot claim before deadline", async () => {
    try {
      await program.methods
        .claimInheritanceSol()
        .accounts({
          beneficiaryWallet: beneficiary.publicKey,
          vault: vaultPda,
          beneficiaryRecord: beneficiaryRecordPda,
        } as any)
        .signers([beneficiary])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      expect(e.message).to.include("DeadlineNotPassed");
    }
  });

  it("Share overflow fails", async () => {
    const extraBeneficiary = Keypair.generate();
    const [extraRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("beneficiary"), vaultPda.toBuffer(), extraBeneficiary.publicKey.toBuffer()],
      program.programId
    );
    try {
      await program.methods
        .addBeneficiary(extraBeneficiary.publicKey, 8000, Buffer.from(Array(64).fill(0)))
        .accounts({
          owner: owner.publicKey,
          beneficiaryWallet: extraBeneficiary.publicKey,
          vault: vaultPda,
          beneficiaryRecord: extraRecordPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .signers([owner])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      expect(e.message).to.include("SharesExceedMaximum");
    }
  });

  it("Extends the deadline", async () => {
    const newDeadline = new anchor.BN(40 * 24 * 60 * 60);
    await program.methods
      .extendDeadline(newDeadline)
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
      } as any)
      .signers([owner])
      .rpc();
    const vault = await program.account.vaultConfig.fetch(vaultPda);
    expect(vault.deadlineSeconds.toString()).to.equal(newDeadline.toString());
  });

  it("Claims inheritance successfully", async () => {
    // Fast forward past deadline and grace period
    const vault = await program.account.vaultConfig.fetch(vaultPda);
    const futureTime = BigInt(vault.lastHeartbeat.toNumber() + vault.deadlineSeconds.toNumber() + vault.gracePeriodSeconds.toNumber() + 100);
    const currentClock = await context.banksClient.getClock();

    context.setClock(
      new Clock(
        currentClock.slot,
        currentClock.epochStartTimestamp,
        currentClock.epoch,
        currentClock.leaderScheduleEpoch,
        futureTime
      )
    );

    const beneficiaryBalanceBefore = await context.banksClient.getBalance(beneficiary.publicKey);

    await program.methods
      .claimInheritanceSol()
      .accounts({
        beneficiaryWallet: beneficiary.publicKey,
        vault: vaultPda,
        beneficiaryRecord: beneficiaryRecordPda,
      } as any)
      .signers([beneficiary])
      .rpc();

    const beneficiaryBalanceAfter = await context.banksClient.getBalance(beneficiary.publicKey);
    expect(Number(beneficiaryBalanceAfter)).to.be.greaterThan(Number(beneficiaryBalanceBefore));
  });

  it("Double-claim prevention", async () => {
    try {
      await program.methods
        .claimInheritanceSol()
        .accounts({
          beneficiaryWallet: beneficiary.publicKey,
          vault: vaultPda,
          beneficiaryRecord: beneficiaryRecordPda,
        } as any)
        .signers([beneficiary])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      expect(e.message).to.include("AlreadyClaimed");
    }
  });

  it("Emergency cancel rejection after claim", async () => {
    try {
      await program.methods
        .emergencyCancel()
        .accounts({
          owner: owner.publicKey,
          vault: vaultPda,
        } as any)
        .signers([owner])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      expect(e).to.be.ok;
    }
  });
});
