use anchor_lang::prelude::*;

#[constant]
pub const SEED: &str = "anchor";
pub const MAX_SUBMISSIONS: u64 = 1e4 as u64; // Maximum number of submissions per challenge
pub const ANCHOR_DISCRIMINATOR: usize = 8;
pub const MAX_QUESTION_LENGTH: usize = 256; // Maximum length of the question and solution
pub const SETTER_CUT: u64 = 10; // Percentage of the entry fee that goes to the setter