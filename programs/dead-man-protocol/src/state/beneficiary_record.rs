use anchor_lang::prelude::*;

use crate::constants::CID_LENGTH;

/// On-chain account representing a single beneficiary of a vault.
///
/// Derived as a PDA with seeds:
/// `[b"beneficiary", vault.key().as_ref(), wallet.key().as_ref()]`.
/// Each beneficiary has an allocated share (in bps) and an optional
/// encrypted secret payload on IPFS.
#[account]
#[derive(InitSpace)]
pub struct BeneficiaryRecord {
    /// The vault this beneficiary belongs to.
    pub vault: Pubkey,

    /// The wallet address of the beneficiary.
    pub wallet: Pubkey,

    /// Share of the vault in basis points (100% = 10000 bps).
    pub share_bps: u16,

    /// IPFS CID of the per-heir encrypted secret payload.
    #[max_len(CID_LENGTH)]
    pub encrypted_secret_cid: Vec<u8>,

    /// Whether this beneficiary has claimed their inheritance.
    pub is_claimed: bool,

    /// Unix timestamp of when the claim was made (0 if unclaimed).
    pub claimed_at: i64,

    /// PDA bump seed.
    pub bump: u8,
}
