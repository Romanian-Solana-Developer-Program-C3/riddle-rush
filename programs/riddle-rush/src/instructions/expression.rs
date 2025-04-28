use anchor_lang::prelude::*;

#[derive(Debug)]
pub enum ExpressionError {
    InvalidCharacter(char),
    InvalidNumber,
    UnexpectedEnd,
    DivisionByZero,
}

impl From<ExpressionError> for anchor_lang::error::Error {
    fn from(e: ExpressionError) -> Self {
        match e {
            ExpressionError::InvalidCharacter(_c) => anchor_lang::error::Error::from(ProgramError::Custom(100)),
            ExpressionError::InvalidNumber => anchor_lang::error::Error::from(ProgramError::Custom(101)),
            ExpressionError::UnexpectedEnd => anchor_lang::error::Error::from(ProgramError::Custom(102)),
            ExpressionError::DivisionByZero => anchor_lang::error::Error::from(ProgramError::Custom(103)),
        }
    }
}

pub fn evaluate_expression(expr: &str) -> Result<f64> {
    // Remove all whitespace from the expression
    let expr = expr.replace(char::is_whitespace, "");
    let mut chars = expr.chars().peekable();
    evaluate_expression_recursive(&mut chars)
}

fn evaluate_expression_recursive(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64> {
    let mut result = evaluate_term(chars)?;
    
    while let Some(&c) = chars.peek() {
        match c {
            '+' => {
                chars.next();
                result += evaluate_term(chars)?;
            }
            '-' => {
                chars.next();
                result -= evaluate_term(chars)?;
            }
            _ => break,
        }
    }
    
    Ok(result)
}

fn evaluate_term(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64> {
    let mut result = evaluate_factor(chars)?;
    
    while let Some(&c) = chars.peek() {
        match c {
            '*' => {
                chars.next();
                result *= evaluate_factor(chars)?;
            }
            '/' => {
                chars.next();
                let divisor = evaluate_factor(chars)?;
                if divisor == 0.0 {
                    return Err(ExpressionError::DivisionByZero.into());
                }
                result /= divisor;
            }
            _ => break,
        }
    }
    
    Ok(result)
}

fn evaluate_factor(chars: &mut std::iter::Peekable<std::str::Chars>) -> Result<f64> {
    match chars.peek() {
        Some(&c) if c.is_digit(10) || c == '.' => {
            let mut num_str = String::new();
            while let Some(&c) = chars.peek() {
                if c.is_digit(10) || c == '.' {
                    num_str.push(chars.next().unwrap());
                } else {
                    break;
                }
            }
            num_str.parse::<f64>().map_err(|_| ExpressionError::InvalidNumber.into())
        }
        Some(&c) if c == '(' => {
            chars.next();
            let result = evaluate_expression_recursive(chars)?;
            match chars.next() {
                Some(')') => Ok(result),
                _ => Err(ExpressionError::UnexpectedEnd.into()),
            }
        }
        Some(&c) => Err(ExpressionError::InvalidCharacter(c).into()),
        None => Err(ExpressionError::UnexpectedEnd.into()),
    }
} 