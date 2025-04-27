// The player reveals the solution they have submitted previously for this challenge
use anchor_lang::prelude::*;

use crate::{ChallengeAccount, SubmissionAccount};
use crate::error::RiddleRushError;
use tiny_keccak::{Hasher, Sha3};

#[derive(Accounts)]
pub struct SubmissionSolutionReveal<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(
        mut,
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Account<'info, ChallengeAccount>,
    #[account(
        mut,
        seeds = [b"submission", challenge_account.key().as_ref(), submitter.key().as_ref()],
        bump,
    )]
    pub submission_account: Account<'info, SubmissionAccount>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubmissionSolutionReveal>, nonce: String, plaintext_answer: String) -> Result<()> {
    let challenge = &mut ctx.accounts.challenge_account;
    let submission = &mut ctx.accounts.submission_account;

    require!(submission.revealed == false, RiddleRushError::SubmissionAlreadyRevealed);
    require!(challenge.solution != "", RiddleRushError::SolutionNotRevealed);

    let mut hasher = Sha3::v256();
    let mut hash_output = [0u8; 32];

    // compute the keccak256 hash of the plaintext answer concatenated with the nonce
    let concatenated_answer = format!("{}{}", plaintext_answer, nonce);
    hasher.update(concatenated_answer.as_bytes());
    hasher.finalize(&mut hash_output);
    // check if the encrypted answer in the submission matches the answer hash
    msg!("Hash output: {:?}", hash_output);
    msg!("Encrypted answer: {:?}", submission.encrypted_answer);
    require!(submission.encrypted_answer == hash_output, RiddleRushError::AnswerMismatch);
    submission.revealed = true;
    // check if the answer is correct, i.e. the encrypted answer in the challenge matches the answer hash
    if challenge.solution == plaintext_answer { 
        submission.answer_correct = true;
        challenge.correct_submissions += 1;
    } else {
        submission.answer_correct = false;
    }
    msg!("Answer correct: {}", submission.answer_correct);
    msg!("Correct submissions: {}", challenge.correct_submissions);
    Ok(())
}
