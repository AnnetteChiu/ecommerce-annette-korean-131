
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export default function DebugEnvPage() {
  const envVars = [
    {
      name: 'GOOGLE_API_KEY',
      isSet: !!process.env.GOOGLE_API_KEY,
      purpose: 'Enables all AI features (recommendations, virtual try-on, etc.).',
      location: 'Found in Google AI Studio.',
    },
    {
      name: 'RESEND_API_KEY',
      isSet: !!process.env.RESEND_API_KEY,
      purpose: 'Allows the application to send transactional emails (e.g., order confirmations).',
      location: 'Found in your Resend dashboard.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      purpose: 'Required for connecting to the Firebase database.',
      location: 'Found in your Firebase project settings.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      purpose: 'Required for Firebase Authentication.',
      location: 'Found in your Firebase project settings.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      purpose: 'Identifies your specific Firebase project.',
      location: 'Found in your Firebase project settings.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      purpose: 'Required for Firebase Storage features.',
      location: 'Found in your Firebase project settings.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      purpose: 'Required for Firebase Cloud Messaging (push notifications).',
      location: 'Found in your Firebase project settings.',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      isSet: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      purpose: 'Identifies your specific web app within Firebase.',
      location: 'Found in your Firebase project settings.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-headline font-bold">Environment Setup Check</h1>
        <p className="text-muted-foreground mt-2">
          This page checks if your environment variables are correctly loaded by the application.
        </p>
      </div>

      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Important!</AlertTitle>
        <AlertDescription>
          After adding or changing any values in your <code>.env.local</code> file, you must **restart your development server** for the changes to take effect.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Key Status</CardTitle>
          <CardDescription>
            This table shows the status of the required API keys. This does not check if the keys are *valid*, only if they have been *set*.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envVars.map((v) => (
                <TableRow key={v.name}>
                  <TableCell className="font-mono text-xs">{v.name}</TableCell>
                  <TableCell>
                    {v.isSet ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700">Set</Badge>
                    ) : (
                      <Badge variant="destructive">Not Set</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <p>{v.purpose}</p>
                    <p className="text-xs text-muted-foreground">{v.location}</p>
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
