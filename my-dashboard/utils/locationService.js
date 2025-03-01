const API_KEY = process.env.NEXT_PUBLIC_LOCATION;

export async function getUserLocation() {
    try {
        // First get the user's IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        console.log('User IP:', ip); // Log the IP address

        const locationResponse = await fetch(`https://ipinfo.io/${ip}/json?token=${API_KEY}`);
        const locationData = await locationResponse.json();
        console.log('Location Data:', locationData); 

        return {
            city: locationData.city || 'Unknown', // Use city from the response or default to 'Unknown'
            region: locationData.region || 'Unknown', // Use region from the response or default to 'Unknown'
            country: locationData.country || 'Unknown', // Use country from the response or default to 'Unknown'
            latitude: locationData.loc ? locationData.loc.split(',')[0] : null, // Extract latitude
            longitude: locationData.loc ? locationData.loc.split(',')[1] : null // Extract longitude
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null; // Return null or handle the error as needed
    }
}
