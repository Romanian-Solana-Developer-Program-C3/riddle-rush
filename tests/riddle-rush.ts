import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RiddleRush } from "../target/types/riddle_rush";
import { BN } from "bn.js";
import { Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { assert } from "chai";

describe("riddle-rush", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.riddleRush as Program<RiddleRush>;

  const setter = Keypair.generate();

  let accounts: Record<string, PublicKey> = {
    setter: setter.publicKey,
  };

  before(async() => {
    const fundAmount = 1e8;
    const fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: setter.publicKey,
        lamports: fundAmount,
      })
    );

    const txSignature = await sendAndConfirmTransaction(
      provider.connection,
      fundTx,
      [provider.wallet.payer],
    )

    console.log("Funded setter account with 0.1 SOL:", txSignature);

    
  })

  it("Create challenge - Happy path", async () => {
    const challenge_id = new BN(1234);
    const question = "1 + 2 * (3 - 4.5)";
    const solution = "";
    const sub_deadline = new BN(Math.floor(Date.now() / 1000) + 3600);
    const ans_deadline = new BN(Math.floor(Date.now() / 1000) + 7200);
    const claim_deadline = new BN(Math.floor(Date.now() / 1000) + 86400);
    const entry_fee = new BN(1e9);

    const tx = await program.methods
    .createChallenge(challenge_id, question, solution, sub_deadline, ans_deadline, claim_deadline, entry_fee)
    .accounts({ ...accounts})
    .signers([setter])
    .rpc();

    await provider.connection.confirmTransaction(tx, "confirmed");
    console.log("Your transaction signature", tx);

    const challengePda = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), accounts.setter.toBuffer(), challenge_id.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    const challenge = await program.account.challengeAccount.fetch(challengePda);

    assert.equal(challenge.id.toString(), challenge_id.toString());
    assert.equal(challenge.question, question);
    assert.equal(challenge.solution, solution);
    assert.equal(challenge.submissionDeadline.toString(), sub_deadline.toString());
    assert.equal(challenge.answerRevealDeadline.toString(), ans_deadline.toString());
    assert.equal(challenge.claimDeadline.toString(), claim_deadline.toString());
    assert.equal(challenge.entryFee.toString(), entry_fee.toString());
    assert.equal(challenge.setter.toString(), accounts.setter.toString());
    assert.equal(challenge.pot.toString(), "0");
    //Todo: verify default submissions state
  });
});
