// The player reveals the solution they have submitted previously for this challenge
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct SubmissionSolutionReveal<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(
        seeds = [b"challenge", id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge: Account<'info, Challenge>,
    #[account(
        seeds = [b"submission", submitter.key().as_ref(), id.to_le_bytes().as_ref()],,
        bump,
    )]
    pub submission: Account<'info, Submission>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubmissionSolutionReveal>, id: u64, nonce: String, plaintext_answer: String) -> Result<()> {
    let challenge = &ctx.accounts.challenge;
    let submission = &ctx.accounts.submission;
    let submitter = &ctx.accounts.submitter;

    require!(submission.revealed == false, RiddleRushError::SubmissionAlreadyRevealed);
    require!(submission.submitter == submitter.key(), RiddleRushError::NotTheSubmitter);

    // compute the keccak256 hash of the plaintext answer concatenated with the nonce
    let concatenated_answer = format!("{}{}", plaintext_answer, nonce);
    let answer_hash = keccak256(concatenated_answer.as_bytes());
    let answer_hash_bytes = answer_hash.to_bytes();
    // check if the encrypted answer in the submission matches the answer hash
    require!(submission.encrypted_answer == answer_hash_bytes, RiddleRushError::IncorrectAnswer);
    submission.revealed = true;
    // check if the answer is correct, i.e. the encrypted answer in the challenge matches the answer hash
    if (challenge.encrypted_answer == answer_hash_bytes) { 
        submission.answer_correct = true;
    } else {
        submission.answer_correct = false;
    }

    Ok(())
}
