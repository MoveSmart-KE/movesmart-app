
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, MapIcon, Clock, Zap, AlertTriangle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Urban Planning Dashboard</h1>
          <p className="text-lg text-gray-600">
            Real-time traffic analytics and congestion management for Kenya's urban centers
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Average Speed (km/h)"
            value="18.4"
            change="+5.2%"
            icon={Clock}
            changeType="increase"
          />
          <MetricCard
            title="Congestion Index"
            value="67%"
            change="-8.1%"
            icon={BarChart3}
            changeType="decrease"
          />
          <MetricCard
            title="Active Routes"
            value="1,247"
            change="+12.3%"
            icon={MapIcon}
            changeType="increase"
          />
          <MetricCard
            title="Energy Efficiency"
            value="78%"
            change="+3.7%"
            icon={Zap}
            changeType="increase"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Traffic Hotspots */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Traffic Hotspots Analysis
                </CardTitle>
                <CardDescription>
                  Current congestion levels across major Nairobi routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <h4 className="font-semibold text-red-800">Uhuru Highway - CBD Junction</h4>
                        <p className="text-sm text-red-600">Heavy congestion detected</p>
                      </div>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Mombasa Road - Airport</h4>
                        <p className="text-sm text-yellow-600">Moderate delays expected</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-green-800">Thika Superhighway</h4>
                        <p className="text-sm text-green-600">Flowing smoothly</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-600 text-green-600">Good</Badge>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Traffic Flow Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Peak Hour Efficiency</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Off-Peak Efficiency</span>
                        <span>89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Insights */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Traffic Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 text-sm">Rush Hour Pattern</h4>
                  <p className="text-xs text-blue-600 mt-1">
                    Morning peak: 7:00-9:00 AM<br />
                    Evening peak: 5:00-7:30 PM
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 text-sm">Optimization Impact</h4>
                  <p className="text-xs text-green-600 mt-1">
                    23% reduction in average travel time for optimized routes
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 text-sm">AI Prediction</h4>
                  <p className="text-xs text-purple-600 mt-1">
                    Weather forecast suggests 15% increase in traffic volume tomorrow
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NTSA Traffic Data</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">KENHA Road Sensors</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nairobi County Systems</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mobile GPS Data</span>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">Partial</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weather Integration</span>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">Limited</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Planning Recommendations */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                AI-Powered Planning Recommendations
              </CardTitle>
              <CardDescription>
                Strategic suggestions for urban transportation improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Traffic Light Optimization</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Adjust timing at 12 intersections to reduce congestion by an estimated 18%
                  </p>
                  <Badge className="bg-green-600">High Impact</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Alternative Route Development</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Promote underutilized roads to distribute traffic more evenly
                  </p>
                  <Badge className="bg-blue-600">Medium Impact</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Public Transport Integration</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Enhance BRT connectivity to reduce private vehicle dependency
                  </p>
                  <Badge className="bg-purple-600">Long-term</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
