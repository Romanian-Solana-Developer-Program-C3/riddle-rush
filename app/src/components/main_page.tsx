import React, { useEffect, useState, useRef } from "react";
import { useProgram } from "../anchor/setup";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";

const GLOBAL_ID = 10; // Fixed global ID for now

// Helper function to format SOL amounts
const formatSol = (lamports: number) => {
  return (lamports / 1e9).toFixed(2);
};

// Get timezone abbreviation
const timezoneAbbr = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ')[2];

// Status display component
const StatusDisplay: React.FC<{ challenge: any }> = ({ challenge }) => {
  const now = Math.floor(Date.now() / 1000);
  const submissionDeadline = challenge.submissionDeadline.toNumber();
  const answerRevealDeadline = challenge.answerRevealDeadline.toNumber();
  const claimDeadline = challenge.claimDeadline.toNumber();

  if (now < submissionDeadline) {
    return <span style={{ color: '#4CAF50' }}>Open</span>;
  } else if (now < answerRevealDeadline) {
    return <span style={{ color: '#FFC107' }}>Closed</span>;
  } else if (now < claimDeadline) {
    return <span style={{ color: '#2196F3' }}>Revealing</span>;
  } else {
    return <span style={{ color: '#9E9E9E' }}>Ended</span>;
  }
};

// Action button component
const ActionButton: React.FC<{ challenge: any }> = ({ challenge }) => {
  const navigate = useNavigate();
  const now = Math.floor(Date.now() / 1000);
  const submissionDeadline = challenge.submissionDeadline.toNumber();
  const answerRevealDeadline = challenge.answerRevealDeadline.toNumber();
  const claimDeadline = challenge.claimDeadline.toNumber();

  if (now < submissionDeadline) {
    return (
      <button
        onClick={() => navigate(`/create-submission/${challenge.id.toString()}`)}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Submit
      </button>
    );
  } else if (now < answerRevealDeadline) {
    return (
      <button
        onClick={() => navigate(`/submission-reveal/${challenge.id.toString()}`)}
        style={{
          background: '#FFC107',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Reveal
      </button>
    );
  } else {
    return null;
  }
};

// Table styles
const tableHeaderStyle = {
  padding: '16px',
  textAlign: 'left' as const,
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: '500',
  fontSize: '14px',
  borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
};

const tableCellStyle = {
  padding: '16px',
  color: 'rgba(255, 255, 255, 0.9)',
  fontSize: '14px',
};

const MainPage: React.FC = () => {
  const programContext = useProgram();
  const program = programContext?.program;
  const [challenges, setChallenges] = useState<any[]>([]);
  const hasFetchedChallenges = useRef(false);
  const navigate = useNavigate();

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

export default MainPage;