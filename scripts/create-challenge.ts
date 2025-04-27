#!/usr/bin/env node
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import fs from 'fs';
import path from 'path';

async function main() {
    // Parse command line arguments
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Usage: create-challenge <question> [entry_fee_in_sol]');
        process.exit(1);
    }

    const question = args[0];
    const entryFeeInSol = args[1] ? parseFloat(args[1]) : 0.1; // Default to 0.1 SOL
    const entryFeeInLamports = Math.floor(entryFeeInSol * 1e9);

    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load your wallet
    const walletKeypair = Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync(path.join(process.env['HOME'] || '', '.config/solana/id.json'), 'utf-8')))
    );
    
    // Create wallet and provider
    const wallet = new Wallet(walletKeypair);
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    
    // Create program instance
    const programId = new PublicKey('3bKvaAkVaejaBLzpo6qzRMLUXbKpUUTm6G7LagPFNWEJ');
    const idl = JSON.parse(fs.readFileSync(path.join(__dirname, '../target/idl/riddle_rush_new.json'), 'utf-8'));
    const program = new Program(idl, provider);
    
    // Calculate deadlines
    const now = Math.floor(Date.now() / 1000);
    const submissionDeadline = now + 86400; // 24 hours
    const answerRevealDeadline = now + 172800; // 48 hours
    const claimDeadline = now + 259200; // 72 hours
    
    try {
        // Get the global config PDA
        const [globalConfigPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('global_config')],
            program.programId
        );

        console.log('Creating challenge with parameters:');
        console.log('Question:', question);
        console.log('Entry fee:', entryFeeInSol, 'SOL');
        console.log('Submission deadline:', new Date(submissionDeadline * 1000).toISOString());
        console.log('Answer reveal deadline:', new Date(answerRevealDeadline * 1000).toISOString());
        console.log('Claim deadline:', new Date(claimDeadline * 1000).toISOString());

        // Create challenge
        const tx = await program.methods
            .createChallenge(
                question,
                new BN(submissionDeadline),
                new BN(answerRevealDeadline),
                new BN(claimDeadline),
                new BN(entryFeeInLamports)
            )
            .accounts({
                setter: wallet.publicKey,
                globalConfig: globalConfigPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();
            
        console.log('\nChallenge created successfully!');
        console.log('Transaction signature:', tx);
        console.log('View on Solana Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 