# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Enable AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide your Google AI API key.

### For Local Development & Production

1.  **Generate your key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click the **"Create API key"** button to get your new key.

2.  **Add your key to the configuration file:**
    *   Open the file at `src/ai/config.ts`.
    *   In that file, replace the placeholder string `YOUR_GOOGLE_API_KEY_HERE` with your actual API key.
    
    ```typescript
    // src/ai/config.ts
    export const GOOGLE_API_KEY = 'PASTE_YOUR_KEY_HERE'; 
    ```

3.  **Restart your app:** Stop and restart the local development server for the changes to take effect.

That's it! All AI features will now be enabled everywhere the app is run.
