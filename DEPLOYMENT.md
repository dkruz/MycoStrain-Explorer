
# Deployment Guide: MycoStrain Explorer (v2.0)

Version 2.0 uses Google's native **Secure Key Selection** flow. This is the safest way to collaborate.

## 1. How the new "Secure Flow" works
Instead of you sharing your project keys, the app now uses a Google-managed dialog:
1.  **Privacy:** You never see the collaborator's keys; they never see yours.
2.  **No IAM Needed:** You do not need to add the collaborator to your Google Cloud project principals.
3.  **Billing:** The collaborator uses their own billing project.

## 2. Instructions for your Collaborator
To give your collaborator access, simply send them the app URL and these instructions:
1.  **Click "Connect Key":** On the top right of the app.
2.  **Link Project:** A Google popup will appear. Select a Google Cloud project where you have the Gemini API enabled.
3.  **Billing:** Note that the project must have billing enabled (Google provides a free tier, but the project itself must be a "Paid" type project).
4.  **No Setup:** You do not need to visit AI Studio or copy-paste any strings. The app handles the handshake securely.

## 3. GitHub & Hosting
1.  **Repository:** Upload these files to GitHub.
2.  **Vercel/Netlify:** Deploy as a static site.
3.  **No Config:** You do not need to set any environment variables on your hosting provider. The user-provided key will be used for all sessions.
