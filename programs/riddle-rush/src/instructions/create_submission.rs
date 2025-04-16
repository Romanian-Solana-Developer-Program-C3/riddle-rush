use anchor_lang::prelude::*;

use crate::{ChallengeAccount, ANCHOR_DISCRIMINATOR};
use crate::error::RiddleRushError;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateSubmission<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(mut,
        seeds = [b"challenge", id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    #[account(
        init,
        payer = submitter,
        space = ANCHOR_DISCRIMINATOR + SubmissionAccount::INIT_SPACE,
        seeds = [b"submission", submitter.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub sumission: Account<'info, SubmissionAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateSubmission>,
    id: u64,
    _encrypted_answer: [u8; 32],
) -> Result<()> {
    require!(
        ctx.accounts.challenge.submission_deadline > Clock::get()?.unix_timestamp,
        RiddleRushError::SubmissionDeadlinePassed
    );

    ctx.accounts.sumission.set_inner(
        SubmissionAccount {
            challenge_key: ctx.accounts.challenge.key(),
            submission_key: ctx.accounts.sumission.key(),
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
    anchor_lang::system_program::transfer(cpi_context, _entry_fee)?;

    ctx.accounts.challenge.pot += ctx.accounts.challenge.entry_fee;

    Ok(())
}