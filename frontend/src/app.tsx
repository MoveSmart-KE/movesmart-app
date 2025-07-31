import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

// Add your Mapbox token to a .env file in the `frontend` directory
// VITE_MAPBOX_ACCESS_TOKEN='YOUR_TOKEN_HERE'
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface RouteResult {
  routeName: string;
  mapboxTime: number;
  predictedTime: number;
  routeIndex: number;
}

function App() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const directionsControl = useRef<MapboxDirections | null>(null);

  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.8219, -1.2921],
      zoom: 12,
      // This is the pro move to disable the telemetry and fix the console error
      collectResourceTiming: false,
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving-traffic',
      controls: { inputs: false, instructions: true },
      alternatives: true,
    });
    directionsControl.current = directions;
    map.current.addControl(directions, 'top-left');

    directions.on('route', async (e: any) => {
      if (!e.route || e.route.length === 0) return;
      
      setLoading(true);
      const results: RouteResult[] = [];
      const finalDestination = directionsControl.current?.getDestination();

      for (let routeIndex = 0; routeIndex < e.route.length; routeIndex++) {
        const route = e.route[routeIndex];
        let totalPredictedDuration = 0;

        for (const leg of route.legs) {
          for (let i = 0; i < leg.steps.length; i++) {
            const step = leg.steps[i];
            const isLastStep = i === leg.steps.length - 1;
            const nextStep = isLastStep ? null : leg.steps[i + 1];

            if (step.maneuver && step.maneuver.location) {
              const startCoords = step.maneuver.location.join(',');
              let endCoords;

              if (isLastStep && finalDestination && finalDestination.geometry.coordinates) {
                endCoords = finalDestination.geometry.coordinates.join(',');
              } else if (nextStep && nextStep.maneuver && nextStep.maneuver.location) {
                endCoords = nextStep.maneuver.location.join(',');
              } else {
                totalPredictedDuration += step.duration / 60;
                continue;
              }

              const payload = {
                timestamp: new Date().toISOString(),
                start_coords: startCoords,
                end_coords: endCoords,
                name: step.name || 'Unknown Segment',
                free_flow_speed: 60,
                congestion_lag_1: 0.2,
                speed_lag_1: 50,
              };

              try {
                const response = await axios.post('http://127.0.0.1:5001/predict', payload);
                const { predicted_speed } = response.data;
                const distance = step.distance / 1000;
                if (predicted_speed > 0) {
                  totalPredictedDuration += (distance / predicted_speed) * 60;
                } else {
                  totalPredictedDuration += step.duration / 60;
                }
              } catch (error) {
                console.error("Prediction API error:", error);
                totalPredictedDuration += step.duration / 60;
              }
            } else {
              totalPredictedDuration += step.duration / 60;
            }
          }
        }
        results.push({
          routeName: `Route ${routeIndex + 1} (${route.legs[0].summary})`,
          mapboxTime: Math.round(route.duration / 60),
          predictedTime: Math.round(totalPredictedDuration),
          routeIndex: routeIndex,
        });
      }
      setRouteResults(results);
      setLoading(false);
    });
  }, []);

  const handleOptimizeRoute = () => {
    if (!start || !destination || !directionsControl.current) return;
    setRouteResults([]);
    directionsControl.current.setOrigin(start);
    directionsControl.current.setDestination(destination);
  };

  const bestRoute = routeResults.length > 0 
    ? routeResults.reduce((best, current) => current.predictedTime < best.predictedTime ? current : best)
    : null;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '350px', padding: '20px', background: '#f8f9fa', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>MoveSmart AI</h1>
        <div style={{ marginBottom: '15px' }}>
          <label>Start</label>
          <input
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="e.g., University of Nairobi"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Yaya Centre"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          onClick={handleOptimizeRoute}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Optimizing...' : 'Optimize Route'}
        </button>

        {routeResults.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Route Analysis</h2>
            {routeResults.map((route) => (
              <div 
                key={route.routeIndex} 
                style={{ 
                  padding: '15px', 
                  background: bestRoute?.routeIndex === route.routeIndex ? '#d4edda' : '#e9ecef', 
                  borderRadius: '5px', 
                  marginBottom: '10px',
                  border: bestRoute?.routeIndex === route.routeIndex ? '2px solid #28a745' : 'none'
                }}
                onClick={() => directionsControl.current?.setRouteIndex(route.routeIndex)}
              >
                <p style={{ fontWeight: 'bold', color: bestRoute?.routeIndex === route.routeIndex ? '#155724' : 'black' }}>
                  {route.routeName}
                  {bestRoute?.routeIndex === route.routeIndex && ' (AI Recommended)'}
                </p>
                <p><strong>MoveSmart AI Prediction:</strong> {route.predictedTime} minutes</p>
                <p><strong>Standard Mapbox Time:</strong> {route.mapboxTime} minutes</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={mapContainer} style={{ flex: 1 }} />
    </div>
  );
}

export default App;
