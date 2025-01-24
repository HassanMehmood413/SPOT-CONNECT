import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
// import Dash from '../pages/dashboard';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const publicPaths = ['/login', '/register'];

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const isPublicPath = publicPaths.includes(router.pathname);

      if (!token && !isPublicPath) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router.pathname]);

  return (
    <>
      {/* <Dash /> */}
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </>
  );
}

export default MyApp;