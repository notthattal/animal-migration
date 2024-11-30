import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';

const App = () => {
  const mapDiv = useRef(null);

  useEffect(() => {
    // Sample data from your CSV
    const locationData = [
      { id: 1, month: 10, year: 1969, latitude: -18.25455, longitude: 34.64503 },
      { id: 2, month: 10, year: 1969, latitude: -18.27515, longitude: 34.58535 },
      { id: 3, month: 10, year: 1969, latitude: -18.28297, longitude: 34.63437 },
      { id: 4, month: 10, year: 1969, latitude: -18.30073, longitude: 34.53490 },
      { id: 5, month: 10, year: 1969, latitude: -18.29150, longitude: 34.56261 },
      { id: 6, month: 10, year: 1969, latitude: -18.29931, longitude: 34.57469 }
    ].map(point => ({
      ...point,
      // Create Date object for each point (setting to first day of month for demo)
      timestamp: new Date(point.year, point.month - 1, 1)
    }));

    // Create the map
    const map = new Map({
      basemap: 'topo-vector'
    });

    // Create the view focused on Gorongosa
    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [34.58, -18.28], // Centered on your data points
      zoom: 11
    });

    // Create a graphics layer
    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

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
    const createGraphics = (data) => {
      return data.map(point => {
        return new Graphic({
          geometry: new Point({
            longitude: point.longitude,
            latitude: point.latitude
          }),
          attributes: {
            ObjectId: point.id,
            timestamp: point.timestamp.getTime()
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
    const locationGraphics = createGraphics(locationData);
    graphicsLayer.graphics.addMany(locationGraphics);

    // Create and configure TimeSlider
    const timeSlider = new TimeSlider({
      container: "timeSlider",
      view: view,
      mode: "instant",
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

    view.ui.add(timeSlider, "bottom-left");

    // Update graphics based on time
    timeSlider.watch("timeExtent", (timeExtent) => {
      graphicsLayer.graphics.removeAll();
      graphicsLayer.add(parkBoundary);

      const filteredData = locationData.filter(point =>
          point.timestamp >= timeExtent.start &&
          point.timestamp <= timeExtent.end
      );

      graphicsLayer.graphics.addMany(createGraphics(filteredData));
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <div ref={mapDiv} style={{ width: '100%', height: '100%' }} />
        <div id="timeSlider" className="absolute bottom-8 left-8 bg-white p-4 rounded-lg shadow-lg z-10" />
      </div>
  );
};

export default App;