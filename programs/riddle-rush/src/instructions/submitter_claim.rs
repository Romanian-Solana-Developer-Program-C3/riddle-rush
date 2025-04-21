// The player claims the pot if their answer is correct
use anchor_lang::prelude::*;

use crate::{ChallengeAccount, SETTER_CUT, SubmissionAccount};
use crate::error::RiddleRushError;

#[derive(Accounts)]
pub struct SubmitterClaim<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(
        mut,
        constraint = challenge_account.pot > 0,
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    #[account(
        mut,
        // close = submitter, //uncomment after verify solution PR
        constraint = submission_account.submitter == submitter.key(),
        constraint = submission_account.challenge_id == challenge_account.id,
        constraint = submission_account.claimed == false,
        // constraint = submission_account.answer_correct == true, // Uncomment this line after verify solution PR
        seeds = [b"submission", challenge_account.key().as_ref(), submitter.key().as_ref()],
        bump,
    )]
    pub submission_account: Account<'info, SubmissionAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SubmitterClaim>,
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

    //Calculate number of players minus the setter
    let num_players = (ctx.accounts.challenge_account.pot / ctx.accounts.challenge_account.entry_fee) - 1;

    // Calculate the submitter's share
    let submitter_share = (ctx.accounts.challenge_account.pot - setter_cut) / num_players;
    
    // Transfer lamports from challenge_account (PDA) to setter
    let challenge_account_info = &mut ctx.accounts.challenge_account.to_account_info();
    let submitter_info = &mut ctx.accounts.submitter.to_account_info();

    // Ensure the PDA has enough lamports
    require!(
        challenge_account_info.lamports() >= submitter_share,
        RiddleRushError::InsufficientFunds
    );
    // Update the challenge account
    ctx.accounts.submission_account.claimed = true;

    // Decrease the PDA's lamport balance
    **challenge_account_info.lamports.borrow_mut() -= submitter_share;
    // Increase the setter's lamport balance
    **submitter_info.lamports.borrow_mut() += submitter_share;

    msg!("Transferred {} lamports to submitter", setter_cut);
    Ok(())
}
