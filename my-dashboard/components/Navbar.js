import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <h1 className="text-xl font-bold">School Feedback Dashboard</h1>
      <div className="mt-2">
        <Link href="/" className="mr-4">Home</Link>
        <Link href="/feedback" className="mr-4">Submit Feedback</Link>
        <Link href="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;