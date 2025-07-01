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

### For Production Deployment

When you publish your app, do not include the `.env.local` file. Instead, set the `GOOGLE_API_KEY` as an environment variable (or "secret") in your hosting provider's project settings (e.g., Firebase App Hosting, Vercel, Netlify). This securely enables the AI features in your live application.
