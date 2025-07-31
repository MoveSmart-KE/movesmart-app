import { useEffect, useRef, useState } from 'react';
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

    directions.on('route', async (e: any) => {
      if (!e.route || e.route.length === 0) return;
      
      setLoading(true);
      const results = [];
      const finalDestination = directionsControl.current?.getDestination();
      
      for (let routeIndex = 0; routeIndex < e.route.length; routeIndex++) {
        const route = e.route[routeIndex];
        const isDrivingProfile = route.weight_name === 'auto';
        
        // For non-driving profiles, just use the standard Mapbox time.
        if (!isDrivingProfile) {
          results.push({
            routeName: `Route ${routeIndex + 1} (${route.legs[0].summary})`,
            mapboxTime: Math.round(route.duration / 60),
            status: 'not_applicable',
            routeIndex: routeIndex,
          });
          continue; // Skip to the next route
        }

        // --- AI Prediction Logic for Driving Profiles ---
        let totalPredictedDuration = 0;
        let predictionFailed = false;

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

              // --- Dynamic Feature Calculation ---
              const distanceKm = step.distance / 1000;
              const durationHours = step.duration / 3600;
              const currentSpeedKph = durationHours > 0 ? distanceKm / durationHours : 60; // Avoid division by zero
              
              // Assuming a free-flow speed of 100 kph for congestion calculation.
              // This could be made more sophisticated later.
              const freeFlowSpeed = 100; 
              const congestion = Math.max(0, 1 - (currentSpeedKph / freeFlowSpeed));

              const payload = {
                timestamp: new Date().toISOString(),
                start_coords: startCoords,
                end_coords: endCoords,
                name: step.name || 'Unknown Segment',
                free_flow_speed: freeFlowSpeed,
                congestion_lag_1: congestion,
                speed_lag_1: currentSpeedKph,
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
                predictionFailed = true;
                break;
              }
            } else {
              totalPredictedDuration += step.duration / 60;
            }
          }
          if (predictionFailed) break;
        }
        
        if (predictionFailed) {
          results.push({
            routeName: `Route ${routeIndex + 1} (${route.legs[0].summary})`,
            mapboxTime: Math.round(route.duration / 60),
            status: 'failed',
            routeIndex: routeIndex,
          });
        } else {
          results.push({
            routeName: `Route ${routeIndex + 1} (${route.legs[0].summary})`,
            mapboxTime: Math.round(route.duration / 60),
            predictedTime: Math.round(totalPredictedDuration),
            status: 'success',
            routeIndex: routeIndex,
          });
        }
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