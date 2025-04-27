import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgram } from '../anchor/setup';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { Buffer } from 'buffer';

const CreateChallenge: React.FC = () => {
  const navigate = useNavigate();
  const programContext = useProgram();
  const program = programContext?.program;
  const wallet = programContext?.provider?.wallet;

  const [question, setQuestion] = useState('1 + 1 * 2');
  const [entryFee, setEntryFee] = useState('1000');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [answerRevealDeadline, setAnswerRevealDeadline] = useState('');
  const [claimDeadline, setClaimDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !program) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert dates to timestamps
      const submissionTimestamp = Math.floor(new Date(submissionDeadline).getTime() / 1000);
      const revealTimestamp = Math.floor(new Date(answerRevealDeadline).getTime() / 1000);
      const claimTimestamp = Math.floor(new Date(claimDeadline).getTime() / 1000);

      // Convert entry fee to lamports
      const entryFeeLamports = Math.floor(parseFloat(entryFee));

      // Get the global config PDA
      const [globalConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('global_config')],
        program.programId
      );

      // Create PDA for the challenge
      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('challenge'), new BN(0).toArrayLike(Buffer, 'le', 8)], // The ID will be set by the program
        program.programId
      );

      console.log('Creating challenge with parameters:', {
        question,
        entryFeeLamports,
        submissionTimestamp,
        revealTimestamp,
        claimTimestamp
      });

      console.log('Global Config PDA:', globalConfigPda.toBase58());
      console.log('Challenge PDA:', challengePda.toBase58());

      // Create the challenge
      await program.methods
        .createChallenge(
          question,
          new BN(submissionTimestamp),
          new BN(revealTimestamp),
          new BN(claimTimestamp),
          new BN(entryFeeLamports)
        )
        .accounts({
          globalConfig: globalConfigPda,
          challengeAccount: challengePda,
          setter: wallet.publicKey,
        })
        .rpc();

      alert('Challenge created successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error creating challenge:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      alert('Failed to create challenge. Please try again.');
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