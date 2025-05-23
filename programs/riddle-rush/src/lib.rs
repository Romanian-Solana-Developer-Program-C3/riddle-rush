pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Gb4JYubKArC3R3EpQSzYwoPecYBNi2znUmtHrhLNeVsM");

#[program]
pub mod riddle_rush {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::handler(ctx)
    }

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        question: String,
        submission_deadline: i64,
        answer_reveal_deadline: i64,
        claim_deadline: i64,
        entry_fee: u64,
    ) -> Result<()> {
        create_challenge::handler(ctx, question, submission_deadline, answer_reveal_deadline, claim_deadline, entry_fee)
    }

    pub fn create_submission(
        ctx: Context<CreateSubmission>,
        encrypted_answer: [u8; 32],
    ) -> Result<()> {
        create_submission::handler(ctx, encrypted_answer)
    }
    pub fn setter_claim(
        ctx: Context<SetterClaim>
    ) -> Result<()> {
        setter_claim::handler(ctx)
    }

    pub fn submitter_claim(
        ctx: Context<SubmitterClaim>
    ) -> Result<()> {
        submitter_claim::handler(ctx)
    }

    pub fn setter_close_challenge(
        ctx: Context<SetterClose>
    ) -> Result<()> {
        setter_close_challenge::handler(ctx)
    }
    
    pub fn challenge_solution_reveal(
        ctx: Context<ChallengeSolutionReveal>,
        id: u64,
    ) -> Result<()> {
        challenge_solution_reveal::handler(ctx, id)
    }

    pub fn submission_solution_reveal(
        ctx: Context<SubmissionSolutionReveal>,
        nonce: String,
        plaintext_answer: String,
    ) -> Result<()> {
        submission_solution_reveal::handler(ctx, nonce, plaintext_answer)
    }
}
