use anchor_lang::prelude::*;

use crate::constants::VAULT_SEED;
use crate::errors::DeadManError;
use crate::events::HeartbeatRecorded;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct Heartbeat<'info> {
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
}

pub fn handle(ctx: Context<Heartbeat>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    vault.last_heartbeat = clock.unix_timestamp;

    emit!(HeartbeatRecorded {
        vault: vault.key(),
        owner: vault.owner,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
