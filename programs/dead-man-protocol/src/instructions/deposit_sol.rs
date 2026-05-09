use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

use crate::constants::VAULT_SEED;
use crate::errors::DeadManError;
use crate::events::Deposited;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, vault.owner.as_ref()],
        bump = vault.bump,
        constraint = !vault.is_executed @ DeadManError::VaultAlreadyExecuted,
        constraint = !vault.is_cancelled @ DeadManError::VaultCancelled,
    )]
    pub vault: Account<'info, VaultConfig>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<DepositSol>, amount_lamports: u64) -> Result<()> {
    // Anyone can deposit into an active vault
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        Transfer {
            from: ctx.accounts.depositor.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        },
    );
    transfer(cpi_context, amount_lamports)?;

    emit!(Deposited {
        vault: ctx.accounts.vault.key(),
        depositor: ctx.accounts.depositor.key(),
        amount_lamports,
    });

    Ok(())
}
