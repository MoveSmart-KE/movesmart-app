
import Navigation from "@/components/Navigation";
import MetricCard from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  NavigationIcon, 
  BarChart3, 
  Zap, 
  MapIcon,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MOVESMARTKE
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              AI-Powered Traffic Optimization for Renewable Energy Goals
            </p>
            <p className="text-lg mb-10 opacity-80 max-w-3xl mx-auto">
              Minimizing fuel consumption and traffic congestion in urban Kenya through 
              intelligent route optimization and sustainable transportation planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/route-optimizer">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Start Optimizing Routes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="bg-white text-green-600 hover:bg-gray-100">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

     

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools for sustainable urban transportation management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <NavigationIcon className="w-10 h-10 text-green-600 mb-4" />
              <CardTitle className="text-xl">Route Optimizer</CardTitle>
              <CardDescription>
                Suggests eco-friendly and time-efficient routes using real-time traffic data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/route-optimizer">
                <Button className="w-full">
                  Optimize Routes
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
              <CardTitle className="text-xl">Urban Planning Dashboard</CardTitle>
              <CardDescription>
                Visual analytics for transport officials to plan road networks and manage congestion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button className="w-full">
                  View Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <NavigationIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">MOVESMARTKE</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 MOVESMARTKE. 
              Optimizing Kenya's future through intelligent transportation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;