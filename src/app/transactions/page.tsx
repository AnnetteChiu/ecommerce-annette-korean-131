
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

const ADMIN_PASSWORD = 'admin123';

const mockTransactions = [
  {
    orderId: 'CS-9A8B7C',
    customer: 'Alice Johnson',
    date: '2023-11-10',
    subtotal: 220.00,
    shipping: 19.98,
    taxes: 17.60,
    total: 239.98,
  },
  {
    orderId: 'CS-6F5E4D',
    customer: 'Bob Williams',
    date: '2023-11-10',
    subtotal: 150.00,
    shipping: 15.00,
    taxes: 12.00,
    total: 165.00,
  },
  {
    orderId: 'CS-3I2H1G',
    customer: 'Charlie Brown',
    date: '2023-11-08',
    subtotal: 80.00,
    shipping: 9.99,
    taxes: 6.40,
    total: 89.99,
  },
  {
    orderId: 'CS-KJ23L9',
    customer: 'Diana Prince',
    date: '2023-11-07',
    subtotal: 250.00,
    shipping: 20.00,
    taxes: 20.00,
    total: 270.00,
  },
  {
    orderId: 'CS-M4N5O6',
    customer: 'Eve Adams',
    date: '2023-11-05',
    subtotal: 120.50,
    shipping: 12.05,
    taxes: 9.64,
    total: 132.55,
  }
];

export default function TransactionsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  
  const totalTransactions = mockTransactions.length;
  const totalRevenue = mockTransactions.reduce((acc, t) => acc + t.total, 0);

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      toast({ title: 'Login Successful', description: 'Welcome, admin!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect password. Please try again.',
      });
    }
  };

  if (!isLoggedIn) {
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
      <div>
        <h1 className="text-3xl font-bold font-headline">Transaction Summary</h1>
        <p className="text-muted-foreground">Financial overview for tax and accounting purposes.</p>
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
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Shipping</TableHead>
                <TableHead className="text-right">Taxes</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((transaction) => (
                <TableRow key={transaction.orderId}>
                  <TableCell className="font-mono text-xs">{transaction.orderId}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{transaction.customer}</div>
                  </TableCell>
                  <TableCell className="text-right">${transaction.subtotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${transaction.shipping.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${transaction.taxes.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">${transaction.total.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
