import { useState } from 'react';

const FeedbackForm = () => {
  const [issueDescription, setIssueDescription] = useState('');
  const [userLocation, setUserLocation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:8000/users/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ issue_description: issueDescription, user_location: userLocation }),
    });

    if (response.ok) {
      alert('Feedback submitted successfully!');
      setIssueDescription('');
      setUserLocation('');
    } else {
      alert('Failed to submit feedback');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Issue Description:</label>
        <input
          type="text"
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Your Location:</label>
        <input
          type="text"
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          className="border p-2 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white p-2">
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;