# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Enable AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide a Google AI API key directly in the source code.

**SECURITY WARNING:** This method is not recommended for production applications. Exposing an API key in client-side code is a security risk. For a real application, you should use environment variables and server-side secrets.

### For Local Development

1.  **Generate your key:**
    *   Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   Click the **"Create API key"** button to get your new key.

2.  **Add the key to your code:**
    *   Open the file `src/ai/genkit.ts`.
    *   Replace the placeholder `YOUR_GOOGLE_API_KEY_HERE` with your actual API key.

    ```typescript
    // src/ai/genkit.ts
    // ...
    export const ai = genkit({
      plugins: [googleAI({apiKey: "YOUR_GOOGLE_API_KEY_HERE"})], // Add your key here
      model: 'googleai/gemini-2.0-flash',
    });
    ```

3.  **Restart your app:** Stop and restart the local development server for the changes to take effect.
