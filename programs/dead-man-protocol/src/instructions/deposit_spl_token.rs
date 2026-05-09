use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

use crate::constants::VAULT_SEED;
use crate::errors::DeadManError;
use crate::events::TokenDeposited;
use crate::state::VaultConfig;

#[derive(Accounts)]
pub struct DepositSplToken<'info> {
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

    #[account(mut)]
    pub depositor_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handle(ctx: Context<DepositSplToken>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.depositor_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.depositor.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    emit!(TokenDeposited {
        vault: ctx.accounts.vault.key(),
        mint: ctx.accounts.vault_token_account.mint,
        depositor: ctx.accounts.depositor.key(),
        amount,
    });

    Ok(())
}
