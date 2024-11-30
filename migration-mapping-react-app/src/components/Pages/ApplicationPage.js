import React from 'react';
import ArcGISMap from '../Map/ArcGISMap';
import TimeSliderWidget from '../TimeSlider/TimeSliderWidget';

const ApplicationPage = () => {
    return (
        <div className="h-[calc(100vh-100px)]">
            <ArcGISMap />
            <TimeSliderWidget />
        </div>
    );
};

export default ApplicationPage;