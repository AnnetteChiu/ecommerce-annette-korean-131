# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Enable AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide your Google AI API key as an environment variable. This is a secure method that keeps your key safe.

### For Local Development

1.  **Generate your key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click the **"Create API key"** button to get your new key.

2.  **Create a `.env.local` file:**
    *   In the root directory of your project, create a new file named `.env.local`.

3.  **Add your key to the file:**
    *   Open `.env.local` and add the following line, replacing `YOUR_KEY_HERE` with the key you generated:
    ```bash
    GOOGLE_API_KEY="YOUR_KEY_HERE"
    ```

4.  **Restart your app:** Stop and restart the local development server for the changes to take effect.

That's it! All AI features will now be enabled for your local development environment.

### For Production (Firebase App Hosting)

When you deploy your app to Firebase App Hosting, you'll need to configure your API key as a secret. Please refer to the official [Firebase App Hosting documentation on managing secrets](https://firebase.google.com/docs/app-hosting/configure#manage-secrets) for detailed instructions.
