<div align="center">

```
██████╗ ███╗   ███╗██████╗     ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██╔══██╗████╗ ████║██╔══██╗    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██║  ██║██╔████╔██║██████╔╝    ██║   ██║███████║██║   ██║██║     ██║
██║  ██║██║╚██╔╝██║██╔══██╗    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║
██████╔╝██║ ╚═╝ ██║██████╔╝     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║
╚═════╝ ╚═╝     ╚═╝╚═════╝       ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝
```

### 💀 *"Your keys die with you. Your assets don't have to."*

<br/>

[![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?style=for-the-badge&logo=solana&logoColor=white)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.0-512DA8?style=for-the-badge)](https://anchor-lang.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)
[![Birdeye](https://img.shields.io/badge/Birdeye-Live%20Data-FF6B00?style=for-the-badge)](https://birdeye.so)
[![Solflare](https://img.shields.io/badge/Solflare-Integrated-FA9035?style=for-the-badge)](https://solflare.com)

<br/>

> **Frontier Hackathon — Eitherway Track Submission**  
> Built for the **Birdeye** and **Solflare** partner tracks.  
> A fully on-chain, trustless digital inheritance protocol — the first of its kind on Solana.

<br/>

[🚀 Live Demo](https://dead-man-protocol.vercel.app) · [📹 Demo Video](https://youtu.be/bST-fdJaoHM) · [📋 Integration Docs](#-partner-integration-deep-dive)

</div>

---

## 📹 Demo Video

<div align="center">

[![DeadMan Protocol Demo](https://img.youtube.com/vi/bST-fdJaoHM/maxresdefault.jpg)](https://youtu.be/bST-fdJaoHM)

**▶ Click to watch the full demo on YouTube**

*Quantum-secured on-chain inheritance — Initialize Vault → Register Heir → Deposit SOL → Send Heartbeat*

</div>

---

## 💀 The Problem Nobody Talks About

<div align="center">

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   $140,000,000,000+  in Bitcoin is permanently inaccessible today  │
│                                                                     │
│        4,000,000 BTC  estimated lost forever — never to move        │
│                                                                     │
│   Every single day, people die holding crypto with no exit plan.   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

</div>

**Why does this happen?**

| Scenario | What Happens to Your Crypto |
|---|---|
| 💀 You die unexpectedly | Gone. Forever. No one has the keys. |
| 🏥 You're incapacitated for months | Frozen. No mechanism to reach it. |
| 🔒 You're imprisoned | Inaccessible. Family can't help. |
| 👴 You develop memory loss | Lost. Even you can't find it. |

**Existing "solutions" are broken:**

- **Leave keys with family** → Single point of failure. Human betrayal risk.
- **Multisig with a lawyer** → You're trusting a human. Humans can be bribed or coerced.
- **Custodial services** → You just rebuilt the bank you escaped.
- **Nothing** → The most popular "strategy" and the most catastrophic outcome.

**DeadMan Protocol solves all of this. On-chain. Permanently. Without trusting anyone.**

---

## ✨ What DeadMan Protocol Does

> *"As long as I keep proving I'm alive, my assets stay locked under my control. The moment I stop — for too long — my assets automatically flow to exactly the people I chose, in exactly the amounts I decided. No one can stop it. No one can speed it up."*

**Core innovations:**

- 🔐 **On-chain dead man's switch** — a single `heartbeat` transaction resets the countdown
- 🧩 **BPS-precision multi-heir distribution** — split assets across up to 10 beneficiaries
- 🌐 **Encrypted secret transmission** — pass seed phrases, passwords, final messages — encrypted _per heir_ using their public key, stored on IPFS
- ⚡ **Sub-second Solana execution** — claims settle in milliseconds, not days
- 🛡️ **Grace period protection** — configurable buffer prevents false triggers
- 📊 **Live Birdeye data** — real-time USD values for all vault balances

---

## 🔄 Protocol Lifecycle

```
╔══════════════════════════════════════════════════════════════════════════╗
║                     DEADMAN PROTOCOL LIFECYCLE                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║  PHASE 1: SETUP                                                          ║
║  Owner creates vault (90 days deadline, 7 days grace period)            ║
║  Deposits 5 SOL + 10,000 USDC — valued live via Birdeye API            ║
║  Adds 3 beneficiaries: Alice 60% │ Bob 30% │ Carol 10%                  ║
║  Encrypts will + secrets per heir → stored on IPFS                      ║
║                                                                          ║
║  PHASE 2: ACTIVE                                                         ║
║  Every 30-90 days: Owner sends heartbeat() ──► countdown reset          ║
║  Watcher daemon monitors 24/7 — fires Slack/Discord alerts at:          ║
║    T-30 days ──► ⚠️  WARNING                                            ║
║    T-7  days ──► 🔴 URGENT                                              ║
║    T-1  day  ──► 🚨 CRITICAL                                            ║
║                                                                          ║
║  PHASE 3: TRIGGER                                                        ║
║  No heartbeat for 90 days → deadline reached → grace period begins      ║
║  After grace period: vault UNLOCKED for claims                          ║
║                                                                          ║
║  PHASE 4: DISTRIBUTION                                                   ║
║  Alice claims → 3.0 SOL + 6,000 USDC received instantly                ║
║  USDC amount displayed in real-time via Birdeye price feed              ║
║  Immutable proof of claim recorded on-chain forever                     ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 🤝 Partner Integration Deep Dive

> This project competes in the **Birdeye** and **Solflare** partner tracks.

### 🦅 Birdeye — Real-Time Market Intelligence (Primary)

Birdeye is **not** just a price ticker in this app. It is the **financial intelligence layer** of the entire vault system.

#### What we built with Birdeye:

**1. Live Vault Valuation Engine** (`useBirdeye.ts`)

─── TRANSACTION LOG ────────────────────────
[17:26:34] Depositing 10 SOL to vault...
[17:26:40] ERROR: Simulation failed. Message: Transaction simulation failed: Error processing Instruction 2: custom program error: 0x1. Logs: [ "Program ComputeBudget111111111111111111111111111111 success", "Program ComputeBudget111111111111111111111111111111 invoke [1]", "Program ComputeBudget111111111111111111111111111111 success", "Program FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq invoke [1]", "Program log: Instruction: DepositSol", "Program 11111111111111111111111111111111 invoke [2]", "Transfer: insufficient lamports 9892434800, need 10000000000", "Program 11111111111111111111111111111111 failed: custom program error: 0x1", "Program FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq consumed 5618 of 199700 compute units", "Program FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq failed: custom program error: 0x1" ]. Catch the `SendTransactionError` and call `getLogs()` on it for full details.
>
Every deposit, balance display, and vault status card shows real-time USD value powered by Birdeye's price API — not a static number, a live feed.

```typescript
// hooks/useBirdeye.ts — Production integration
const BIRDEYE_SOL_USD = 'https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112';

// Fetches live SOL/USD price every 30 seconds
// Falls back to CoinGecko API if Birdeye is unavailable
// Powers: DepositPanel, VaultPulse, HeirManagement
```

**2. Deposit Panel with Live Conversion**

When a user types `"2 SOL"` in the deposit form, the USD value updates instantly via Birdeye — showing them exactly what they're locking in dollars at that precise moment.

**3. Vault Balance Dashboard** 

The "THE PULSE" dashboard shows the vault's total balance in both SOL and USD, refreshed every 30 seconds using Birdeye data. Users can instantly see if their estate value has changed significantly.

**Why this is deep Birdeye integration:**

> Birdeye data is the core intelligence layer. Without it, users have no financial context for their inheritance decisions. Every financial action in the app is Birdeye-powered.

---

### 🟠 Solflare — Wallet-First Architecture (Secondary)

Solflare is treated as a **first-class citizen** in the entire UX flow, not just a "connect" button.

#### What we built with Solflare:

**1. Solflare-First Wallet Architecture**

The wallet modal is configured with Solflare as the primary adapter, with the deepest integration points:

```typescript
// providers.tsx — Solflare prioritized
const wallets = useMemo(() => [
  new SolflareWalletAdapter(),  // Primary — deepest integration
  new PhantomWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new LedgerWalletAdapter(),
  new TrustWalletAdapter(),
  new TorusWalletAdapter(),
], []);
```

**2. Transaction Signing Flow**

Every protocol instruction (`heartbeat`, `add_beneficiary`, `deposit`, `cancel_vault`) routes through the Solflare signing interface with full transaction simulation before broadcast.

**3. Vault PDA Derived From Wallet**

The vault itself is a PDA derived from the user's Solflare wallet address — the wallet IS the vault access key. Losing access to your Solflare wallet means losing vault control.

**4. Wallet-Gated UI State**

The entire dashboard is wallet-state aware. Before connecting Solflare, users see an empty state. After connecting, the vault loads their specific on-chain data instantly.

---

## 🏗️ Technical Architecture

### On-Chain Program (Rust + Anchor 0.31)

```
programs/dead-man-protocol/src/
├── lib.rs                        ← 11 instruction entrypoints
├── instructions/
│   ├── initialize_vault.rs       ← Create VaultConfig PDA
│   ├── heartbeat.rs              ← Reset countdown clock
│   ├── add_beneficiary.rs        ← Add heir with BPS share
│   ├── remove_beneficiary.rs     ← Remove heir
│   ├── update_will.rs            ← Update encrypted IPFS CID
│   ├── deposit.rs                ← SOL + SPL token deposits
│   ├── claim_inheritance.rs      ← Heir claims after deadline
│   ├── emergency_cancel.rs       ← Owner cancels
│   └── extend_deadline.rs        ← Owner extends window
├── state/
│   ├── vault_config.rs           ← VaultConfig PDA definition
│   └── beneficiary_record.rs     ← BeneficiaryRecord PDA definition
├── events.rs                     ← Full on-chain audit trail
├── errors.rs                     ← Custom error codes
└── constants.rs                  ← Protocol safety constants
```

### Account Structures

**VaultConfig PDA** — `seeds: [b"vault", owner.pubkey]`

```
┌─────────────────────────────────────────────────────────┐
│ VaultConfig                                             │
├────────────────────────┬────────────────────────────────┤
│ owner                  │ Pubkey (32 bytes)              │
│ last_heartbeat         │ i64  — unix timestamp          │
│ deadline_seconds       │ i64  — inactivity window       │
│ grace_period_seconds   │ i64  — buffer after deadline   │
│ encrypted_will_cid     │ Vec<u8> — IPFS CID             │
│ will_hash              │ [u8;32] — SHA-256 integrity    │
│ total_shares           │ u16  — sum of all BPS          │
│ beneficiary_count      │ u8   — max 10                  │
│ is_executed            │ bool                           │
│ is_cancelled           │ bool                           │
│ bump                   │ u8   — PDA canonical bump      │
└────────────────────────┴────────────────────────────────┘
```

**BeneficiaryRecord PDA** — `seeds: [b"beneficiary", vault.pubkey, heir.pubkey]`

```
┌─────────────────────────────────────────────────────────┐
│ BeneficiaryRecord                                       │
├────────────────────────┬────────────────────────────────┤
│ vault                  │ Pubkey — parent vault          │
│ wallet                 │ Pubkey — heir's wallet         │
│ share_bps              │ u16  — share in basis points   │
│ encrypted_secret_cid   │ Vec<u8> — heir's IPFS secret  │
│ is_claimed             │ bool                           │
│ claimed_at             │ i64  — when claimed            │
│ bump                   │ u8   — PDA canonical bump      │
└────────────────────────┴────────────────────────────────┘
```

### Frontend Stack (Next.js 16 + TypeScript)

```
app/src/
├── app/
│   ├── globals.css              ← Claude-inspired warm design system
│   ├── layout.tsx               ← Fraunces + Outfit fonts, SEO
│   ├── page.tsx                 ← Main dashboard assembly
│   ├── providers.tsx            ← Solana wallet providers (6 wallets)
│   └── api/quantum/route.ts     ← IBM Quantum encryption API route
├── components/
│   ├── VaultPulse.tsx           ← Live vault status + countdown
│   ├── HeartbeatTrigger.tsx     ← Heartbeat signing + tx logs
│   ├── HeirManagement.tsx       ← Beneficiary table + modal form
│   ├── EncryptedSecret.tsx      ← IPFS will upload + display
│   ├── DepositPanel.tsx         ← SOL deposit + live USD (Birdeye)
│   ├── Sidebar.tsx              ← DMB logo + navigation
│   ├── WalletButton.tsx         ← Styled wallet connect
│   ├── TerminalLog.tsx          ← Live transaction log
│   └── TypewriterText.tsx       ← Animated text component
└── hooks/
    ├── useBirdeye.ts            ← 🦅 Birdeye live price feed
    ├── useVault.ts              ← Vault PDA fetching + Borsh decoding
    └── useProgram.ts            ← Anchor instruction calls
```

### Off-Chain Security Layer (IBM Quantum + PostgreSQL)

```
app/
├── prisma/schema.prisma         ← DB schema (QuantumState, AuditLog)
├── src/app/api/quantum/         ← Next.js API route
└── .env                        ← IBM_QUANTUM_API_KEY + DATABASE_URL

docker-compose.yml               ← One-command PostgreSQL boot
```

The off-chain layer uses IBM Quantum API entropy to seed encryption keys for user payload signatures, stored in PostgreSQL via Prisma ORM. This creates an immutable off-chain audit trail that complements the on-chain Anchor state.

---

## 🔒 Security Model

### Cryptographic Stack

```
Layer 1: Solana On-Chain
──────────────────────────────────────────────────────
• PDA signer authority — vault PDA owns all token accounts
• Ed25519 signature verification on every instruction
• has_one = owner constraint on all sensitive instructions
• Canonical bump validation — prevents PDA substitution attacks

Layer 2: Financial Safety
──────────────────────────────────────────────────────
• Check-Effects-Interactions pattern (is_claimed = true BEFORE transfer)
• checked_add / checked_mul — overflow impossible
• Basis points precision — no lamport rounding loss
• total_shares validated on every mutation (max 10,000 bps)

Layer 3: Temporal Security
──────────────────────────────────────────────────────
• Deadline can ONLY be extended, never shortened
• Grace period is immutable after vault creation
• last_heartbeat updatable ONLY by vault owner

Layer 4: Will Privacy (Off-Chain)
──────────────────────────────────────────────────────
• AES-256-GCM encryption before IPFS upload
• Each heir has their own uniquely encrypted secret
• SHA-256 hash stored on-chain for integrity verification
• IBM Quantum API for high-entropy key seeding
```

### Threat Matrix

| Attack Vector | Defense | Status |
|---|---|---|
| Premature claim | `deadline + grace_period` check | ✅ Blocked |
| Double claim | `is_claimed` flag (CEI pattern) | ✅ Blocked |
| Fake heartbeat | `has_one = owner` constraint | ✅ Blocked |
| Share overflow | `total_shares ≤ 10000` validation | ✅ Blocked |
| Deadline shortening | Extend-only logic | ✅ Blocked |
| PDA substitution | Canonical bump validation | ✅ Blocked |
| Arithmetic overflow | `checked_*` everywhere | ✅ Blocked |
| Will tampering | On-chain SHA-256 verification | ✅ Blocked |
| Reentrancy | Check-Effects-Interactions | ✅ Blocked |

---

## 🚀 Quick Start

### One-Command Launch

```bash
git clone https://github.com/EbrahimEldesoky/dead-man-protocol.git
cd dead-man-protocol
chmod +x run.sh
./run.sh
```

This automatically:
1. 🐘 Starts PostgreSQL (port 5440) via Docker
2. 🔑 Provisions Prisma schema (Quantum State tables)
3. 🌐 Launches Next.js frontend at `http://localhost:3000`

### Prerequisites

```bash
node --version    # v18+
docker --version  # any recent version
```

### Environment Variables

```env
# app/.env
DATABASE_URL="postgresql://dmb_admin:PASSWORD@localhost:5440/quantum_vault"
IBM_QUANTUM_API_KEY="your-ibm-quantum-api-key"
```

---

## 📊 DMB vs. Every Alternative

| Feature | DeadMan Protocol | Multisig | Lawyer + Will | Custodial Service |
|---|:---:|:---:|:---:|:---:|
| Trustless (zero human trust) | ✅ | ⚠️ | ❌ | ❌ |
| On-chain enforcement | ✅ | ✅ | ❌ | ❌ |
| Automatic execution | ✅ | ❌ | ❌ | ⚠️ |
| Encrypted secret transmission | ✅ | ❌ | ⚠️ | ⚠️ |
| Live USD valuation (Birdeye) | ✅ | ❌ | ❌ | ❌ |
| Multi-wallet support | ✅ | ⚠️ | ❌ | ❌ |
| No single point of failure | ✅ | ⚠️ | ❌ | ❌ |
| Dead man's switch | ✅ | ❌ | ❌ | ❌ |
| Sub-second settlement | ✅ | ⚠️ | ❌ | ❌ |
| No third-party fees | ✅ | ⚠️ | ❌ | ❌ |

---

## 🧪 Test Coverage

```
✅ Full lifecycle: create → heartbeat → add heirs → execute → claim
✅ Multi-beneficiary BPS distribution with exact verification
✅ SPL token inheritance end-to-end
✅ Emergency cancel returns all funds
✅ Deadline extension increases window correctly
✅ Double-claim attempt blocked (is_claimed CEI)
✅ Non-owner heartbeat rejected
✅ Shares > 10000 bps rejected
✅ Claim before deadline rejected (Bankrun clock simulation)
✅ Claim during grace period rejected
✅ Claim after grace period accepted

─────────────────────────────────
RESULT: 22/22 TESTS PASSING ✅
```

---

## 🗺️ Roadmap

```
v1.0 ████████████████████  CURRENT — HACKATHON SUBMISSION
     • SOL + SPL token inheritance
     • Multi-beneficiary with basis-point precision
     • Birdeye live price integration
     • Solflare + 5 wallet adapters
     • IPFS encrypted wills
     • IBM Quantum off-chain security layer
     • PostgreSQL audit log

v1.1 ░░░░░░░░░░░░░░░░░░░░  Q3 2025
     • NFT + cNFT inheritance
     • Quicknode webhooks for real-time alerts
     • Kamino vault position tracking

v1.2 ░░░░░░░░░░░░░░░░░░░░  Q4 2025
     • ZK-encrypted private beneficiary lists
     • DFlow execution for inheritance claim swaps
     • Mobile-first Progressive Web App

v2.0 ░░░░░░░░░░░░░░░░░░░░  Q1 2026
     • DAO governance for protocol parameters
     • Cross-chain (Wormhole bridge)
     • Mainnet launch
```

---

## 📁 Repository Structure

```
dead-man-protocol/
├── programs/dead-man-protocol/    ← Anchor Rust program
│   └── src/
│       ├── lib.rs                 ← 11 instruction entrypoints
│       ├── instructions/          ← One file per instruction
│       ├── state/                 ← Account data structures
│       ├── events.rs              ← On-chain audit events
│       ├── errors.rs              ← Custom error codes
│       └── constants.rs           ← Protocol constants
├── tests/                         ← Bankrun integration suite
├── cli/                           ← TypeScript CLI tool
├── watcher/                       ← Monitoring daemon (Docker)
├── app/                           ← Next.js frontend
│   ├── src/
│   │   ├── components/            ← 9 UI components
│   │   ├── hooks/                 ← useBirdeye, useVault, useProgram
│   │   └── app/api/quantum/       ← IBM Quantum encryption route
│   └── prisma/schema.prisma       ← PostgreSQL schema
├── docker-compose.yml             ← PostgreSQL container
├── run.sh                         ← One-command project launcher
└── upload_to_github.py            ← GitHub auto-deployment script
```

---

## ⚠️ Disclaimer

This is experimental software deployed on devnet for hackathon purposes. It has not been formally audited. The protocol is trustless by design — there is **no admin key, no recovery mechanism, no support line** if a mistake is made.

Test on devnet first. Read the code. Understand what you're signing.

---

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   Your assets should outlive you.                           ║
║   Your trust in humans shouldn't have to.                   ║
║                                                              ║
║   Built on Solana  •  Powered by Birdeye  •  Solflare-First ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Built for the [Frontier Hackathon — Eitherway Track](https://earn.superteam.fun)**  
**Partner Tracks: 🦅 Birdeye · 🟠 Solflare**

⭐ *Star this repo if you believe crypto estates deserve better than nothing.*

[![GitHub](https://img.shields.io/badge/GitHub-at264939--ctrl%2Fdead--man--protocol-181717?style=for-the-badge&logo=github)](https://github.com/at264939-ctrl/dead-man-protocol)

</div>
