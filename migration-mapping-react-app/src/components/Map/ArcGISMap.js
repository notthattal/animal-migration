import React, { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { MAP_CONFIG } from './MapConfig';

const ArcGISMap = ({ timeSliderRef }) => {
    const mapDiv = useRef(null);
    const view = useRef(null);

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

        return () => {
            if (view.current) {
                view.current.destroy();
            }
        };
    }, []);

    return (
        <div className="map-container h-full w-full">
            <div ref={mapDiv} className="h-full w-full" />
        </div>
    );
};

export default ArcGISMap;