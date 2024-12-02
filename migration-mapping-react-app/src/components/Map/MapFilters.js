// import React, { useState } from 'react';
// import { Filter } from 'lucide-react';
// import { ChevronDown, Search, X } from 'lucide-react';


// const SPECIES_LIST = [
//   'blueWildebeest', 'buffalo', 'bushbuck', 'bushpig', 'commonReedbuck', 
//   'duikerGrey', 'duikerRed', 'eland', 'elephant', 'hartebeest', 
//   'hippo', 'impala', 'kudu', 'nyala', 'oribi', 
//   'sable', 'warthog', 'waterbuck', 'zebra'
// ];

// const SidebarFilters = ({ onFilterChange }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedSpecies, setSelectedSpecies] = useState([]);
//   const [dateRange, setDateRange] = useState({
//         startDate: '2023-01-01',
//         endDate: '2024-12-01'
//   });
  
  
//   const handleDateChange = (type, value) => {
//         setDateRange(prev => ({
//             ...prev,
//             [type]: value
//         }));
//     };

//     const handleApplyFilters = () => {
//         onFilterChange({
//             startDate: dateRange.startDate,
//             endDate: dateRange.endDate
//         });
//     };

    

//     return (
//         <div className="p-4 space-y-6">
//             <div>
//                 <h3 className="font-medium mb-2">Date Range</h3>
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm mb-1">Start Date</label>
//                         <input
//                             type="date"
//                             value={dateRange.startDate}
//                             onChange={(e) => handleDateChange('startDate', e.target.value)}
//                             className="w-full p-2 border rounded"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm mb-1">End Date</label>
//                         <input
//                             type="date"
//                             value={dateRange.endDate}
//                             onChange={(e) => handleDateChange('endDate', e.target.value)}
//                             className="w-full p-2 border rounded"
//                         />
//                     </div>
//                 </div>
//             </div>

//             <button
//                 onClick={handleApplyFilters}
//                 className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
//             >
//                 Apply Filters
//             </button>
//         </div>
//     );
// };

// export default SidebarFilters;


import React, { useState } from 'react';
import { Filter, ChevronDown, Search, X } from 'lucide-react';

const SPECIES_LIST = [
  'blueWildebeest', 'buffalo', 'bushbuck', 'bushpig', 'commonReedbuck', 
  'duikerGrey', 'duikerRed', 'eland', 'elephant', 'hartebeest', 
  'hippo', 'impala', 'kudu', 'nyala', 'oribi', 
  'sable', 'warthog', 'waterbuck', 'zebra'
];

const SidebarFilters = ({ onFilterChange }) => {
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const [speciesSearchTerm, setSpeciesSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState([]);
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

  const toggleSpecies = (species) => {
    setSelectedSpecies(prev => 
      prev.includes(species) 
        ? prev.filter(s => s !== species)
        : [...prev, species]
    );
  };

  const clearSpeciesSelection = () => {
    setSelectedSpecies([]);
  };

  const filteredSpecies = SPECIES_LIST.filter(species => 
    species.toLowerCase().includes(speciesSearchTerm.toLowerCase())
  );

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      species: selectedSpecies
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Species Filter */}
      <div>
        <h3 className="font-medium mb-2">Species</h3>
        <div className="relative">
          <button 
            onClick={() => setIsSpeciesOpen(!isSpeciesOpen)}
            className="w-full p-2 border rounded flex justify-between items-center"
          >
            <span>
              {selectedSpecies.length === 0 
                ? 'Select Species' 
                : `${selectedSpecies.length} species selected`}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {isSpeciesOpen && (
            <div className="absolute z-10 w-full mt-1 border rounded shadow-lg bg-white">
              <div className="p-2 border-b flex items-center">
                <Search className="h-4 w-4 mr-2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search species..."
                  value={speciesSearchTerm}
                  onChange={(e) => setSpeciesSearchTerm(e.target.value)}
                  className="w-full outline-none"
                />
              </div>

              <div className="max-h-60 overflow-y-auto">
                {filteredSpecies.map(species => (
                  <div 
                    key={species}
                    className={`p-2 hover:bg-gray-100 flex items-center cursor-pointer 
                      ${selectedSpecies.includes(species) ? 'bg-blue-50' : ''}`}
                    onClick={() => toggleSpecies(species)}
                  >
                    <input 
                      type="checkbox"
                      checked={selectedSpecies.includes(species)}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <span>{species}</span>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t flex justify-between items-center">
                <button 
                  onClick={clearSpeciesSelection}
                  className="text-red-500 hover:bg-red-50 p-1 rounded"
                >
                  Clear
                </button>
                <button 
                  onClick={() => setIsSpeciesOpen(false)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {selectedSpecies.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedSpecies.map(species => (
                <span 
                  key={species} 
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                >
                  {species}
                  <X 
                    className="ml-1 h-3 w-3 cursor-pointer" 
                    onClick={() => toggleSpecies(species)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date Range Filter */}
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