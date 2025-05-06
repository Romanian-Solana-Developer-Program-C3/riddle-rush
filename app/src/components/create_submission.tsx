import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useProgram } from '../anchor/setup';
import { useWallet } from '@solana/wallet-adapter-react';
import { Buffer } from 'buffer';
import BN from 'bn.js';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import pkg from 'js-sha3';
const { keccak_256 } = pkg;

// Polyfill Buffer for browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const CreateSubmission: React.FC = () => {
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

  // Generate random nonce on component mount
  useEffect(() => {
    if (!id) return;
    
    const randomNonce = Math.random().toString(36).substring(2, 15);
    setNonce(randomNonce);
    // Store nonce in cookie
    document.cookie = `submission_nonce_${id}=${randomNonce}; path=/; max-age=31536000`;
  }, [id]);

  // Calculate time remaining
  useEffect(() => {
    if (!challenge) return;

    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Math.floor(new Date(challenge.submissionDeadline).getTime() / 1000);
      const remaining = deadline - now;

      if (remaining <= 0) {
        setTimeRemaining('Submission period has ended');
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

      // Check if submission deadline has passed
      const now = Math.floor(Date.now() / 1000);
      if (now >= challenge.submissionDeadline) {
        setError('Submission deadline has passed');
        setIsSubmitting(false);
        return;
      }

      // Create hash of answer + nonce using Keccak-256
      const data = `${answer}${nonce}`;
      
        // Hash the concatenated string using SHA-256
      const hashHex = keccak_256(data);
    
      // Convert the hash (hex string) to a Uint8Array
      const hashArray = new Uint8Array(hashHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      
      console.log('Submission - Concatenated string:', data);
      console.log('Submission - Hash array:', hashArray);

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

      // Create submission
      const tx = await program.methods
        .createSubmission(Array.from(hashArray))
        .accountsPartial({
          submitter: wallet.publicKey,
          challengeAccount: challengePda,
          submissionAccount: submissionPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Submission transaction:', tx);
      navigate('/');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
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
        }}>Submit Answer for Challenge #{id}</h1>
        
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

        {/* Answer Submission Form */}
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
              Nonce (Save this!):
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
            <p style={{ 
              marginTop: "8px", 
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "14px" 
            }}>
              ⚠️ Important: Save this nonce! You'll need it to reveal your answer later.
              If you clear your browser cookies, you won't be able to reveal your answer without this nonce.
            </p>
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
            {isSubmitting ? 'Submitting...' : 'Submit Answer'}
          </button>
        </form>

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
            marginTop: "20px",
            alignSelf: "flex-start",
          }}
        >
          Back to Challenges
        </button>
      </div>
    </div>
  );
};

export default CreateSubmission;