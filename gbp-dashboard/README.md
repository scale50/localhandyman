# GBP Review Dashboard

A live web dashboard for tracking Google Business Profile reviews across all Local Handyman territories.

![Dashboard](https://img.shields.io/badge/status-live-brightgreen) ![GBP API](https://img.shields.io/badge/Google%20Business-API%20v4-blue)

## How It Works

```
Google Business Profile API  →  Google Sheet  →  Apps Script Web App  →  Dashboard (HTML)
```

1. **Apps Script** pulls review data from the GBP API into your Google Sheet
2. The script also serves the sheet data as **JSON** via a `doGet()` web app endpoint
3. The **HTML dashboard** fetches that JSON and renders it — sorted by review count, color-coded by status

## Setup

### Step 1 — Update the Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace your existing `Code.gs` with the contents of [`apps-script/Code.gs`](apps-script/Code.gs)
4. Save

### Step 2 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon → select **Web app**
3. Set:
   - **Description**: `GBP Dashboard API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone within [your organization]`
4. Click **Deploy**
5. **Copy the Web app URL** — it looks like:
   ```
   https://script.google.com/a/macros/yourdomain.com/s/AKfycb.../exec
   ```

### Step 3 — Configure the Dashboard

1. Open [`dashboard/index.html`](dashboard/index.html)
2. Find this line near the top of the `<script>` section:
   ```js
   const APPS_SCRIPT_URL = 'YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace with your actual URL from Step 2
4. Save the file

### Step 4 — Open the Dashboard

- Open `index.html` in any browser — it just works, no server needed
- Or host it on GitHub Pages, Netlify, or any static host

## Dashboard Features

| Feature | Description |
|---------|-------------|
| **Auto-sorted** | Territories ranked by review count (descending) |
| **Color-coded status** | 🟢 Good · 🟡 Below 4.5 rating · 🟠 No reviews |
| **KPI cards** | Total reviews, org-wide avg rating, active territory count |
| **Reload Dashboard** | Re-fetches cached sheet data (fast) |
| **Pull Fresh Reviews** | Triggers GBP API refresh, then loads updated data |
| **Auto-load** | Dashboard fetches data automatically on open |
| **Responsive** | Works on desktop, tablet, and mobile |

## Two Refresh Modes

- **Reload Dashboard** — reads current sheet data (instant)
- **Pull Fresh Reviews** — calls `updateReviews()` on the server first, which hits the GBP API for every location, then returns fresh data (takes 15–30 seconds depending on how many territories you have)

## Adding New Territories

1. Add the new territory to your Google Sheet (columns A–E)
2. The dashboard will automatically pick it up on next reload — no code changes needed

## File Structure

```
gbp-dashboard/
├── apps-script/
│   └── Code.gs          # Google Apps Script (paste into your sheet)
├── dashboard/
│   └── index.html       # The web dashboard (single file, no dependencies)
└── README.md
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Could not connect to data source" | Check that `APPS_SCRIPT_URL` is correct and the web app is deployed |
| CORS errors | Make sure you deployed as a web app (not just saved). Redeploy if needed |
| "No OAuth access" on refresh | Open the Google Sheet and run **GBP Dashboard → Authorize GBP** from the menu |
| Data looks stale | Click **Pull Fresh Reviews** to trigger a live GBP API call |
