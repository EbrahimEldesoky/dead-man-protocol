use anchor_lang::prelude::*;

/// Custom error codes for the DeadMan Protocol.
/// Each variant includes a descriptive message for client-side error parsing.
#[error_code]
pub enum DeadManError {
    /// The caller is not the vault owner.
    #[msg("Unauthorized: only the vault owner can perform this action")]
    Unauthorized,

    /// The provided deadline is below the minimum (30 days).
    #[msg("Deadline must be at least 30 days (2,592,000 seconds)")]
    DeadlineTooShort,

    /// The provided grace period is below the minimum (3 days).
    #[msg("Grace period must be at least 3 days (259,200 seconds)")]
    GracePeriodTooShort,

    /// Adding this beneficiary would exceed the maximum share total of 10000 bps.
    #[msg("Total shares would exceed 10000 basis points (100%)")]
    SharesExceedMaximum,

    /// The vault already has the maximum number of beneficiaries.
    #[msg("Maximum number of beneficiaries (10) reached")]
    MaxBeneficiariesReached,

    /// The vault has already been executed (all claims processed).
    #[msg("Vault has already been executed")]
    VaultAlreadyExecuted,

    /// The vault has been cancelled by the owner.
    #[msg("Vault has been cancelled")]
    VaultCancelled,

    /// The inactivity deadline has not yet passed.
    #[msg("Deadline has not passed yet — owner is still active")]
    DeadlineNotPassed,

    /// The grace period has not yet ended after the deadline.
    #[msg("Grace period has not ended yet")]
    GracePeriodNotEnded,

    /// The deadline has already passed; this action is no longer allowed.
    #[msg("Deadline has already passed — cannot perform this action")]
    DeadlineAlreadyPassed,

    /// This beneficiary has already claimed their inheritance.
    #[msg("Inheritance already claimed by this beneficiary")]
    AlreadyClaimed,

    /// Arithmetic overflow detected in financial calculation.
    #[msg("Arithmetic overflow in share calculation")]
    ArithmeticOverflow,

    /// The new deadline must be longer than the current one (cannot shorten).
    #[msg("New deadline must be greater than current deadline")]
    DeadlineCannotBeShortened,

    /// The share basis points must be greater than zero.
    #[msg("Share basis points must be greater than zero")]
    ZeroShareBps,

    /// Insufficient funds in the vault for this transfer.
    #[msg("Insufficient vault balance for transfer")]
    InsufficientBalance,

    /// The vault is not in a valid state for this operation.
    #[msg("Vault is not active (executed or cancelled)")]
    VaultNotActive,
}
