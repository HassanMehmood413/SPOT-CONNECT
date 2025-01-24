import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    // Clear user session (e.g., remove token from localStorage)
    localStorage.removeItem('token');

    // Redirect to login page
    router.push('/login');
  }, [router]);

  return null; // You can return a loading spinner or message if desired
};

export default Logout;