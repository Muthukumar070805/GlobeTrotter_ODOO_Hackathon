
# GlobeTrotter - AI-Powered Travel Planning App

An intelligent travel planning application powered by Google's Gemini AI, built for the ODOO Hackathon.

**🔗 Repository:** [github.com/Muthukumar070805/GlobeTrotter_ODOO_Hackathon](https://github.com/Muthukumar070805/GlobeTrotter_ODOO_Hackathon)

**🎨 AI Studio:** [View App](https://ai.studio/apps/drive/1iWgZVhyPSTvuMRDzRjn7QMw_LPjs2gNB)

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Set `VITE_GEMINI_API_KEY` to your Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository in Vercel

3. Configure environment variables in Vercel:
   - Go to **Project Settings** → **Environment Variables**
   - Add `VITE_GEMINI_API_KEY` with your Gemini API key

4. Deploy! Vercel will automatically build and deploy your app

## Build for Production

```bash
npm run build
npm run preview
```

The build output will be in the `dist` folder.
