
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
import type { Transaction } from '@/types';

type BrowsingHistoryItem = {
  id: string;
  name: string;
};

// Mock data for demonstration, used as a fallback
const mockOrders = [
  { id: 'CS-1A2B3C', date: '2023-10-26', total: 149.99, status: 'Delivered' },
  { id: 'CS-4D5E6F', date: '2023-10-15', total: 89.99, status: 'Delivered' },
  { id: 'CS-7G8H9I', date: '2023-09-01', total: 235.00, status: 'Cancelled' },
];

type DisplayOrder = {
  id: string;
  date: string;
  total: number;
  status: string;
};

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [browsingHistory, setBrowsingHistory] = useState<BrowsingHistoryItem[]>([]);
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [isSampleData, setIsSampleData] = useState(false);
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

      // Load user's actual orders or fall back to mock data
      try {
        const userTransactionsStr = localStorage.getItem('userTransactions');
        const userTransactions: Transaction[] = userTransactionsStr ? JSON.parse(userTransactionsStr) : [];

        if (userTransactions.length > 0) {
            const userOrders: DisplayOrder[] = userTransactions.map(tx => ({
                id: tx.orderId,
                date: tx.date,
                total: tx.total,
                status: 'Processing' // Assume recent orders are processing
            })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(userOrders);
            setIsSampleData(false);
        } else {
            // If no user orders, show mock data as a placeholder
            setOrders(mockOrders);
            setIsSampleData(true);
        }
      } catch (error) {
        console.error("Failed to parse user transactions:", error);
        setOrders(mockOrders); // Fallback to mock data on error
        setIsSampleData(true);
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
            <CardDescription>
              {isSampleData 
                ? "This is sample data. Orders you place will appear here." 
                : "Your past orders are listed here."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
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
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'Delivered' ? 'outline' : 
                          order.status === 'Processing' ? 'secondary' :
                          'destructive'
                        }>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have not placed any orders yet.</p>
            )}
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
