import Map from "@/components/Map";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Navigation as NavigationIcon, Clock, Zap, BrainCircuit } from "lucide-react";

interface RouteResult {
  routeName: string;
  mapboxTime: number;
  predictedTime: number;
  routeIndex: number;
}

const RouteOptimizer = () => {
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);

  const bestRoute = routeResults.length > 0 
    ? routeResults.reduce((best, current) => current.predictedTime < best.predictedTime ? current : best)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Route Optimizer</h1>
          <p className="text-lg text-gray-600">
            Find the most fuel-efficient and time-optimal routes for your journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3 space-y-9">
            <Card className="h-96">
              <CardContent className="h-full p-0">
                <Map routeResults={routeResults} setRouteResults={setRouteResults} setLoading={setLoading} />
              </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <BrainCircuit className="w-12 h-12 mx-auto text-gray-400 animate-pulse" />
                <p className="text-lg text-gray-600 mt-4">Our AI is analyzing the routes...</p>
              </div>
            )}

            {/* Initial State (Placeholder) */}
            {!loading && routeResults.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-dashed border-gray-300 bg-gray-50/50">
                  <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center text-gray-500">
                          <BrainCircuit className="w-5 h-5 mr-2" />
                          AI Recommendation
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-gray-600">
                          Enter a route to let our AI find the optimal path based on our traffic analysis.
                      </p>
                  </CardContent>
                </Card>
                <Card className="hidden md:block border-dashed border-gray-300 bg-gray-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center text-gray-500">
                            <NavigationIcon className="w-5 h-5 mr-2" />
                            Alternative Route
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            Alternative routes from Mapbox will be analyzed and displayed here.
                        </p>
                    </CardContent>
                </Card>
                <Card className="hidden md:block border-dashed border-gray-300 bg-gray-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center text-gray-500">
                            <Clock className="w-5 h-5 mr-2" />
                            Time Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600">
                            We'll show you how our prediction compares to the standard estimate.
                        </p>
                    </CardContent>
                </Card>
              </div>
            )}

            {/* Results State */}
            {routeResults.length > 0 && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routeResults.map((route) => (
                  <Card 
                    key={route.routeIndex}
                    className={`cursor-pointer transition-all ${bestRoute?.routeIndex === route.routeIndex ? "border-green-400 bg-green-50 shadow-lg" : "hover:shadow-md"}`}
                    // onClick={() => directionsControl.current?.setRouteIndex(route.routeIndex)}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center">
                        {bestRoute?.routeIndex === route.routeIndex ? (
                          <BrainCircuit className="w-5 h-5 mr-2 text-green-600" />
                        ) : (
                          <NavigationIcon className="w-5 h-5 mr-2 text-gray-500" />
                        )}
                        {route.routeName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-gray-800">{route.predictedTime} min</p>
                        <p className="text-sm text-gray-600">Standard Time: {route.mapboxTime} min</p>
                        {bestRoute?.routeIndex === route.routeIndex && (
                          <p className="text-sm font-bold text-green-600">MoveSmart AI Recommended</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>       
      </div>
    </div>
  );
};

export default RouteOptimizer;
