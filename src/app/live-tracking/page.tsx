'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Truck, Package, Home, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// A simple SVG map background to avoid external dependencies
const MapBackground = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0 h-full w-full object-cover">
    <rect width="800" height="600" fill="#f0f0f0" />
    {/* Roads */}
    <path d="M 0 300 H 800" stroke="#d1d5db" strokeWidth="15" />
    <path d="M 100 0 V 600" stroke="#d1d5db" strokeWidth="15" />
    <path d="M 400 0 V 600" stroke="#d1d5db" strokeWidth="15" />
    <path d="M 700 0 V 600" stroke="#d1d5db" strokeWidth="15" />
    <path d="M 0 100 H 800" stroke="#d1d5db" strokeWidth="10" />
    <path d="M 0 500 H 800" stroke="#d1d5db" strokeWidth="10" />
    {/* Buildings */}
    <rect x="120" y="50" width="80" height="40" fill="#e5e7eb" />
    <rect x="220" y="120" width="60" height="60" fill="#e5e7eb" />
    <rect x="420" y="350" width="150" height="80" fill="#e5e7eb" />
    <rect x="600" y="450" width="80" height="100" fill="#e5e7eb" />
    <rect x="50" y="400" width="40" height="40" fill="#e5e7eb" />
  </svg>
);


export default function LiveTrackingPage() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Out for Delivery');
  const [eta, setEta] = useState(15);

  // Define the path for the truck to follow
  const path = {
    startX: 50,
    startY: 50,
    endX: 700,
    endY: 500,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('Delivered');
          return 100;
        }
        const newProgress = prev + 1;
        
        if (newProgress > 85) {
            setStatus('Arriving Soon');
        }
        setEta(Math.round(15 * (1 - newProgress / 100)));

        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

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

          {/* Route path */}
          <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0">
             <path
              d={`M ${path.startX} ${path.startY} L ${path.endX} ${path.endY}`}
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              strokeDasharray="8 8"
              fill="none"
            />
          </svg>
          
          <div className="absolute" style={{ top: `${path.startY - 16}px`, left: `${path.startX - 16}px` }}>
            <div className="relative">
              <Home className="h-8 w-8 text-primary-foreground fill-primary" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold bg-primary text-primary-foreground px-2 py-1 rounded-md">Warehouse</span>
            </div>
          </div>
          <div className="absolute" style={{ top: `${path.endY - 16}px`, left: `${path.endX - 16}px` }}>
            <div className="relative">
                <Package className="h-8 w-8 text-destructive-foreground fill-destructive" />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold bg-destructive text-destructive-foreground px-2 py-1 rounded-md">You</span>
            </div>
          </div>
          
          {status !== 'Delivered' && (
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
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{status}</h3>
                <Badge variant={status === 'Delivered' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
              </div>
              <Progress value={progress} />
            </div>
            
            <Separator />

            <div className="flex items-center justify-between text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Estimated Arrival</span>
              </div>
              <span className="font-bold text-primary">{status === 'Delivered' ? 'Now' : `~${eta} min`}</span>
            </div>

             <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex items-start gap-2">
                    <Home className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium text-card-foreground">From</p>
                        <p>CodiStyle Warehouse, Seoul</p>
                    </div>
                </div>
                 <div className="flex items-start gap-2">
                    <Package className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-medium text-card-foreground">To</p>
                        <p>123 Main Street, New York</p>
                    </div>
                </div>
            </div>

          </CardContent>
        </Card>
      </div>

       <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Note: This is a simulated delivery for demonstration purposes only.</p>
        </div>
    </div>
  );
}
