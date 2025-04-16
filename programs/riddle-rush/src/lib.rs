pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub mod expression;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;
pub use expression::*;

declare_id!("35ELX25de2z4XxDYW1wizysNjsjm2WUrfbPgvvJkDtbZ");

#[program]
pub mod riddle_rush {
    use super::*;

    pub fn create_challenge(
        ctx: Context<CreateChallenge>,
        id: u64,
        question: String,
        solution: String,
        submission_deadline: i64,
        answer_reveal_deadline: i64,
        claim_deadline: i64,
        entry_fee: u64,
    ) -> Result<()> {
        create_challenge::handler(ctx, id, question, submission_deadline, answer_reveal_deadline, claim_deadline, entry_fee)
    }
}
