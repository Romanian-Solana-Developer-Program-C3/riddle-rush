use anchor_lang::prelude::*;

use crate::{SubmissionAccount, ANCHOR_DISCRIMINATOR, ChallengeAccount};
use crate::error::RiddleRushError;

#[derive(Accounts)]
pub struct CreateSubmission<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(mut,
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        constraint = challenge_account.pot > 0, //checks that the challenge id was initialized
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    #[account(
        init,
        payer = submitter,
        space = ANCHOR_DISCRIMINATOR + SubmissionAccount::INIT_SPACE,
        seeds = [b"submission", challenge_account.key().as_ref(), submitter.key().as_ref()],
        bump,
    )]
    pub submission_account: Account<'info, SubmissionAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateSubmission>,
    _encrypted_answer: [u8; 32],
) -> Result<()> {
    require!(
        ctx.accounts.challenge_account.submission_deadline > Clock::get()?.unix_timestamp,
        RiddleRushError::SubmissionDeadlinePassed
    );

    ctx.accounts.submission_account.set_inner(
        SubmissionAccount {
            challenge_id: ctx.accounts.challenge_account.id,
            submitter: ctx.accounts.submitter.key(),
            encrypted_answer: _encrypted_answer,
            revealed: false,
            answer_correct: false,
            claimed: false,
        }
    );

    // Transfer entry fee from setter to challenge account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.submitter.to_account_info(),
            to: ctx.accounts.challenge_account.to_account_info(),
        },
    );
    let _entry_fee = ctx.accounts.challenge_account.entry_fee;
    anchor_lang::system_program::transfer(cpi_context, _entry_fee)?;

    ctx.accounts.challenge_account.pot += ctx.accounts.challenge_account.entry_fee;

    Ok(())
}