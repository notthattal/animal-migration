import React, { useEffect, useRef, useState } from 'react';
import { Menu, Filter, MapPin } from 'lucide-react';

// Sidebar Filters Component
const SidebarFilters = ({ onFilterChange }) => {
    const [selectedSpecies, setSelectedSpecies] = useState([]);
    const [dateRange, setDateRange] = useState({
      start: '1972-01-01',
      end: new Date().toISOString().split('T')[0]
    });
  
    const speciesList = [
      'Elephant', 'Lion', 'Zebra', 'Giraffe', 'Leopard', 
      'Rhinoceros', 'Buffalo', 'Cheetah'
    ];
  
    const handleSpeciesToggle = (species) => {
      setSelectedSpecies(prev => 
        prev.includes(species)
          ? prev.filter(s => s !== species)
          : [...prev, species]
      );
    };
  
    const handleApplyFilters = () => {
      onFilterChange({
        species: selectedSpecies,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
    };
  
    return (
      <div className="w-64 bg-gray-100 p-4 h-full overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="mr-2" /> Filters
        </h2>
        
        <div className="mb-4">
          <h3 className="font-medium mb-2">Species</h3>
          <div className="space-y-2">
            {speciesList.map(species => (
              <div key={species} className="flex items-center">
                <input
                  type="checkbox"
                  id={species}
                  checked={selectedSpecies.includes(species)}
                  onChange={() => handleSpeciesToggle(species)}
                  className="mr-2"
                />
                <label htmlFor={species}>{species}</label>
              </div>
            ))}
          </div>
        </div>
  
        <div className="mb-4">
          <h3 className="font-medium mb-2">Date Range</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                min="1972-01-01"
                max={dateRange.end}
                onChange={(e) => setDateRange(prev => ({
                  ...prev, 
                  start: e.target.value
                }))}
                className="w-full p-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                min={dateRange.start}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({
                  ...prev, 
                  end: e.target.value
                }))}
                className="w-full p-1 border rounded"
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

export default SidebarFilters

