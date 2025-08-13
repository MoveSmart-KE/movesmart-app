import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import axios from 'axios';

import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';

mapboxgl.workerClass = MapboxWorker;

interface MapProps {
  origin?: string;
  destination?: string;
  setRouteResults: (results: any[]) => void; // More specific type can be used
  setLoading: (loading: boolean) => void;
}

const Map = ({ origin, destination, setRouteResults, setLoading }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const directionsControl = useRef<MapboxDirections | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.8219, -1.2921],
      zoom: 12,
    });

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving-traffic',
      controls: { inputs: true, instructions: true },
      alternatives: true,
    });

    directionsControl.current = directions;
    map.current.addControl(directions, 'top-left');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    geolocate.on('geolocate', (e) => {
      const longitude = e.coords.longitude;
      const latitude = e.coords.latitude
      const position = [longitude, latitude];
      if (directionsControl.current) {
        directionsControl.current.setOrigin(position);
      }
    });

    map.current.addControl(geolocate, 'bottom-right');

    directions.on('route', async (e: any) => {
      if (!e.route || e.route.length === 0) return;
      
      setLoading(true);
      const results = [];
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
  }, [setRouteResults, setLoading]);

  useEffect(() => {
    if (!directionsControl.current) return;
    if (origin) directionsControl.current.setOrigin(origin);
    if (destination) directionsControl.current.setDestination(destination);
  }, [origin, destination]);

  return (
    <div
      ref={mapContainer}
      className="map-container"
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default Map;