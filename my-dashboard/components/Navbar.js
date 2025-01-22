import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">School Feedback</h1>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="text-white hover:text-blue-200">Dashboard</Link>
          </li>
          <li>
            <Link href="/feedback" className="text-white hover:text-blue-200">Feedback</Link>
          </li>
          <li>
            <Link href="/schools" className="text-white hover:text-blue-200">Schools</Link>
          </li>
          <li>
            <Link href="/login" className="text-white hover:text-blue-200">Login</Link>
          </li>
          <li>
            <Link href="/register" className="text-white hover:text-blue-200">Register</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;