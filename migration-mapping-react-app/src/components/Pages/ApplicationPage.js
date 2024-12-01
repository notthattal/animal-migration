import React from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import SidebarFilters from '../Map/MapFilters';
import { Menu, Filter, MapPin, X } from 'lucide-react';

const ApplicationPage = () => {
    const [timeExtent, setTimeExtent] = useState(null);
    const [locationData, setLocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    
    const handleFilterChange = (newFilters) => {
        setAppliedFilters(newFilters);
        // TODO: Implement filter logic for map layer
        const startDate = newFilters.startDate;
        const endDate = newFilters.endDate;
        
        // Call handleTimeChange with the date range
        if (startDate && endDate) {
            handleTimeChange({ start: startDate, end: endDate });
        }
      };
      
    const toggleSidebar = () => {
        setFiltersVisible(!filtersVisible);
      };
    useEffect(() => {
        const loadCSVData = async () => {
            try {
                const response = await fetch('/data/animals.csv');
                const csvText = await response.text();
                
                

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        // results.data.slice(0, 10).map((point, index) => {
                        //     return {
                        //         ...point,
                        //         id: index + 1, // Example transformation
                        //     };
                        // });
                        const processedData = results.data.slice(5000, 12000).map((point, index) => ({
                        ...point,
                        id: point.ID || index + 1,
                        month: Number(point.MONTH),
                        year: Number(point.COUNT),
                        latitude: Number(point.LATITUDE),
                        longitude: Number(point.LONGITUDE),
                        fullDate: new Date(
                            Number(point.COUNT), // year
                            Number(point.MONTH) - 1, // month (0-indexed)
                            typeof point.DATE == 'string' ? Number(point.DATE.split('/')[1]) : Number(point.DATE),
                            typeof point.TIME == 'string' ? Number(point.TIME.split(':')[0]) : Number(point.TIME),
                            typeof point.TIME == 'string' ? Number(point.TIME.split(':')[1]) : Number(point.TIME)
                           
                        ),
                        }))// Sort data chronologically
                        .sort((a, b) => a.fullDate - b.fullDate)
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
            // console.log("time range is set to: ", timeRange)
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
        <div className="relative h-[calc(100vh-100px)] flex">
          {/* Sidebar */}
          <div
            className={`absolute top-0 left-0 h-full z-20 bg-white shadow-md border-r border-gray-300 transform transition-transform duration-300 ${
              filtersVisible ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ width: '300px' }}
          >
            <div className="p-4 bg-green-600 text-white flex items-center justify-between">
              <h1 className="text-lg font-semibold">Filters</h1>
              <button
                className="p-1 hover:bg-green-700 rounded"
                onClick={toggleSidebar}
              >
                <X size={20} />
              </button>
            </div>
            <SidebarFilters onFilterChange={handleFilterChange} />
          </div>
    
          {/* Toggle Button */}
          <button
            className="absolute bottom-4 right-4 z-30 bg-green-600 text-white p-2 rounded-full shadow-md hover:bg-green-700"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
    
          {/* Map */}
          <div className="flex-1 overflow-hidden">
            <ArcGISMap
              locationData={locationData}
              onTimeChange={handleTimeChange}
            />
          </div>
        </div>
      );
};

export default ApplicationPage;