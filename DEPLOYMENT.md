
# Deployment Guide: MycoStrain Explorer

Follow these steps to move your project from AI Studio to a live public URL.

## 1. Understanding the "Verification Flow"
When you add a collaborator (e.g., `usrx@gmail.com`) as a **Principal** in Google Cloud:
1. **Google Identity:** Google handles the "Log In" process. When your user visits AI Studio, they are already "Verified" if they are logged into that Gmail account.
2. **Project Visibility:** Because you added them to your project, Google allows them to see your project in their "Project Selector" dropdown.
3. **Key Generation:** They are not "proving" their identity to the app; they are using their Google-verified identity to generate a specific API key string that belongs to your project.
4. **App Access:** They paste that key string into the app to "Unlock" the session.

## 2. Best Practices for Collaborators (Send this to them!)
*   **Browser Choice:** When clicking the app link, ensure it opens in a browser where you are logged into the invited Gmail account (`usrx@gmail.com`).
*   **Email Clients:** It does not matter if you use Apple Mail, Outlook, or the Gmail app to receive the invitation link. The verification happens in your **web browser**, not your mail app.
*   **Incognito Windows:** Do not use Incognito/Private mode unless you intend to log into Google manually within that session.
*   **Project Selection:** When creating your key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), if you don't see the project in the dropdown, refresh the page and ensure you are switched to the correct Google Identity.

## 3. GitHub Setup (Version Control)
1. Create a new repository on GitHub.
2. Upload your files (index.html, App.tsx, etc.).
3. **CRITICAL:** Ensure you do not hardcode your API Key string.
4. Create a `.gitignore` file and add `.env` to it.

## 4. Vercel Setup (Hosting)
1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **"Add New"** > **"Project"**.
3. Import your MycoStrain Explorer repository.
4. Before clicking "Deploy", expand the **Environment Variables** section.
5. Add the following:
   - **NAME:** `VITE_API_KEY` (The prefix `VITE_` is essential for the browser to see the key)
   - **VALUE:** `[Paste your Gemini API Key here]`
6. Click **Deploy**.

## 5. Troubleshooting
- **Collaborator Access:** If a user sees "Analysis Failed," ensure they generated their key **after** selecting your project in the dropdown at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
- **Format:** Ensure they are pasting the long alphanumeric string, not the name "Collaborator Key".
