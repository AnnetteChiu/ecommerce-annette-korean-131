'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin } from 'lucide-react';

const ADMIN_PASSWORD = 'admin123';

// Mock data for suppliers
const mockSuppliers = [
  { id: 'sup1', name: 'Supplier A', contact: 'contact@suppliera.com', products: 5, address: '123 Fashion Ave, New York, NY, USA' },
  { id: 'sup2', name: 'Supplier B', contact: 'contact@supplierb.com', products: 12, address: '456 Textile Road, London, UK' },
  { id: 'sup3', name: 'Supplier C', contact: 'contact@supplierc.com', products: 8, address: '789 Design Court, Tokyo, Japan' },
];

export default function SupplierManagementPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword('');
    localStorage.removeItem('isLoggedIn');
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };
  
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">공급업체 관리</h1>
            <p className="text-muted-foreground mt-2">Enter the password to manage suppliers.</p>
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
        <h1 className="text-4xl font-headline font-bold">공급업체 관리</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableCaption>A list of all suppliers.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier Name</TableHead>
              <TableHead>Contact Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Product Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.contact}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{supplier.address}</span>
                    <Button asChild variant="link" className="p-0 h-auto justify-start font-normal text-muted-foreground">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.address)}`} target="_blank" rel="noopener noreferrer">
                        <MapPin className="mr-1 h-3 w-3" />
                        View on Map
                      </a>
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">{supplier.products}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
