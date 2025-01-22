import Layout from '../components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Welcome to the Dashboard</h1>
      <p className="mt-4 text-gray-600">This is the main dashboard page.</p>
      <p className="mt-4">
        <a href="/feedback" className="text-blue-600 hover:underline">Submit Feedback</a>
      </p>
      <p className="mt-4">
        <a href="/schools" className="text-blue-600 hover:underline">View Schools</a>
      </p>
    </Layout>
  );
};

export default Dashboard;