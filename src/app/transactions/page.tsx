
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Hash, Loader2, AlertTriangle } from 'lucide-react';
import type { Transaction } from '@/types';
import { getTransactions } from '@/lib/transactions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const ADMIN_PASSWORD = 'admin123';

export default function TransactionsPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
  const { toast } = useToast();
  
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);

  useEffect(() => {
    // This check runs on the client and determines if Firebase is set up.
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        setIsFirebaseConfigured(false);
        setIsLoading(false); // Stop loading if not configured
    }

    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      setIsAdminLoggedIn(true);
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn && isFirebaseConfigured) {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const data = await getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to load transactions", error);
                toast({
                    variant: 'destructive',
                    title: 'Failed to load transactions',
                    description: 'Could not fetch data from the database. Please try again.',
                });
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }
  }, [isAdminLoggedIn, isFirebaseConfigured, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast({ title: 'Login Successful', description: 'Welcome, admin!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect password. Please try again.',
      });
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setPassword('');
    localStorage.removeItem('isAdminLoggedIn');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">Transaction Summary</h1>
            <p className="text-muted-foreground mt-2">Enter the password to view financial data.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
            />
            <Button type="submit" className="w-full">Login</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">Hint: The password is <strong>{ADMIN_PASSWORD}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Transaction Summary</h1>
            <p className="text-muted-foreground">Financial overview for tax and accounting purposes.</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>

       {!isFirebaseConfigured ? (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Firebase Not Configured</AlertTitle>
            <AlertDescription>
                <p>This page requires a connection to a Firebase database, but the necessary API keys are missing.</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Go to your Firebase project settings to get your API keys.</li>
                    <li>Create a <code>.env.local</code> file in your project's root directory.</li>
                    <li>Add your Firebase keys (e.g., <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>) to the file.</li>
                    <li><strong>Important:</strong> Stop your development server and restart it for changes to apply.</li>
                    <li>For more detailed instructions, visit the <Link href="/docs" className="font-semibold underline">documentation page</Link>.</li>
                </ol>
            </AlertDescription>
        </Alert>
      ) : isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
       ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <p className="text-xs text-muted-foreground">from {totalTransactions} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTransactions}</div>
                 <p className="text-xs text-muted-foreground">in the selected period</p>
              </CardContent>
            </Card>
           </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Transactions</CardTitle>
              <CardDescription>A complete log of all financial transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Shipping</TableHead>
                    <TableHead className="text-right">Taxes</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.orderId}>
                        <TableCell className="font-mono text-xs">{transaction.orderId}</TableCell>
                        <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="font-medium">{transaction.customer}</div>
                        </TableCell>
                        <TableCell>{transaction.email}</TableCell>
                        <TableCell className="text-right">${transaction.subtotal.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${transaction.shipping.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${transaction.taxes.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">${transaction.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No transactions have been recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
