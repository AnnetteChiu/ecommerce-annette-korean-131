
# Firebase Studio E-Commerce Starter

This is a Next.js starter application for Firebase Studio, demonstrating a modern e-commerce experience with integrated AI features.

## 🚀 Getting Started

1.  **Install dependencies:**
    ```
    npm install
    ```

2.  **Run the development server:**
    ```
    npm run dev
    ```

3.  Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## ✨ Enabling AI Features

This application includes advanced AI features powered by Google's Generative AI. To turn them on, you need to provide your Google AI API key. The setup depends on your environment.

### 1. For Local Development

For running the app on your local machine:

1.  **Get Your Key:** Generate a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Create `.env.local`:** Create a file named `.env.local` in the project's root directory.
3.  **Add the Key:** Add the following line to the file, replacing `YOUR_API_KEY_HERE` with the key you just copied:
    ```env
    GOOGLE_API_KEY="YOUR_API_KEY_HERE"
    ```
4.  **Restart:** Stop and restart your development server (`npm run dev`) for the change to take effect.

You can also find instructions for testing specific AI features by running the app and navigating to the `/docs` page.

### 2. For Production Deployment

When you deploy your site to Firebase App Hosting, the API key must be stored securely in Google Cloud Secret Manager. Your `apphosting.yaml` file is already configured to use this secret. This makes the key available to your application on the server, so your end-users will not need to provide their own keys.

**Prerequisites:**
Before you begin, you must complete the following setup steps on your local machine. The `gcloud` and `firebase` commands below will not work until you do.

1.  **Install Google Cloud SDK:** You must first install the command-line tools.
    - [**Click here to follow the official installation guide for the Google Cloud SDK.**](https://cloud.google.com/sdk/docs/install)
    - **Important:** After installation, you must **close and reopen your terminal** for the `gcloud` command to be recognized.

2.  **Install Firebase CLI:** You will also need the Firebase command-line tools to deploy your app.
    - **Run this command in your terminal:** `npm install -g firebase-tools`
    - **Important:** If you've previously installed it, make sure it's up to date (`npm update -g firebase-tools`).

3.  **Login to Google Cloud:** Once the SDK is installed, authenticate with Google Cloud by running this command in your terminal:
    ```
    gcloud auth login
    ```

4.  **Set Your Project:** Configure the gcloud CLI to use your project ID with:
    ```
    gcloud config set project gen-lang-client-0049357498
    ```
5.  **Enable Secret Manager API:** Enable the API by running `gcloud services enable secretmanager.googleapis.com` or by visiting [this link in the Cloud Console](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).

Follow these steps in your terminal:

1.  **Create the Secret:** This command creates a container for your key.
    ```
    gcloud secrets create GOOGLE_API_KEY --replication-policy="automatic"
    ```
2.  **Add Your Key as a Secret Version:** Replace `YOUR_API_KEY_HERE` with your actual Google AI API key.
    ```
    echo -n "YOUR_API_KEY_HERE" | gcloud secrets versions add GOOGLE_API_KEY --data-file=-
    ```
3.  **Deploy Your App:** Now you can deploy your application. Firebase App Hosting will automatically make the secret available to your app as an environment variable.
    ```
    firebase deploy
    ```
