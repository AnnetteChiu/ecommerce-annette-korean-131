
'use client';

import { useState, useEffect } from 'react';
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
import { DollarSign, Hash } from 'lucide-react';
import type { Transaction } from '@/types';
import { getHistoricalTransactions } from '@/lib/transactions';

const ADMIN_PASSWORD = 'admin123';

export default function TransactionsPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  
  const totalTransactions = transactions.length;
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
        try {
            const historicalTransactions = getHistoricalTransactions();
            const userTransactionsStr = localStorage.getItem('userTransactions');
            const newTransactions: Transaction[] = userTransactionsStr ? JSON.parse(userTransactionsStr) : [];
            
            // Combine historical data with new transactions from this session
            const allTransactionsMap = new Map<string, Transaction>();
            historicalTransactions.forEach(tx => allTransactionsMap.set(tx.orderId, tx));
            newTransactions.forEach(tx => allTransactionsMap.set(tx.orderId, tx));
            
            const combinedTransactions = Array.from(allTransactionsMap.values());
            
            // Sort by date, newest first
            combinedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTransactions(combinedTransactions);
        } catch (error) {
            console.error("Failed to load transactions", error);
            setTransactions([]); // Fallback to empty on error
        }
    }
  }, [isAdminLoggedIn]);

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
    </div>
  );
}
