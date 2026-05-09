use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::{MIN_DEADLINE_SECONDS, MIN_GRACE_PERIOD_SECONDS, VAULT_SEED, CID_LENGTH, HASH_LENGTH};
use crate::errors::DeadManError;
use crate::events::VaultInitialized;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + VaultConfig::INIT_SPACE,
        seeds = [VAULT_SEED, owner.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, VaultConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<InitializeVault>,
    deadline_seconds: i64,
    grace_period_seconds: i64,
    encrypted_will_cid: Vec<u8>,
    will_hash: [u8; HASH_LENGTH],
    deposit_amount: u64,
) -> Result<()> {
    require!(
        deadline_seconds >= MIN_DEADLINE_SECONDS,
        DeadManError::DeadlineTooShort
    );
    require!(
        grace_period_seconds >= MIN_GRACE_PERIOD_SECONDS,
        DeadManError::GracePeriodTooShort
    );

    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    vault.owner = ctx.accounts.owner.key();
    vault.last_heartbeat = clock.unix_timestamp;
    vault.deadline_seconds = deadline_seconds;
    
    // Copy the CID directly (already validated for max_len by Anchor)
    vault.encrypted_will_cid = encrypted_will_cid.clone();
    
    vault.will_hash = will_hash;
    vault.total_shares = 0;
    vault.beneficiary_count = 0;
    vault.is_executed = false;
    vault.is_cancelled = false;
    vault.grace_period_seconds = grace_period_seconds;
    vault.bump = ctx.bumps.vault;

    // Optional initial deposit
    if deposit_amount > 0 {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.owner.to_account_info(),
                to: vault.to_account_info(),
            },
        );
        transfer(cpi_context, deposit_amount)?;
    }

    emit!(VaultInitialized {
        owner: vault.owner,
        deadline_seconds,
        grace_period_seconds,
        initial_deposit_lamports: deposit_amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
