pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("35ELX25de2z4XxDYW1wizysNjsjm2WUrfbPgvvJkDtbZ");

#[program]
pub mod riddle_rush {
    use super::*;

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        id: u64,
        question: String,
        submission_deadline: i64,
        answer_reveal_deadline: i64,
        claim_deadline: i64,
        entry_fee: u64,
    ) -> Result<()> {
        create_challenge::handler(ctx, id, question, submission_deadline, answer_reveal_deadline, claim_deadline, entry_fee)
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
}
