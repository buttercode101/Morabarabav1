# 🚀 Morabaraba - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

Before deploying to Vercel, ensure all files are committed to your GitHub repository.

### Required Files Checklist

- [x] **package.json** - Updated with correct dependencies
- [x] **package-lock.json** - ⚠️ **MUST BE COMMITTED** (critical for Vercel)
- [x] **vercel.json** - Vercel configuration file
- [x] **.npmrc** - npm configuration for consistent installs
- [x] **public/icons/icon-192.png** - PWA icon (192x192)
- [x] **public/icons/icon-512.png** - PWA icon (512x512)
- [x] **public/manifest.json** - PWA manifest
- [x] **vite.config.ts** - Vite configuration
- [x] **tsconfig.json** - TypeScript configuration
- [x] **index.html** - Entry HTML file
- [x] **src/** - All source files

---

## 🔧 Fixes Applied

### 1. Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Purpose:**
- Specifies correct build command and output directory
- Configures security headers and caching

**Note:** Node.js version is set in Vercel Dashboard, not in `vercel.json`:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Build & Development Settings**
3. Set **Node.js Version** to `20.x`

### 2. npm Configuration (`.npmrc`)
```
engine-strict=true
registry=https://registry.npmjs.org/
prefer-offline=true
fund=false
audit=false
```

**Purpose:**
- Ensures consistent dependency installation across platforms
- Enables offline installs when possible
- Reduces npm install noise

### 3. Package Dependencies (`package.json`)
**Changes:**
- Downgraded `@vitejs/plugin-react` from `^5.0.4` to `^4.3.0` (Node 20.18 compatibility)
- Added `terser` for production minification
- Added `engines` field specifying Node version requirement
- Added `generate:icons` script

### 4. PWA Icons
**Generated:**
- `public/icons/icon-192.png` - Android home screen icon
- `public/icons/icon-512.png` - Play Store icon
- `public/icons/icon.svg` - Scalable vector icon

**How to regenerate:**
```bash
python generate-icons.py
# OR
open generate-icons.html  # In browser
```

### 5. Updated `.gitignore`
**Added:**
- Python cache files
- IDE settings
- Additional log files
- OS-specific files

---

## 📤 Deployment Steps

### Step 1: Commit All Changes

```bash
cd C:\Users\motaung\Games-Production\Morabaraba

# Add all new and modified files
git add .

# Commit with descriptive message
git commit -m "fix: Add Vercel deployment configuration and fix build issues

- Add vercel.json with Node.js 20.x configuration
- Add .npmrc for consistent cross-platform installs
- Generate PWA icons (192x192 and 512x512)
- Fix @vitejs/plugin-react version for Node compatibility
- Add terser for production minification
- Update .gitignore with comprehensive exclusions"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `Morabaraba`
4. Vercel will auto-detect it as a Vite project

### Step 3: Configure Build Settings

In Vercel project settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node.js Version** | `20.x` ⚠️ **Set this in Dashboard!** |

> ⚠️ **Important:** Node.js version must be set in the Vercel Dashboard:
> 1. Go to your project in Vercel
> 2. Click **Settings** → **Build & Development Settings**
> 3. Find **Node.js Version** and select `20.x`
> 4. Save changes

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-5 minutes)
3. Check deployment logs for any errors

---

## 🔍 Troubleshooting

### Build Fails with "Cannot find module 'lightningcss...'"

**Cause:** Missing or incorrect native module for Linux

**Solution:**
1. Ensure `package-lock.json` is committed to GitHub
2. Vercel will install the correct Linux native modules automatically

### Build Fails with "Unsupported engine"

**Cause:** Node version mismatch

**Solution:**
1. Check Vercel Node version in project settings
2. Ensure it's set to `20.x`
3. Verify `vercel.json` has `"nodeVersion": "20.x"`

### PWA Icons Not Loading

**Cause:** Missing PNG files or incorrect paths

**Solution:**
1. Verify `public/icons/icon-192.png` and `icon-512.png` exist
2. Check `manifest.json` has correct icon paths
3. Regenerate icons: `python generate-icons.py`

### Build Succeeds but Site is Blank

**Cause:** Incorrect base path or routing issues

**Solution:**
1. Check browser console for errors
2. Verify `vite.config.ts` doesn't have custom `base` setting (should use default `/`)
3. Ensure all assets are in `dist/` after build

---

## 📊 Build Output Verification

After successful build, `dist/` should contain:

```
dist/
├── index.html           (~1 KB)
├── manifest.json        (copied from public/)
├── icons/
│   ├── icon-192.png     (~5-20 KB)
│   └── icon-512.png     (~10-50 KB)
└── assets/
    ├── index-*.css      (~13 KB)
    └── index-*.js       (~317 KB)
```

---

## 🎯 Post-Deployment Checks

After deployment, verify:

- [ ] Site loads without errors
- [ ] Game is playable (test placing, moving, shooting cows)
- [ ] PWA install prompt appears
- [ ] Icons display correctly
- [ ] Mobile responsive design works
- [ ] Sound effects work (if enabled)
- [ ] Local storage saves wins/losses

---

## 📈 Vercel Dashboard URLs

After deployment, you'll have:

- **Production URL:** `https://morabaraba-*.vercel.app`
- **Preview URLs:** For pull request previews
- **Analytics:** View visitor stats
- **Deployments:** View build history

---

## 🛠️ Local Testing Before Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Open http://localhost:4173
```

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-27 | 1.0.0 | Initial Vercel deployment configuration |

---

## 🔗 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this guide's troubleshooting section
3. Search Vercel community forums
4. Check Vite and Tailwind CSS GitHub issues

---

**Last Updated:** March 27, 2026
**Game Version:** 1.0.0
