import * as turf from '@turf/turf';

class DataProcessor {
  // Interpolate sparse observations
  // In DataProcessor.js or a new utility file
    static getUniqueObservationDates = (data) => {
        return [...new Set(
            data.map(point => 
                new Date(point.year, point.month - 1, point.DATE || point.day)
            )
        )].sort();
    }

    
  static interpolateObservations(observations, interpolationWindow = 365) {
    // Sort observations by date
    const sortedObs = [...observations].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
    const interpolatedData = [];

    for (let i = 0; i < sortedObs.length - 1; i++) {
      const currentObs = sortedObs[i];
      const nextObs = sortedObs[i + 1];
      const timeDiff = new Date(nextObs.fullDate) - new Date(currentObs.fullDate);

      // If time gap is significant, generate intermediate points
      if (timeDiff > interpolationWindow * 24 * 60 * 60 * 1000) {
        const interpolationSteps = Math.floor(timeDiff / (interpolationWindow * 24 * 60 * 60 * 1000));
        
        for (let j = 1; j <= interpolationSteps; j++) {
          const interpolationFactor = j / (interpolationSteps + 1);
          const interpolatedPoint = {
            ...currentObs,
            id: `${currentObs.id}-interpolated-${j}`,
            latitude: this.linearInterpolate(
              currentObs.latitude, 
              nextObs.latitude, 
              interpolationFactor
            ),
            longitude: this.linearInterpolate(
              currentObs.longitude, 
              nextObs.longitude, 
              interpolationFactor
            ),
            fullDate: new Date(
              new Date(currentObs.fullDate).getTime() + 
              interpolationFactor * timeDiff
            ),
            count: Math.round(
              this.linearInterpolate(currentObs.count, nextObs.count, interpolationFactor)
            ),
            isInterpolated: true // Add a flag to distinguish interpolated points
          };
          
          interpolatedData.push(interpolatedPoint);
        }
      }
    }

    return [...observations, ...interpolatedData];
  }

  // Linear interpolation helper
  static linearInterpolate(start, end, factor) {
    return start + (end - start) * factor;
  }

  

  // Advanced filtering with species and date range
  static filterObservations(observations, filters = {}) {
    // const { species, startDate, endDate } = filters;
    const {startDate, endDate } = filters;
    return observations.filter(obs => {
    //   const speciesMatch = !species || 
    //     species.length === 0 || 
    //     species.includes(obs.species);
      
      const startDateMatch = !startDate || new Date(obs.fullDate) >= new Date(startDate);
      const endDateMatch = !endDate || new Date(obs.fullDate) <= new Date(endDate);
      return startDateMatch && endDateMatch;
    //   return speciesMatch && startDateMatch && endDateMatch;
    });
  }

  // Generate heatmap data
  static generateHeatmapData(observations) {
    return observations.map(obs => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [obs.longitude, obs.latitude]
      },
      properties: {
        weight: obs.count || 1
      }
    }));
  }
}

export default DataProcessor;