/// Named constants for the DeadMan Protocol.
/// All magic numbers are centralized here for auditability and maintainability.

/// Minimum deadline duration: 30 days in seconds (30 * 24 * 60 * 60).
pub const MIN_DEADLINE_SECONDS: i64 = 2_592_000;

/// Minimum grace period: 3 days in seconds (3 * 24 * 60 * 60).
pub const MIN_GRACE_PERIOD_SECONDS: i64 = 259_200;

/// Maximum number of beneficiaries per vault.
pub const MAX_BENEFICIARIES: u8 = 10;

/// Maximum total shares in basis points (100% = 10000 bps).
pub const MAX_SHARES_BPS: u16 = 10_000;

/// Fixed length for IPFS CID storage on-chain.
pub const CID_LENGTH: usize = 64;

/// Fixed length for SHA-256 hash storage on-chain.
pub const HASH_LENGTH: usize = 32;

/// Seed prefix for vault PDA derivation.
pub const VAULT_SEED: &[u8] = b"vault";

/// Seed prefix for beneficiary PDA derivation.
pub const BENEFICIARY_SEED: &[u8] = b"beneficiary";
