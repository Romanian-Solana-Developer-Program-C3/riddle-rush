// The creator of the challenge reveals the solution to the challenge
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ChallengeSolutionReveal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        seeds = [b"challenge", id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge: Account<'info, Challenge>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ChallengeSolutionReveal>) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge;
    require!(Clock::get()?.unix_timestamp > challenge.sumbmission_deadline, RiddleRushError::SolutionRevealDeadlineNotMet);

    if challenge.solution == "" {
        match evaluate_expression(&_question) {
            Ok(result) => {
                challenge.solution = result.to_string();
            },
            Err(e) => {
                msg!("Error evaluating expression: {:?}", e);
                return err!(RiddleRushError::InvalidExpression);
            }
        }
    }

    Ok(())
}
