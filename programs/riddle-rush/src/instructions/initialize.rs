use anchor_lang::prelude::*;

use crate::{GlobalConfig, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = ANCHOR_DISCRIMINATOR + GlobalConfig::INIT_SPACE,
        seeds = [b"global_config"],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    ctx.accounts.global_config.set_inner(
        GlobalConfig {
            next_challenge_id: 0,
            bump: ctx.bumps.global_config,
        }
    );
    Ok(())
} 