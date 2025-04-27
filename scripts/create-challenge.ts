import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { RiddleRush } from "../target/types/riddle_rush";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.RiddleRush as Program<RiddleRush>;

  // Get the next challenge ID from global config
  const globalConfigPda = PublicKey.findProgramAddressSync(
    [Buffer.from("global_config")],
    program.programId
  )[0];

  const globalConfig = await program.account.globalConfig.fetch(globalConfigPda);

  // Derive the challenge account PDA using the next challenge ID
  const challengeAccountPda = PublicKey.findProgramAddressSync(
    [Buffer.from("challenge"), globalConfig.nextChallengeId.toArrayLike(Buffer, "le", 8)],
    program.programId
  )[0];

  // Create the challenge with the correct parameter order
  const tx = await program.methods
    .createChallenge(
      "What is 2 + 2?", // question: string
      new anchor.BN(Date.now() / 1000 + 3600), // submission_deadline: i64
      new anchor.BN(Date.now() / 1000 + 7200), // answer_reveal_deadline: i64
      new anchor.BN(Date.now() / 1000 + 10800), // claim_deadline: i64
      new anchor.BN(1_000_000) // entry_fee: u64
    )
    .accounts({
      setter: provider.wallet.publicKey,
      global_config: globalConfigPda,
      challenge_account: challengeAccountPda,
      system_program: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Transaction signature:", tx);
  console.log("Challenge ID:", globalConfig.nextChallengeId.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 