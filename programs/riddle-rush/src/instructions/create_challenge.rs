use anchor_lang::prelude::*;

use crate::{ChallengeAccount, ANCHOR_DISCRIMINATOR};
use crate::error::RiddleRushError;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(
        init,
        payer = setter,
        space = ANCHOR_DISCRIMINATOR + ChallengeAccount::INIT_SPACE,
        seeds = [b"challenge", setter.key().as_ref(), id.to_le_bytes().as_ref()],
        bump,
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
    _entry_fee: u64, 
) -> Result<()> {
    require!(
        _submission_deadline > Clock::get()?.unix_timestamp,
        RiddleRushError::SubmissionDeadlinePassed
    );
    require!(
        _answer_reveal_deadline > _submission_deadline,
        RiddleRushError::AnswerRevealDeadlinBeforeSubmissionDeadline
    );
    require!(
        _question.len() <= 256,
        RiddleRushError::QuestionTooLong
    );
    require!(
        _solution.len() <= 256,
        RiddleRushError::SolutionTooLong
    );

    require!(
        _entry_fee > 0,
        RiddleRushError::ZeroEntryFee
    );

    ctx.accounts.challenge_account.set_inner( 
        ChallengeAccount {
            id: _id,
            question: _question,
            solution: _solution,
            submission_deadline: _submission_deadline,
            answer_reveal_deadline: _answer_reveal_deadline,
            entry_fee: _entry_fee,
            setter: ctx.accounts.setter.key(),
            pot: 0,
            submissions: 0, //todo: make hashmap of submissions
        },
    );
    Ok(())
}
