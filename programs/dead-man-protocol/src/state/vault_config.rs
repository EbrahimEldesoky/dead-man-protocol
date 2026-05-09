use anchor_lang::prelude::*;

use crate::constants::{CID_LENGTH, HASH_LENGTH};

/// On-chain account representing a single inheritance vault.
///
/// Derived as a PDA with seeds: `[b"vault", owner.key().as_ref()]`.
/// Holds configuration for deadlines, grace periods, beneficiary tracking,
/// and encrypted will references.
#[account]
#[derive(InitSpace)]
pub struct VaultConfig {
    /// The wallet that created and owns this vault.
    pub owner: Pubkey,

    /// Unix timestamp of the last heartbeat (proof of life) from the owner.
    pub last_heartbeat: i64,

    /// Number of seconds of inactivity before the vault is considered triggered.
    pub deadline_seconds: i64,

    /// IPFS CID of the encrypted will payload, stored as fixed-size bytes.
    #[max_len(CID_LENGTH)]
    pub encrypted_will_cid: Vec<u8>,

    /// SHA-256 hash of the will payload for integrity verification.
    pub will_hash: [u8; HASH_LENGTH],

    /// Sum of all beneficiary shares in basis points (max 10000).
    pub total_shares: u16,

    /// Number of beneficiaries currently registered.
    pub beneficiary_count: u8,

    /// Whether all beneficiaries have claimed and the vault is finalized.
    pub is_executed: bool,

    /// Whether the owner has cancelled this vault.
    pub is_cancelled: bool,

    /// Number of seconds after deadline before claims are allowed.
    /// Immutable after vault creation.
    pub grace_period_seconds: i64,

    /// PDA bump seed for signing.
    pub bump: u8,
}
