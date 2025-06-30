'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { generateAdminReport, type AdminReportOutput } from '@/ai/flows/generate-admin-report';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2, KeyRound, Bot, BarChart2, TrendingUp, TrendingDown, Lightbulb, ListChecks } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [report, setReport] = useState<AdminReportOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  // Check auth status on mount
  useEffect(() => {
    try {
      if (localStorage.getItem('isAdminLoggedIn') === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Could not access localStorage.', error);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    // In a real app, this would be a secure API call.
    // For this prototype, we'll use a hardcoded password.
    if (password === 'admin123') {
      try {
        localStorage.setItem('isAdminLoggedIn', 'true');
        setIsAuthenticated(true);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Could not access local storage. Please enable it in your browser.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Incorrect password. Please try again.',
      });
    }
    setIsLoggingIn(false);
    setPassword('');
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    try {
      const result = await generateAdminReport();
      setReport(result);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: 'An error occurred while generating the report. Please try again.',
      });
    }
    setIsGenerating(false);
  };
  
  // Login View
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter the password to view the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="animate-spin" /> : <KeyRound />}
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-headline font-bold">Admin Dashboard</h1>
        <Button onClick={handleGenerateReport} disabled={isGenerating} size="lg">
          {isGenerating ? <Loader2 className="animate-spin" /> : <Bot />}
          Generate AI Report
        </Button>
      </div>
      
      {isGenerating && (
         <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Generating Report...</h2>
            <p className="text-muted-foreground">The AI is analyzing product data. This may take a moment.</p>
        </div>
      )}

      {report && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ListChecks className="h-6 w-6" />
                    <CardTitle>AI Analysis Summary</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{report.summary}</p>
            </CardContent>
          </Card>
          
          <div className="grid gap-8 md:grid-cols-2">
              <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                        <CardTitle>Top Performing Products</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {report.topPerforming.map(p => (
                          <div key={p.productId} className="border-b pb-2 last:border-b-0">
                              <Link href={`/products/${p.productId}`} className="font-semibold text-primary hover:underline">{p.name}</Link>
                              <p className="text-sm text-muted-foreground">Impressions: {p.impressions.toLocaleString()}</p>
                              <p className="text-sm">{p.reason}</p>
                          </div>
                      ))}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                     <div className="flex items-center gap-2">
                        <TrendingDown className="h-6 w-6 text-red-500" />
                        <CardTitle>Underperforming Products</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      {report.underperforming.map(p => (
                          <div key={p.productId} className="border-b pb-2 last:border-b-0">
                               <Link href={`/products/${p.productId}`} className="font-semibold text-primary hover:underline">{p.name}</Link>
                              <p className="text-sm text-muted-foreground">Impressions: {p.impressions.toLocaleString()}</p>
                              <p className="text-sm">{p.reason}</p>
                          </div>
                      ))}
                  </CardContent>
              </Card>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6" />
                <CardTitle>Impressions by Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="min-h-64 w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={report.categoryPerformance} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="totalImpressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    <CardTitle>AI Suggestions</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
