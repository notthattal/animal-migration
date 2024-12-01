// ApplicationPage.js
import React, { useState, useEffect } from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import SidebarFilters from '../Map/MapFilters';
import { Menu, X } from 'lucide-react';

const ApplicationPage = () => {
    const [locationData, setLocationData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [timeRange, setTimeRange] = useState(null);
    const [processedData, setProcessedData] = useState([]);

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

                    // Create and verify date object
                    const dateObj = new Date(year, month, day);

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

                setProcessedData(prev => {
                    const newData = [...prev, ...processed];
                    console.log(`Total processed records: ${newData.length}`);
                    return newData;
                });
            }
        };

        window.ws = ws;

        return () => {
            ws.close();
        };
    }, []);

    const handleFilterChange = (filters) => {
        console.log('Applying filters:', filters);
        setProcessedData([]); // Clear existing data
        setLocationData([]);
        setIsLoading(true);

        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);

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
        } else {
            setError('WebSocket not connected');
            setIsLoading(false);
        }
    };

    // Rest of the component remains the same...
    return (
        <div className="relative h-[calc(100vh-100px)] flex">
            <div className={`absolute top-0 left-0 h-full z-20 bg-white shadow-md border-r border-gray-300 transform transition-transform duration-300 ${
                filtersVisible ? 'translate-x-0' : '-translate-x-full'
            }`} style={{ width: '300px' }}>
                <div className="p-4 bg-green-600 text-white flex items-center justify-between">
                    <h1 className="text-lg font-semibold">Filters</h1>
                    <button className="p-1 hover:bg-green-700 rounded" onClick={() => setFiltersVisible(false)}>
                        <X size={20} />
                    </button>
                </div>
                <SidebarFilters onFilterChange={handleFilterChange} />
            </div>

            <button
                className="absolute bottom-4 right-4 z-30 bg-green-600 text-white p-2 rounded-full shadow-md hover:bg-green-700"
                onClick={() => setFiltersVisible(true)}
            >
                <Menu size={20} />
            </button>

            <div className="flex-1 overflow-hidden">
                {isLoading && (
                    <div className="absolute top-4 right-4 z-40 bg-white p-2 rounded shadow">
                        Loading data...
                    </div>
                )}
                {error && (
                    <div className="absolute top-4 right-4 z-40 bg-red-100 text-red-700 p-2 rounded shadow">
                        {error}
                    </div>
                )}
                <div className="absolute top-4 right-4 z-40 bg-white p-2 rounded shadow">
                    Records loaded: {processedData.length}
                </div>
                <ArcGISMap
                    locationData={processedData}
                    timeRange={timeRange}
                />
            </div>
        </div>
    );
};

export default ApplicationPage;