import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Clock, User, Globe, Fuel, Route } from "lucide-react";
import axios from "axios";
import PersonalSavingsChart from "@/components/PersonalSavingsChart";
import TopRoutesChart from "@/components/TopRoutesChart";

// --- Helper Types ---
interface DailyStat {
  date: string;
  timeSaved: number;
  fuelSaved: number;
  trips: number;
}

// --- Components for each tab ---

const MyStatsTab = () => {
  const [stats, setStats] = useState<DailyStat[]>([]);

  useEffect(() => {
    const refreshStats = () => {
      const statsRaw = localStorage.getItem('movesmart_daily_stats');
      setStats(statsRaw ? JSON.parse(statsRaw) : []);
    };
    
    refreshStats();
    window.addEventListener('storage', refreshStats);
    return () => window.removeEventListener('storage', refreshStats);
  }, []);

  const aggregateStats = stats.reduce(
    (acc, s) => {
      acc.totalTimeSaved += s.timeSaved;
      acc.totalFuelSaved += s.fuelSaved;
      acc.totalTrips += s.trips;
      return acc;
    },
    { totalTimeSaved: 0, totalFuelSaved: 0, totalTrips: 0 }
  );

  const avgTimeSavedPerTrip = aggregateStats.totalTrips > 0 
    ? Math.round(aggregateStats.totalTimeSaved / aggregateStats.totalTrips) 
    : 0;

  const formattedTimeSaved = `${Math.floor(aggregateStats.totalTimeSaved / 60)}h ${Math.round(aggregateStats.totalTimeSaved % 60)}m`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="Total Time Saved"
        value={formattedTimeSaved}
        change="since you started using the app"
        icon={Clock}
        changeType="increase"
      />
      <MetricCard
        title="Estimated Fuel Saved"
        value={`${aggregateStats.totalFuelSaved.toFixed(1)} L`}
        change="by avoiding traffic"
        icon={Fuel}
        changeType="increase"
      />
      <MetricCard
        title="Avg. Time Saved Per Trip"
        value={`${avgTimeSavedPerTrip} min`}
        change={`across ${aggregateStats.totalTrips} trips`}
        icon={Route}
        changeType="increase"
      />
      <PersonalSavingsChart />
    </div>
  );
};

const CityPulseTab = () => {
  const [analytics, setAnalytics] = useState({
    aggregate_time_saved_minutes: 0,
    aggregate_fuel_saved_liters: 0,
    average_congestion_index: 0,
    total_logged_trips: 0,
    top_routes_by_saving: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://127.0.0.1:5001/urban_analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error("Failed to fetch urban analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formattedTimeSaved = `${Math.floor(analytics.aggregate_time_saved_minutes / 60)}h ${analytics.aggregate_time_saved_minutes % 60}m`;

  if (loading) {
    return <p>Loading city-wide analytics...</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Aggregate Time Saved"
          value={formattedTimeSaved}
          change={`${analytics.total_logged_trips} trips optimized`}
          icon={Globe}
          changeType="increase"
        />
        <MetricCard
          title="Aggregate Fuel Saved"
          value={`${analytics.aggregate_fuel_saved_liters.toFixed(1)} L`}
          change="across all users"
          icon={Fuel}
          changeType="increase"
        />
        <MetricCard
          title="Avg. Congestion Index"
          value={`${analytics.average_congestion_index}%`}
          change="city-wide average"
          icon={BarChart3}
          changeType="decrease"
        />
        <MetricCard
          title="Total Optimized Trips"
          value={analytics.total_logged_trips.toString()}
          change="logged in the system"
          icon={Route}
          changeType="increase"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TopRoutesChart data={analytics.top_routes_by_saving} />
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Future Insights</CardTitle>
            <CardDescription>More city-wide analytics coming soon.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("my-stats");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Your personal driving stats and real-time analytics for Kenya's urban centers.
          </p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="my-stats">
              <User className="w-4 h-4 mr-2" />
              My Stats
            </TabsTrigger>
            <TabsTrigger value="city-pulse">
              <BarChart3 className="w-4 h-4 mr-2" />
              City Pulse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="my-stats" className="mt-6">
            <MyStatsTab />
          </TabsContent>
          <TabsContent value="city-pulse" className="mt-6">
            <CityPulseTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
