/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/riddle_rush.json`.
 */
export type RiddleRush = {
  "address": "35ELX25de2z4XxDYW1wizysNjsjm2WUrfbPgvvJkDtbZ",
  "metadata": {
    "name": "riddleRush",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "challengeSolutionReveal",
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
          "name": "challengeAccount",
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
          "name": "systemProgram",
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
      "name": "createChallenge",
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
          "name": "challengeAccount",
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        },
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "submissionDeadline",
          "type": "i64"
        },
        {
          "name": "answerRevealDeadline",
          "type": "i64"
        },
        {
          "name": "claimDeadline",
          "type": "i64"
        },
        {
          "name": "entryFee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createSubmission",
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
          "name": "challengeAccount",
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
                "account": "challengeAccount"
              }
            ]
          }
        },
        {
          "name": "submissionAccount",
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
                "path": "challengeAccount"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "encryptedAnswer",
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
      "name": "setterClaim",
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
            "challengeAccount"
          ]
        },
        {
          "name": "challengeAccount",
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
                "account": "challengeAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setterCloseChallenge",
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
          "name": "challengeAccount",
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
                "account": "challengeAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "submissionSolutionReveal",
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
          "name": "challengeAccount",
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
                "account": "challengeAccount"
              }
            ]
          }
        },
        {
          "name": "submissionAccount",
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
                "path": "challengeAccount"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "string"
        },
        {
          "name": "plaintextAnswer",
          "type": "string"
        }
      ]
    },
    {
      "name": "submitterClaim",
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
          "name": "challengeAccount",
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
                "account": "challengeAccount"
              }
            ]
          }
        },
        {
          "name": "submissionAccount",
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
                "path": "challengeAccount"
              },
              {
                "kind": "account",
                "path": "submitter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "challengeAccount",
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
      "name": "submissionAccount",
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
      "name": "submissionDeadlinePassed",
      "msg": "The submission deadline has already passed."
    },
    {
      "code": 6001,
      "name": "answerRevealDeadlinBeforeSubmissionDeadline",
      "msg": "The answer reveal deadline must be after the submission deadline."
    },
    {
      "code": 6002,
      "name": "answerRevealDeadlinBeforeClaimDeadline",
      "msg": "The answer reveal deadline must be before the claim deadline."
    },
    {
      "code": 6003,
      "name": "questionTooLong",
      "msg": "The question is too long, max length: {MAX_QUESTION_LENGTH}"
    },
    {
      "code": 6004,
      "name": "solutionTooLong",
      "msg": "The solution is too long, max length: {MAX_QUESTION_LENGTH}"
    },
    {
      "code": 6005,
      "name": "zeroEntryFee",
      "msg": "The entry fee must be greater than zero."
    },
    {
      "code": 6006,
      "name": "invalidExpression",
      "msg": "Invalid mathematical expression."
    },
    {
      "code": 6007,
      "name": "withdrawTooEarly",
      "msg": "User attempting to withdraw before answer reveal deadline."
    },
    {
      "code": 6008,
      "name": "withdrawTooLate",
      "msg": "User attempting to withdraw after prize claim deadline."
    },
    {
      "code": 6009,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in the challenge account."
    },
    {
      "code": 6010,
      "name": "solutionRevealDeadlineNotMet",
      "msg": "Solution reveal deadline has not been met."
    },
    {
      "code": 6011,
      "name": "submissionAlreadyRevealed",
      "msg": "This submission has already been revealed."
    },
    {
      "code": 6012,
      "name": "notTheSubmitter",
      "msg": "The transaction sender is not the submitter."
    },
    {
      "code": 6013,
      "name": "solutionNotRevealed",
      "msg": "The solution has not been revealed yet."
    },
    {
      "code": 6014,
      "name": "answerMismatch",
      "msg": "The answer doesn't match the encrypted answer."
    },
    {
      "code": 6015,
      "name": "zeroCorrectSubmissions",
      "msg": "No correct submissions."
    }
  ],
  "types": [
    {
      "name": "challengeAccount",
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
            "name": "submissionDeadline",
            "type": "i64"
          },
          {
            "name": "answerRevealDeadline",
            "type": "i64"
          },
          {
            "name": "claimDeadline",
            "type": "i64"
          },
          {
            "name": "entryFee",
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
            "name": "setterCutClaimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "correctSubmissions",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "submissionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "challengeId",
            "type": "u64"
          },
          {
            "name": "submitter",
            "type": "pubkey"
          },
          {
            "name": "encryptedAnswer",
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
            "name": "answerCorrect",
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
      "name": "seed",
      "type": "string",
      "value": "\"anchor\""
    }
  ]
};
