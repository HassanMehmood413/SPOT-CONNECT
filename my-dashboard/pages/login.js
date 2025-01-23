import { useState } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    const response = await fetch('http://localhost:8000/admin/login', { // Adjusted endpoint for user login
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.access_token); // Store token
      alert('Logged in successfully!');
      router.push('/'); // Redirect to dashboard
    } else {
      const errorData = await response.json();
      setError(errorData.detail || 'Invalid credentials');
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2">
          Login
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    </Layout>
  );
};

export default Login;