# Firebase Studio

This is a NextJS starter in Firebase Studio.

## How to Enable AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide your Google AI API key as a secure credential. The method differs for local development and production deployment.

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

When you deploy your app to Firebase App Hosting, you must configure your API key as a secret in Google Cloud Secret Manager. This keeps your key secure and makes it available to your deployed application as an environment variable.

Your `apphosting.yaml` file is already configured to look for a secret named `GOOGLE_API_KEY`. You just need to create the secret and set its value using the gcloud CLI.

**Prerequisites:**
- You have the [gcloud CLI](https://cloud.google.com/sdk/docs/install) and [Firebase CLI](https://firebase.google.com/docs/cli) installed and authenticated.
- You have set your active Google Cloud project (`gcloud config set project YOUR_PROJECT_ID`).

**Steps to configure your secret:**

1.  **Create the Secret:**
    Run the following command in your terminal to create a new secret.
    ```bash
    gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"
    ```

2.  **Set the Secret's Value:**
    Now, add your API key as the value for the secret you just created. Replace `YOUR_KEY_HERE` with your actual Google AI API key.
    ```bash
    echo -n "YOUR_KEY_HERE" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-
    ```

3.  **Deploy Your App:**
    Deploy your application as usual using the Firebase CLI.
    ```bash
    firebase deploy
    ```

That's it! App Hosting will automatically grant the necessary permissions and make the `GOOGLE_API_KEY` available to your running application.
