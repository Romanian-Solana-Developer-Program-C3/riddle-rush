import React, { useEffect, useState, useRef } from "react";
import { useProgram } from "../anchor/setup";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Program } from "@coral-xyz/anchor";
import { RiddleRush } from "../anchor/riddle_rush";

const GLOBAL_ID = 10; // Fixed global ID for now

const MainPage: React.FC = () => {
  const programContext = useProgram();
  const program = programContext?.program;
  const [challenges, setChallenges] = useState<any[]>([]);
  const [expandedStates, setExpandedStates] = useState<boolean[]>([]); // Track expanded state for all challenges
  const hasFetchedChallenges = useRef(false); // Track if challenges have been fetched
  const [allExpanded, setAllExpanded] = useState(false); // Track if all challenges are expanded

  // Fetch challenges during the initial setup phase
  useEffect(() => {
    const fetchChallenges = async () => {
      if (hasFetchedChallenges.current) return;

      try {
        // Use a direct connection to Solana Devnet
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

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
        setExpandedStates(new Array(fetchedChallenges.length).fill(false)); // Initialize all challenges as collapsed
        hasFetchedChallenges.current = true; // Mark challenges as fetched
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, [program]);

  // Toggle all challenges between expanded and minimized
  const toggleAll = () => {
    const newState = !allExpanded;
    setExpandedStates(new Array(challenges.length).fill(newState));
    setAllExpanded(newState);
  };

  // Render the challenges in a scrollable list
  return (
    <div style={{ padding: "20px" }}>
      <h1>Challenges</h1>
      <Menu toggleAll={toggleAll} allExpanded={allExpanded} />
      <div style={{ maxHeight: "500px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}>
        {challenges.map((challenge, index) => (
          <ChallengeItem
            key={index}
            challenge={challenge}
            isExpanded={expandedStates[index]}
            toggleExpand={() => {
              const newStates = [...expandedStates];
              newStates[index] = !newStates[index];
              setExpandedStates(newStates);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Menu component
const Menu: React.FC<{ toggleAll: () => void; allExpanded: boolean }> = ({ toggleAll, allExpanded }) => {
  return (
    <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
      <button onClick={toggleAll}>{allExpanded ? "Minimize All" : "Expand All"}</button>
    </div>
  );
};

// Challenge item component with collapsible details
const ChallengeItem: React.FC<{ challenge: any; isExpanded: boolean; toggleExpand: () => void }> = ({
  challenge,
  isExpanded,
  toggleExpand,
}) => {
  return (
    <div
      style={{
        borderBottom: "1px solid #ccc",
        marginBottom: "10px",
        paddingBottom: "10px",
        width: "400px", // Set a fixed width for the challenge container
        overflow: "hidden", // Prevent content from overflowing
      }}
    >
      <h3 onClick={toggleExpand} style={{ cursor: "pointer" }}>
        Challenge #{challenge.id.toString()} {isExpanded ? "▲" : "▼"}
      </h3>
      {isExpanded && (
        <div>
          <p><strong>Question:</strong> {challenge.question}</p>
          <p><strong>Entry Fee:</strong> {challenge.entryFee.toString()} lamports</p>
          <p><strong>Pot:</strong> {challenge.pot.toString()} lamports</p>
          <p><strong>Submission Deadline:</strong> {new Date(challenge.submissionDeadline.toNumber() * 1000).toLocaleString()}</p>
          <p><strong>Answer Reveal Deadline:</strong> {new Date(challenge.answerRevealDeadline.toNumber() * 1000).toLocaleString()}</p>
          <p><strong>Claim Deadline:</strong> {new Date(challenge.claimDeadline.toNumber() * 1000).toLocaleString()}</p>
          <ActionButton challenge={challenge} />
        </div>
      )}
    </div>
  );
};

// Action button component
const ActionButton: React.FC<{ challenge: any }> = ({ challenge }) => {
  const now = Math.floor(Date.now() / 1000);
  const navigate = useNavigate(); // Hook for navigation
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
            .accountsPartial ({
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

  if (now < challenge.submissionDeadline.toNumber()) {
    return (
      <button onClick={() => navigate(`/create-submission`, { state: { challenge } })}>
        Submit Answer
      </button>
    );
  } else if (now < challenge.answerRevealDeadline.toNumber()) {
    return (
      <button onClick={() => navigate(`/submission-reveal`, { state: { challenge } })}>
        Reveal Solution
      </button>
    );
  } else if (now < challenge.claimDeadline.toNumber()) {
    return <button onClick={handleClaim}>Claim Prize</button>;
  } else {
    return <button disabled>Challenge Closed</button>;
  }
};

export default MainPage;