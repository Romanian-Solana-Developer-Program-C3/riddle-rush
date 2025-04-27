import { Program, AnchorProvider, setProvider } from "@coral-xyz/anchor";
import IDL from "./idl.json";
import { RiddleRush } from "./riddle_rush.ts";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export const useProgram = () => {
  const connection = useMemo(() => new Connection(clusterApiUrl("devnet"), "confirmed"), []);
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      const dummyWallet = {
        publicKey: Keypair.generate().publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };
      return new AnchorProvider(connection, dummyWallet, {});
    }

    const anchorWallet = {
      publicKey: wallet.publicKey,
      signTransaction: wallet.signTransaction,
      signAllTransactions: wallet.signAllTransactions,
    };
    return new AnchorProvider(connection, anchorWallet, {});
  }, [connection, wallet]);

  const program = useMemo(() => {
    setProvider(provider);
    return new Program<RiddleRush>(IDL as RiddleRush, provider);
  }, [provider]);

  return { program, provider };
}
