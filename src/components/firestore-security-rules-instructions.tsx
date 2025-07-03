
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function FirestoreSecurityRulesInstructions() {
    return (
        <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
                <p>Your Firestore Security Rules are blocking access to the transactions data. For this demo application, you can allow access by updating your rules in the Firebase Console.</p>
                <p className="mt-2"><strong>1. Go to Firestore Database &gt; Rules tab in the Firebase Console.</strong></p>
                <p><strong>2. Replace the existing rules with the following:</strong></p>
                <pre className="mt-2 p-2 bg-muted rounded-md text-xs font-mono whitespace-pre-wrap">
                    {`rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // WARNING: Insecure rules, for demo purposes only.
    match /transactions/{transactionId} {
      allow read, write: if true;
    }
  }
}`}
                </pre>
                <p className="mt-2"><strong>3. Click "Publish" and refresh this page.</strong></p>
            </AlertDescription>
        </Alert>
    );
}
