use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::*;
use constants::HASH_LENGTH;

declare_id!("FscnjuLXzegHTn6LYdSS2HbjaaDDa7Tn2tBCgSp3dLSq");

#[program]
pub mod dead_man_protocol {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        deadline_seconds: i64,
        grace_period_seconds: i64,
        encrypted_will_cid: Vec<u8>,
        will_hash: [u8; HASH_LENGTH],
        deposit_amount: u64,
    ) -> Result<()> {
        instructions::initialize_vault::handle(
            ctx,
            deadline_seconds,
            grace_period_seconds,
            encrypted_will_cid,
            will_hash,
            deposit_amount,
        )
    }

    pub fn heartbeat(ctx: Context<Heartbeat>) -> Result<()> {
        instructions::heartbeat::handle(ctx)
    }

    pub fn add_beneficiary(
        ctx: Context<AddBeneficiary>,
        beneficiary_wallet: Pubkey,
        share_bps: u16,
        encrypted_secret_cid: Vec<u8>,
    ) -> Result<()> {
        instructions::add_beneficiary::handle(
            ctx,
            beneficiary_wallet,
            share_bps,
            encrypted_secret_cid,
        )
    }

    pub fn remove_beneficiary(ctx: Context<RemoveBeneficiary>) -> Result<()> {
        instructions::remove_beneficiary::handle(ctx)
    }

    pub fn update_will(
        ctx: Context<UpdateWill>,
        new_encrypted_will_cid: Vec<u8>,
        new_will_hash: [u8; HASH_LENGTH],
    ) -> Result<()> {
        instructions::update_will::handle(ctx, new_encrypted_will_cid, new_will_hash)
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, amount_lamports: u64) -> Result<()> {
        instructions::deposit_sol::handle(ctx, amount_lamports)
    }

    pub fn deposit_spl_token(ctx: Context<DepositSplToken>, amount: u64) -> Result<()> {
        instructions::deposit_spl_token::handle(ctx, amount)
    }

    pub fn claim_inheritance_sol(ctx: Context<ClaimInheritanceSol>) -> Result<()> {
        instructions::claim_inheritance_sol::handle(ctx)
    }

    pub fn claim_inheritance_spl(ctx: Context<ClaimInheritanceSpl>) -> Result<()> {
        instructions::claim_inheritance_spl::handle(ctx)
    }

    pub fn emergency_cancel(ctx: Context<EmergencyCancel>) -> Result<()> {
        instructions::emergency_cancel::handle(ctx)
    }

    pub fn extend_deadline(ctx: Context<ExtendDeadline>, new_deadline_seconds: i64) -> Result<()> {
        instructions::extend_deadline::handle(ctx, new_deadline_seconds)
    }
}
