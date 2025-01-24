import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaWifi, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <FaWifi className="text-blue-400 text-2xl" />
              <h3 className="text-2xl font-bold text-white">FeedbackHub</h3>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering communities through feedback. Together we can improve network connectivity for everyone.
            </p>
            <div className="flex space-x-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FaGithub className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
                  <span>Services</span>
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
                  <span>Contact</span>
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-blue-400" />
                <span className="text-gray-400">Faisalabad, Pakistan</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="text-blue-400" />
                <span className="text-gray-400">+92 123 456 7890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="text-blue-400" />
                <span className="text-gray-400">support@feedbackhub.com</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
            <p className="text-gray-400">Subscribe to our newsletter for updates.</p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} FeedbackHub. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-blue-400 transition-colors duration-300">Terms of Service</a>
              <span>•</span>
              <a href="/cookies" className="hover:text-blue-400 transition-colors duration-300">Cookie Policy</a>
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <FaHeart className="text-red-500 mx-1" />
              <span>in Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;