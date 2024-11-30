import React, { useEffect, useRef } from 'react';
import TimeSlider from '@arcgis/core/widgets/TimeSlider';

const TimeSliderWidget = ({ view }) => {
    const timeSliderRef = useRef(null);

    useEffect(() => {
        if (!view) return;

        const timeSlider = new TimeSlider({
            view: view,
            container: "timeSlider",
            mode: "time-window",
            fullTimeExtent: {
                start: new Date(2024, 0, 1),
                end: new Date(2024, 11, 31)
            },
            playRate: 1000,
            stops: {
                interval: {
                    value: 1,
                    unit: "days"
                }
            }
        });

        timeSliderRef.current = timeSlider;
        view.ui.add(timeSlider, "bottom-left");

        return () => {
            if (timeSliderRef.current) {
                view.ui.remove(timeSliderRef.current);
            }
        };
    }, [view]);

    return <div id="timeSlider" className="absolute bottom-8 left-8 z-10" />;
};

export default TimeSliderWidget;