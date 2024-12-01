import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const SidebarFilters = ({ onFilterChange }) => {
    const [dateRange, setDateRange] = useState({
        startDate: '2023-01-01',
        endDate: '2024-12-01'
    });

    const handleDateChange = (type, value) => {
        setDateRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handleApplyFilters = () => {
        onFilterChange({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
        });
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <h3 className="font-medium mb-2">Date Range</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Start Date</label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">End Date</label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={handleApplyFilters}
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            >
                Apply Filters
            </button>
        </div>
    );
};

export default SidebarFilters;