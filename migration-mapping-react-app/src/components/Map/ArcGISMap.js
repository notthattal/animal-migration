import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import { MAP_CONFIG } from './MapConfig';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

const ArcGISMap = ({ locationData, onTimeChange = () => {}  }) => {
    const mapDiv = useRef(null);
    const view = useRef(null);
    const timeSliderContainer = useRef(null);
    const timeSliderRef = useRef(null);
    const graphicsLayerRef = useRef(null);

    // Creating and loading the map component
    useEffect(() => {
        const map = new Map({
            basemap: MAP_CONFIG.basemap
        });

        const mapView = new MapView({
            container: mapDiv.current,
            map: map,
            center: MAP_CONFIG.center,
            zoom: MAP_CONFIG.zoom
        });

        view.current = mapView;

        const migrationLayer = new FeatureLayer({
            url: process.env.REACT_APP_FEATURE_LAYER_URL,
            outFields: ["*"],
            timeInfo: MAP_CONFIG.timeInfo
        });

        map.add(migrationLayer);

        // Create a graphics layer
        const graphicsLayer = new GraphicsLayer();
        map.add(graphicsLayer);
        graphicsLayerRef.current = graphicsLayer;


        // Prepare location data with timestamps
        const processedLocationData = locationData.map(point => ({
            ...point,
            timestamp: new Date(point.year, point.month - 1, 1)
        }));

        

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
                [34.3, -18.6]
            ]
            ]
        },
        symbol: {
            type: "simple-fill",
            color: [76, 140, 43, 0.2],
            outline: {
            color: [76, 140, 43],
            width: 2
            }
        }
        });
        graphicsLayer.add(parkBoundary);

        // Create point graphics from location data
        // Create point graphics from location data
        const createGraphics = (data) => {
            return data.map(point => {
            return new Graphic({
                geometry: new Point({
                longitude: point.LONGITUDE,
                latitude: point.LATITUDE
                }),
                attributes: {
                ObjectId: point.ID,
                // timestamp: point.timestamp.getTime()
                },
                symbol: {
                type: "simple-marker",
                color: "#FF0000",
                size: 8,
                outline: {
                    color: "white",
                    width: 1
                }
                },
                popupTemplate: {
                title: "Location Point",
                content: [
                    {
                    type: "fields",
                    fieldInfos: [
                        {
                        fieldName: "ObjectId",
                        label: "ID",
                        visible: true
                        },
                        {
                        fieldName: "timestamp",
                        label: "Date",
                        visible: true,
                        format: {
                            dateFormat: "short-date"
                        }
                        }
                    ]
                    }
                ]
                }
            });
            });
        };

        // Add initial graphics
        const locationGraphics = createGraphics(processedLocationData);
        graphicsLayer.graphics.addMany(locationGraphics);

        const timeSliderContainer = document.createElement('div');
        timeSliderContainer.id = 'timeSlider';
        mapDiv.current.parentNode.appendChild(timeSliderContainer);


        // Create and configure TimeSlider
        const timeSlider = new TimeSlider({
            container: timeSliderContainer,
            view: mapView,
            mode: "time-window",
            fullTimeExtent: {
              start: new Date(1969, 0, 1),  // Start of 1969
              end: new Date(1969, 11, 31)   // End of 1969
            },
            playRate: 1000,
            stops: {
              interval: {
                value: 1,
                unit: "months"
              }
            }
          });
        

        timeSliderRef.current = timeSlider;
        mapView.ui.add(timeSlider, "bottom-left");

        // Update graphics based on time
        timeSlider.watch("timeExtent", (timeExtent) => {
            graphicsLayer.graphics.removeAll();
            graphicsLayer.add(parkBoundary);

            const filteredData = locationData.filter(point =>
                point.timestamp >= timeExtent.start &&
                point.timestamp <= timeExtent.end
            );

            graphicsLayer.graphics.addMany(createGraphics(processedLocationData));

            // Call time change callback
            onTimeChange({
                start: timeExtent.start,
                end: timeExtent.end
            });
        });

        timeSliderRef.current = timeSlider;

        return () => {
            if (view.current) {
                view.current.destroy();
            }
            if (timeSlider) {
                timeSlider.destroy();
            }
        };
    }, [locationData, onTimeChange]);

    return (
        <div className="map-container h-full w-full">
            <div ref={mapDiv} className="h-full w-full" />
            {/* <div 
                ref={timeSliderContainer} 
                className="h-16 w-full bg-gray-100 p-2"
            /> */}
        </div>
    );
};

export default ArcGISMap;