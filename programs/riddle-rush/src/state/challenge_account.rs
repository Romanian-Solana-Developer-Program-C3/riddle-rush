use anchor_lang::prelude::*;
use crate::{MAX_QUESTION_LENGTH};

#[account]
#[derive(InitSpace)]
pub struct ChallengeAccount {
    pub id: u64,
    #[max_len(MAX_QUESTION_LENGTH)]
    pub question: String,
    #[max_len(MAX_QUESTION_LENGTH)]
    pub solution: String,
    pub submission_deadline: i64,
    pub answer_reveal_deadline: i64,
    pub claim_deadline: i64,
    pub entry_fee: u64,
    pub setter: Pubkey,
    pub pot: u64, // Total pot amount - don't update on withdraws so we can calculate each player's share
    pub setter_cut_claimed: bool,
    pub bump: u8,
}