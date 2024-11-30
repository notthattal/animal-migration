import React from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import { useState } from 'react';

const ApplicationPage = () => {
    const [timeExtent, setTimeExtent] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    // Function to handle time changes from the TimeSlider
    const handleTimeChange = async (timeRange) => {
        try {
            // // Fetch data based on the time range
            // const response = await fetch('/api/wildlife-data', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         startDate: timeRange.start,
            //         endDate: timeRange.end
            //     })
            // });

            // const data = await response.json();
            // setFilteredData(data);
            // setTimeExtent(timeRange);
            console.log("time range is set to: ", timeRange)
        } catch (error) {
            console.error('Error fetching wildlife data:', error);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)]">
            <ArcGISMap onTimeChange={handleTimeChange} />
   
        </div>
    );
};

export default ApplicationPage;