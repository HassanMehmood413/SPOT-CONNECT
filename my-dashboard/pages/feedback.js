import Layout from '../components/Layout';
import FeedbackForm from '../components/FeedbackForm';

const Feedback = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Feedback Page</h1>
      <FeedbackForm />
    </Layout>
  );
};

export default Feedback;