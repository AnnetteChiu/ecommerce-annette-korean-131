# Firebase Studio

This is a NextJS starter in Firebase Studio. To get started, take a look at `src/app/page.tsx`.

## How to Enable AI Features (Optional)

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide a Google AI API key. The app is fully functional without it.

### For Local Development

1.  **Generate your key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click the **"Create API key"** button to get your new key.

2.  **Set up your environment:**
    *   In the root directory of your project, create a new file named `.env.local`.
    *   Add your API key to this file like so:
        ```
        GOOGLE_API_KEY=YOUR_API_KEY_HERE
        ```

3.  **Restart your app:** Stop and restart the local development server for the changes to take effect.

### For Production Deployment on Firebase App Hosting

When you deploy your application, your `.env.local` file is **not** included for security reasons. To enable AI features in your live app for all your users, you must securely provide your API key as a "secret" in your Firebase project.

Your application is already configured to use this secret via the `apphosting.yaml` file.

**Your Action Required:**

1.  **Go to the Firebase Console** and select your project.
2.  Navigate to the **App Hosting** section from the "Build" menu.
3.  Find your backend and go to its settings.
4.  In the **Secrets** tab, click **Create secret**.
5.  For the "Secret name," enter exactly: `GOOGLE_API_KEY`
6.  Paste your API key into the "Secret value" field.
7.  Click **Create secret** and save your changes.
8.  **Redeploy your app.**

After redeploying, your live application will have access to the key, and all AI features will be enabled for your users.
