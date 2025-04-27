import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import type { RiddleRush } from '../target/types/riddle_rush';

async function main() {
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
    const idl = JSON.parse(fs.readFileSync(path.join(__dirname, '../target/idl/riddle_rush.json'), 'utf-8'));
    const program = new Program<RiddleRush>(idl, provider);
    
    try {
        // Get the global config PDA
        const [globalConfigPda] = PublicKey.findProgramAddressSync(
            [Buffer.from('global_config')],
            program.programId
        );

        console.log('Initializing program...');
        console.log('Global Config PDA:', globalConfigPda.toBase58());

        // Initialize the program
        const tx = await (program as any).methods
            .initialize()
            .accounts({
                authority: wallet.publicKey,
                global_config: globalConfigPda,
                system_program: SystemProgram.programId,
            })
            .rpc();
            
        console.log('\nProgram initialized successfully!');
        console.log('Transaction signature:', tx);
        console.log('View on Solana Explorer:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 