
# Deployment Guide: MycoStrain Explorer (v2.0)

Version 2.0 uses Google's native **Secure Key Selection** flow. This is the safest way to collaborate and protects your personal API keys from exposure.

## 1. How the "Secure Flow" works
This app follows the "Bring Your Own Key" (BYOK) architecture:
1.  **Code Hosting:** Vercel/Netlify only hosts the visual interface. It **never** sees or stores any API keys.
2.  **Privacy:** You never see the collaborator's keys; they never see yours.
3.  **Security:** All API communication happens directly between the user's browser and Google.

## 2. Instructions for your Collaborator
To give your collaborator access, send them the live URL and these steps:
1.  **Click "Connect Key":** Found in the top-right corner of the app.
2.  **Link Project:** A secure Google popup will appear. Select any Google Cloud project you own.
3.  **Billing:** The selected project must have billing enabled (Google's free tier still requires a "Paid" project type to work with external apps).
4.  **Independence:** You do not need to be added to the owner's Google Cloud project or visit AI Studio.

## 3. GitHub & Hosting (For the Owner)
1.  **Repository:** Push your project files to a private or public GitHub repo.
2.  **Vercel/Netlify:** Connect the repo and deploy as a "Static Site".
3.  **Zero Environment Variables:** Do **not** add any API keys to the Vercel dashboard. The app is designed to get the key directly from the person using it via the "Connect Key" button.
