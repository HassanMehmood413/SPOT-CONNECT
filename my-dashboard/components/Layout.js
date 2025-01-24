import { useState, useEffect } from 'react';
import Navbar from './Navbar';
// import Footer from './Footer';

export default function Layout({ children }) {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      <Navbar />
      <div className="pt-16">{children}</div>
    </div>
  );
}