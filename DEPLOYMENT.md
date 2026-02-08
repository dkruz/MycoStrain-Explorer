
# MycoStrain Explorer v4.2: Deployment & Architecture Guide

## 🔬 Project Overview
MycoStrain Explorer is a high-precision bioinformatics dashboard designed for computational mycologists. It leverages the **Gemini 3 Pro** model with **Deep Thinking (32k tokens)** to synthesize genomic haplotypes, ancestral origins, and functional ontologies.

---

## 🏗️ Technical Architecture

### 1. Data Synthesis Flow
1. **User Input**: Species and focus area are sent to `geminiService.ts`.
2. **Thinking Inference**: Gemini 3 Pro utilizes its 32,768-token thinking budget to simulate phylogenetic drift and functional trait emergence.
3. **Grounding**: Uses Google Search grounding to verify research and provide source URLs.
4. **Visualization**: Raw JSON is parsed by D3.js and React engines.

### 2. Security & API Protocols
- **API Key Handling**: Relies on `process.env.API_KEY`.
- **Statelessness**: No user data is stored server-side.
- **Vite Definition**: The `vite.config.ts` bakes the environment variable into the static JS bundle at build time.

---

## 🚀 Deployment Instructions

### Option A: Vercel (Static Hosting)
1. **Import Project**: Link your Git repository to Vercel.
2. **Configure Variables**: 
   - Go to **Settings > Environment Variables**.
   - Add a new variable with Key: `API_KEY` and Value: `[Your Google API Key]`.
3. **Redeploy**: If you added the key *after* the first build, you **must** trigger a manual Redeploy in the "Deployments" tab for the key to take effect.

### Option B: Google Cloud Run (Containerized)
1. **Service Type**: "Continuously deploy from a source repository".
2. **Variables**: Add `API_KEY` in the "Variables & Secrets" tab.
3. **Build Integrity**: Ensure `cloudbuild.yaml` is present to handle Secret Manager injection.

---

## 🔍 Troubleshooting Build Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **BUILD_INTEGRITY_FAILURE** | API Key missing at build time | Add `API_KEY` to Vercel/Cloud Run settings and REBUILD. |
| **White Screen** | React Version Conflict | Remove `importmap` from `index.html` for production builds. |
| **403 Forbidden** | Key is restricted | Check Google AI Studio for IP/Domain restrictions on your key. |

---
**Version**: 4.2.0  
**Status**: Production Ready  
**Bioinformatics Standard**: MYCO-V4.2
