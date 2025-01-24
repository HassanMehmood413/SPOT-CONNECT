import React from 'react';
import NearbyFeedbacks from '../components/NearbyFeedback';
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'


const NearbyIssuesPage = () => {
    return (
        <>
        <div>
            <Navbar/>
        </div>
            <div className="container mx-auto p-4">

                <h1 className="text-2xl font-bold text-center mb-9">Nearby Reported Issues</h1>
                <NearbyFeedbacks />
            </div>
            <Footer />
        </>
    );
};

export default NearbyIssuesPage;
