import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import axios from 'axios';
import useUserId from '@/hooks/useUserId';

import MapboxWorker from 'mapbox-gl/dist/mapbox-gl-csp-worker?worker';

mapboxgl.workerClass = MapboxWorker;

// --- Helper Types ---
interface RouteResult {
  routeName: string;
  mapboxTime: number;
  predictedTime: number;
  routeIndex: number;
  predictedCongestion: number;
}

interface DailyStat {
  date: string;
  timeSaved: number;
  fuelSaved: number;
  trips: number;
}

// --- Helper Function for Local Storage ---
const updateLocalDailyStats = (timeSaved: number, fuelSaved: number) => {
  const today = new Date().toISOString().split('T')[0];
  const statsRaw = localStorage.getItem('movesmart_daily_stats');
  const stats: DailyStat[] = statsRaw ? JSON.parse(statsRaw) : [];
  const todayStats = stats.find(s => s.date === today);

  if (todayStats) {
    todayStats.timeSaved += timeSaved;
    todayStats.fuelSaved += fuelSaved;
    todayStats.trips += 1;
  } else {
    stats.push({ date: today, timeSaved, fuelSaved, trips: 1 });
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentStats = stats.filter(s => new Date(s.date) >= thirtyDaysAgo);

  localStorage.setItem('movesmart_daily_stats', JSON.stringify(recentStats));
  const totalTimeSaved = recentStats.reduce((acc, s) => acc + s.timeSaved, 0);
  localStorage.setItem('total_time_saved', totalTimeSaved.toString());
};

interface MapProps {
  origin?: string;
  destination?: string;
  routeResults: RouteResult[];
  setRouteResults: (results: RouteResult[]) => void;
  setLoading: (loading: boolean) => void;
}

const Map = ({ origin, destination, routeResults, setRouteResults, setLoading }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const directionsControl = useRef<MapboxDirections | null>(null);
  const userId = useUserId();

  useEffect(() => {
    const logTripData = async () => {
      if (!userId || routeResults.length === 0) return;
      const bestRoute = routeResults.reduce((best, current) => current.predictedTime < best.predictedTime ? current : best);
      const standardBestRoute = routeResults.reduce((best, current) => current.mapboxTime < best.mapboxTime ? current : best);
      const timeSaved = standardBestRoute.mapboxTime - bestRoute.predictedTime;
      const fuelSavedLiters = timeSaved > 0 ? (timeSaved / 60) * 1.5 : 0;

      if (timeSaved > 0) {
        updateLocalDailyStats(timeSaved, fuelSavedLiters);
      }

      const logPayload = {
        userId: userId,
        origin: directionsControl.current?.getOrigin().properties.name,
        destination: directionsControl.current?.getDestination().properties.name,
        timeSavedMinutes: timeSaved > 0 ? timeSaved : 0,
        fuelSavedLiters: fuelSavedLiters,
        aiRouteTime: bestRoute.predictedTime,
        standardRouteTime: standardBestRoute.mapboxTime,
        routeName: bestRoute.routeName, // Now this is the clean summary
        predictedCongestion: bestRoute.predictedCongestion,
        timestamp: new Date().toISOString(),
      };
      console.log("Attempting to log trip data:", logPayload); // DEBUGGING
      try {
        const response = await axios.post('http://127.0.0.1:5001/log_trip', logPayload);
        if (response.status === 200) {
          console.log("Trip data logged successfully.");
        } else {
          console.warn("Logging endpoint returned a non-200 status:", response);
        }
      } catch (error) {
        console.error("Failed to log trip data:", error);
      }
    };
    logTripData();
  }, [routeResults, userId]);

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
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
    });
    map.current.addControl(geolocate, 'bottom-right');

    directions.on('route', async (e: any) => {
      if (!e.route || e.route.length === 0) return;
      setLoading(true);
      const results: RouteResult[] = [];
      const finalDestination = directionsControl.current?.getDestination();

      for (let routeIndex = 0; routeIndex < e.route.length; routeIndex++) {
        const route = e.route[routeIndex];
        let totalPredictedDuration = 0;
        let totalCongestion = 0;
        let stepCount = 0;

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
                const { predicted_speed, predicted_congestion } = response.data;
                totalCongestion += predicted_congestion;
                stepCount++;
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
          routeName: route.legs[0].summary,
          mapboxTime: Math.round(route.duration / 60),
          predictedTime: Math.round(totalPredictedDuration),
          routeIndex: routeIndex,
          predictedCongestion: stepCount > 0 ? totalCongestion / stepCount : 0,
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
