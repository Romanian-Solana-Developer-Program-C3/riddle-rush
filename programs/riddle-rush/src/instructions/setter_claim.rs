// The creator of the challenge claims the percentage of the pot
use anchor_lang::prelude::*;

use crate::{ChallengeAccount, SETTER_CUT};
use crate::error::RiddleRushError;

#[derive(Accounts)]
pub struct SetterClaim<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(
        mut,
        has_one = setter,
        constraint = setter.key() == challenge_account.setter,
        constraint = challenge_account.pot > 0,
        constraint = challenge_account.setter_cut_claimed == false,
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SetterClaim>,
) -> Result<()> {
    //Current time should be after answer reveal deadline
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time > ctx.accounts.challenge_account.answer_reveal_deadline,
        RiddleRushError::WithdrawTooEarly
    );

    //And before the claim deadline
    require!(
        current_time < ctx.accounts.challenge_account.claim_deadline,
        RiddleRushError::WithdrawTooLate
    );

    // Calculate the setter's cut
    let setter_cut = ctx.accounts.challenge_account.pot * SETTER_CUT / 100;
    
    // Transfer lamports from challenge_account (PDA) to setter
    let challenge_account_info = &mut ctx.accounts.challenge_account.to_account_info();
    let setter_info = &mut ctx.accounts.setter.to_account_info();

    // Ensure the PDA has enough lamports
    require!(
        challenge_account_info.lamports() >= setter_cut,
        RiddleRushError::InsufficientFunds
    );
    // Update the challenge account
    ctx.accounts.challenge_account.setter_cut_claimed = true;

    // Decrease the PDA's lamport balance
    **challenge_account_info.lamports.borrow_mut() -= setter_cut;
    // Increase the setter's lamport balance
    **setter_info.lamports.borrow_mut() += setter_cut;

    msg!("Transferred {} lamports to setter", setter_cut);

    Ok(())
}
