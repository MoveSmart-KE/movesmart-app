
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Navigation as NavigationIcon, BarChart3, Zap } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: NavigationIcon },
    { path: "/route-optimizer", label: "Route Optimizer", icon: NavigationIcon },
    { path: "/dashboard", label: "Urban Dashboard", icon: BarChart3 },
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex ${mobile ? 'flex-col space-y-4' : 'space-x-6'}`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="w-4 h-4" />
            <span className={mobile ? 'text-base' : 'text-sm font-medium'}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <NavigationIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MOVESMARTKE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <NavigationIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">MOVESMARTKE</span>
                  </div>
                  <NavLinks mobile />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
