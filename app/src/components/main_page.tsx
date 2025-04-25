import React, { useEffect, useState, useRef } from "react";
import { useProgram } from "../anchor/setup";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";

const GLOBAL_ID = 10;

const MainPage: React.FC = () => {
  const programContext = useProgram();
  const program = programContext?.program;
  const [challenges, setChallenges] = useState<any[]>([]);
  const hasFetchedChallenges = useRef(false);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!program || hasFetchedChallenges.current) return;

      const fetchedChallenges = [];
      for (let challengeId = 1; challengeId <= GLOBAL_ID; challengeId++) {
        try {
          const [challengePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("challenge"), new BN(challengeId).toArrayLike(Buffer, "le", 8)],
            program.programId
          );

          const challenge = await program.account.challengeAccount.fetch(challengePda);
          fetchedChallenges.push({ ...challenge, pda: challengePda });
        } catch (error) {
          console.error(`Error fetching challenge ${challengeId}:`, error);
        }
      }

      setChallenges(fetchedChallenges);
      hasFetchedChallenges.current = true;
    };

    fetchChallenges();
  }, [program]);

  const formatSol = (lamports: number) => {
    return (lamports / 1e9).toFixed(9);
  };

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneAbbr = new Date().toLocaleString('en-US', { timeZone: timezone, timeZoneName: 'short' }).split(' ').pop();

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
      }}>
        <div style={{
          background: "rgba(10, 5, 41, 0.95)",
          backdropFilter: "blur(10px)",
          borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            borderSpacing: "0",
          }}>
            <thead>
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
          </table>
        </div>
        <div style={{
          flex: 1,
          overflowY: "auto",
        }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            borderSpacing: "0",
          }}>
            <tbody>
              {challenges.map((challenge, index) => (
                <tr 
                  key={index}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                    transition: "background 0.2s ease",
                    ":hover": {
                      background: "rgba(255, 255, 255, 0.05)"
                    }
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

    const [challengePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), new BN(challenge.id).toArrayLike(Buffer, "le", 8)],
      programContext?.program.programId
    );
    const [submissionPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("submission"), challengePda.toBuffer(), wallet.publicKey.toBuffer()],
      programContext?.program.programId
    );
    const submission = await programContext?.program.account.submissionAccount.fetch(submissionPda);
    const isSubmitter = submission.submitter.toBase58() === userPublicKey;

    if (challenge.setter.toBase58() === userPublicKey) {
      try {
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
    } else if (isSubmitter) {
      try {
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
      alert("User not part of challenge");
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
          .accounts({
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
        onClick={() => navigate(`/create-submission`, { state: { challenge } })}
        style={buttonStyle}
      >
        Submit Answer
      </button>
    );
  } else if (now < challenge.answerRevealDeadline.toNumber()) {
    return (
      <button 
        onClick={() => navigate(`/submission-reveal`, { state: { challenge } })}
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