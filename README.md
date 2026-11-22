# Royal Enfield Hunter 350 – Smart Fuel Tracker & Mileage Dashboard (PWA)

A production-ready, mobile-first Progressive Web App (PWA) designed for your **Royal Enfield Hunter 350 Graphite Grey (2026 Model)**.

All records and parameters are **100% user-defined** (no fake or hardcoded values). It uses **zero backend databases**—all fuel records are stored privately in your phone/browser and can be exported as a JSON backup at any time.

---

## 🚀 Instant Deployment to Render (Zero Database Required)

Deploying to [Render.com](https://render.com) gives you a live permanent URL (e.g. `https://hunter-fuel-tracker.onrender.com`) that you can open and install on your phone **from anywhere, anytime**.

### Step 1: Push Project to GitHub / GitLab
Open PowerShell in this project folder:
```powershell
cd "C:\Users\JEEVALAKSHMI R\.gemini\antigravity\scratch\hunter-fuel-tracker"
git add .
git commit -m "Hunter 350 Fuel Tracker PWA"
```
Create a new repository on your GitHub (e.g. `hunter-fuel-tracker`) and push:
```powershell
git remote add origin https://github.com/<your-username>/hunter-fuel-tracker.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy on Render

#### Option A: Render Static Site (Recommended — 100% Free Forever & Instant)
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Static Site**.
3. Connect your `hunter-fuel-tracker` GitHub repository.
4. Fill in the following fields:
   - **Name:** `hunter-fuel-tracker` (or your preferred name)
   - **Branch:** `main`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. Under **Advanced** $\rightarrow$ **Rewrite Rules**, add:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(Render will automatically pick up `render.yaml` if you use Blueprint!)*
6. Click **Create Static Site**.
7. In ~60 seconds, Render will provide your live HTTPS URL: `https://hunter-fuel-tracker.onrender.com`.

---

#### Option B: Render Web Service (If you choose Web Service)
1. In Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your repo and set:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
3. Click **Create Web Service**.

---

## 📱 How to Use on Your Phone Anywhere
1. Open your Render URL (`https://your-app.onrender.com`) in **Chrome** (Android) or **Safari** (iPhone).
2. Install as Native App:
   - **Android:** Tap **Install Hunter 350 App** from the banner or menu $\rightarrow$ **Add to Home screen**.
   - **iPhone:** Tap the **Share** button $\rightarrow$ **Add to Home Screen** $\rightarrow$ **Add**.
3. It launches full-screen like a native app.
4. **All data stays on your phone** via local storage. No database is needed, no sign-in required, and it functions even when offline at petrol pumps.

---

## 🔒 100% User-Defined Data (Zero Hardcoded Values)
- **Starts Clean:** The app starts with 0 refuel entries. No pre-seeded dummy records.
- **Dynamic Odometer:** You set your own starting odometer when logging your first refill.
- **Dynamic Prices:** Prices are entered by you (the app remembers your last entered price for convenience).
- **Customizable Profile:** You can edit the registration number, tank capacity (default 13L for Hunter 350), and model year in the Settings tab anytime.
- **Full Data Portability:** Export your JSON backup anytime via mobile share sheet (WhatsApp, Google Drive, iCloud, Files) and import it on any new device.

---

## 💻 Local Running (Optional)
```powershell
cd "C:\Users\JEEVALAKSHMI R\.gemini\antigravity\scratch\hunter-fuel-tracker"
npm run dev -- --host
```
Open the printed Network IP on your mobile phone on the same Wi-Fi.

### Run Tests:
```powershell
npm test
```
Runs mathematical validation on consecutive full-tank intervals, partial refill handling, and weighted averages.
