use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SubmissionAccount {
    pub challenge_id: u64,
    pub submitter: Pubkey,
    pub encrypted_answer: [u8; 32],
    pub revealed: bool,
    pub answer_correct: bool,
    pub claimed: bool,
}