import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import routing components
import "./App.css";
import Logo from "./components/Logo";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

import MainPage from "./components/main_page";
import CreateSubmission from "./components/create_submission"; // Import CreateSubmission component
import SubmissionReveal from "./components/submission_reveal"; // Import SubmissionReveal component

function App() {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;
  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      // if desired, manually define specific/custom wallets here (normally not required)
      // otherwise, the wallet-adapter will auto detect the wallets a user's browser has available
    ],
    [network],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(to bottom, #0a0529, #1a1a1a)',
            }}>
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '80px',
                background: 'rgba(10, 5, 41, 0.95)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <Logo />
                  <h1 style={{ 
                    margin: 0,
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 'bold',
                  }}>
                    Challenges
                  </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <WalletMultiButton />
                </div>
              </div>
              <div style={{ 
                marginTop: '80px',
                flex: 1,
                overflow: 'hidden',
              }}>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/create-submission" element={<CreateSubmission />} />
                  <Route path="/submission-reveal" element={<SubmissionReveal />} />
                </Routes>
              </div>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;