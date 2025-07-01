# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Setup for AI Features

This application uses Google's Generative AI. To enable the AI-powered features (like product recommendations, style analysis, and the virtual fitting room), you need to provide a Google AI API key.

1.  **Get an API Key:** Obtain your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

2.  **Create an Environment File:** In the root directory of your project, create a new file named `.env.local`.

3.  **Add the API Key:** Open the `.env.local` file and add your API key like this:

    ```
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Deployment:** When you deploy your application to a hosting provider (like Vercel, Netlify, or Firebase App Hosting), you must also set the `GOOGLE_API_KEY` as an environment variable in your provider's project settings. This ensures the AI features will work in your live application.
