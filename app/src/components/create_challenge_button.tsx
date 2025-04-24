import React, { useState } from "react";
import { useProgram } from "../anchor/setup";
import { AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {Buffer} from "buffer";

const CreateChallengeButton: React.FC = () => {
    const programContext = useProgram();
    const program = programContext?.program;
    const [loading, setLoading] = useState(false);
    const [challengeId, setChallengeId] = useState(1); // Example challenge ID
    const [question, setQuestion] = useState("1 * (3 - 4.5)"); // Example question
    const [entryFee, setEntryFee] = useState(1000000); // Example entry fee in lamports (1 SOL = 1e9 lamports)

    const createChallenge = async () => {
        if (!program) {
            alert("Program is not available. Please connect your wallet to create a challenge.");
            return;
        }
        setLoading(true);
        try {
            const now = Math.floor(Date.now() / 1000);
            const subDeadline = new BN(now + 100); // Submission deadline in 100 seconds
            const ansDeadline = new BN(now + 200); // Answer reveal deadline in 200 seconds
            const claimDeadline = new BN(now + 300); // Claim deadline in 300 seconds
            
            const [challengePda, _] = PublicKey.findProgramAddressSync(
                [Buffer.from("challenge"), new BN(challengeId).toArrayLike(Buffer, "le", 8)],
                program.programId
            );

            console.log("Challenge PDA:", challengePda.toBase58());

            const tx = await program.methods
                .createChallenge(
                    new BN(challengeId),
                    question,
                    subDeadline,
                    ansDeadline,
                    claimDeadline,
                    new BN(entryFee)
                )
                .accounts({
                    setter: (program.provider as AnchorProvider).wallet.publicKey,
                })
                .rpc();

            console.log("Challenge created successfully. Transaction signature:", tx);
            alert("Challenge created successfully!");
        } catch (error) {
            console.error("Error creating challenge:", error);
            alert("Failed to create challenge. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h3>Create a Challenge</h3>
            <label>
                Challenge ID:
                <input
                    type="number"
                    value={challengeId}
                    onChange={(e) => setChallengeId(Number(e.target.value))}
                />
            </label>
            <br />
            <label>
                Question:
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
            </label>
            <br />
            <label>
                Entry Fee (in lamports):
                <input
                    type="number"
                    value={entryFee}
                    onChange={(e) => setEntryFee(Number(e.target.value))}
                />
            </label>
            <br />
            <button onClick={createChallenge} disabled={loading}>
                {loading ? "Creating..." : "Create Challenge"}
            </button>
        </div>
    );
};

export default CreateChallengeButton;