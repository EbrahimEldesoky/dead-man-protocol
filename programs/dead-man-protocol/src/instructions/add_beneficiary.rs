use anchor_lang::prelude::*;

use crate::constants::{MAX_BENEFICIARIES, MAX_SHARES_BPS, VAULT_SEED, BENEFICIARY_SEED, CID_LENGTH};
use crate::errors::DeadManError;
use crate::events::BeneficiaryAdded;
use crate::state::{VaultConfig, BeneficiaryRecord};

#[derive(Accounts)]
#[instruction(beneficiary_wallet: Pubkey)]
pub struct AddBeneficiary<'info> {
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
        init,
        payer = owner,
        space = 8 + BeneficiaryRecord::INIT_SPACE,
        seeds = [BENEFICIARY_SEED, vault.key().as_ref(), beneficiary_wallet.as_ref()],
        bump
    )]
    pub beneficiary_record: Account<'info, BeneficiaryRecord>,

    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<AddBeneficiary>,
    beneficiary_wallet: Pubkey,
    share_bps: u16,
    encrypted_secret_cid: Vec<u8>,
) -> Result<()> {
    require!(share_bps > 0, DeadManError::ZeroShareBps);
    
    let vault = &mut ctx.accounts.vault;
    
    require!(
        vault.beneficiary_count < MAX_BENEFICIARIES,
        DeadManError::MaxBeneficiariesReached
    );

    // Use checked math for safety
    let new_total_shares = vault.total_shares
        .checked_add(share_bps)
        .ok_or(DeadManError::ArithmeticOverflow)?;

    require!(
        new_total_shares <= MAX_SHARES_BPS,
        DeadManError::SharesExceedMaximum
    );

    vault.total_shares = new_total_shares;
    vault.beneficiary_count = vault.beneficiary_count
        .checked_add(1)
        .ok_or(DeadManError::ArithmeticOverflow)?;

    let record = &mut ctx.accounts.beneficiary_record;
    record.vault = vault.key();
    record.wallet = beneficiary_wallet;
    record.share_bps = share_bps;
    record.encrypted_secret_cid = encrypted_secret_cid;
    record.is_claimed = false;
    record.claimed_at = 0;
    record.bump = ctx.bumps.beneficiary_record;

    emit!(BeneficiaryAdded {
        vault: vault.key(),
        wallet: beneficiary_wallet,
        share_bps,
        total_shares: new_total_shares,
    });

    Ok(())
}
