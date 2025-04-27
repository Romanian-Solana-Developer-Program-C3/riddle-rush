import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load your wallet
    const wallet = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync('/Users/seb/.config/solana/id.json', 'utf-8')))
    );
    
    // Create provider
    const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: 'confirmed' });
    
    // Create program instance
    const programId = new PublicKey('Arbq6eViLrrx51rnhrdX8K6BAWuSujS6aubnW9edAYhp');
    const idl = JSON.parse(fs.readFileSync(join(__dirname, 'src/anchor/idl.json'), 'utf-8'));
    const program = new anchor.Program(idl, programId, provider);
    
    // Calculate deadlines
    const now = Math.floor(Date.now() / 1000);
    const submissionDeadline = now + 86400; // 24 hours
    const answerRevealDeadline = now + 172800; // 48 hours
    const claimDeadline = now + 259200; // 72 hours
    
    try {
        // Create challenge
        const tx = await program.methods
            .createChallenge(
                "What is 2 + 2?",
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