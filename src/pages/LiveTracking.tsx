import { useState, useEffect, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation,
  Wifi,
  WifiOff
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Simulated center coordinates (Bangalore, India)
const CITY_CENTER = { lat: 12.9716, lng: 77.5946 };

const LiveTracking = () => {
  const [truckLocation, setTruckLocation] = useState({
    lat: CITY_CENTER.lat + 0.008,
    lng: CITY_CENTER.lng - 0.005
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Simulate truck movement every 5 seconds
  const updateTruckPosition = useCallback(() => {
    setTruckLocation(prev => {
      // Small random movement to simulate GPS updates
      const deltaLat = (Math.random() - 0.5) * 0.002;
      const deltaLng = (Math.random() - 0.3) * 0.002; // Slight bias towards center
      
      return {
        lat: Math.max(CITY_CENTER.lat - 0.02, Math.min(CITY_CENTER.lat + 0.02, prev.lat + deltaLat)),
        lng: Math.max(CITY_CENTER.lng - 0.02, Math.min(CITY_CENTER.lng + 0.02, prev.lng + deltaLng))
      };
    });
    setLastUpdated(new Date());
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTruckPosition, 5000);
    return () => clearInterval(interval);
  }, [updateTruckPosition]);

  // Convert lat/lng to map position (percentage)
  const getMapPosition = () => {
    const latRange = 0.04; // Total lat range shown on map
    const lngRange = 0.04; // Total lng range shown on map
    
    const x = ((truckLocation.lng - (CITY_CENTER.lng - lngRange/2)) / lngRange) * 100;
    const y = ((CITY_CENTER.lat + latRange/2 - truckLocation.lat) / latRange) * 100;
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  const mapPos = getMapPosition();

  return (
    <MainLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Live Truck Tracking</h1>
            <p className="text-sm text-muted-foreground">Track your waste collection truck in real-time</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "flex items-center gap-1.5",
              isConnected ? "border-success text-success" : "border-destructive text-destructive"
            )}
          >
            {isConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Map Container */}
        <Card className="overflow-hidden">
          <div 
            className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-blue-50 to-blue-100"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          >
            {/* City area labels */}
            <div className="absolute top-4 left-4 text-xs font-medium text-blue-600/60 bg-white/70 px-2 py-1 rounded">
              Ward 3
            </div>
            <div className="absolute top-4 right-4 text-xs font-medium text-blue-600/60 bg-white/70 px-2 py-1 rounded">
              Ward 4
            </div>
            <div className="absolute bottom-16 left-4 text-xs font-medium text-blue-600/60 bg-white/70 px-2 py-1 rounded">
              Ward 5
            </div>
            <div className="absolute bottom-16 right-4 text-xs font-medium text-blue-600/60 bg-white/70 px-2 py-1 rounded">
              Ward 6
            </div>

            {/* Simulated roads */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-300/50" />
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-gray-300/50" />
            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-gray-200/50" />
            <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-gray-200/50" />
            <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gray-200/50" />
            <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gray-200/50" />

            {/* Your location marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
                <div className="absolute -inset-2 rounded-full bg-blue-400/20 animate-ping" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-blue-700 whitespace-nowrap">
                Your Area
              </span>
            </div>

            {/* Truck marker with smooth animation */}
            <div 
              className="absolute transition-all duration-[4000ms] ease-linear"
              style={{
                left: `${mapPos.x}%`,
                top: `${mapPos.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute -inset-3 rounded-full bg-success/20 animate-pulse" />
                {/* Truck icon container */}
                <div className="relative w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-lg border-2 border-white">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                {/* Label */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                  TRK-001
                </div>
              </div>
            </div>

            {/* Map attribution */}
            <div className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/50">
              Simulated Map View
            </div>
          </div>
        </Card>

        {/* Truck Info Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Truck TRK-001</h3>
                  <p className="text-sm text-muted-foreground">Waste Collection Vehicle</p>
                </div>
              </div>
              <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                <Navigation className="w-3 h-3 mr-1" />
                On the way
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Truck ID</p>
                <p className="font-semibold">TRK-001</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Current Zone</p>
                <p className="font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  Ward 5
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Updated</p>
                <p className="font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {format(lastUpdated, 'HH:mm:ss')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Arrival</p>
                <p className="font-semibold text-success">10–15 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 text-sm">Today's Route Progress</h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Ward 1</span>
              </div>
              <div className="flex-1 h-1 bg-success rounded" />
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Ward 3</span>
              </div>
              <div className="flex-1 h-1 bg-success rounded" />
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-warning animate-pulse" />
                <span className="text-xs font-medium">Ward 5</span>
              </div>
              <div className="flex-1 h-1 bg-muted rounded" />
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">Ward 6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-xs text-muted-foreground text-center italic px-4">
          Live location is simulated for MVP demonstration. In real deployment, this connects to the driver's GPS device.
        </p>
      </div>
    </MainLayout>
  );
};

export default LiveTracking;
