// Admin emergency withdraw on remaining funds & closes challenge account
use anchor_lang::prelude::*;

use crate::{ChallengeAccount};
use crate::error::RiddleRushError;

#[derive(Accounts)]
pub struct SetterClose<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(
        mut,
        close = setter,
        constraint = challenge_account.setter == setter.key(),
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SetterClose>,
) -> Result<()> {
    //Current time should be after answer reveal deadline
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time > ctx.accounts.challenge_account.claim_deadline,
        RiddleRushError::WithdrawTooEarly
    );
    
    // Transfer lamports from challenge_account (PDA) to setter
    let challenge_account_info = &mut ctx.accounts.challenge_account.to_account_info();
    let lamports = **challenge_account_info.lamports.borrow();
    let challenge_id = ctx.accounts.challenge_account.id;

    msg!("Closed challenge account with id {} and transferred {} lamports to submitter", challenge_id, lamports);
    Ok(())
}
