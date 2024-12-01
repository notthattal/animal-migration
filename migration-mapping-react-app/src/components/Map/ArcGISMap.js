// ArcGISMap.js
import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import Circle from "@arcgis/core/geometry/Circle";

const ArcGISMap = ({ locationData, timeRange }) => {
    const mapDiv = useRef(null);
    const view = useRef(null);
    const graphicsLayerRef = useRef(null);
    const timeSliderRef = useRef(null);

    // Initialize map
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

        return () => {
            if (view.current) {
                view.current.destroy();
            }
        };
    }, []);

    // Create density circles
    const createDensityCircles = (points) => {
        const gridSize = 0.01; // Approximately 1km grid
        const grid = {};

        // Group points into grid cells
        points.forEach(point => {
            const gridX = Math.floor(point.longitude / gridSize);
            const gridY = Math.floor(point.latitude / gridSize);
            const key = `${gridX},${gridY}`;

            if (!grid[key]) {
                grid[key] = {
                    points: [],
                    count: 0,
                    totalNumber: 0
                };
            }
            grid[key].points.push(point);
            grid[key].count++;
            grid[key].totalNumber += (point.number || 1);
        });

        // Create circles for each grid cell
        return Object.entries(grid).map(([key, cell]) => {
            // Calculate center of cell
            const avgLon = cell.points.reduce((sum, p) => sum + p.longitude, 0) / cell.points.length;
            const avgLat = cell.points.reduce((sum, p) => sum + p.latitude, 0) / cell.points.length;

            // Scale opacity and size based on point density
            const maxCount = 50; // Adjust this based on your data
            const opacity = Math.min(cell.count / maxCount, 0.8);
            const size = Math.min(cell.count * 100, 500); // Adjust size scaling

            return new Graphic({
                geometry: new Point({
                    longitude: avgLon,
                    latitude: avgLat
                }),
                symbol: {
                    type: "simple-marker",
                    style: "circle",
                    color: [255, 0, 0, opacity],
                    size: size,
                    outline: null
                },
                attributes: {
                    count: cell.count,
                    totalAnimals: cell.totalNumber
                },
                popupTemplate: {
                    title: "Wildlife Density",
                    content: [
                        {
                            type: "text",
                            text: `Sightings: ${cell.count}\nTotal Animals: ${cell.totalNumber}`
                        }
                    ]
                }
            });
        });
    };

    // Handle TimeSlider and data updates
    useEffect(() => {
        if (!view.current || !timeRange || !locationData.length) return;

        if (timeSliderRef.current) {
            view.current.ui.remove(timeSliderRef.current);
        }

        const timeSlider = new TimeSlider({
            container: "timeSlider",
            view: view.current,
            mode: "time-window",
            fullTimeExtent: {
                start: timeRange.start,
                end: timeRange.end
            },
            timeExtent: {
                start: timeRange.start,
                end: new Date(timeRange.start.getTime() + (24 * 60 * 60 * 1000))
            },
            stops: {
                interval: {
                    value: 1,
                    unit: "hours"
                }
            },
            playRate: 500
        });

        timeSliderRef.current = timeSlider;
        view.current.ui.add(timeSlider, "bottom-left");

        timeSlider.watch("timeExtent", (timeExtent) => {
            if (timeExtent) {
                updateVisualization(timeExtent);
            }
        });

        // Initialize with first day's data
        updateVisualization({
            start: timeRange.start,
            end: new Date(timeRange.start.getTime() + (24 * 60 * 60 * 1000))
        });

    }, [timeRange, locationData]);

    const updateVisualization = (timeExtent) => {
        if (!graphicsLayerRef.current) return;

        // Clear existing points but keep park boundary
        const graphics = graphicsLayerRef.current.graphics.toArray();
        const parkBoundary = graphics.find(g => g.geometry.type === "polygon");
        graphicsLayerRef.current.graphics.removeAll();
        if (parkBoundary) {
            graphicsLayerRef.current.add(parkBoundary);
        }

        // Filter points for current time window
        const currentPoints = locationData.filter(point => {
            const pointDate = point.fullDate.getTime();
            return pointDate >= timeExtent.start.getTime() &&
                pointDate <= timeExtent.end.getTime();
        });

        // Create and add density circles
        const densityCircles = createDensityCircles(currentPoints);
        graphicsLayerRef.current.addMany(densityCircles);
    };

    return (
        <div className="h-full w-full relative">
            <div ref={mapDiv} className="h-full w-full" />
            <div id="timeSlider" className="absolute bottom-8 left-8 z-10" />
        </div>
    );
};

export default ArcGISMap;