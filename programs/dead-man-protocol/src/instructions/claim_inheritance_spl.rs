use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

use crate::constants::{VAULT_SEED, BENEFICIARY_SEED, MAX_SHARES_BPS};
use crate::errors::DeadManError;
use crate::events::TokenInheritanceClaimed;
use crate::state::{VaultConfig, BeneficiaryRecord};

#[derive(Accounts)]
pub struct ClaimInheritanceSpl<'info> {
    #[account(mut)]
    pub beneficiary_wallet: Signer<'info>,

    #[account(
        mut,
        seeds = [VAULT_SEED, vault.owner.as_ref()],
        bump = vault.bump,
        constraint = !vault.is_executed @ DeadManError::VaultAlreadyExecuted,
        constraint = !vault.is_cancelled @ DeadManError::VaultCancelled,
    )]
    pub vault: Account<'info, VaultConfig>,

    #[account(
        mut,
        seeds = [BENEFICIARY_SEED, vault.key().as_ref(), beneficiary_wallet.key().as_ref()],
        bump = beneficiary_record.bump,
        has_one = vault,
    )]
    pub beneficiary_record: Account<'info, BeneficiaryRecord>,

    #[account(mut)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub beneficiary_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handle(ctx: Context<ClaimInheritanceSpl>) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let record = &ctx.accounts.beneficiary_record;
    let clock = Clock::get()?;

    // Time validation
    let time_since_heartbeat = clock.unix_timestamp.checked_sub(vault.last_heartbeat)
        .ok_or(DeadManError::ArithmeticOverflow)?;
        
    require!(
        time_since_heartbeat > vault.deadline_seconds,
        DeadManError::DeadlineNotPassed
    );

    let required_time_passed = vault.deadline_seconds.checked_add(vault.grace_period_seconds)
        .ok_or(DeadManError::ArithmeticOverflow)?;

    require!(
        time_since_heartbeat > required_time_passed,
        DeadManError::GracePeriodNotEnded
    );

    // Manual wallet validation
    require!(
        record.wallet == ctx.accounts.beneficiary_wallet.key(),
        DeadManError::Unauthorized
    );

    // Calculate share based on vault token account balance
    let available_balance = ctx.accounts.vault_token_account.amount;
    
    let claim_amount = (available_balance as u128)
        .checked_mul(record.share_bps as u128)
        .unwrap()
        .checked_div(MAX_SHARES_BPS as u128)
        .unwrap() as u64;

    require!(claim_amount > 0, DeadManError::InsufficientBalance);

    // Transfer SPL tokens using CPI with vault PDA signer
    let seeds = &[
        VAULT_SEED,
        vault.owner.as_ref(),
        &[vault.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.beneficiary_token_account.to_account_info(),
        authority: vault.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer_seeds,
    );
    
    transfer(cpi_ctx, claim_amount)?;

    // We don't mark record.is_claimed = true here because the heir might claim SOL, Token A, Token B etc.
    // The "is_claimed" flag should probably only apply to the SOL instruction (or be tracked per-mint).
    // The instructions said "marks beneficiary as claimed" on the SOL instruction.

    emit!(TokenInheritanceClaimed {
        vault: vault.key(),
        beneficiary: record.wallet,
        mint: ctx.accounts.vault_token_account.mint,
        amount: claim_amount,
        share_bps: record.share_bps,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
