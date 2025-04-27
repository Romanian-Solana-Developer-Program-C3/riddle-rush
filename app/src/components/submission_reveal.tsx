import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SubmissionReveal: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const challenge = location.state?.challenge;

  if (!challenge) {
    return <div>No challenge data available</div>;
  }

  return (
    <div style={{ 
      height: "100%",
      color: "white",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}>
        <h1>Reveal Answer for Challenge #{challenge.id.toString()}</h1>
        <p>Question: {challenge.question}</p>
        <p>Answer Reveal Deadline: {new Date(challenge.answerRevealDeadline.toNumber() * 1000).toLocaleString()}</p>
        
        <div style={{ marginTop: "20px" }}>
          <p>Answer reveal form will be implemented here.</p>
        </div>

        <button 
          onClick={() => navigate('/')}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            background: "rgba(255, 255, 255, 0.1)",
            color: "white",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginTop: "20px",
          }}
        >
          Back to Challenges
        </button>
      </div>
    </div>
  );
};

export default SubmissionReveal;