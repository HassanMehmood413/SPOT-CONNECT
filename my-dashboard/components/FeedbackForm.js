import { useState } from 'react';

const FeedbackForm = () => {
  const [feedbackType, setFeedbackType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/submit_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1, // Replace with actual user ID
        school_id: 1, // Replace with actual school ID
        feedback_type: feedbackType,
        issue_description: issueDescription,
      }),
    });

    if (response.ok) {
      alert('Feedback submitted successfully!');
      setFeedbackType('');
      setIssueDescription('');
    } else {
      alert('Failed to submit feedback.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold">Submit Feedback</h2>
      <div>
        <label className="block text-gray-700">Feedback Type:</label>
        <input
          type="text"
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Issue Description:</label>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          className="border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;