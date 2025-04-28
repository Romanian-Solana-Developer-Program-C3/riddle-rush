use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalConfig {
    pub next_challenge_id: u64,
    pub bump: u8,
} 