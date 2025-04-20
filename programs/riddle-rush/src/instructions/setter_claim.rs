// The creator of the challenge claims the percentage of the pot
use anchor_lang::prelude::*;

use crate::{ChallengeAccount, SETTER_CUT};
use crate::error::RiddleRushError;

#[derive(Accounts)]
pub struct SetterClaim<'info> {
    #[account(mut)]
    pub setter: Signer<'info>,
    #[account(
        mut,
        has_one = setter,
        constraint = setter.key() == challenge_account.setter,
        constraint = challenge_account.pot > 0,
        constraint = challenge_account.setter_cut_claimed == false,
        seeds = [b"challenge", challenge_account.id.to_le_bytes().as_ref()],
        bump,
    )]
    pub challenge_account: Box<Account<'info, ChallengeAccount>>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<SetterClaim>,
) -> Result<()> {
    //Current time should be after answer reveal deadline
    let current_time = Clock::get()?.unix_timestamp;
    require!(
        current_time > ctx.accounts.challenge_account.answer_reveal_deadline,
        RiddleRushError::WithdrawTooEarly
    );

    //And before the claim deadline
    require!(
        current_time < ctx.accounts.challenge_account.claim_deadline,
        RiddleRushError::WithdrawTooLate
    );

    // Calculate the setter's cut
    let setter_cut = ctx.accounts.challenge_account.pot * SETTER_CUT / 100;
    // Transfer the setter's cut to the setter
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.challenge_account.to_account_info(),
            to: ctx.accounts.setter.to_account_info(),
        },
    );
    anchor_lang::system_program::transfer(cpi_context, setter_cut)?;

    msg!("Transferred {} lamports to setter", setter_cut);
    // Update the challenge account
    ctx.accounts.challenge_account.setter_cut_claimed = true;
    Ok(())
}
