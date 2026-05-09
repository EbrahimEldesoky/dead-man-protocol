use anchor_lang::prelude::*;

use crate::constants::VAULT_SEED;
use crate::errors::DeadManError;
use crate::events::DeadlineExtended;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct ExtendDeadline<'info> {
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

pub fn handle(ctx: Context<ExtendDeadline>, new_deadline_seconds: i64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let old_deadline = vault.deadline_seconds;

    require!(
        new_deadline_seconds > old_deadline,
        DeadManError::DeadlineCannotBeShortened
    );

    vault.deadline_seconds = new_deadline_seconds;

    emit!(DeadlineExtended {
        vault: vault.key(),
        old_deadline,
        new_deadline: new_deadline_seconds,
    });

    Ok(())
}
