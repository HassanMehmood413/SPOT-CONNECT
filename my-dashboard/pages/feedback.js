import React from 'react';
import Layout from '../components/Layout';
import FeedbackForm from '../components/FeedbackForm';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const FeedbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* <h1 className="text-3xl font-bold mb-6">Submit Feedback</h1> */}
        <FeedbackForm />
      </div>
    </Layout>
  );
};

// Make sure to export the component as default
export default FeedbackPage; 