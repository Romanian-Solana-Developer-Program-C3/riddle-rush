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
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Logo from "./components/Logo";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

import MainPage from "./components/main_page";
import CreateSubmission from "./components/create_submission";
import SubmissionReveal from "./components/submission_reveal";
import CreateChallenge from "./components/create_challenge";
import Logo from "./components/Logo";

const NavigationMenu = () => {
  const navigate = useNavigate();
  
  const menuItemStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: "14px",
    fontWeight: "500",
    letterSpacing: "0.3px",
    color: "rgba(255, 255, 255, 0.7)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    padding: "8px 16px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    ":hover": {
      background: "rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.9)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    },
  };
  
  return (
    <div style={{
      display: "flex",
      gap: "16px",
      alignItems: "center",
      marginRight: "24px",
    }}>
      <div 
        onClick={() => navigate('/')}
        style={menuItemStyle}
      >
        Challenge List
      </div>
      <div 
        onClick={() => navigate('/create-challenge')}
        style={menuItemStyle}
      >
        Create New Challenge
      </div>
      <div 
        onClick={() => navigate('/stats')}
        style={menuItemStyle}
      >
        Stats
      </div>
    </div>
  );
};

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [],
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
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <NavigationMenu />
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
                  <Route path="/create-challenge" element={<CreateChallenge />} />
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