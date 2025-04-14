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
        solution: String,
        submission_deadline: i64,
        answer_reveal_deadline: i64,
        entry_fee: u64,
    ) -> Result<()> {
        create_challenge::handler(ctx, id, question, solution, submission_deadline, answer_reveal_deadline, entry_fee)
    }
}
