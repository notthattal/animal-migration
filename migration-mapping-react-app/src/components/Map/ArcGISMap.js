// import React, { useEffect, useRef } from 'react';
// import Map from '@arcgis/core/Map';
// import MapView from '@arcgis/core/views/MapView';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
// import TimeSlider from '@arcgis/core/widgets/TimeSlider';
// import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
// import Graphic from '@arcgis/core/Graphic';
// import Point from '@arcgis/core/geometry/Point';
// import { MAP_CONFIG } from './MapConfig';
// import './Map.css'

// const ArcGISMap = ({ locationData, onTimeChange = () => {} }) => {
//     const mapDiv = useRef(null);
//     const view = useRef(null);
//     const timeSliderRef = useRef(null);
//     const graphicsLayerRef = useRef(null);
//     const animationRef = useRef(null); // Ref to handle animation control
//     const isPlayingRef = useRef(false);
//     const lastValidDataRef = useRef(null);

    
//     useEffect(() => {
//         const map = new Map({
//             basemap: MAP_CONFIG.basemap,
//         });

//         const mapView = new MapView({
//             container: mapDiv.current,
//             map: map,
//             center: MAP_CONFIG.center,
//             zoom: MAP_CONFIG.zoom,
//         });

//         view.current = mapView;

//         const migrationLayer = new FeatureLayer({
//             url: process.env.REACT_APP_FEATURE_LAYER_URL,
//             outFields: ["*"],
//             timeInfo: MAP_CONFIG.timeInfo,
//         });

//         map.add(migrationLayer);

//         // Create graphics layer
//         const graphicsLayer = new GraphicsLayer();
//         map.add(graphicsLayer);
//         graphicsLayerRef.current = graphicsLayer;

//         // Add park boundary
//         const parkBoundary = new Graphic({
//             geometry: {
//                 type: "polygon",
//                 rings: [
//                     [
//                         [34.3, -18.6],
//                         [34.7, -18.6],
//                         [34.7, -19.0],
//                         [34.3, -19.0],
//                         [34.3, -18.6],
//                     ],
//                 ],
//             },
//             symbol: {
//                 type: "simple-fill",
//                 color: [76, 140, 43, 0.2],
//                 outline: {
//                     color: [76, 140, 43],
//                     width: 2,
//                 },
//             },
//         });
//         graphicsLayer.add(parkBoundary);

//         // Function to create graphics from location data
//         const createGraphics = (data) =>
//             data.map((point) => {
//                 return new Graphic({
//                     geometry: new Point({
//                         longitude: point.LONGITUDE,
//                         latitude: point.LATITUDE,
//                     }),
//                     attributes: {
//                         ObjectId: point.ID,
//                     },
//                     symbol: {
//                         type: "simple-marker",
//                         color: "#FF0000",
//                         size: 8,
//                         outline: {
//                             color: "white",
//                             width: 1,
//                         },
//                     },
//                 });
//             });

//         // Initialize TimeSlider
//         const timeSlider = new TimeSlider({
//             container: "timeSlider",
//             view: mapView,
//             mode: "instant",
//             fullTimeExtent: {
//                 start: new Date(2007, 10, 7),
//                 end: new Date(2024, 11, 31),
//             },
            
//             stops: {
//                 interval: {
//                     value: 1,
//                     unit: "days",
//                 },
//             },
//             layout: 'wide',
//             playRate: 1000 // Adjust for animation speed
    
            
//         });


//         mapView.ui.empty("bottom-right"); // Clear existing widgets
//         mapView.ui.add(timeSlider, {
//             position: "manual",
//             index: 1
//         });
//         // mapView.ui.add(timeSlider, "bottom-right");

//         const processedLocationData = locationData.map((point) => ({
//             ...point,
//             timestamp: new Date(point.year, point.month - 1, point.day || 1),
//         }));


