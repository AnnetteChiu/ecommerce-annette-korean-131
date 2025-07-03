
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, History, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type BrowsingHistoryItem = {
  id: string;
  name: string;
};

// Mock data for demonstration
const mockOrders = [
  { id: 'CS-1A2B3C', date: '2023-10-26', total: 149.99, status: 'Delivered' },
  { id: 'CS-4D5E6F', date: '2023-10-15', total: 89.99, status: 'Delivered' },
  { id: 'CS-7G8H9I', date: '2023-09-01', total: 235.00, status: 'Cancelled' },
];

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
      
      try {
        const historyString = sessionStorage.getItem('browsingHistory');
        if (historyString) {
          setBrowsingHistory(JSON.parse(historyString));
        }
      } catch (error) {
        console.error("Failed to parse browsing history:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be logged in to view your account page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">My Account</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your activity at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard /> Order History</CardTitle>
            <CardDescription>Your past orders are listed here. (This is sample data)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'Delivered' ? 'outline' : 'destructive'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Browsing History</CardTitle>
            <CardDescription>A list of products you've recently viewed.</CardDescription>
          </CardHeader>
          <CardContent>
            {browsingHistory.length > 0 ? (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {browsingHistory.slice().reverse().map(item => (
                  <li key={item.id}>
                    <Link href={`/products/${item.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">You haven't viewed any products yet. Go explore!</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center">
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
