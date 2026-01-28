# MycoStrain Explorer v4.1: Deployment & Architecture Guide

## 🔬 Project Overview
MycoStrain Explorer is a high-precision bioinformatics dashboard designed for computational mycologists. It leverages the **Gemini 3 Pro** model to synthesize genomic haplotypes, ecological niches, and entomological associations.

---

## 🏗️ Technical Architecture

### 1. Data Synthesis Flow
1. **User Input**: Species and focus area are sent to `geminiService.ts`.
2. **AI Inference**: Gemini 3 Pro acts as a Senior Computational Mycologist, returning a structured JSON schema.
3. **Grounding**: Uses Google Search grounding to verify research and provide source URLs.
4. **Visualization**: Raw JSON is parsed by D3.js engines:
   - **StrainMap**: Mercator projection on a "Steel Silhouette" Continental USA.
   - **NetworkGraph**: Force simulation modeling genetic distance.

### 2. Security & API Protocols
- **API Key Handling**: Relies on `process.env.API_KEY`. In Google AI Studio/Cloud Run, this is injected automatically.
- **Statelessness**: No user data is stored server-side.
- **Response Extraction**: ⚠️ **CRITICAL**: Use `response.text` as a getter property. Calling `response.text()` as a function will cause a runtime crash.

---

## ☁️ Google Cloud Run & Deployment Hardening

### 1. Dependency Management (The "Lockfile Trap")
*   **Issue**: Cloud Buildpacks use `npm ci` if `package-lock.json` is present, which often fails due to version mismatches or CDN-based imports.
*   **Protocol**: Add `package-lock.json` to `.gitignore`. This forces the builder to use a resilient `npm install`.

### 2. Importmap Management
*   **Current Architecture**: This project currently uses a **Browser-Native ESM** approach with `<script type="importmap">`.
*   **Production Transition**: If you move to a Vite-based bundle:
    *   **REMOVE** the `importmap` from `index.html`. Vite manages dependencies via `package.json`.
    *   Keeping both leads to "Multiple versions of React" errors and Hook failures.

### 3. Build Integrity
*   **Tag Integrity**: Ensure all `<style>` and `<script>` tags are closed. Truncated files cause `eof-in-element` failures in Cloud Build.
*   **Environment Variables**: The variable in Cloud Run must be named exactly `API_KEY`.

---

## 🚀 Deployment Instructions

### Local Development
1. Serve the root directory using a local server (e.g., `npx serve .`).
2. Ensure `process.env.API_KEY` is accessible.

### Production (Google Cloud Run)
1. **Service Type**: "Continuously deploy from a source repository".
2. **Build Type**: **Google Cloud Buildpacks** (No-Dockerfile method).
3. **Variables**: Add `API_KEY` in the "Variables & Secrets" tab before the first build.
4. **Region**: `us-central1` or `us-west1` for best AI feature availability.

---

## 🔍 Troubleshooting Common Errors

| Error | Cause | Solution |
| :--- | :--- | :--- |
| **White Screen / Hooks Error** | Duplicate React versions | Delete the `importmap` if using a bundler. |
| **403 / Blocked Request** | Host mismatch | Set `allowedHosts: true` in vite config. |
| **Build Failure: eof-in-element** | Unclosed HTML tags | Check `index.html` for unclosed script/style tags. |
| **npm ci failed** | Strict lockfile mismatch | Delete `package-lock.json` and repush. |
| **TypeError: .text is not a function** | Incorrect API call | Ensure you access `response.text` as a property. |

---
**Version**: 4.1.0  
**Status**: Production Ready  
**Bioinformatics Standard**: MYCO-V4.1