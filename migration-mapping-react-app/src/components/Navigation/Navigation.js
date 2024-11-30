import React from 'react';

const Navigation = ({ activePage, setActivePage }) => (
    <nav className="bg-white shadow-lg p-4 mb-6">
        <div className="flex justify-center space-x-6">
            {['application', 'research', 'authors'].map((page) => (
                <button
                    key={page}
                    onClick={() => setActivePage(page)}
                    className={`px-4 py-2 rounded-lg ${
                        activePage === page
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
            ))}
        </div>
    </nav>
);

export default Navigation;