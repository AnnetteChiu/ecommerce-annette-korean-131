# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Enable AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide a Google AI API key using an environment variable. This is a secure practice that keeps your key safe.

### For Local Development

1.  **Generate your key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click the **"Create API key"** button to get your new key.

2.  **Create a `.env.local` file:**
    *   In the root directory of your project, create a new file named `.env.local`. This file is ignored by version control, so your key will not be exposed.

3.  **Add your key to the file:**
    *   Open `.env.local` and add the following line, replacing `YOUR_GOOGLE_API_KEY_HERE` with your actual API key:
    ```
    GOOGLE_API_KEY='YOUR_GOOGLE_API_KEY_HERE'
    ```

4.  **Restart your app:** Stop and restart the local development server for the changes to take effect.

### For Production (Firebase App Hosting)

When you deploy your application, you must provide the API key as a secret in your Firebase project.

1.  Go to the **Firebase Console** and open your project.
2.  In the "Build" menu, select **App Hosting**.
3.  Find your backend and click on its name to go to its settings page.
4.  In the **Secrets** tab, click "Create secret".
5.  Enter the exact name: `GOOGLE_API_KEY`.
6.  Paste your API key value into the "Secret value" field.
7.  Click "Create secret" and then "Save changes".
8.  **Redeploy your application.** Your live app will now have secure access to the key.
