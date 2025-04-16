use anchor_lang::prelude::*;

use crate::{ChallengeAccount, ANCHOR_DISCRIMINATOR};
use crate::error::RiddleRushError;

#[derive(Accounts)]
#[instruction(id: u64, submission_deadline: i64, answer_reveal_deadline: i64, claim_deadline: i64, entry_fee: u64)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(
        init,
        payer = setter,
        space = ANCHOR_DISCRIMINATOR + ChallengeAccount::INIT_SPACE,
        seeds = [b"challenge", id.to_le_bytes().as_ref()],
        bump,
        constraint = entry_fee > 0,
    )]
    pub challenge_account: Box<Account<'info, ChallengeAccount>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateChallenge>,
    _id: u64,
    _question: String,
    _solution: String,
    _submission_deadline: i64,
    _answer_reveal_deadline: i64,   
    _claim_deadline: i64,
    _entry_fee: u64, 
) -> Result<()> {
    require!(
        _submission_deadline < _answer_reveal_deadline,
        RiddleRushError::AnswerRevealDeadlinBeforeSubmissionDeadline
    );

    require!(
        _answer_reveal_deadline < _claim_deadline,
        RiddleRushError::AnswerRevealDeadlinBeforeClaimDeadline
    );

    require!(
        _submission_deadline > Clock::get()?.unix_timestamp,
        RiddleRushError::SubmissionDeadlinePassed
    );

    // Transfer entry fee from setter to challenge account
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.setter.to_account_info(),
            to: ctx.accounts.challenge_account.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, _entry_fee)?;
    
    ctx.accounts.challenge_account.set_inner( 
        ChallengeAccount {
            id: _id,
            question: _question,
            solution: "".to_string(),
            submission_deadline: _submission_deadline,
            answer_reveal_deadline: _answer_reveal_deadline,
            claim_deadline: _claim_deadline,
            entry_fee: _entry_fee,
            setter: ctx.accounts.setter.key(),
            pot: _entry_fee, // Initialize pot with entry fee
        },
    );
    Ok(())
}
