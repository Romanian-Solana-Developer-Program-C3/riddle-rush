import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgram } from '../anchor/setup';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { Buffer } from 'buffer';
import { useWallet } from '@solana/wallet-adapter-react';
import IDL from '../anchor/idl.json';

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const programContext = useProgram();
  const program = programContext?.program;
  const wallet = useWallet();

  const [question, setQuestion] = useState('1 + 1 * 2');
  const [entryFee, setEntryFee] = useState('1000');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [answerRevealDeadline, setAnswerRevealDeadline] = useState('');
  const [claimDeadline, setClaimDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeProgram = async () => {
    if (!program || !wallet.publicKey) return false;

    try {
      const [globalConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global_config')],
        program.programId
      );

      // Try to fetch the global config account
      try {
        const globalConfig = await (program.account as any).globalConfig.fetch(globalConfigPda);
        console.log('Existing GlobalConfig found:', globalConfig);
        return true; // Account exists
      } catch (e) {
        // Account doesn't exist, initialize it
        console.log('GlobalConfig not found, initializing program...');
        try {
          const tx = await program.methods
            .initialize()
            .accounts({
              authority: wallet.publicKey,
              global_config: globalConfigPda,
              system_program: SystemProgram.programId,
            } as any)
            .rpc();
          console.log('Program initialized:', tx);

          // Verify initialization
          const globalConfig = await (program.account as any).globalConfig.fetch(globalConfigPda);
          console.log('Initialized GlobalConfig:', globalConfig);
          return true;
        } catch (initError) {
          console.error('Error during program initialization:', initError);
          return false;
        }
      }
    } catch (error) {
      console.error('Error in initializeProgram:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set default dates
    const now = new Date();
    const submissionDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const revealDate = new Date(submissionDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after submission
    const claimDate = new Date(revealDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours after reveal

    setSubmissionDeadline(submissionDate.toISOString().slice(0, 16));
    setAnswerRevealDeadline(revealDate.toISOString().slice(0, 16));
    setClaimDeadline(claimDate.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    // Log program initialization status
    console.log('Program Context:', programContext);
    console.log('Program:', program);
    if (program) {
      console.log('Program Accounts:', program.account);
      console.log('Available Program Methods:', program.methods);
      console.log('Program ID:', program.programId.toBase58());
      console.log('Available Account Types:', Object.keys(program.account));
      console.log('Program Account Details:', {
        globalConfig: (program.account as any).globalConfig,
        challengeAccount: (program.account as any).challengeAccount,
        submissionAccount: (program.account as any).submissionAccount
      });
    } else {
      console.warn('Program not initialized properly');
    }
  }, [programContext, program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!program) {
      setError('Program not initialized. Please check your wallet connection and try again.');
      return;
    }

    if (!program.account) {
      console.error('Program accounts not available:', program);
      setError('Program account not initialized properly. Please refresh the page and try again.');
      return;
    }

    // Log available accounts
    console.log('Available accounts:', Object.keys(program.account));
    
    if (!(program.account as any).globalConfig) {
      console.error('GlobalConfig account not found. Available accounts:', Object.keys(program.account));
      setError('Global config not found in program account. Please check program deployment.');
      return;
    }

    // Check if we need to initialize the program
    const isInitialized = await initializeProgram();
    if (!isInitialized) {
      setError('Failed to initialize program. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert dates to timestamps
      const submissionTimestamp = Math.floor(new Date(submissionDeadline).getTime() / 1000);
      const revealTimestamp = Math.floor(new Date(answerRevealDeadline).getTime() / 1000);
      const claimTimestamp = Math.floor(new Date(claimDeadline).getTime() / 1000);

      // Convert entry fee to lamports (1 SOL = 1_000_000_000 lamports)
      const entryFeeLamports = entryFee;

      // Get the global config PDA
      const [globalConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global_config')],
        program.programId
      );

      // Get the global config account to get the next_challenge_id
      const globalConfig = await (program.account as any).globalConfig.fetch(globalConfigPda);
      console.log('Global Config:', globalConfig);
      console.log('Global Config type:', typeof globalConfig);
      console.log('Global Config keys:', Object.keys(globalConfig));
      
      const nextChallengeId = globalConfig.nextChallengeId;
      console.log('Next Challenge ID:', nextChallengeId);
      console.log('Next Challenge ID type:', typeof nextChallengeId);

      // Create PDA for the challenge using the next_challenge_id
      const [challengePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('challenge'),
          nextChallengeId.toArrayLike(Buffer, 'le', 8)
        ],
        program.programId
      );

      console.log('Creating challenge with parameters:', {
        question,
        entryFeeLamports,
        submissionTimestamp,
        revealTimestamp,
        claimTimestamp,
        nextChallengeId: nextChallengeId.toString()
      });

      console.log('Global Config PDA:', globalConfigPda.toBase58());
      console.log('Challenge PDA:', challengePda.toBase58());

      // Create the challenge
      const tx = await (program.methods as any)
        .createChallenge(
          question,
          new BN(submissionTimestamp),
          new BN(revealTimestamp),
          new BN(claimTimestamp),
          new BN(entryFeeLamports)
        )
        .accounts({
          setter: wallet.publicKey,
          global_config: globalConfigPda,
          challenge_account: challengePda,
          system_program: SystemProgram.programId,
        } as any)
        .rpc();

      console.log('Transaction signature:', tx);
      alert('Challenge created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating challenge:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        // Show more specific error message
        if (error.message.includes('insufficient funds')) {
          setError('Insufficient funds to create challenge. Please ensure you have enough SOL.');
        } else if (error.message.includes('deadline')) {
          setError('Invalid deadline configuration. Please check your dates.');
        } else {
          setError(`Failed to create challenge: ${error.message}`);
        }
      } else {
        setError('Failed to create challenge. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      height: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}>
        <h1 style={{
          fontSize: "24px",
          fontWeight: "600",
          marginBottom: "24px",
          color: "rgba(255, 255, 255, 0.9)",
        }}>Create New Challenge</h1>

        {error && (
          <div style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            background: "rgba(255, 0, 0, 0.1)",
            border: "1px solid rgba(255, 0, 0, 0.2)",
            color: "rgba(255, 255, 255, 0.9)",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          alignItems: "center",
        }}>
          <table style={{
            width: "600px",
            borderCollapse: "collapse",
          }}>
            <tbody>
              <tr>
                <td style={{
                  width: "150px",
                  padding: "12px 16px 12px 0",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  verticalAlign: "top",
                  textAlign: "right",
                }}>Question</td>
                <td style={{ textAlign: "left" }}>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    style={{
                      width: "400px",
                      minHeight: "100px",
                      padding: "12px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                      resize: "vertical",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{
                  width: "150px",
                  padding: "12px 16px 12px 0",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  textAlign: "right",
                }}>Entry Fee (Lamports)</td>
                <td style={{ textAlign: "left" }}>
                  <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    required
                    min="0"
                    step="1"
                    style={{
                      width: "400px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{
                  width: "150px",
                  padding: "12px 16px 12px 0",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  textAlign: "right",
                }}>Submission Deadline</td>
                <td style={{ textAlign: "left" }}>
                  <input
                    type="datetime-local"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    required
                    style={{
                      width: "200px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{
                  width: "150px",
                  padding: "12px 16px 12px 0",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  textAlign: "right",
                }}>Answer Reveal Deadline</td>
                <td style={{ textAlign: "left" }}>
                  <input
                    type="datetime-local"
                    value={answerRevealDeadline}
                    onChange={(e) => setAnswerRevealDeadline(e.target.value)}
                    required
                    style={{
                      width: "200px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td style={{
                  width: "150px",
                  padding: "12px 16px 12px 0",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  textAlign: "right",
                }}>Claim Deadline</td>
                <td style={{ textAlign: "left" }}>
                  <input
                    type="datetime-local"
                    value={claimDeadline}
                    onChange={(e) => setClaimDeadline(e.target.value)}
                    required
                    style={{
                      width: "200px",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "14px",
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "20px",
            width: "600px",
          }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "14px",
                fontWeight: "500",
                flex: 3,
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Creating Challenge...' : 'Create Challenge'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: "12px 24px",
                borderRadius: "6px",
                border: "none",
                background: "rgba(255, 255, 255, 0.05)",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "14px",
                fontWeight: "500",
                flex: 1,
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge; 