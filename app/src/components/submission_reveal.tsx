import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProgram } from '../anchor/setup';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';
import BN from 'bn.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { keccak256 } from 'ethereum-cryptography/keccak';

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const SubmissionReveal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const initialChallenge = location.state?.challenge;
  const programContext = useProgram();
  const program = programContext?.program;
  const wallet = useWallet();

  const [challenge, setChallenge] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [nonce, setNonce] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealingSolution, setIsRevealingSolution] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Fetch challenge data
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!program || !id) {
        console.log('Program or challenge ID not available:', { program, id });
        return;
      }

      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("challenge"), new BN(id).toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const challenge = await (program.account as any).challengeAccount.fetch(challengePda);
      try {
        console.log('Fetching challenge data...');
        console.log('Challenge ID:', id);
        console.log('Initial challenge:', challenge);
        
        // Create a new challenge object with the BN values properly converted
        const challengeData = {
          id: challenge.id,
          question: challenge.question,
          solution: challenge.solution,
          submissionDeadline: new Date(challenge.submissionDeadline.toNumber() * 1000).toLocaleString(),
          answerRevealDeadline: new Date(challenge.answerRevealDeadline.toNumber() * 1000).toLocaleString(),
          claimDeadline: new Date(challenge.claimDeadline.toNumber() * 1000).toLocaleString(),
          entryFee: new BN(challenge.entryFee.toNumber()),
          pot: new BN(challenge.pot.toNumber()),
          setter: challenge.setter,
          publicKey: challenge.pda,
        };

        setChallenge(challengeData);
      } catch (err) {
        console.error('Error setting challenge:', err);
        setError('Failed to set challenge data. Please try again.');
      }
    };

    fetchChallenge();
  }, [program, id, initialChallenge]);

  // Get nonce from cookie
  useEffect(() => {
    if (!id) return;
    
    const cookies = document.cookie.split(';');
    const nonceCookie = cookies.find(cookie => cookie.trim().startsWith(`submission_nonce_${id}=`));
    if (nonceCookie) {
      const nonceValue = nonceCookie.split('=')[1];
      setNonce(nonceValue);
    } else {
      setError('No nonce found for this challenge. Please make sure you have submitted an answer first.');
    }
  }, [id]);

  // Calculate time remaining
  useEffect(() => {
    if (!challenge) return;

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(new Date(challenge.answerRevealDeadline).getTime() / 1000);
      const remaining = deadline - now;

      if (remaining <= 0) {
        setTimeRemaining('Answer reveal period has ended');
        return;
      }

      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [challenge]);

  if (!challenge) {
    return (
      <div style={{ 
        height: "100%",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
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
          alignItems: "center",
          justifyContent: "center",
        }}>
          {error ? (
            <div style={{ color: "#ff6b6b" }}>{error}</div>
          ) : (
            <div>Loading challenge data...</div>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !wallet.publicKey || !id) {
      setError('Wallet not connected or challenge ID missing');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Check if answer reveal deadline has passed
      const now = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(new Date(challenge.answerRevealDeadline).getTime() / 1000);
      if (now >= deadline) {
        setError('Answer reveal deadline has passed');
        setIsSubmitting(false);
        return;
      }

      // Log the values being sent to the program
      console.log('Reveal - Nonce:', nonce);
      console.log('Reveal - Answer:', answer);
      console.log('Reveal - Concatenated string:', `${answer}${nonce}`);

      const concatenated_answer = `${answer}${nonce}`;
      const hashBuffer = keccak256(Buffer.from(concatenated_answer));
      const hashArray = Array.from(new Uint8Array(hashBuffer));

      
      // Derive the challenge PDA
      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("challenge"), new BN(id).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      // Derive the submission PDA
      const [submissionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("submission"), challengePda.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );

      const submission = await (program.account as any).submissionAccount.fetch(submissionPda);
      console.log("Submission answer: ", submission.encryptedAnswer);
      console.log("Hash of answer + nonce: ", hashArray);

      // Reveal submission
      const tx = await program.methods
        .submissionSolutionReveal(nonce, answer)
        .accountsPartial({
          submitter: wallet.publicKey,
          challengeAccount: challengePda,
          submissionAccount: submissionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Reveal transaction:', tx);
      navigate('/');
    } catch (err) {
      console.error('Reveal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reveal answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealSolution = async () => {
    if (!program || !wallet.publicKey || !id) {
      setError('Wallet not connected or challenge ID missing');
      return;
    }

    try {
      setIsRevealingSolution(true);
      setError(null);

      // Check if answer reveal deadline has passed
      const now = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(new Date(challenge.answerRevealDeadline).getTime() / 1000);
      if (now >= deadline) {
        setError('Answer reveal deadline has passed');
        setIsRevealingSolution(false);
        return;
      }

      // Derive the challenge PDA
      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("challenge"), new BN(id).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      // Call challenge_solution_reveal instruction
      const tx = await program.methods
        .challengeSolutionReveal(new BN(id))
        .accountsPartial({
          user: wallet.publicKey,
          challengeAccount: challengePda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Challenge solution reveal transaction:', tx);
      alert('Challenge solution revealed successfully!');
    } catch (err) {
      console.error('Challenge solution reveal error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reveal challenge solution');
    } finally {
      setIsRevealingSolution(false);
    }
  };

  return (
    <div style={{ 
      height: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      maxWidth: "1200px",
      margin: "0 auto",
      width: "100%",
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
        }}>Reveal Answer for Challenge #{id}</h1>
        
        {/* Challenge Information and Metrics Container */}
        <div style={{ 
          display: "flex",
          gap: "24px",
          marginBottom: "24px",
        }}>
          {/* Challenge Information */}
          <div style={{ 
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "rgba(255, 255, 255, 0.9)",
            }}>Challenge Information</h2>
            <p style={{ marginBottom: "8px" }}><strong>Question:</strong> {challenge.question}</p>
            <p style={{ marginBottom: "8px" }}><strong>Submission Deadline:</strong> {challenge.submissionDeadline}</p>
            <p style={{ marginBottom: "8px" }}><strong>Answer Reveal Deadline:</strong> {challenge.answerRevealDeadline}</p>
            <p style={{ marginBottom: "8px" }}><strong>Claim Deadline:</strong> {challenge.claimDeadline}</p>
          </div>

          {/* Challenge Metrics */}
          <div style={{ 
            flex: 1,
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "20px",
          }}>
            <h2 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "rgba(255, 255, 255, 0.9)",
            }}>Challenge Metrics</h2>
            <p style={{ marginBottom: "8px" }}><strong>Entry Fee:</strong> {challenge.entryFee.toNumber() / 1e9} SOL</p>
            <p style={{ marginBottom: "8px" }}><strong>Pot:</strong> {challenge.pot.toNumber() / 1e9} SOL</p>
            <p style={{ marginBottom: "8px" }}><strong>Time Remaining:</strong> {timeRemaining}</p>
          </div>
        </div>

        {/* Answer Reveal Form */}
        <form onSubmit={handleSubmit} style={{ 
          marginTop: "20px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          padding: "20px",
        }}>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="answer" style={{ 
              display: "block", 
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.9)",
            }}>
              Your Answer:
            </label>
            <input
              type="text"
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="nonce" style={{ 
              display: "block", 
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.9)",
            }}>
              Nonce:
            </label>
            <input
              type="text"
              id="nonce"
              value={nonce}
              readOnly
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "16px",
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: "#ff6b6b", 
              marginBottom: "20px",
              padding: "12px",
              background: "rgba(255, 107, 107, 0.1)",
              borderRadius: "6px",
            }}>
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "12px 24px",
              borderRadius: "6px",
              border: "none",
              background: isSubmitting ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
              color: "white",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              fontSize: "16px",
              width: "100%",
            }}
          >
            {isSubmitting ? 'Revealing...' : 'Reveal Answer'}
          </button>
        </form>

        <div style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
        }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Back to Challenges
          </button>
          <button 
            onClick={handleRevealSolution}
            disabled={isRevealingSolution}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              background: isRevealingSolution ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.2)",
              color: "white",
              cursor: isRevealingSolution ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {isRevealingSolution ? 'Revealing Solution...' : 'Reveal Challenge Solution'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionReveal;