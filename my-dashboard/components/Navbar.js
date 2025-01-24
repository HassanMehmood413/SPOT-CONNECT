import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaUserCircle, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const navbarVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navbarVariants}
      transition={{ duration: 0.5 }}
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200">
              FeedbackHub
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            <NavLink href="/" text="Dashboard" />
            <NavLink href="/feedback" text="Submit Feedback" />
            <NavLink href="/profile" text="Profile" />
            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200">
                <FaUserCircle className="w-6 h-6 mr-2" />
                <span>User</span>
                <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                >
                  <Link href="/settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    <FaCog className="mr-2" />
                    Settings
                  </Link>
                  <Link href="/logout" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink href="/" text="Dashboard" />
            <MobileNavLink href="/feedback" text="Submit Feedback" />
            <MobileNavLink href="/profile" text="Profile" />
            <MobileNavLink href="/settings" text="Settings" />
            <MobileNavLink href="/logout" text="Logout" />
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

const NavLink = ({ href, text }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} className={`text-sm font-medium ${
      isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
    } transition-colors duration-200`}>
      {text}
    </Link>
  );
};

const MobileNavLink = ({ href, text }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link href={href} className={`block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
    } transition-colors duration-200`}>
      {text}
    </Link>
  );
};

export default Navbar;