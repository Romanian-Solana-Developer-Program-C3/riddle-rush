import { useLocation } from "react-router-dom";

const SubmissionReveal: React.FC = () => {
  const location = useLocation();
  const { challenge } = location.state;

  return (
    <div>
      <h1>Submission Reveal</h1>
      <p>Challenge ID: {challenge.id}</p>
      {/* Add form or logic for revealing a submission */}
    </div>
  );
};

export default SubmissionReveal;