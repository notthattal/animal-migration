import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';

// Gorongosa National Park coordinates
const center = {
    lat: -18.9298,
    lng: 34.3505
};

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const mapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: true,
    fullscreenControl: true,
    styles: [
        {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#a5b076"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "color": "#b7d0e5"
                }
            ]
        }
    ]
};

const HomePage = () => {
    const navigate = useNavigate();

    // Load Google Maps API
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyCXI-pxVlTM6dM5Fk4fpQZMZCf9ljWqG7A',
    });

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Banner Section with Map */}
            <div className="relative h-[40vh] w-full bg-slate-100">
                {/* Google Map */}
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={10}
                    options={mapOptions}
                >
                    <Marker
                        position={center}
                        icon={{
                            path: "M-20,0a20,20 0 1,0 40,0a20,20 0 1,0 -40,0",
                            fillColor: '#FF0000',
                            fillOpacity: 0.6,
                            strokeWeight: 0,
                            scale: 0.5
                        }}
                    />
                </GoogleMap>

                {/* Explore Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <button
                        className="bg-green-800 bg-opacity-70 hover:bg-opacity-100 text-white hover:bg-green-800 shadow-lg text-lg px-8 py-4 rounded-lg transition-opacity duration-300"
                        onClick={() => navigate('/application')}
                    >
                        Explore Gorongosa
                    </button>
                </div>
            </div>

            {/* Content Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* Left Panel */}
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="h-full overflow-y-auto pr-4" style={{ maxHeight: 'calc(100vh - 40vh - 3rem)' }}>
                        <div className="space-y-8">
                            {/* About Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">About</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Welcome to our research initiative in Gorongosa National Park, Mozambique.
                                    Our team is dedicated to understanding and preserving the unique ecosystems
                                    and wildlife of this remarkable park. Through collaborative efforts with
                                    local communities and international partners, we strive to make a lasting
                                    impact on conservation efforts in this biodiverse region.
                                </p>
                            </section>

                            {/* Research Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Research</h2>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Wildlife Conservation</h3>
                                        <p className="text-gray-700">
                                            Our primary focus is on elephant population studies and habitat
                                            preservation within Gorongosa National Park. Using cutting-edge technology
                                            and traditional tracking methods, we monitor migration patterns and
                                            behavior throughout the park's diverse landscapes.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-green-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Community Engagement</h3>
                                        <p className="text-gray-700">
                                            Working closely with local communities around Gorongosa, we develop
                                            sustainable conservation practices that benefit both wildlife and human
                                            populations in and around the park.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Ecosystem Analysis</h3>
                                        <p className="text-gray-700">
                                            Comprehensive studies of Gorongosa's ecosystem help us understand
                                            the delicate balance between different species and their environment
                                            within this unique African wilderness.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="bg-white rounded-lg shadow-lg relative">
                    <div className="h-[60vh] w-full bg-slate-50 flex items-center justify-center rounded-lg">
                        <img
                            src={`https://lennoxanderson.com/migrationPicture.jpeg`}
                            alt="Migration"
                            className="h-full w-auto object-contain rounded-lg"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
