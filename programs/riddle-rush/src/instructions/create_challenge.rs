use anchor_lang::prelude::*;

use crate::{ChallengeAccount, GlobalConfig, ANCHOR_DISCRIMINATOR, expression::evaluate_expression};
use crate::error::RiddleRushError;

#[derive(Accounts)]
#[instruction(submission_deadline: i64, answer_reveal_deadline: i64, claim_deadline: i64, entry_fee: u64)]
pub struct CreateChallenge<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(mut,
        seeds = [b"global_config"],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,
    #[account(
        init,
        payer = setter,
        space = ANCHOR_DISCRIMINATOR + ChallengeAccount::INIT_SPACE,
        seeds = [b"challenge", global_config.next_challenge_id.to_le_bytes().as_ref()],
        bump,
        constraint = entry_fee > 0,
    )]
    pub challenge_account: Box<Account<'info, ChallengeAccount>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CreateChallenge>,
    question: String,
    submission_deadline: i64,
    answer_reveal_deadline: i64,   
    claim_deadline: i64,
    entry_fee: u64, 
) -> Result<()> {
    // Check if the solution is a valid mathematical expression
    match evaluate_expression(&question) {
        Ok(result) => {
            msg!("Expression result: {}", result);
        },
        Err(e) => {
            msg!("Error evaluating expression: {:?}", e);
            return err!(RiddleRushError::InvalidExpression);
        }
    }

    require!(
        submission_deadline < answer_reveal_deadline,
        RiddleRushError::AnswerRevealDeadlinBeforeSubmissionDeadline
    );

    require!(
        answer_reveal_deadline < claim_deadline,
        RiddleRushError::AnswerRevealDeadlinBeforeClaimDeadline
    );

    require!(
        submission_deadline > Clock::get()?.unix_timestamp,
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
    anchor_lang::system_program::transfer(cpi_context, entry_fee)?;
    
    ctx.accounts.challenge_account.set_inner( 
        ChallengeAccount {
            id: ctx.accounts.global_config.next_challenge_id,
            question,
            solution: "".to_string(),
            submission_deadline,
            answer_reveal_deadline,
            claim_deadline,
            entry_fee,
            setter: ctx.accounts.setter.key(),
            pot: entry_fee, // Initialize pot with entry fee
            setter_cut_claimed: false,
            bump: ctx.bumps.challenge_account,
            correct_submissions: 0,
        },
    );

    // Increment the next challenge ID
    ctx.accounts.global_config.next_challenge_id += 1;

    Ok(())
}
