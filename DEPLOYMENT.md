
# Deployment Guide: MycoStrain Explorer

Follow these steps to move your project from AI Studio to a live public URL.

## 1. GitHub Setup (Version Control)
1. Create a new repository on GitHub.
2. Upload your files (index.html, App.tsx, etc.).
3. **CRITICAL:** Ensure you do not hardcode your API Key string.
4. Create a `.gitignore` file and add `.env` to it.

## 2. Vercel Setup (Hosting)
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New"** > **"Project"**.
3. Import your MycoStrain Explorer repository.
4. Before clicking "Deploy", expand the **Environment Variables** section.
5. Add the following:
   - **NAME:** `VITE_API_KEY` (The prefix `VITE_` is essential for the browser to see the key)
   - **VALUE:** `[Paste your Gemini API Key here]`
6. Click **Deploy**.

## 3. Troubleshooting "Analysis Failed"
- If you see an error after deploying, check your Vercel logs. 
- Ensure you renamed the key to `VITE_API_KEY` and did a **Full Redeploy** (Vercel > Deployments > Redeploy).
- Ensure your Google Cloud restriction allows the specific Vercel URL.
