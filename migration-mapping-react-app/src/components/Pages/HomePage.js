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
                        className="bg-green-800 bg-opacity-80 hover:bg-opacity-100 text-white hover:bg-green-800 shadow-lg text-lg px-8 py-4 rounded-lg transition-opacity duration-300"
                        onClick={() => navigate('/animalmigration/application')}
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
                                    This mapping project was created by <strong> Ahmed Boutar</strong>, <strong>Tal Erez</strong>, <strong>Vihaan Nama</strong>, and
                                    <strong> Lennox Anderson</strong> as part of a class project at Duke University.
                                    While the project was developed during their time at the university, the rights of the application belong solely to the creators.

                                </p>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    The project focuses on predicting migration patterns of animals in Mozambique's Gorogonsa national park,
                                    leveraging decades of data and modern predictive analytics. The biggest obstacle to accurate mapping
                                    of the different data points is the lack of data. In fact, animal sightings were performed only a few times each year,
                                    making a continuous mapping and animation a difficult task.
                                </p>
                            </section>

                            {/* Research Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Research</h2>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
                                        <p className="text-gray-700">
                                            The dataset spans from 1969 to the present and includes detailed field observations
                                            digitized from maps. The predictions rely on advanced models to understand animal behavior
                                            over decades.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-green-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Modeling Techniques</h3>
                                        <p className="text-gray-700">
                                            Various machine learning techniques were explored, including GradientBoostingRegressor,
                                            LSTMs, and ensemble models. These were tuned to achieve high accuracy in migration predictions.
                                        </p>
                                    </div>

                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2">Conservation Impact</h3>
                                        <p className="text-gray-700">
                                            By analyzing migration data, the project supports conservation efforts, helping preserve
                                            Gorogonsa's biodiversity and ensuring a sustainable future for its wildlife.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="bg-white rounded-lg shadow-lg relative">
                    <img
                        src="https://lennoxanderson.com/migrationPicture.jpeg"
                        alt="Animal Migration"
                        className="h-[60vh] w-full object-cover rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;