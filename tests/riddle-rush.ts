import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RiddleRush } from "../target/types/riddle_rush";
import { BN } from "bn.js";
import { Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { assert } from "chai";
import { encrypt } from "./helpers";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { time } from "console";

describe("riddle-rush", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.riddleRush as Program<RiddleRush>;

  const setter = Keypair.generate();
  const submitter = Keypair.generate();

  let accounts: Record<string, PublicKey> = {
    setter: setter.publicKey,
    submitter: submitter.publicKey,
  };

  const fundAmount = 1e8;
  const entry_fee = new BN(1e7);

  before(async() => {
    
    let fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: setter.publicKey,
        lamports: fundAmount,
      })
    );

    let txSignature = await sendAndConfirmTransaction(
      provider.connection,
      fundTx,
      [provider.wallet.payer],
    )

    console.log(`Funded setter account with ${fundAmount / LAMPORTS_PER_SOL} SOL:`, txSignature);

    fundTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: submitter.publicKey,
        lamports: fundAmount,
      })
    );

    txSignature = await sendAndConfirmTransaction(
      provider.connection,
      fundTx,
      [provider.wallet.payer],
    )

    console.log(`Funded submitter account with ${fundAmount / LAMPORTS_PER_SOL} SOL:`, txSignature);

  })

  it("Create challenge - Happy path", async () => {
    const challenge_id = new BN(1);
    const question = "1 * (3 - 4.5)";
    const now = Math.floor(Date.now() / 1000);
    const sub_deadline = new BN(now+100);
    const ans_deadline = new BN(now +101);
    const claim_deadline = new BN(now + 102);
    

    const tx = await program.methods
    .createChallenge(challenge_id, question, sub_deadline, ans_deadline, claim_deadline, entry_fee)
    .accounts({ ...accounts})
    .signers([setter])
    .rpc();

    await provider.connection.confirmTransaction(tx, "confirmed");
    console.log("Your transaction signature", tx);

    const challengePda = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challenge_id.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    const challenge = await program.account.challengeAccount.fetch(challengePda);
    const final_setter_balance = await provider.connection.getBalance(setter.publicKey);
    const challenge_account_balance = await provider.connection.getBalance(challengePda);

    assert.equal(challenge.id.toString(), challenge_id.toString());
    assert.equal(challenge.question, question);
    assert.equal(challenge.solution, "");
    assert.equal(challenge.submissionDeadline.toString(), sub_deadline.toString());
    assert.equal(challenge.answerRevealDeadline.toString(), ans_deadline.toString());
    assert.equal(challenge.claimDeadline.toString(), claim_deadline.toString());
    assert.equal(challenge.entryFee.toString(), entry_fee.toString());
    assert.equal(challenge.setter.toString(), accounts.setter.toString());
    assert.equal(challenge.pot.toString(), entry_fee.toString());
    assert.isAbove(challenge_account_balance, entry_fee.toNumber());
    assert.isBelow(final_setter_balance, fundAmount - entry_fee.toNumber()); //also accounts for transaction fees
    });

  it("Create submission - Happy path", async () => {
    //Create a corresponding challenge account
    const challenge_id = new BN(2);
    const question = "1 * (3 - 4.5)";
    const now = Math.floor(Date.now() / 1000);

    //100 seconds to make the submission
    const sub_deadline = new BN(now + 100);
    const ans_deadline = new BN(now + 101);
    const claim_deadline = new BN(now + 102);
    

    const txCreate = await program.methods
    .createChallenge(challenge_id, question, sub_deadline, ans_deadline, claim_deadline, entry_fee)
    .accounts({ ...accounts})
    .signers([setter])
    .rpc();

    await provider.connection.confirmTransaction(txCreate, "confirmed");
    console.log("Your create transaction signature", txCreate);

    const challengePda = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challenge_id.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    const challenge = await program.account.challengeAccount.fetch(challengePda);

    accounts.challengeAccount = challengePda;

    //Encrypt the answer using a nonce
    const nonce = 111;
    const answer = "1.5";
    const encrypted_answer = encrypt(answer, nonce);
    
    const tx = await program.methods
      .createSubmission(Array.from(encrypted_answer))
      .accounts({ ...accounts})
      .signers([submitter])
      .rpc();

    await provider.connection.confirmTransaction(tx, "confirmed");
    console.log("Your transaction signature", tx);

    const submissionPda = PublicKey.findProgramAddressSync(
      [Buffer.from("submission"), challengePda.toBuffer(), submitter.publicKey.toBuffer()],
      program.programId
    )[0];

    const submission = await program.account.submissionAccount.fetch(submissionPda);

    const final_submitter_balance = await provider.connection.getBalance(submitter.publicKey);
    const challenge_account_balance = await provider.connection.getBalance(challengePda);

    assert.deepEqual(Array.from(submission.encryptedAnswer), Array.from(encrypted_answer));
    assert.equal(submission.challengeId.toString(), challenge_id.toString());
    assert.equal(submission.submitter.toString(), submitter.publicKey.toString());
    assert.equal(submission.revealed, false);
    assert.equal(submission.answerCorrect, false);
    assert.equal(submission.claimed, false);
    assert.equal(challenge.pot.toString(), challenge.entryFee.toString());
    assert.isAbove(challenge_account_balance, (entry_fee.toNumber() * 2));
    assert.isBelow(final_submitter_balance, fundAmount - entry_fee.toNumber());
  });

  it("Setter claim -- Happy path", async () => {
    //Create a corresponding challenge account
    const challenge_id = new BN(3);
    const question = "1 * (3 - 4.5)";
    const now = Math.floor(Date.now() / 1000);

    //100 seconds to make the submission
    const sub_deadline = new BN(now + 1);
    const ans_deadline = new BN(now + 101);
    const claim_deadline = new BN(now + 102);
    

    const txCreate = await program.methods
    .createChallenge(challenge_id, question, sub_deadline, ans_deadline, claim_deadline, entry_fee)
    .accounts({ ...accounts})
    .signers([setter])
    .rpc();

    await provider.connection.confirmTransaction(txCreate, "confirmed");
    console.log("Your create transaction signature", txCreate);

    const challengePda = PublicKey.findProgramAddressSync(
      [Buffer.from("challenge"), challenge_id.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

    accounts.challengeAccount = challengePda;

    // Wait for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    const initial_setter_balance = await provider.connection.getBalance(setter.publicKey);

    const tx = await program.methods
      .setterClaim()
      .accounts({ ...accounts})
      .signers([setter])
      .rpc();

    await provider.connection.confirmTransaction(tx, "confirmed");
    console.log("Your transaction signature", tx);

    const challenge = await program.account.challengeAccount.fetch(challengePda);
    const initial_challenge_pot = challenge.pot;
    //After the 10 percent cut
    const expected_challenge_pot = initial_challenge_pot.sub(initial_challenge_pot.div(new BN(10)));
    const final_setter_balance = await provider.connection.getBalance(setter.publicKey);

    assert.equal(challenge.pot.toString(), expected_challenge_pot.toString());
    assert.equal(challenge.setterCutClaimed, true);
    assert.isAbove(final_setter_balance, initial_setter_balance);
  });
});
