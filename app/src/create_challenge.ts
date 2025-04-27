import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { RiddleRush } from './anchor/riddle_rush';
import BN from 'bn.js';

async function main() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load your wallet
    const wallet = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(require('fs').readFileSync('/Users/seb/.config/solana/id.json', 'utf-8')))
    );
    
    // Create provider
    const provider = new AnchorProvider(connection, { publicKey: wallet.publicKey, signTransaction: async (tx) => {
        tx.sign(wallet);
        return tx;
    }}, { commitment: 'confirmed' });
    
    // Create program instance
    const programId = new PublicKey('Arbq6eViLrrx51rnhrdX8K6BAWuSujS6aubnW9edAYhp');
    const program = new Program(RiddleRush as any, programId, provider);
    
    // Calculate deadlines
    const now = Math.floor(Date.now() / 1000);
    const submissionDeadline = now + 86400; // 24 hours
    const answerRevealDeadline = now + 172800; // 48 hours
    const claimDeadline = now + 259200; // 72 hours
    
    try {
        // Create challenge
        const tx = await program.methods
            .createChallenge(
                "2 + 2",
                new BN(submissionDeadline),
                new BN(answerRevealDeadline),
                new BN(claimDeadline),
                new BN(100000000) // 0.1 SOL
            )
            .accounts({
                setter: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
            
        console.log('Transaction signature:', tx);
    } catch (error) {
        console.error('Error:', error);
    }
}

main(); 