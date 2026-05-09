use anchor_lang::prelude::*;

use crate::constants::{VAULT_SEED, HASH_LENGTH};
use crate::errors::DeadManError;
use crate::events::WillUpdated;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct UpdateWill<'info> {
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

pub fn handle(
    ctx: Context<UpdateWill>,
    new_encrypted_will_cid: Vec<u8>,
    new_will_hash: [u8; HASH_LENGTH],
) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let clock = Clock::get()?;

    vault.encrypted_will_cid = new_encrypted_will_cid;
    vault.will_hash = new_will_hash;

    // Optional: a will update could implicitly count as a heartbeat
    vault.last_heartbeat = clock.unix_timestamp;

    emit!(WillUpdated {
        vault: vault.key(),
        will_hash: new_will_hash,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
