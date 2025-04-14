use anchor_lang::prelude::*;

use crate::MAX_QUESTION_LENGTH;

#[error_code]
pub enum RiddleRushError {
    #[msg("The submission deadline has already passed.")]
    SubmissionDeadlinePassed,
    #[msg("The answer reveal deadline must be after the submission deadline.")]
    AnswerRevealDeadlinBeforeSubmissionDeadline,
    #[msg("The question is too long, max length: {MAX_QUESTION_LENGTH}")]
    QuestionTooLong,
    #[msg("The solution is too long, max length: {MAX_QUESTION_LENGTH}")]
    SolutionTooLong,
    #[msg("The entry fee must be greater than zero.")]
    ZeroEntryFee,
}


