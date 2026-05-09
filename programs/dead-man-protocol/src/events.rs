use anchor_lang::prelude::*;

/// Emitted when a new vault is initialized.
#[event]
pub struct VaultInitialized {
    pub owner: Pubkey,
    pub deadline_seconds: i64,
    pub grace_period_seconds: i64,
    pub initial_deposit_lamports: u64,
    pub timestamp: i64,
}

/// Emitted when the owner sends a heartbeat (proof of life).
#[event]
pub struct HeartbeatRecorded {
    pub vault: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

/// Emitted when a beneficiary is added to a vault.
#[event]
pub struct BeneficiaryAdded {
    pub vault: Pubkey,
    pub wallet: Pubkey,
    pub share_bps: u16,
    pub total_shares: u16,
}

/// Emitted when a beneficiary is removed from a vault.
#[event]
pub struct BeneficiaryRemoved {
    pub vault: Pubkey,
    pub wallet: Pubkey,
    pub recovered_shares: u16,
    pub total_shares: u16,
}

/// Emitted when the encrypted will is updated.
#[event]
pub struct WillUpdated {
    pub vault: Pubkey,
    pub will_hash: [u8; 32],
    pub timestamp: i64,
}

/// Emitted when SOL is deposited into the vault.
#[event]
pub struct Deposited {
    pub vault: Pubkey,
    pub depositor: Pubkey,
    pub amount_lamports: u64,
}

/// Emitted when SPL tokens are deposited into the vault.
#[event]
pub struct TokenDeposited {
    pub vault: Pubkey,
    pub mint: Pubkey,
    pub depositor: Pubkey,
    pub amount: u64,
}

/// Emitted when a beneficiary claims their SOL inheritance.
#[event]
pub struct InheritanceClaimed {
    pub vault: Pubkey,
    pub beneficiary: Pubkey,
    pub amount_lamports: u64,
    pub share_bps: u16,
    pub timestamp: i64,
}

/// Emitted when a beneficiary claims their SPL token inheritance.
#[event]
pub struct TokenInheritanceClaimed {
    pub vault: Pubkey,
    pub beneficiary: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub share_bps: u16,
    pub timestamp: i64,
}

/// Emitted when the vault is cancelled by the owner.
#[event]
pub struct VaultCancelled {
    pub vault: Pubkey,
    pub owner: Pubkey,
    pub timestamp: i64,
}

/// Emitted when the deadline is extended.
#[event]
pub struct DeadlineExtended {
    pub vault: Pubkey,
    pub old_deadline: i64,
    pub new_deadline: i64,
}
