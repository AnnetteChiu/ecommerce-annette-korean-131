'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getCoupons, addCoupon } from '@/lib/coupons';
import type { CouponDiscount } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { sendDiscountCodeEmail } from './actions';
import { Loader2, Mail } from 'lucide-react';


const ADMIN_PASSWORD = 'admin123';

const sendCouponFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  couponCode: z.string().min(1, { message: 'Please select a coupon.' }),
});

export default function MarketingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [coupons, setCoupons] = useState<{ [code: string]: CouponDiscount & { isMock?: boolean } }>({});
  
  // Form state for creating coupons
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState<number | ''>('');

  const [isSending, startSendTransition] = useTransition();
  const { toast } = useToast();
  
  const sendForm = useForm<z.infer<typeof sendCouponFormSchema>>({
    resolver: zodResolver(sendCouponFormSchema),
    defaultValues: {
      email: '',
      couponCode: '',
    },
  });

  const loadCoupons = () => {
    const allCoupons = getCoupons();
    setCoupons(allCoupons);
  };

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadCoupons();
    }
  }, [isLoggedIn]);

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
  
  const handleCreateCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCode.trim() || newValue === '') {
          toast({ variant: 'destructive', title: 'Invalid Input', description: 'Please fill out all fields for the new coupon.' });
          return;
      }
      
      const success = addCoupon(newCode.trim().toUpperCase(), {
          type: newType,
          value: Number(newValue),
      });

      if (success) {
          toast({ title: 'Coupon Created', description: `Coupon "${newCode.toUpperCase()}" has been added.` });
          setNewCode('');
          setNewType('percentage');
          setNewValue('');
          loadCoupons(); // Refresh the list
      } else {
          toast({ variant: 'destructive', title: 'Creation Failed', description: 'A coupon with this code already exists.' });
      }
  };

  function onSendSubmit(values: z.infer<typeof sendCouponFormSchema>) {
    startSendTransition(async () => {
      const selectedCoupon = coupons[values.couponCode];
      if (!selectedCoupon) {
        toast({ variant: 'destructive', title: 'Error', description: 'Selected coupon not found.' });
        return;
      }

      const result = await sendDiscountCodeEmail({
        email: values.email,
        couponCode: values.couponCode,
        discount: {
          type: selectedCoupon.type,
          value: selectedCoupon.value,
        },
      });

      if (result.success) {
        toast({ title: 'Email Sent!', description: result.message });
        sendForm.reset();
      } else {
        toast({ variant: 'destructive', title: 'Email Failed', description: result.error });
      }
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-headline font-bold">Marketing Tools</h1>
            <p className="text-muted-foreground mt-2">Enter the password to create and send discount codes.</p>
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
        <h1 className="text-3xl font-bold font-headline">Marketing</h1>
        <p className="text-muted-foreground">Create, manage, and send discount codes to your customers.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Create New Coupon</CardTitle>
                <CardDescription>Add a new promotional code to the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateCoupon} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input id="code" placeholder="e.g., SUMMER25" value={newCode} onChange={e => setNewCode(e.target.value)} required />
                    </div>
                      <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <RadioGroup defaultValue="percentage" value={newType} onValueChange={(value: 'percentage' | 'fixed') => setNewType(value)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="percentage" id="r-percentage" />
                                <Label htmlFor="r-percentage">Percentage (%)</Label>
                            </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="fixed" id="r-fixed" />
                                <Label htmlFor="r-fixed">Fixed Amount ($)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Value</Label>
                        <Input id="value" type="number" placeholder={newType === 'percentage' ? '25' : '50.00'} value={newValue} onChange={e => setNewValue(Number(e.target.value))} required step="any" min="0"/>
                    </div>
                    <Button type="submit" className="w-full">Create Coupon</Button>
                </form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Send Coupon to Customer</CardTitle>
                <CardDescription>Email a discount code directly to a customer.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...sendForm}>
                <form onSubmit={sendForm.handleSubmit(onSendSubmit)} className="space-y-6">
                  <FormField
                    control={sendForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Email</FormLabel>
                        <FormControl>
                          <Input placeholder="customer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={sendForm.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a coupon to send" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(coupons).map(([code, discount]) => (
                              <SelectItem key={code} value={code}>
                                {code} ({discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSending}>
                    {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    {isSending ? 'Sending...' : 'Send Email'}
                  </Button>
                </form>
              </Form>
            </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Active Coupons</CardTitle>
            <CardDescription>A list of all available discount codes.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Source</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {Object.entries(coupons).map(([code, discount]) => (
                          <TableRow key={code}>
                              <TableCell className="font-mono font-semibold">{code}</TableCell>
                              <TableCell className="capitalize">{discount.type}</TableCell>
                              <TableCell>
                                  {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                              </TableCell>
                              <TableCell>
                                <Badge variant={discount.isMock ? 'secondary' : 'default'}>
                                    {discount.isMock ? 'System' : 'Custom'}
                                </Badge>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

    </div>
  );
}
