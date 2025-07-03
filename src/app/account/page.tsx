'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
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
        <p className="text-muted-foreground mt-2">Welcome back to your CodiStyle account.</p>
      </div>
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Account Details</CardTitle>
          <CardDescription>This is your member area. More features coming soon!</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">For now, this page is a placeholder for your future account details, order history, and saved addresses.</p>
        </CardContent>
      </Card>
      <div className="text-center">
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
