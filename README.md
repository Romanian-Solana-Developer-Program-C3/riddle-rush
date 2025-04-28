# Riddle Rush

![Riddle Rush Logo](app/public/riddle-rush.jpg)

Riddle Rush is a decentralized, high-stakes math puzzle game built on Solana, where players stake SOL to solve viral brain teasers and claim a share of the pot through a thrilling zero-knowledge commit-reveal system. Setters craft puzzles with custom deadlines, while participants submit cryptographically secure answers, reveal them post-deadline, and claim rewards if correct—all protected by a hybrid oracle/community voting mechanism to ensure fair solutions. Leveraging Solana's lightning-fast transactions and low fees, this dApp blends crypto economics, game theory, and intellectual competition to create an addictive, community-driven experience that redefines Web3 gaming.

## Project Structure

```
riddle-rush/
├── programs/           # Solana program source code
├── app/               # Web application
│   ├── src/          # Frontend source code
│   ├── public/       # Static assets
│   └── Dockerfile    # Docker configuration
├── tests/            # Program tests
├── scripts/          # Deployment and initialization scripts
└── migrations/       # Database migrations
```

## Solana Program Setup

### Prerequisites
- Rust and Cargo
- Solana CLI tools
- Anchor Framework
- Node.js and npm/yarn

### Building and Testing
1. Build the program:
```bash
anchor build
```

2. Run tests:
```bash
anchor test
```

### Deployment to Devnet
1. Configure Solana CLI for devnet:
```bash
solana config set --url devnet
```

2. Deploy the program:
```bash
anchor deploy
```

3. Initialize the contract:
```bash
npx esrun scripts/initialize.ts
```

## Web Application

The web application is containerized using Docker for easy deployment and consistency across environments.

### Running with Docker

1. Navigate to the app directory:
```bash
cd app
```

2. Build and start the containers:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:5173`

### Development Setup

For local development without Docker:

1. Install dependencies:
```bash
cd app
yarn install
```

2. Start the development server:
```bash
yarn dev
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.