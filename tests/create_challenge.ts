import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RiddleRush } from "../app/src/anchor/riddle_rush";
import { expect } from "chai";

describe("riddle-rush", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RiddleRush as Program<RiddleRush>;

  it("Creates a challenge", async () => {
    // Calculate deadlines
    const now = Math.floor(Date.now() / 1000);
    const submissionDeadline = now + 86400; // 24 hours
    const answerRevealDeadline = now + 172800; // 48 hours
    const claimDeadline = now + 259200; // 72 hours

    const [challengeAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("challenge"),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const tx = await program.methods
      .createChallenge(
        new anchor.BN(0), // First challenge ID
        "What is 2 + 2?",
        new anchor.BN(submissionDeadline),
        new anchor.BN(answerRevealDeadline),
        new anchor.BN(claimDeadline),
        new anchor.BN(100000000) // 0.1 SOL
      )
      .accounts({
        setter: provider.wallet.publicKey,
        challengeAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature:", tx);
  });
}); 