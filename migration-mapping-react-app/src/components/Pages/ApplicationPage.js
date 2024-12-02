import React, { useState, useEffect, useMemo } from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import Papa from 'papaparse';
import SidebarFilters from '../Map/MapFilters';
import { Menu, X } from 'lucide-react';
import DataProcessor from '../Map/DataProcessor';

const ApplicationPage = () => {
    const [rawLocationData, setRawLocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({
        species: [],
        startDate: '1972-01-01',
        endDate: '2024-01-01'
    });
    const [filteredData, setFilteredData] = useState([]);
    const [timeRange, setTimeRange] = useState(null);


    
    const getSpeciesName = (dataPoint) => {
      const speciesColumns = Object.keys(dataPoint)
          .filter(key => key.startsWith('SPECIES_') && dataPoint[key] === true);
      
      return speciesColumns.length > 0 
          ? speciesColumns[0].replace('SPECIES_', '') 
          : 'Unknown';
    }

    // Helper function to convert seconds after midnight to hours, minutes, seconds
    const getTimeFromSeconds = (secondsAfterMidnight) => {
        const hours = Math.floor(secondsAfterMidnight / 3600);
        const minutes = Math.floor((secondsAfterMidnight % 3600) / 60);
        const seconds = secondsAfterMidnight % 60;
        return { hours, minutes, seconds };
    };

    // Memoized data processing
    // const processedData = useMemo(() => {
    //     if (rawLocationData.length === 0) return [];

    //     // Step 1: Interpolate observations
    //     const interpolatedData = DataProcessor.interpolateObservations(rawLocationData);

    //     // Step 2: Apply filters
    //     const filteredData = DataProcessor.filterObservations(interpolatedData, {
    //         // species: appliedFilters.species,
    //         startDate: new Date(appliedFilters.startDate),
    //         endDate: new Date(appliedFilters.endDate)
    //     });

    //     return filteredData;
    // }, [rawLocationData, appliedFilters]);
    
    
    useEffect(() => {
        const ws = new WebSocket('wss://i4zknw04kh.execute-api.us-east-1.amazonaws.com/prod');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setError(null);
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            setError('Connection lost');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Connection error');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'data') {
                console.log(`Received chunk ${data.currentChunk} of ${data.totalChunks}`);

                // Process the incoming data
                const processed = data.payload.map(record => {
                    // Log raw record data
                    console.log('Raw record:', record);

                    // Extract and verify date components
                    const year = parseInt(record.year);
                    const month = parseInt(record.month) - 1; // Convert to 0-based month
                    const day = parseInt(record.date) || 1;
                    const secondsSinceMidnight = parseInt(record.time) || 1;
                    const hours = Math.floor(secondsSinceMidnight / 3600);
                    const minutes = Math.floor((secondsSinceMidnight % 3600) / 60);
                    const seconds = secondsSinceMidnight % 60;

                    // Create and verify date object
                    const dateObj = new Date(year, month, day, hours, minutes, seconds);

                    // Log date processing
                    console.log('Date components:', {
                        year,
                        month: month + 1, // Show 1-based month in logs
                        day,
                        resultingDate: dateObj.toISOString()
                    });

                    return {
                        ...record,
                        fullDate: dateObj,
                        latitude: parseFloat(record.latitude),
                        longitude: parseFloat(record.longitude)
                    };
                });

                setFilteredData(prev => {
                    const newData = [...prev, ...processed];
                    console.log(`Total processed records: ${newData.length}`);
                    return newData;
                });
                setIsLoading(false)
            }
        };

          window.ws = ws;

          return () => {
              ws.close();
          };
      }, []);

    useEffect(() => {
        const loadCSVData = async () => {
            try {
                const response = await fetch('/data/animals.csv');
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const processedData = results.data.map((point, index) => {
                            // Convert time from seconds after midnight
                            const timeOfDay = point.TIME 
                                ? getTimeFromSeconds(Number(point.TIME)) 
                                : { hours: 0, minutes: 0, seconds: 0 };
                            
                            return {
                                ...point,
                                id: point.ID || index + 1,
                                species: getSpeciesName(point) || 'Unknown', // Add species field
                                month: Number(point.MONTH),
                                year: Number(point.COUNT),
                                latitude: Number(point.LATITUDE),
                                longitude: Number(point.LONGITUDE),
                                animal_count: Number(point.NUMBER) || 1, // Add count field
                                fullDate: new Date(
                                    Number(point.COUNT), // year
                                    Number(point.MONTH) - 1, // month (0-indexed)
                                    point.DATE ? Number(point.DATE) : 1, // day
                                    timeOfDay.hours,
                                    timeOfDay.minutes,
                                    timeOfDay.seconds
                                )
                            };
                        }).sort((a, b) => a.fullDate - b.fullDate);
                        
                        setRawLocationData(processedData);
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

    const handleFilterChange = (newFilters) => {
        setAppliedFilters(prevFilters => ({
            ...prevFilters,
            ...newFilters
        }));

        console.log('Applying filters:', newFilters);
        setFilteredData([]); // Clear existing data
        setRawLocationData([]);
        setIsLoading(true);

        const startDate = new Date(newFilters.startDate);
        const endDate = new Date(newFilters.endDate);

        console.log('Date range:', { startDate, endDate });

        const message = {
            action: 'sendmessage',
            startYear: startDate.getFullYear(),
            startMonth: startDate.getMonth() + 1,
            endYear: endDate.getFullYear(),
            endMonth: endDate.getMonth() + 1
        };

        if (window.ws?.readyState === WebSocket.OPEN) {
            window.ws.send(JSON.stringify(message));
            setTimeRange({ start: startDate, end: endDate });
            // const filteredBySpecies = newFilters.species.length > 0
            //     ? filteredData.filter(point => 
            //         appliedFilters.species.includes(point.species)
            //     )
            //     : filteredData;
            // setFilteredData(filteredBySpecies)
            // setIsLoading(false)
        } else {
            setError('WebSocket not connected');
            setIsLoading(false);
        }
    };

    const toggleSidebar = () => {
        setFiltersVisible(!filtersVisible);
    };

    if (isLoading) {
        return <div>Loading data...</div>;
    }
    
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="relative h-[calc(100vh-100px)] flex">
            {/* Sidebar implementation remains the same */}
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
                <SidebarFilters 
                    onFilterChange={handleFilterChange}
                    currentFilters={appliedFilters}
                />
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
                    locationData={filteredData}
                    timeRange={timeRange}
                    selectedSpecies={appliedFilters.species}
                />
            </div>
        </div>
    );
};

export default ApplicationPage;