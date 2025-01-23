const FeedbackList = ({ feedbacks }) => {
    return (
      <div>
        <h2 className="text-2xl font-semibold mt-6">Feedbacks</h2>
        <ul className="mt-4 space-y-4">
          {feedbacks.map(feedback => (
            <li key={feedback.feedback_id} className="border p-4 rounded shadow">
              <h3 className="font-bold">{feedback.issue_description}</h3>
              <p>Status: {feedback.status}</p>
              <p>Location: {feedback.user_location}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default FeedbackList;