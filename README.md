<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

![CI](https://github.com/your-username/your-repo/actions/workflows/check.yml/badge.svg)
![Build](https://github.com/your-username/your-repo/actions/workflows/quality.yml/badge.svg)

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/39ddad59-b7fd-4c0a-b456-5b13ff2d6e52

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Automation

This repository uses GitHub Actions for:
- continuous integration and build validation
- secure dependency scanning
- automated deployment to GitHub Pages
- dependency update automation via Dependabot