//     //     locationData.slice(0, 10).map((point, index) => {
//     //     console.log('point: ', point); // This will log each data point
//     //     console.log('point.day: ', point.day)
//     //     return {
//     //         ...point,
//     //         id: index + 1, // Example transformation
//     //     };
//     // });


        
       

        // const updateGraphics = (currentDate) => {
        //     graphicsLayer.graphics.removeAll();
        //     graphicsLayer.add(parkBoundary);
        
        //     // Find exact matches for the current date
        //     const currentDateData = processedLocationData.filter(point => {
        //         const pointDate = new Date(point.fullDate);
        //         return pointDate.getFullYear() === currentDate.getFullYear() &&
        //                pointDate.getMonth() === currentDate.getMonth() &&
        //                pointDate.getDate() === currentDate.getDate();
        //     });
        
        //     if (currentDateData.length > 0) {
        //         const graphics = createGraphics(currentDateData);
        //         graphicsLayer.graphics.addMany(graphics);
        //     }
        // };
        

//         // timeSlider.watch("timeExtent", (timeExtent) => {
//         //     if (timeExtent) {
//         //         updateGraphics(timeExtent.start);
//         //         onTimeChange({
//         //             start: timeExtent.start,
//         //             end: timeExtent.start // Since we're using instant mode
//         //         });
//         //     }
            
//         // });

//         // Animation control functions
//         const startAnimation = () => {
//             isPlayingRef.current = true;
//             animate();
//         };

//         const stopAnimation = () => {
//             isPlayingRef.current = false;
//             if (animationRef.current) {
//                 cancelAnimationFrame(animationRef.current);
//                 animationRef.current = null;
//             }
//         };

//         const toggleAnimation = () => {
//             if (isPlayingRef.current) {
//                 stopAnimation();
//             } else {
//                 startAnimation();
//             }
//         };

//         // Animation function
//         // const animate = () => {
//         //     if (!isPlayingRef.current) return;
        
//         //     const currentDate = timeSlider.timeExtent.start;
//         //     const endDate = timeSlider.fullTimeExtent.end;
        
//         //     if (currentDate < endDate) {
//         //         const nextMonth = new Date(currentDate);
//         //         nextMonth.setMonth(nextMonth.getMonth() + 1);
                
//         //         const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//         //         const monthEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
                
//         //         timeSlider.timeExtent = {
//         //             start: monthStart,
//         //             end: monthEnd
//         //         };
                
//         //         animationRef.current = requestAnimationFrame(animate);
//         //     } else {
//         //         stopAnimation();
//         //     }
//         // };

//         // Update the animation function for daily progression
//         // const animate = () => {
//         //     if (!isPlayingRef.current) return;

//         //     const currentDate = timeSlider.timeExtent.start;
//         //     const endDate = timeSlider.fullTimeExtent.end;

//         //     if (currentDate < endDate) {
//         //         const nextDay = new Date(currentDate);
//         //         nextDay.setDate(nextDay.getDate() + 1);
                
//         //         timeSlider.timeExtent = {
//         //             start: nextDay,
//         //             end: nextDay
//         //         };
                
//         //         animationRef.current = requestAnimationFrame(animate);
//         //     } else {
//         //         stopAnimation();
//         //     }
//         // };
//         // Modified animate function to handle skips
//         const animate = () => {
//             if (!isPlayingRef.current) return;

//             const currentDate = timeSlider.timeExtent.start;
//             const endDate = timeSlider.fullTimeExtent.end;

//             if (currentDate < endDate) {
//                 const nextDate = new Date(currentDate);
//                 nextDate.setDate(nextDate.getDate() + 1);

//                 // Find next date with data
//                 const nextDataPoint = processedLocationData.find(point => {
//                     const pointDate = new Date(point.timestamp);
//                     return pointDate > currentDate && pointDate <= endDate;
//                 });

//                 if (nextDataPoint) {
//                     timeSlider.timeExtent = {
//                         start: new Date(nextDataPoint.timestamp),
//                         end: new Date(nextDataPoint.timestamp)
//                     };
//                 } else {
//                     timeSlider.timeExtent = {
//                         start: nextDate,
//                         end: nextDate
//                     };
//                 }

