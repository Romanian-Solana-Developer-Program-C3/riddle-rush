import React, { useEffect, useState, useRef } from "react";
import { useProgram } from "../anchor/setup";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Buffer } from "buffer";

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
      setExpandedStates(new Array(fetchedChallenges.length).fill(false)); // Initialize all challenges as collapsed
      hasFetchedChallenges.current = true; // Mark challenges as fetched
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

  if (now < challenge.submissionDeadline.toNumber()) {
    return <button>Submit Answer</button>;
  } else if (now < challenge.answerRevealDeadline.toNumber()) {
    return <button>Reveal Solution</button>;
  } else if (now < challenge.claimDeadline.toNumber()) {
    return <button>Claim Prize</button>;
  } else {
    return <button disabled>Challenge Closed</button>;
  }
};

export default MainPage;