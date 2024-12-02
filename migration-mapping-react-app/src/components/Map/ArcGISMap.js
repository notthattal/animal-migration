// export default ArcGISMap;
import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import { MAP_CONFIG } from './MapConfig';
import DataProcessor from './DataProcessor';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import './Map.css'

const ArcGISMap = ({ locationData, timeRange, selectedSpecies }) => {
    const mapDiv = useRef(null);
    const view = useRef(null);
    const graphicsLayerRef = useRef(null);
    const animationRef = useRef(null); // Ref to handle animation control
    const isPlayingRef = useRef(false);
    const currentIndexRef = useRef(0);
    const [customStops, setCustomStops] = useState([]);
    const [animatedData, setAnimatedData] = useState([]);


    console.log('selectedSpecies: ', selectedSpecies)
    
    const SPECIES_COLORS = {
        'blueWildebeest': '#0E4D92',    // Deep blue
        'buffalo': '#B22222',           // Firebrick red
        'bushbuck': '#228B22',          // Forest green
        'bushpig': '#FF6347',           // Tomato orange
        'commonReedbuck': '#8A2BE2',    // Blue violet
        'duikerGrey': '#4A4A4A',        // Dark charcoal grey
        'duikerRed': '#FF4500',         // Orange red
        'eland': '#00CED1',             // Dark turquoise
        'elephant': '#4B0082',          // Indigo
        'hartebeest': '#DAA520',        // Goldenrod yellow
        'hippo': '#1E90FF',             // Dodger blue
        'impala': '#FF1493',            // Deep pink
        'kudu': '#2E8B57',              // Sea green
        'nyala': '#9932CC',             // Dark orchid
        'oribi': '#6495ED',             // Cornflower blue
        'sable': '#D2691E',             // Chocolate brown-orange
        'warthog': '#36454F',           // Charcoal blue-grey
        'waterbuck': '#008080',         // Teal
        'zebra': '#708090',             // Slate grey
        'default': '#FF0000'            // Bright red for unmatched species
    };
    
    const getSpeciesColor = (species) => {
      return SPECIES_COLORS[species] || SPECIES_COLORS['default'];
    }


    useEffect(() => {
        const map = new Map({
            basemap: "dark-gray"
        });

        const mapView = new MapView({
            container: mapDiv.current,
            map: map,
            center: [34.5, -19.0],
            zoom: 11
        });

        view.current = mapView;

        // Create a custom legend
        const createLegend = () => {
            // Create legend container
            const legendContainer = document.createElement('div');
            legendContainer.className = 'esri-legend esri-widget esri-widget--panel';
            legendContainer.style.padding = '10px';
            legendContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            legendContainer.style.borderRadius = '4px';
            legendContainer.style.maxWidth = '250px';

            // Legend title
            const legendTitle = document.createElement('h3');
            legendTitle.textContent = 'Species';
            legendTitle.style.marginBottom = '10px';
            legendTitle.style.borderBottom = '1px solid #ccc';
            legendContainer.appendChild(legendTitle);

            // Create legend items
            Object.entries(SPECIES_COLORS)
                .filter(([species]) => species !== 'default' && selectedSpecies.includes(species))
                .forEach(([species, color]) => {
                    const legendItem = document.createElement('div');
                    legendItem.style.display = 'flex';
                    legendItem.style.alignItems = 'center';
                    legendItem.style.marginBottom = '5px';

                    // Color circle
                    const colorBox = document.createElement('div');
                    colorBox.style.width = '20px';
                    colorBox.style.height = '20px';
                    colorBox.style.backgroundColor = color;
                    colorBox.style.marginRight = '10px';
                    colorBox.style.borderRadius = '50%';

                    // Species name
                    const speciesName = document.createElement('span');
                    speciesName.textContent = species
                        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                        .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

                    legendItem.appendChild(colorBox);
                    legendItem.appendChild(speciesName);
                    legendContainer.appendChild(legendItem);
                });

            // Position the legend
            mapView.ui.add(legendContainer, 'top-right');
        };

        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        graphicsLayerRef.current = graphicsLayer;

        // Add park boundary
        const parkBoundary = new Graphic({
            geometry: {
                type: "polygon",
                rings: [
                    [
                        [34.3, -18.6],
                        [34.7, -18.6],
                        [34.7, -19.0],
                        [34.3, -19.0],
                        [34.3, -18.6],
                    ],
                ],
            },
            symbol: {
                type: "simple-fill",
                color: [76, 140, 43, 0.1],
                outline: {
                    color: [76, 140, 43],
                    width: 2,
                }
            }
        });
        graphicsLayer.add(parkBoundary);

        // Function to create graphics from location data
        const createGraphics = (data) =>
            data.map((point) => {
                return new Graphic({
                    geometry: new Point({
                        longitude: point.LONGITUDE,
                        latitude: point.LATITUDE,
                    }),
                    attributes: {
                        ObjectId: point.ID,
                    },
                    symbol: {
                        type: "simple-marker",
                        color: "#FF0000",
                        size: 8,
                        outline: {
                            color: "white",
                            width: 1,
                        },
                    },
                });
            });
        
        const uniqueObservationDates = DataProcessor.getUniqueObservationDates(locationData);
        setCustomStops(uniqueObservationDates.map(date => new Date(date)));

        // Initialize TimeSlider
        if(!timeRange) return;
        const timeSlider = new TimeSlider({
            container: "timeSlider",
            view: mapView,
            mode: "time-window",
            fullTimeExtent: {
                start: timeRange.start,
                end:  timeRange.end
            },
            timeExtent: {
                start: timeRange.start,
                end: new Date(timeRange.start.getTime() + (24 * 60 * 60 * 1000))
            },
            stops: {
                interval: {
                    value: 1,
                    unit: "days",
                },
                // dates: customStops
            },
            layout: 'wide',
            // playRate: 5000 // Adjust for animation speed
    
            
        });


        mapView.ui.empty("bottom-right"); // Clear existing widgets
        mapView.ui.add(timeSlider, {
            position: "manual",
            index: 1
        });

        const processedLocationData = locationData.map((point) => ({
            ...point,
            timestamp: new Date(point.year, point.month - 1, point.day || 1),
        }));

        // Animation control functions
        const startAnimation = () => {
            isPlayingRef.current = true;
            animate();
        };

        const stopAnimation = () => {
            isPlayingRef.current = false;
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };

        const toggleAnimation = () => {
            if (isPlayingRef.current) {
                stopAnimation();
            } else {
                startAnimation();
            }
        };

        const getSpeciesName = (dataPoint) => {
            const species = Object.keys(dataPoint['species']).filter(key => dataPoint['species'][key] === true);
            
            return species.length > 0 
                ? species[0]
                : 'Unknown';
          }

        
        // Modified animate function to handle skips
        const animate = () => {
            if (!isPlayingRef.current) return;

            const currentDate = timeSlider.timeExtent.start;
            const endDate = timeSlider.fullTimeExtent.end;

            if (currentDate < endDate) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(nextDate.getDate() + 1);

                // Find next date with data
                const nextDataPoint = processedLocationData.find(point => {
                    const pointDate = new Date(point.timestamp);
                    return pointDate > currentDate && pointDate <= endDate;
                });

                if (nextDataPoint) {
                    timeSlider.timeExtent = {
                        start: new Date(nextDataPoint.timestamp),
                        end: new Date(nextDataPoint.timestamp)
                    };
                } else {
                    timeSlider.timeExtent = {
                        start: nextDate,
                        end: nextDate
                    };
                }

                setTimeout(() => {
                    animationRef.current = requestAnimationFrame(animate);
                }, timeSlider.playRate);
            } else {
                stopAnimation();
            }
        };

        const updateGraphics = (currentDate) => {
            graphicsLayer.graphics.removeAll();
            graphicsLayer.add(parkBoundary);
        
            // Find exact matches for the current date
            const currentDateData = processedLocationData.filter(point => {
                const pointDate = new Date(point.fullDate);
                return pointDate.getFullYear() === currentDate.getFullYear() &&
                       pointDate.getMonth() === currentDate.getMonth() &&
                       pointDate.getDate() === currentDate.getDate();
            });
        
            if (currentDateData.length > 0) {
                const graphics = createGraphics(currentDateData);
                graphicsLayer.graphics.addMany(graphics);
            }
        };

        const animatePointsForDay = (dayData) => {
            // Sort points by time of day
            const sortedDayPoints = dayData.sort((a, b) => a.fullDate - b.fullDate);
            
            sortedDayPoints.forEach((point, index) => {
                setTimeout(() => {
                    const species = getSpeciesName(point);
                    if (selectedSpecies.includes(species)) {
                        const graphic = new Graphic({
                            geometry: new Point({
                                longitude: point.longitude,
                                latitude: point.latitude
                            }),
                            symbol: {
                                type: "simple-marker",
                                color: getSpeciesColor(species),
                                size: point.number * 2, // Size based on animal count
                                outline: {
                                    color: "white",
                                    width: 1
                                }
                            },
                            attributes: {
                                species: species,
                                count: point.number
                            }
                        });
    
                        graphicsLayer.add(graphic);
                        // Remove point after an hour of display
                        setTimeout(() => {
                            graphicsLayer.remove(graphic);
                        }, 1000); // 1 hour
                    }
                    

                    

                }, index * 300); // 500ms between point displays
            });
        };

        //  timeSlider.watch("timeExtent", (timeExtent) => {
        //     if (timeExtent) {
        //         updateGraphics(timeExtent.start);
                
        //     }
            
        // });

        // Call create legend after map is loaded
        mapView.when(() => {
            createLegend();
        });

        timeSlider.watch("timeExtent", (timeExtent) => {
            const currentDate = timeExtent.start;
            const dayData = locationData.filter(point => 
                isSameDay(point.fullDate, currentDate)
            );

            animatePointsForDay(dayData);
        });

        
    
    
        return () => {
            if (view.current) {
                view.current.destroy();
                view.current = null;
            }
        };

    }, [locationData]);

    const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    return (
        <div className="h-full w-full relative">
            <div ref={mapDiv} className="h-full w-full" />
            <div id="timeSlider" className="absolute bottom-8 left-8 z-10" />
        </div>
    );
};

export default ArcGISMap;