use anchor_lang::prelude::*;

use crate::MAX_QUESTION_LENGTH;

#[error_code]
pub enum RiddleRushError {
    #[msg("The submission deadline has already passed.")]
    SubmissionDeadlinePassed,
    #[msg("The answer reveal deadline must be after the submission deadline.")]
    AnswerRevealDeadlinBeforeSubmissionDeadline,
    #[msg("The answer reveal deadline must be before the claim deadline.")]
    AnswerRevealDeadlinBeforeClaimDeadline,
    #[msg("The question is too long, max length: {MAX_QUESTION_LENGTH}")]
    QuestionTooLong,
    #[msg("The solution is too long, max length: {MAX_QUESTION_LENGTH}")]
    SolutionTooLong,
    #[msg("The entry fee must be greater than zero.")]
    ZeroEntryFee,
    #[msg("Invalid mathematical expression.")]
    InvalidExpression,
    #[msg("User attempting to withdraw before answer reveal deadline.")]
    WithdrawTooEarly,
    #[msg("User attempting to withdraw after prize claim deadline.")]
    WithdrawTooLate,
    #[msg("Insufficient funds in the challenge account.")]
    InsufficientFunds,
    #[msg("Solution reveal deadline has not been met.")]
    SolutionRevealDeadlineNotMet,
    #[msg("This submission has already been revealed.")]
    SubmissionAlreadyRevealed,
    #[msg("The transaction sender is not the submitter.")]
    NotTheSubmitter,
    #[msg("The solution has not been revealed yet.")]
    SolutionNotRevealed,
    #[msg("The answer doesn't match the encrypted answer.")]
    AnswerMismatch,
    #[msg("No correct submissions.")]
    ZeroCorrectSubmissions
}


