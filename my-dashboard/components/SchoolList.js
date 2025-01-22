import { useEffect, useState } from 'react';

const SchoolList = () => {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    const fetchSchools = async () => {
      const response = await fetch('http://localhost:8000/schools');
      const data = await response.json();
      setSchools(data);
    };

    fetchSchools();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold">List of Schools</h2>
      <ul className="mt-4">
        {schools.map((school) => (
          <li key={school.id} className="border-b border-gray-200 py-2">
            <span className="font-medium">{school.name}</span> - {school.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SchoolList;