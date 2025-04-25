import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { RiddleRush } from "./riddle_rush.ts";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

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
}

// This is just a TypeScript type for the Counter data structure based on the IDL
// We need this so TypeScript doesn't yell at us
// export type CounterData = IdlAccounts<RiddleRush>["riddle_rush"];
