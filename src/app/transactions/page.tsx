'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/transactions';
import { db } from '@/lib/firebase';
import type { Transaction } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Package } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFirebaseConfigured = !!db.app.options.apiKey;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    async function fetchTransactions() {
      try {
        const data = await getTransactions();
        setTransactions(data);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Failed to load transactions. ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [isFirebaseConfigured]);

  const renderContent = () => {
    if (!isFirebaseConfigured) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            The transaction history feature requires a connection to a Firebase database.
            Please set up your Firebase environment variables in your <code>.env.local</code> file
            and restart the server. For detailed instructions, please see the{' '}
            <Link href="/docs" className="underline font-semibold">
              documentation
            </Link>.
          </AlertDescription>
        </Alert>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-bold">No Transactions Yet</h2>
            <p className="mt-2 text-muted-foreground">When new orders are placed, they will appear here.</p>
            <Button asChild className="mt-6">
                <Link href="/">Continue Shopping</Link>
            </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
              <TableCell>
                <div className="font-medium">{order.customer}</div>
                <div className="text-xs text-muted-foreground">{order.email}</div>
              </TableCell>
              <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary">Processing</Badge>
              </TableCell>
              <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-2">A summary of all orders placed through the store.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            This list is populated from your live Firebase database.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
