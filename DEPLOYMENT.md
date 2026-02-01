# MycoStrain Explorer v4.2: Deployment & Architecture Guide

## 🔬 Project Overview
MycoStrain Explorer is a high-precision bioinformatics dashboard designed for computational mycologists. It leverages the **Gemini 3 Pro** model with **Deep Thinking (32k tokens)** to synthesize genomic haplotypes, ancestral origins, and functional ontologies.

---

## 🏗️ Technical Architecture

### 1. Data Synthesis Flow
1. **User Input**: Species and focus area are sent to `geminiService.ts`.
2. **Thinking Inference**: Gemini 3 Pro utilizes its 32,768-token thinking budget to simulate phylogenetic drift and functional trait emergence.
3. **Grounding**: Uses Google Search grounding to verify research and provide source URLs.
4. **Visualization**: Raw JSON is parsed by D3.js and React engines:
   - **StrainMap**: Mercator projection on a "Steel Silhouette" Continental USA.
   - **Evolutionary Timeline**: Temporal sequence of genetic drift in millions of years (Mya).
   - **NetworkGraph**: Force simulation modeling genetic distance.

### 2. Security & API Protocols
- **API Key Handling**: Relies on `process.env.API_KEY`.
- **Statelessness**: No user data is stored server-side.
- **Thinking Config**: Optimized for high-reasoning tasks in mycology.

---

## ☁️ Google Cloud Run & Deployment Hardening

### 1. Dependency Management
*   **Protocol**: Vite manages dependencies via `package.json`. No `importmap` is used in the production build to avoid React version conflicts.

### 2. Build Integrity
*   **Cloud Build**: Uses `CLOUD_LOGGING_ONLY` to avoid logs_bucket configuration errors in new projects.

---

## 🚀 Deployment Instructions

### Local Development
1. Serve the root directory using a local server (e.g., `npm run dev`).

### Production (Google Cloud Run)
1. **Service Type**: "Continuously deploy from a source repository".
2. **Build Type**: **Google Cloud Buildpacks** or Dockerfile.
3. **Variables**: Add `API_KEY` in the "Variables & Secrets" tab before the first build.

---

## 🔍 Troubleshooting Common Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **White Screen / Hooks Error** | Duplicate React versions | Ensure `importmap` is removed from `index.html`. |
| **Invalid Argument (Logs)** | Build logs bucket config | Ensure `cloudbuild.yaml` has `logging: CLOUD_LOGGING_ONLY`. |
| **TypeError: .text is not a function** | Incorrect API call | Ensure you access `response.text` as a property. |

---
**Version**: 4.2.0  
**Status**: Production Ready  
**Bioinformatics Standard**: MYCO-V4.2