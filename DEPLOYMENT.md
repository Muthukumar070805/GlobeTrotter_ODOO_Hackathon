# 🚀 Vercel Deployment Guide for GlobeTrotter

## Quick Deploy to Vercel

Your app is now ready to deploy! Follow these steps:

### Step 1: Push to GitHub

```bash
# Push your code to GitHub
git push -u origin main
```

If the repository already exists and you need to force push:
```bash
git push -u origin main --force
```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com/new)**

2. **Import your repository:**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Paste: `https://github.com/Muthukumar070805/GlobeTrotter_ODOO_Hackathon`
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add variable:
     - **Name:** `VITE_GEMINI_API_KEY`
     - **Value:** Your Gemini API key from [AI Studio](https://aistudio.google.com/app/apikey)
   - Select all environments: Production, Preview, Development
   - Click "Add"

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Verify Deployment

1. Visit your deployed URL
2. Test the city search functionality to ensure Gemini API is working
3. Check browser console for any errors

---

## Configuration Summary

### Files Created/Modified for Vercel:

✅ **vercel.json** - SPA routing configuration
✅ **vite.config.ts** - Removed custom env injection
✅ **vite-env.d.ts** - TypeScript definitions for env variables
✅ **.env.example** - Environment variable template
✅ **services/geminiService.ts** - Updated to use `import.meta.env.VITE_GEMINI_API_KEY`
✅ **README.md** - Added deployment instructions

### Environment Variables:

- **Local Development:** Set `VITE_GEMINI_API_KEY` in `.env.local`
- **Vercel Production:** Set `VITE_GEMINI_API_KEY` in Vercel Dashboard

---

## Troubleshooting

### Build Fails on Vercel

**Issue:** Build fails with environment variable error

**Solution:** 
- Ensure `VITE_GEMINI_API_KEY` is set in Vercel Environment Variables
- Check that the variable name starts with `VITE_` prefix

### API Calls Fail in Production

**Issue:** Gemini API calls return errors

**Solution:**
- Verify your API key is correct in Vercel settings
- Check API key has proper permissions in Google AI Studio
- Review browser console for specific error messages

### 404 Errors on Page Refresh

**Issue:** Direct navigation to routes returns 404

**Solution:**
- Verify `vercel.json` exists with proper rewrites configuration
- This should already be configured correctly

---

## Next Steps After Deployment

1. **Custom Domain** (Optional):
   - Go to Vercel Dashboard → Settings → Domains
   - Add your custom domain

2. **Enable Analytics**:
   - Vercel Dashboard → Analytics
   - Monitor performance and user behavior

3. **Set up Continuous Deployment**:
   - Already configured! Every push to `main` branch will auto-deploy

---

## Repository Information

- **GitHub:** https://github.com/Muthukumar070805/GlobeTrotter_ODOO_Hackathon
- **Framework:** React + Vite
- **Deployment Platform:** Vercel

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Google AI Studio](https://aistudio.google.com/)
