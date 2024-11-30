import React from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const ApplicationPage = () => {
    const [timeExtent, setTimeExtent] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCSVData = async () => {
            try {
                const response = await fetch('/data/animals.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                       
                        const processedData = results.data.slice(0, 1000).map((point, index) => ({
                        ...point,
                        id: point.ID || index + 1,
                        month: Number(point.MONTH),
                        year: Number(point.COUNT),
                        latitude: Number(point.LATITUDE),
                        longitude: Number(point.LONGITUDE)
                        }))
                        // .filter(point => 
                        // !isNaN(point.latitude) && 
                        // !isNaN(point.longitude) && 
                        // point.month && 
                        // point.year
                        // );
                        setLocationData(processedData);
                        setIsLoading(false);
                    },
                    error: (error) => {
                        setError('Error parsing CSV');
                        setIsLoading(false);
                        console.error(error);
                    }
                    });
                
          } catch (err) {
            setError('Error loading CSV');
            setIsLoading(false);
            console.error(err);
          }
        };
    
        loadCSVData();
      }, []);


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

    if (isLoading) {
        return <div>Loading data...</div>;
      }
    
      if (error) {
        return <div>Error: {error}</div>;
      }

    return (
        <div className="h-[calc(100vh-100px)]">
            <ArcGISMap 
                locationData={locationData} 
                onTimeChange={handleTimeChange} 
                
            />
   
        </div>
    );
};

export default ApplicationPage;