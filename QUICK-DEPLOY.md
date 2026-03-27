# ⚡ Quick Deploy - Morabaraba to Vercel

## 🚨 Critical Fix Applied

**Problem:** `vercel.json` had invalid `nodeVersion` property  
**Solution:** Removed `nodeVersion` from `vercel.json` - set it in Dashboard instead

---

## ✅ Pre-Deploy Checklist

```bash
cd C:\Users\motaung\Games-Production\Morabaraba

# 1. Add all changes
git add .

# 2. Commit
git commit -m "fix: Remove invalid nodeVersion from vercel.json"

# 3. Push to GitHub
git push origin main
```

---

## ⚙️ Vercel Dashboard Setup

### Step 1: Create Project
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import `Morabaraba` from GitHub
4. Click **"Import"**

### Step 2: Set Node.js Version ⚠️ **CRITICAL**
Before deploying:

1. Click **"Settings"** (top tabs)
2. Go to **"Build & Development Settings"**
3. Find **"Node.js Version"**
4. Select **`20.x`** from dropdown
5. Click **"Save"**

### Step 3: Deploy
1. Go back to **"Deployments"** tab
2. Click **"Redeploy"** (or deploy the new commit)
3. Wait for build (~2-5 minutes)

---

## 📋 Vercel Settings Summary

| Setting | Value | Where |
|---------|-------|-------|
| Framework | Vite | Auto-detected |
| Build Command | `npm run build` | `vercel.json` |
| Output Directory | `dist` | `vercel.json` |
| Install Command | `npm install` | `vercel.json` |
| **Node.js Version** | **`20.x`** | **Dashboard Settings** ⚠️ |

---

## ✅ Success Indicators

- [ ] Deployment shows green checkmark ✓
- [ ] Site URL loads (e.g., `morabaraba-*.vercel.app`)
- [ ] Game is playable
- [ ] No console errors

---

## 🔧 If Build Fails

### Error: "Unsupported engine"
**Fix:** Set Node.js version to `20.x` in Dashboard (see Step 2 above)

### Error: "Cannot find module"
**Fix:** Ensure `package-lock.json` is committed to GitHub

### Error: "lightningcss..."
**Fix:** Delete `node_modules`, run `npm install`, commit new `package-lock.json`

---

## 📁 Files Ready to Commit

```
✅ vercel.json              (fixed - removed nodeVersion)
✅ .npmrc                   (npm config)
✅ .nvmrc                   (Node version hint)
✅ package.json             (updated dependencies)
✅ package-lock.json        (MUST COMMIT!)
✅ public/icons/*.png       (PWA icons)
✅ generate-icons.py        (icon generator)
✅ DEPLOYMENT-GUIDE.md      (full guide)
✅ FIXES-SUMMARY.md         (technical details)
```

---

## 🔗 Quick Links

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Set Node Version:** Settings → Build & Development → Node.js Version
- **Deployment Logs:** Click on deployment → View Build Logs

---

**Status:** ✅ Ready to Deploy  
**Last Updated:** March 27, 2026
