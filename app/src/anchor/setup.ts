import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { RiddleRush } from "./riddle_rush.ts";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

export const useProgram = () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const wallet = useAnchorWallet();

  // If the wallet is not connected, use a dummy wallet
  const dummyWallet = {
    publicKey: Keypair.generate().publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };

  const provider = new AnchorProvider(connection, wallet || dummyWallet, {});
  setProvider(provider);

  const program = new Program<RiddleRush>(IDL as RiddleRush, provider);

  return { program, provider };
}
