const NearbySchools = ({ schools }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mt-6">Nearby Schools</h2>
      <ul className="mt-4 space-y-4">
        {schools.map(school => (
          <li key={school.id} className="border p-4 rounded shadow">
            <h3 className="font-bold">{school.name}</h3>
            <p>Address: {school.address}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbySchools;