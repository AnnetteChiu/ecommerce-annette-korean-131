
'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSalesData } from '@/lib/sales';
import type { SalesData, Transaction } from '@/types';
import { DollarSign, Package, Star, MessageSquare, TrendingDown, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useAi } from '@/context/ai-context';
import { generateAdminReport } from '@/ai/flows/generate-admin-report';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getTransactions } from '@/lib/transactions';
import { FirestoreSecurityRulesInstructions } from '@/components/firestore-security-rules-instructions';

const ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [report, setReport] = useState<string>('');
  const [isGenerating, startTransition] = useTransition();
  const [recentOrders, setRecentOrders] = useState<Transaction[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAiEnabled, disableAi } = useAi();

  useEffect(() => {
    if (localStorage.getItem('isAdminLoggedIn') === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn) {
      const data = getSalesData();
      setSalesData(data);
       const fetchOrders = async () => {
          setOrdersError(null);
          const { transactions, error } = await getTransactions();
          
          if (error) {
              if (error.code === 'PERMISSION_DENIED') {
                  setOrdersError('PERMISSION_DENIED');
              } else {
                  setOrdersError(error.message);
              }
              console.error("Failed to load transactions", error.message);
              setRecentOrders([]);
          } else {
              setRecentOrders(transactions);
          }
       };
       fetchOrders();
    }
  }, [isAdminLoggedIn]);
  
  useEffect(() => {
    if (isAdminLoggedIn && salesData && isAiEnabled) {
      startTransition(async () => {
        try {
          const result = await generateAdminReport(salesData);
          setReport(result.report);
        } catch (error) {
          console.error("Failed to generate admin report:", error);
          const description = error instanceof Error ? error.message : "An unknown error occurred.";
          if (description === 'API_KEY_INVALID') {
            disableAi();
            toast({
              variant: 'destructive',
              title: 'Google AI Key Invalid',
              description: 'Your API key is invalid. All AI features have been disabled.',
            });
          } else {
            toast({
              variant: 'destructive',
              title: 'Report Generation Failed',
              description,
            });
          }
        }
      });
    }
  }, [isAdminLoggedIn, salesData, isAiEnabled, toast, disableAi]);

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

  const monthlyChartConfig = {
    sales: {
      label: 'Sales',
      color: 'hsl(var(--chart-1))',
    },
  };

  const regionChartConfig = {
    sales: {
      label: 'Sales',
    },
    首爾: {
      label: '首爾',
      color: 'hsl(var(--chart-1))',
    },
    釜山: {
      label: '釜山',
      color: 'hsl(var(--chart-2))',
    },
    仁川: {
      label: '仁川',
      color: 'hsl(var(--chart-3))',
    },
    大邱: {
      label: '大邱',
      color: 'hsl(var(--chart-4))',
    },
    其他: {
      label: '其他',
      color: 'hsl(var(--chart-5))',
    },
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Enter the password to view the Sales Dashboard.</p>
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

  if (!salesData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Sales Dashboard</h1>
            <p className="text-muted-foreground">{salesData.productName}</p>
        </div>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      {isAiEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles /> AI Sales Report</CardTitle>
            <CardDescription>An AI-generated summary of this product's performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating insights...</span>
              </div>
            ) : report ? (
              <p className="whitespace-pre-line text-sm text-muted-foreground">{report}</p>
            ) : (
               <p className="text-sm text-muted-foreground">Could not generate a report at this time.</p>
            )}
          </CardContent>
        </Card>
      )}

      {!isAiEnabled && isAdminLoggedIn && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>AI Features Disabled</AlertTitle>
            <AlertDescription>
                The AI-powered sales report requires a Google AI API key. Please add it to your <code>.env.local</code> file and restart the server. See the <Link href="/docs" className="underline font-semibold">documentation</Link> for instructions.
            </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.revenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.averageRating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalReviews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.returnRate}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
            <CardDescription>Sales from the last 7 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={salesData.monthlyTrend}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Sales Regions</CardTitle>
            <CardDescription>Breakdown of sales by region.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-0">
            <ChartContainer config={regionChartConfig} className="h-[300px] w-full">
              <PieChart accessibilityLayer>
                <ChartTooltip content={<ChartTooltipContent nameKey="sales" />} />
                <Pie data={salesData.topRegions} dataKey="sales" nameKey="region" innerRadius={60} strokeWidth={5}>
                  {salesData.topRegions.map((entry) => (
                    <Cell key={entry.region} fill={`var(--color-${entry.region})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="region" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>An overview of the latest transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersError === 'PERMISSION_DENIED' ? (
              <FirestoreSecurityRulesInstructions />
          ) : ordersError ? (
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Loading Orders</AlertTitle>
                  <AlertDescription>{ordersError}</AlertDescription>
              </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-xs">{order.orderId || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{order.customer || 'N/A'}</div>
                      </TableCell>
                      <TableCell>{order.email || 'N/A'}</TableCell>
                      <TableCell>{order.date || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Processing</Badge>
                      </TableCell>
                      <TableCell className="text-right">${(order.total || 0).toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No recent orders to display.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
