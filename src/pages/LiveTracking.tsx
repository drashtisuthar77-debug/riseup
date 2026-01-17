import { useState, useEffect, useRef, useCallback } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { generateMockTrucks, Truck } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Truck as TruckIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2,
  MapPin,
  Clock,
  Gauge,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';

const statusConfig = {
  'En Route': { color: 'bg-info', label: 'En Route', textColor: 'text-info' },
  'Loading': { color: 'bg-warning', label: 'Loading', textColor: 'text-warning' },
  'Returning': { color: 'bg-success', label: 'Returning', textColor: 'text-success' },
  'Idle': { color: 'bg-muted-foreground', label: 'Idle', textColor: 'text-muted-foreground' }
};

const LiveTracking = () => {
  const [trucks, setTrucks] = useState<Truck[]>(() => generateMockTrucks());
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const mapRef = useRef<HTMLDivElement>(null);

  // Simulate truck movement
  const updateTruckPositions = useCallback(() => {
    setTrucks(prev => prev.map(truck => {
      if (truck.status === 'Idle' || truck.status === 'Loading') return truck;
      
      const speed = truck.speed * speedMultiplier * 0.01;
      let newX = truck.currentLocation.x;
      let newY = truck.currentLocation.y;
      
      // Simple random movement simulation
      const direction = Math.random() * Math.PI * 2;
      newX += Math.cos(direction) * speed;
      newY += Math.sin(direction) * speed;
      
      // Keep within bounds
      newX = Math.max(5, Math.min(95, newX));
      newY = Math.max(5, Math.min(95, newY));
      
      // Random status changes
      let newStatus: 'En Route' | 'Loading' | 'Returning' | 'Idle' = truck.status;
      if (Math.random() < 0.02) {
        const statuses: Array<'En Route' | 'Loading' | 'Returning'> = ['En Route', 'Loading', 'Returning'];
        newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      }
      
      // Update load
      let newLoad = truck.currentLoad;
      if (newStatus === 'Loading') {
        newLoad = Math.min(truck.capacity, newLoad + Math.floor(Math.random() * 100));
      }

      return {
        ...truck,
        currentLocation: { x: newX, y: newY },
        status: newStatus,
        currentLoad: newLoad,
        lastUpdate: new Date()
      };
    }));
    setLastUpdate(new Date());
  }, [speedMultiplier]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(updateTruckPositions, 1000 / speedMultiplier);
    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, updateTruckPositions]);

  const resetSimulation = () => {
    setTrucks(generateMockTrucks());
    setSelectedTruck(null);
    setIsPlaying(true);
  };

  const fleetStats = {
    enRoute: trucks.filter(t => t.status === 'En Route').length,
    loading: trucks.filter(t => t.status === 'Loading').length,
    returning: trucks.filter(t => t.status === 'Returning').length,
    idle: trucks.filter(t => t.status === 'Idle').length
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Truck Tracking</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {format(lastUpdate, 'HH:mm:ss')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-card rounded-lg border p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-8 w-8"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetSimulation}
                className="h-8 w-8"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map(speed => (
                    <Button
                      key={speed}
                      variant={speedMultiplier === speed ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSpeedMultiplier(speed)}
                      className="h-6 w-8 text-xs"
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Fleet Status Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold mb-3">Fleet Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-info" />
                    <span className="text-sm">En Route</span>
                  </div>
                  <Badge variant="secondary">{fleetStats.enRoute}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm">Loading</span>
                  </div>
                  <Badge variant="secondary">{fleetStats.loading}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm">Returning</span>
                  </div>
                  <Badge variant="secondary">{fleetStats.returning}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                    <span className="text-sm">Idle</span>
                  </div>
                  <Badge variant="secondary">{fleetStats.idle}</Badge>
                </div>
              </div>
            </div>

            {/* Truck List */}
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-semibold">All Vehicles</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {trucks.map(truck => (
                  <button
                    key={truck.id}
                    onClick={() => setSelectedTruck(truck)}
                    className={cn(
                      "w-full p-3 text-left border-b last:border-b-0 hover:bg-muted/50 transition-colors",
                      selectedTruck?.id === truck.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{truck.vehicleNumber}</span>
                      <span className={cn(
                        "text-xs font-medium",
                        statusConfig[truck.status].textColor
                      )}>
                        {truck.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {truck.driver} • {truck.assignedWard}
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Load</span>
                        <span>{Math.round((truck.currentLoad / truck.capacity) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(truck.currentLoad / truck.capacity) * 100} 
                        className="h-1"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map View */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">City Map View</h3>
                <Badge variant="outline">
                  <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-success inline-block" />
                  Live
                </Badge>
              </div>
              
              {/* Simulated Map */}
              <div 
                ref={mapRef}
                className="relative h-[600px] bg-gradient-to-br from-muted/30 to-muted/60"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px'
                }}
              >
                {/* City zones overlay */}
                <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-lg">
                  <div className="absolute top-2 left-2 text-xs text-primary/50 font-medium">CITY BOUNDARY</div>
                </div>

                {/* Ward labels */}
                <div className="absolute top-[15%] left-[20%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 1</div>
                <div className="absolute top-[15%] right-[20%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 2</div>
                <div className="absolute top-[45%] left-[15%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 3</div>
                <div className="absolute top-[45%] right-[15%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 4</div>
                <div className="absolute bottom-[20%] left-[20%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 5</div>
                <div className="absolute bottom-[20%] right-[20%] text-xs font-medium text-muted-foreground/60 bg-background/50 px-2 py-1 rounded">Ward 6</div>

                {/* Dump site */}
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center border-2 border-dashed border-muted-foreground/40">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">Dump Site</span>
                </div>

                {/* Truck markers */}
                {trucks.map(truck => (
                  <div
                    key={truck.id}
                    className={cn(
                      "truck-marker cursor-pointer",
                      statusConfig[truck.status].color,
                      selectedTruck?.id === truck.id && "ring-4 ring-primary/50 scale-125 z-10"
                    )}
                    style={{
                      left: `${truck.currentLocation.x}%`,
                      top: `${truck.currentLocation.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedTruck(truck)}
                    title={`${truck.vehicleNumber} - ${truck.status}`}
                  >
                    <TruckIcon className="w-4 h-4" />
                  </div>
                ))}

                {/* Selected truck info popup */}
                {selectedTruck && (
                  <div 
                    className="absolute bg-card rounded-lg border shadow-lg p-4 w-64 z-20"
                    style={{
                      left: `${Math.min(70, Math.max(10, selectedTruck.currentLocation.x))}%`,
                      top: `${Math.min(70, Math.max(10, selectedTruck.currentLocation.y + 8))}%`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", statusConfig[selectedTruck.status].color)} />
                        <span className="font-semibold">{selectedTruck.vehicleNumber}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedTruck(null)}
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedTruck.assignedWard}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedTruck.driver} • {selectedTruck.contractor.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedTruck.speed} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedTruck.currentLoad} / {selectedTruck.capacity} kg</span>
                      </div>
                      
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Capacity Used</span>
                          <span className="font-medium">{Math.round((selectedTruck.currentLoad / selectedTruck.capacity) * 100)}%</span>
                        </div>
                        <Progress value={(selectedTruck.currentLoad / selectedTruck.capacity) * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveTracking;
