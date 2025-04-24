import { useLocation } from "react-router-dom";

const CreateSubmission: React.FC = () => {
  const location = useLocation();
  const { challenge } = location.state;

  return (
    <div>
      <h1>Create Submission</h1>
      <p>Challenge ID: {challenge.id}</p>
      {/* Add form or logic for creating a submission */}
    </div>
  );
};

export default CreateSubmission;