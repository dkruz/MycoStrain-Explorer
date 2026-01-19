# Deployment Guide: MycoStrain Explorer

To share this webapp with your colleagues at a public URL, follow these steps:

## 1. Prepare your Repository
Move these files into a GitHub repository. Ensure your `process.env.API_KEY` is not hardcoded in the files.

## 2. Choose a Hosting Provider
We recommend **Vercel** or **Netlify**.
- Connect your GitHub account.
- Select the MycoStrain Explorer repository.
- **Important:** In the "Environment Variables" settings, add a key named `API_KEY` and paste your Google Gemini API key as the value.

## 3. Public URL
Once the build is complete, the provider will give you a URL (e.g., `https://myco-strain-explorer.vercel.app`) which you can share on social media.

## 4. Addressing Biochemistry Questions (FAQ)
If colleagues ask about the data source, you can use this standardized response:
> "The biochemistry data is generated using a predictive genomic model. The system uses Google Search grounding to identify regional clades and host associations from real-time records (iNaturalist/GBIF), then applies biochemical inference based on established mycological literature to reconstruct the most likely secondary metabolite profile for that specific environment."
