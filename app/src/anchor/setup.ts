import { IdlAccounts, Program, AnchorProvider, setProvider, Idl } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { RiddleRush } from "./riddle_rush.ts";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const programId = new PublicKey("35ELX25de2z4XxDYW1wizysNjsjm2WUrfbPgvvJkDtbZ");

export const useProgram = () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const wallet = useAnchorWallet();

  if (!wallet) {
    return null
  }
  const provider = new AnchorProvider(connection, wallet, {});
  setProvider(provider);

  // Initialize the program interface with the IDL, program ID, and connection.
  // This setup allows us to interact with the on-chain program using the defined interface.
  const program = new Program<RiddleRush>(
    IDL as RiddleRush,
    provider
  );

  return { program, provider };
  // const [counterPDA] = PublicKey.findProgramAddressSync(
  //   [Buffer.from("counter")],
  //   program.programId,
  // );
}

// This is just a TypeScript type for the Counter data structure based on the IDL
// We need this so TypeScript doesn't yell at us
// export type CounterData = IdlAccounts<RiddleRush>["riddle_rush"];
