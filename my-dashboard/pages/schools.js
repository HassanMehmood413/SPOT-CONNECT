import Layout from '../components/Layout';
import SchoolList from '../components/SchoolList';

const Schools = () => {
  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-800">Schools Page</h1>
      <SchoolList />
    </Layout>
  );
};

export default Schools;