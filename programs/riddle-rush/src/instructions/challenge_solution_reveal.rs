// The creator of the challenge reveals the solution to the challenge
use anchor_lang::prelude::*;

use crate::{ChallengeAccount, evaluate_expression};
use crate::error::RiddleRushError;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ChallengeSolutionReveal<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"challenge", id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ChallengeSolutionReveal>, id: u64) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge_account;
    require!(Clock::get()?.unix_timestamp > challenge.submission_deadline, RiddleRushError::SolutionRevealDeadlineNotMet);

    if challenge.solution == "" {
        match evaluate_expression(&challenge.question) {
            Ok(result) => {
                challenge.solution = result.to_string();
                msg!("Solution: {}", challenge.solution);
            },
            Err(e) => {
                msg!("Error evaluating expression: {:?}", e);
                return err!(RiddleRushError::InvalidExpression);
            }
        }
    }

    Ok(())
}