//                 setTimeout(() => {
//                     animationRef.current = requestAnimationFrame(animate);
//                 }, timeSlider.playRate);
//             } else {
//                 stopAnimation();
//             }
//         };

//         // timeSlider.actions.add([{
//         //     title: "Play/Pause",
//         //     id: "play-pause",
//         //     className: "esri-icon-play",
//         //     onclick: toggleAnimation
//         // }]);

//         const updateGraphics = () => {
//             if (!locationData.length) return;
            
//             graphicsLayer.graphics.removeAll();
//             graphicsLayer.add(parkBoundary);
    
//             const graphics = createGraphics(locationData);
//             graphicsLayer.graphics.addMany(graphics);
//         };
    
//         // Update graphics whenever locationData changes
//         updateGraphics();
    
//         return () => {
//             if (view.current) {
//                 view.current.destroy();
//                 view.current = null;
//             }
//         };

     

//         // return () => {
//         //     if (view.current) {
//         //         view.current.destroy();
//         //         view.current = null;
//         //     }
//         //     stopAnimation();
//         //     if (animationRef.current) {
//         //         cancelAnimationFrame(animationRef.current);
//         //     }
//         // };
//     }, [locationData]);

//     return (
//         <div className={`map-container h-full w-full relative `}>
//             <div ref={mapDiv} className="h-full w-full" />
//             {/* <div 
//                 id="timeSlider"
//                 className="time-slider-container"
//             /> */}
//         </div>
//     );
    
// };

// export default ArcGISMap;

import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import { MAP_CONFIG } from './MapConfig';
import './Map.css'

const ArcGISMap = ({ locationData, timeRange}) => {
    const mapDiv = useRef(null);
    const view = useRef(null);
    
    const graphicsLayerRef = useRef(null);
    const animationRef = useRef(null); // Ref to handle animation control
    const isPlayingRef = useRef(false);
    const currentIndexRef = useRef(0);
    console.log("timeRange: ", timeRange)

    
    useEffect(() => {
        const map = new Map({
            basemap: MAP_CONFIG.basemap,
        });

        const mapView = new MapView({
            container: mapDiv.current,
            map: map,
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom,
        });

        view.current = mapView;

        const migrationLayer = new FeatureLayer({
            url: process.env.REACT_APP_FEATURE_LAYER_URL,
            outFields: ["*"],
            timeInfo: MAP_CONFIG.timeInfo,
        });

        map.add(migrationLayer);

        // Create graphics layer
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
                color: [76, 140, 43, 0.2],
                outline: {
                    color: [76, 140, 43],
                    width: 2,
                },
            },
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

        // Initialize TimeSlider
        const timeSlider = new TimeSlider({
            container: "timeSlider",
            view: mapView,
            mode: "instant",
            fullTimeExtent: {
                start: timeRange ? timeRange.start : new Date(1970, 10, 7),
                end: timeRange ? timeRange.end : new Date(2024, 11, 7)
            },
            
            stops: {
                interval: {
                    value: 1,
                    unit: "days",
                },
            },
            layout: 'wide',
            playRate: 1000 // Adjust for animation speed
    
            
        });


        mapView.ui.empty("bottom-right"); // Clear existing widgets
        mapView.ui.add(timeSlider, {
            position: "manual",
            index: 1
        });
        // mapView.ui.add(timeSlider, "bottom-right");

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

         timeSlider.watch("timeExtent", (timeExtent) => {
            if (timeExtent) {
                updateGraphics(timeExtent.start);
                
            }
            
        });
    
    
        return () => {
            if (view.current) {
                view.current.destroy();
                view.current = null;
            }
        };

    }, [locationData]);

    return (
        <div className={`map-container h-full w-full relative `}>
            <div ref={mapDiv} className="h-full w-full" />
            {/* <div 
                id="timeSlider"
                className="time-slider-container"
            /> */}
        </div>
    );
    
};

export default ArcGISMap;
