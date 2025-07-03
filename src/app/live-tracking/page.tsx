'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, Home, Clock, Warehouse, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// A more detailed SVG map background
const MapBackground = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0 h-full w-full object-cover">
        <rect width="800" height="600" fill="hsl(var(--muted))" />
        
        {/* Roads */}
        <path d="M 0 50 H 800" stroke="hsl(var(--border))" strokeWidth="20" />
        <path d="M 0 150 H 800" stroke="hsl(var(--border))" strokeWidth="10" />
        <path d="M 0 300 H 800" stroke="hsl(var(--border))" strokeWidth="25" />
        <path d="M 0 450 H 800" stroke="hsl(var(--border))" strokeWidth="15" />
        <path d="M 100 0 V 600" stroke="hsl(var(--border))" strokeWidth="20" />
        <path d="M 300 0 V 600" stroke="hsl(var(--border))" strokeWidth="10" />
        <path d="M 500 0 V 600" stroke="hsl(var(--border))" strokeWidth="25" />
        <path d="M 700 0 V 600" stroke="hsl(var(--border))" strokeWidth="15" />

        {/* Buildings / City blocks */}
        <rect x="20" y="80" width="60" height="50" fill="hsl(var(--card))" />
        <rect x="120" y="170" width="160" height="110" fill="hsl(var(--card))" />
        <rect x="320" y="20" width="160" height="110" fill="hsl(var(--card))" />
        <rect x="320" y="170" width="160" height="110" fill="hsl(var(--card))" />
        <rect x="520" y="80" width="160" height="200" fill="hsl(var(--card))" />
        <rect x="20" y="340" width="260" height="90" fill="hsl(var(--card))" />
        <rect x="320" y="340" width="160" height="180" fill="hsl(var(--card))" />
        <rect x="520" y="340" width="160" height="90" fill="hsl(var(--card))" />
        <rect x="20" y="480" width="60" height="80" fill="hsl(var(--card))" />
        <rect x="120" y="480" width="160" height="80" fill="hsl(var(--card))" />
        <rect x="720" y="20" width="60" height="400" fill="hsl(var(--card))" />
    </svg>
);

const deliverySteps = [
    { name: 'Order Confirmed', progress: 0, icon: CheckCircle },
    { name: 'Departed Warehouse', progress: 10, icon: Warehouse },
    { name: 'In Transit', progress: 50, icon: Truck },
    { name: 'Arriving Soon', progress: 90, icon: Package },
    { name: 'Delivered', progress: 100, icon: Home },
];

export default function LiveTrackingPage() {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const newProgress = prev + 1;
        setEta(Math.round(15 * (1 - newProgress / 100)));
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const currentStatus = deliverySteps.slice().reverse().find(step => progress >= step.progress) || deliverySteps[0];
  
  const path = {
    startX: 50,
    startY: 20,
    endX: 750,
    endY: 550,
  };

  const truckX = path.startX + (path.endX - path.startX) * (progress / 100);
  const truckY = path.startY + (path.endY - path.startY) * (progress / 100);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Live Order Tracking</h1>
        <p className="text-muted-foreground mt-2">Watch your delivery arrive in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative aspect-video w-full rounded-lg overflow-hidden border bg-muted shadow-lg">
          <MapBackground />

          <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0">
             <path
              d={`M ${path.startX} ${path.startY} C ${path.startX + 100},${path.startY + 300} ${path.endX - 300},${path.endY - 100} ${path.endX} ${path.endY}`}
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeDasharray="8 8"
              fill="none"
            />
          </svg>
          
          <div className="absolute" style={{ top: `${path.startY - 16}px`, left: `${path.startX - 16}px` }}>
            <div className="relative">
              <Warehouse className="h-8 w-8 text-primary-foreground fill-primary" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded-md">Warehouse</span>
            </div>
          </div>
          <div className="absolute" style={{ top: `${path.endY - 16}px`, left: `${path.endX - 16}px` }}>
            <div className="relative">
                <Home className="h-8 w-8 text-destructive-foreground fill-destructive" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold bg-destructive text-destructive-foreground px-2 py-1 rounded-md">You</span>
            </div>
          </div>
          
          {currentStatus.name !== 'Delivered' && (
            <div
              className="absolute transition-all duration-200 ease-linear"
              style={{ top: `${truckY - 16}px`, left: `${truckX - 16}px` }}
            >
              <Truck className="h-8 w-8 text-primary-foreground fill-primary animate-pulse" />
            </div>
          )}
        </div>

        <Card className="sticky top-24 self-start">
          <CardHeader>
            <CardTitle>Delivery Status</CardTitle>
            <CardDescription>Order #12345-ABCDE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {deliverySteps.map((step, index) => {
                    const isActive = progress >= step.progress;
                    const isCurrent = currentStatus.name === step.name && currentStatus.name !== 'Delivered';

                    return (
                        <div key={index} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "rounded-full h-8 w-8 flex items-center justify-center border-2 transition-colors",
                                    isActive ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                                )}>
                                    <step.icon className="h-4 w-4" />
                                </div>
                                {index < deliverySteps.length - 1 && (
                                    <div className="w-0.5 h-8 mt-1 bg-border" />
                                )}
                            </div>
                            <div className="pt-1">
                                <p className={cn(
                                    "font-medium transition-colors",
                                    isActive ? "text-card-foreground" : "text-muted-foreground"
                                )}>
                                    {step.name}
                                </p>
                                {isCurrent && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                        <Clock className="h-4 w-4" />
                                        <span>ETA: ~{eta} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <Separator className="my-6" />

             <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex items-start gap-2">
                    <Warehouse className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium text-card-foreground">From</p>
                        <p>CodiStyle Warehouse, Seoul</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium text-card-foreground">To</p>
                        <p>123 Main Street, New York</p>
                    </div>
                </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
