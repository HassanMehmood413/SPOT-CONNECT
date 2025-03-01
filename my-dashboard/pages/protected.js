import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const ProtectedPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProtectedData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login'); // Redirect to login if no token
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch protected data');
        localStorage.removeItem('token'); // Clear token if unauthorized
        router.push('/login'); // Redirect to login
      }
    };

    fetchProtectedData();
  }, [router]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold">Protected Page</h1>
      {error && <p className="text-red-500">{error}</p>}
      {data ? (
        <div>
          <h2 className="text-2xl">Welcome, {data.username}</h2>
          <p>This is a protected page only accessible to authenticated users.</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </Layout>
  );
};

export default ProtectedPage;