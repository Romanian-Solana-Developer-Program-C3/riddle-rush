import React, { useEffect, useState, useRef } from "react";
import { useProgram } from "../anchor/setup";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Program } from "@coral-xyz/anchor";
import { RiddleRush } from "../anchor/riddle_rush";
import { SystemProgram } from "@solana/web3.js";


const GLOBAL_ID = 20; // Fixed global ID for now

// Helper function to format SOL amounts
const formatSol = (lamports: number) => {
  return (lamports / 1e9).toFixed(2);
};

// Get timezone abbreviation
const timezoneAbbr = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

const MainPage: React.FC = () => {
  const programContext = useProgram();
  const program = programContext?.program;
  const [challenges, setChallenges] = useState<any[]>([]);
  const hasFetchedChallenges = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (hasFetchedChallenges.current) return;
      if (!program) {
        console.log("Program not initialized yet");
        return;
      }

      try {
        // Use a direct connection to Solana Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        // First fetch the global config to get the next_challenge_id
        const [globalConfigPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("global_config")],
          program.programId
        );

        console.log("Fetching global config from:", globalConfigPda.toBase58());
        
        if (!program.account) {
          console.error("Program account not initialized");
          return;
        }

        const globalConfig = await (program.account as any).globalConfig.fetch(globalConfigPda);
        console.log("Global config:", globalConfig);
        
        const nextChallengeId = globalConfig.nextChallengeId.toNumber();
        console.log("Next challenge ID:", nextChallengeId);

        const fetchedChallenges = [];
        for (let challengeId = 0; challengeId < nextChallengeId; challengeId++) {
          try {
            const [challengePda] = PublicKey.findProgramAddressSync(
              [Buffer.from("challenge"), new BN(challengeId).toArrayLike(Buffer, "le", 8)],
              program.programId
            );

            console.log(`Fetching challenge ${challengeId} from:`, challengePda.toBase58());
            const challenge = await (program.account as any).challengeAccount.fetch(challengePda);
            fetchedChallenges.push({ ...challenge, pda: challengePda });
          } catch (error) {
            console.error(`Error fetching challenge ${challengeId}:`, error);
          }
        }

        // Sort challenges in reverse order by ID
        fetchedChallenges.sort((a, b) => b.id.toNumber() - a.id.toNumber());
        setChallenges(fetchedChallenges);
        hasFetchedChallenges.current = true; // Mark challenges as fetched
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, [program]);

  return (
    <div style={{ 
      height: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ 
        flex: 1,
        padding: "20px",
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}>
          <div style={{
            flex: 1,
            overflowY: "auto",
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              borderSpacing: "0",
              tableLayout: "fixed",
            }}>
              <thead style={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                background: "rgba(10, 5, 41, 0.95)",
                backdropFilter: "blur(10px)",
              }}>
                <tr>
                  <th style={{...tableHeaderStyle, width: '5%'}}>ID</th>
                  <th style={{...tableHeaderStyle, width: '25%'}}>Question</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Entry Fee<br />(SOL)</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Pot<br />(SOL)</th>
                  <th style={{...tableHeaderStyle, width: '15%'}}>Submission<br />Deadline<br />({timezoneAbbr})</th>
                  <th style={{...tableHeaderStyle, width: '15%'}}>Answer Reveal<br />Deadline<br />({timezoneAbbr})</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Claim<br />Deadline<br />({timezoneAbbr})</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Status</th>
                  <th style={{...tableHeaderStyle, width: '10%'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge, index) => (
                  <tr 
                    key={index}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "background 0.2s ease",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={{...tableCellStyle, width: '5%'}}>#{challenge.id.toString()}</td>
                    <td style={{...tableCellStyle, width: '25%'}}>{challenge.question}</td>
                    <td style={{...tableCellStyle, width: '10%'}}>{formatSol(challenge.entryFee.toNumber())}</td>
                    <td style={{...tableCellStyle, width: '10%'}}>{formatSol(challenge.pot.toNumber())}</td>
                    <td style={{...tableCellStyle, width: '15%'}}>{new Date(challenge.submissionDeadline.toNumber() * 1000).toLocaleString()}</td>
                    <td style={{...tableCellStyle, width: '15%'}}>{new Date(challenge.answerRevealDeadline.toNumber() * 1000).toLocaleString()}</td>
                    <td style={{...tableCellStyle, width: '10%'}}>{new Date(challenge.claimDeadline.toNumber() * 1000).toLocaleString()}</td>
                    <td style={{...tableCellStyle, width: '10%'}}>
                      <StatusDisplay challenge={challenge} />
                    </td>
                    <td style={{...tableCellStyle, width: '10%'}}>
                      <ActionButton challenge={challenge} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  padding: "16px",
  fontWeight: "bold",
  color: "rgba(255, 255, 255, 0.9)",
  fontSize: "14px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  whiteSpace: "normal" as const,
  lineHeight: "1.2",
  verticalAlign: "middle",
  textAlign: "center" as const,
};

const tableCellStyle = {
  padding: "16px",
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: "14px",
  verticalAlign: "middle",
  textAlign: "center" as const,
};

// Status display component
const StatusDisplay: React.FC<{ challenge: any }> = ({ challenge }) => {
  const now = Math.floor(Date.now() / 1000);
  const submissionDeadline = challenge.submissionDeadline.toNumber();
  const answerRevealDeadline = challenge.answerRevealDeadline.toNumber();
  const claimDeadline = challenge.claimDeadline.toNumber();

  if (now < submissionDeadline) {
    return <span style={{ color: '#4CAF50' }}>Accepting Answers</span>;
  } else if (now < answerRevealDeadline) {
    return <span style={{ color: '#FFC107' }}>Waiting for Reveal</span>;
  } else if (now < claimDeadline) {
    return <span style={{ color: '#2196F3' }}>Prize Collection</span>;
  } else {
    return <span style={{ color: '#9E9E9E' }}>Finished</span>;
  }
};

// Action button component
const ActionButton: React.FC<{ challenge: any }> = ({ challenge }) => {
  const now = Math.floor(Date.now() / 1000);
  const navigate = useNavigate();
  const programContext = useProgram();
  const wallet = programContext?.provider?.wallet;

  const handleClaim = async () => {
    if (!wallet) {
      alert("Wallet not connected");
      return;
    }

    const userPublicKey = wallet.publicKey.toBase58();

    try {
      // Derive the challenge PDA
      const [challengePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("challenge"), new BN(challenge.id).toArrayLike(Buffer, "le", 8)],
        programContext?.program.programId
      );

      console.log("Derived Challenge PDA:", challengePda.toBase58());

      // Check if the user is the setter
      if (challenge.setter.toBase58() === userPublicKey) {
        try {
          // Call setter_claim function
          await programContext?.program.methods
            .setterClaim()
            .accounts({
              challengeAccount: challengePda,
              setter: wallet.publicKey,
            })
            .rpc();
          alert("Setter claim successful!");
        } catch (error) {
          console.error("Error in setter claim:", error);
          alert("Failed to claim as setter.");
        }
        return;
      }

      // Derive the submission PDA
      const [submissionPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("submission"), challengePda.toBuffer(), wallet.publicKey.toBuffer()],
        programContext?.program.programId
      );

      // Check if the user is a submitter
      let isSubmitter = false;
      try {
        const submission = await programContext?.program.account.submissionAccount.fetch(submissionPda);
        isSubmitter = submission.submitter.toBase58() === userPublicKey;
      } catch (error) {
        console.warn("No submission account found for this user:", error);
      }

      if (isSubmitter) {
        try {
          // Call submitter_claim function
          await programContext?.program.methods
            .submitterClaim()
            .accountsPartial({
              challengeAccount: challengePda,
              submissionAccount: submissionPda,
              submitter: wallet.publicKey,
            })
            .rpc();
          alert("Submitter claim successful!");
        } catch (error) {
          console.error("Error in submitter claim:", error);
          alert("Failed to claim as submitter.");
        }
      } else {
        alert("User is neither the setter nor a submitter for this challenge.");
      }
    } catch (error) {
      console.error("Error in handleClaim:", error);
      alert("An error occurred while claiming the prize.");
    }
  };

  const handleCloseChallenge = async () => {
    if (!wallet) {
      alert("Wallet not connected");
      return;
    }

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), new BN(challenge.id).toArrayLike(Buffer, "le", 8)],
      programContext?.program.programId
    );

    if (challenge.setter.toBase58() === wallet.publicKey.toBase58()) {
      try {
        await programContext?.program.methods
          .setterCloseChallenge()
          .accountsPartial({
            challengeAccount: challengePda,
            setter: wallet.publicKey,
          })
          .rpc();
        alert("Challenge closed successfully!");
      } catch (error) {
        console.error("Error closing challenge:", error);
        alert("Failed to close challenge.");
      }
    } else {
      alert("Only the challenge setter can close the challenge");
    }
  };

  if (now < challenge.submissionDeadline.toNumber()) {
    return (
      <button 
        onClick={() => navigate(`/create-submission/${challenge.id}`, { state: { challenge } })}
        style={buttonStyle}
      >
        Submit Answer
      </button>
    );
  } else if (now < challenge.answerRevealDeadline.toNumber()) {
    return (
      <button 
        onClick={() => navigate(`/submission-reveal/${challenge.id}`, { state: { challenge } })}
        style={buttonStyle}
      >
        Reveal Answer
      </button>
    );
  } else if (now < challenge.claimDeadline.toNumber()) {
    return (
      <button 
        onClick={handleClaim}
        style={buttonStyle}
      >
        Claim Prize
      </button>
    );
  } else {
    return (
      <button 
        onClick={handleCloseChallenge}
        style={buttonStyle}
      >
        Close Challenge
      </button>
    );
  }
};

const buttonStyle = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  background: "rgba(255, 255, 255, 0.1)",
  color: "white",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(255, 255, 255, 0.2)",
  },
};

export default MainPage;