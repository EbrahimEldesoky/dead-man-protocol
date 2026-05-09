use anchor_lang::prelude::*;

use crate::constants::{VAULT_SEED, BENEFICIARY_SEED};
use crate::errors::DeadManError;
use crate::events::BeneficiaryRemoved;
use crate::state::{VaultConfig, BeneficiaryRecord};

#[derive(Accounts)]
pub struct RemoveBeneficiary<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, owner.key().as_ref()],
        bump = vault.bump,
        has_one = owner @ DeadManError::Unauthorized,
        constraint = !vault.is_executed @ DeadManError::VaultAlreadyExecuted,
        constraint = !vault.is_cancelled @ DeadManError::VaultCancelled,
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(
        mut,
        close = owner, // Refunds rent directly to owner
        seeds = [BENEFICIARY_SEED, vault.key().as_ref(), beneficiary_record.wallet.as_ref()],
        bump = beneficiary_record.bump,
        has_one = vault @ DeadManError::Unauthorized, // Validates record belongs to this vault
    )]
    pub beneficiary_record: Account<'info, BeneficiaryRecord>,
}

pub fn handle(ctx: Context<RemoveBeneficiary>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let record = &ctx.accounts.beneficiary_record;

    // Use checked arithmetic
    vault.total_shares = vault.total_shares
        .checked_sub(record.share_bps)
        .ok_or(DeadManError::ArithmeticOverflow)?;
        
    vault.beneficiary_count = vault.beneficiary_count
        .checked_sub(1)
        .ok_or(DeadManError::ArithmeticOverflow)?;

    emit!(BeneficiaryRemoved {
        vault: vault.key(),
        wallet: record.wallet,
        recovered_shares: record.share_bps,
        total_shares: vault.total_shares,
    });

    Ok(())
}
