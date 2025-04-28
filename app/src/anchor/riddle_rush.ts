/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/riddle_rush.json`.
 */
export type RiddleRush = {
  "version": "0.1.0",
  "name": "riddle_rush",
  "address": "3bKvaAkVaejaBLzpo6qzRMLUXbKpUUTm6G7LagPFNWEJ",
  "metadata": {
    "name": "riddle_rush",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "challenge_solution_reveal",
      "discriminator": [
        83,
        107,
        98,
        120,
        134,
        15,
        155,
        137
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "create_challenge",
      "discriminator": [
        170,
        244,
        47,
        1,
        1,
        15,
        173,
        239
      ],
      "accounts": [
        {
          "name": "setter",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "global_config.next_challenge_id",
                "account": "GlobalConfig"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "submission_deadline",
          "type": "i64"
        },
        {
          "name": "answer_reveal_deadline",
          "type": "i64"
        },
        {
          "name": "claim_deadline",
          "type": "i64"
        },
        {
          "name": "entry_fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "create_submission",
      "discriminator": [
        85,
        217,
        61,
        59,
        157,
        60,
        175,
        220
      ],
      "accounts": [
        {
          "name": "submitter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account.id",
                "account": "ChallengeAccount"
              }
            ]
          }
        },
        {
          "name": "submission_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "encrypted_answer",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "global_config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setter_claim",
      "discriminator": [
        52,
        58,
        147,
        7,
        39,
        25,
        31,
        153
      ],
      "accounts": [
        {
          "name": "setter",
          "writable": true,
          "signer": true,
          "relations": [
            "challenge_account"
          ]
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account.id",
                "account": "ChallengeAccount"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setter_close_challenge",
      "discriminator": [
        102,
        182,
        159,
        22,
        30,
        14,
        94,
        199
      ],
      "accounts": [
        {
          "name": "setter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account.id",
                "account": "ChallengeAccount"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submission_solution_reveal",
      "discriminator": [
        63,
        172,
        102,
        76,
        57,
        170,
        105,
        14
      ],
      "accounts": [
        {
          "name": "submitter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account.id",
                "account": "ChallengeAccount"
              }
            ]
          }
        },
        {
          "name": "submission_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "string"
        },
        {
          "name": "plaintext_answer",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitter_claim",
      "discriminator": [
        153,
        174,
        127,
        163,
        243,
        21,
        17,
        40
      ],
      "accounts": [
        {
          "name": "submitter",
          "writable": true,
          "signer": true
        },
        {
          "name": "challenge_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  97,
                  108,
                  108,
                  101,
                  110,
                  103,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account.id",
                "account": "ChallengeAccount"
              }
            ]
          }
        },
        {
          "name": "submission_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "challenge_account"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "ChallengeAccount",
      "discriminator": [
        96,
        128,
        44,
        165,
        71,
        172,
        60,
        12
      ]
    },
    {
      "name": "GlobalConfig",
      "discriminator": [
        149,
        8,
        156,
        202,
        160,
        252,
        176,
        217
      ]
    },
    {
      "name": "SubmissionAccount",
      "discriminator": [
        254,
        14,
        34,
        50,
        170,
        36,
        60,
        191
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "SubmissionDeadlinePassed",
      "msg": "The submission deadline has already passed."
    },
    {
      "code": 6001,
      "name": "AnswerRevealDeadlinBeforeSubmissionDeadline",
      "msg": "The answer reveal deadline must be after the submission deadline."
    },
    {
      "code": 6002,
      "name": "AnswerRevealDeadlinBeforeClaimDeadline",
      "msg": "The answer reveal deadline must be before the claim deadline."
    },
    {
      "code": 6003,
      "name": "QuestionTooLong",
      "msg": "The question is too long, max length: {MAX_QUESTION_LENGTH}"
    },
    {
      "code": 6004,
      "name": "SolutionTooLong",
      "msg": "The solution is too long, max length: {MAX_QUESTION_LENGTH}"
    },
    {
      "code": 6005,
      "name": "ZeroEntryFee",
      "msg": "The entry fee must be greater than zero."
    },
    {
      "code": 6006,
      "name": "InvalidExpression",
      "msg": "Invalid mathematical expression."
    },
    {
      "code": 6007,
      "name": "WithdrawTooEarly",
      "msg": "User attempting to withdraw before answer reveal deadline."
    },
    {
      "code": 6008,
      "name": "WithdrawTooLate",
      "msg": "User attempting to withdraw after prize claim deadline."
    },
    {
      "code": 6009,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds in the challenge account."
    },
    {
      "code": 6010,
      "name": "SolutionRevealDeadlineNotMet",
      "msg": "Solution reveal deadline has not been met."
    },
    {
      "code": 6011,
      "name": "SubmissionAlreadyRevealed",
      "msg": "This submission has already been revealed."
    },
    {
      "code": 6012,
      "name": "NotTheSubmitter",
      "msg": "The transaction sender is not the submitter."
    },
    {
      "code": 6013,
      "name": "SolutionNotRevealed",
      "msg": "The solution has not been revealed yet."
    },
    {
      "code": 6014,
      "name": "AnswerMismatch",
      "msg": "The answer doesn't match the encrypted answer."
    },
    {
      "code": 6015,
      "name": "ZeroCorrectSubmissions",
      "msg": "No correct submissions."
    }
  ],
  "types": [
    {
      "name": "ChallengeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "solution",
            "type": "string"
          },
          {
            "name": "submission_deadline",
            "type": "i64"
          },
          {
            "name": "answer_reveal_deadline",
            "type": "i64"
          },
          {
            "name": "claim_deadline",
            "type": "i64"
          },
          {
            "name": "entry_fee",
            "type": "u64"
          },
          {
            "name": "setter",
            "type": "pubkey"
          },
          {
            "name": "pot",
            "type": "u64"
          },
          {
            "name": "setter_cut_claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "correct_submissions",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "GlobalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "next_challenge_id",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "SubmissionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "challenge_id",
            "type": "u64"
          },
          {
            "name": "submitter",
            "type": "pubkey"
          },
          {
            "name": "encrypted_answer",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "revealed",
            "type": "bool"
          },
          {
            "name": "answer_correct",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "SEED",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
