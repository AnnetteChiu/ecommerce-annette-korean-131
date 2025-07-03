
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, History, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/types';
import { getTransactions } from '@/lib/transactions';

type BrowsingHistoryItem = {
  id: string;
  name: string;
};

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
  const [isLoading, setIsLoading] = useState(true);
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

      // Load user's orders from Firestore
      const fetchOrders = async () => {
          setIsLoading(true);
          try {
              // In a real app, you would filter transactions by user ID.
              // For this demo, we will fetch all transactions.
              const allTransactions = await getTransactions();
              const userOrders: DisplayOrder[] = allTransactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(tx => ({
                    id: tx.orderId,
                    date: tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A',
                    total: tx.total || 0,
                    status: 'Processing'
                }));
              setOrders(userOrders);
          } catch (error) {
              console.error("Failed to fetch user transactions:", error);
              setOrders([]); // Fallback to empty on error
          } finally {
              setIsLoading(false);
          }
      };
      fetchOrders();
    } else {
        setIsLoading(false);
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

  if (isLoading) {
    return (
       <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
              Your past orders are listed here.
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
                      <TableCell className="font-mono text-xs">{order.id || 'N/A'}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={'secondary'}>{order.status || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${(order.total || 0).toFixed(2)}</TableCell>
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
