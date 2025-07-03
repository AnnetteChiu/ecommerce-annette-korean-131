import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Home, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ThankYouPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-green-100 dark:bg-green-900/50 rounded-full h-16 w-16 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-3xl font-headline">Thank You for Your Order!</CardTitle>
          <CardDescription>
            Your order has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>This is a demo application</AlertTitle>
              <AlertDescription>
                In a real application, a confirmation email would be sent to you. Since this is a demonstration, no email has been sent.
              </AlertDescription>
            </Alert>
          <Button asChild>
            <Link href="/">
              <Home className="mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
