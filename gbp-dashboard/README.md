# GBP Review Dashboard

A live web dashboard for tracking Google Business Profile reviews across all Local Handyman territories.

![Dashboard](https://img.shields.io/badge/status-live-brightgreen) ![GBP API](https://img.shields.io/badge/Google%20Business-API%20v4-blue)

## How It Works

```
Google Business Profile API  →  Google Sheet  →  Apps Script  →  Dashboard (HTML served by Apps Script)
```

1. **Apps Script** pulls review data from the GBP API into your Google Sheet
2. The **HTML dashboard** is served directly by Apps Script via `google.script.run`, calling server-side functions to read sheet data
3. Dashboard renders the data — sorted by review count, color-coded by status

## Setup

### Step 1 — Update the Apps Script

1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Replace your existing `Code.gs` with the contents of [`apps-script/Code.gs`](apps-script/Code.gs)
4. Add the dashboard HTML as a new file in Apps Script:
   - In the Apps Script editor, click **+** next to Files → **HTML**
   - Name it `Dashboard`
   - Paste the contents of [`dashboard/index.html`](dashboard/index.html)
5. Save

### Step 2 — Deploy as a Web App

1. In the Apps Script editor, click **Deploy → New deployment**
2. Click the gear icon → select **Web app**
3. Set:
   - **Description**: `GBP Dashboard`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone within [your organization]`
4. Click **Deploy**

### Step 3 — Open the Dashboard

- Open the deployed web app URL — no additional configuration needed
- The dashboard uses `google.script.run` to communicate with the server, so no external URL configuration is required

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

- **Reload Dashboard** — calls `getSheetData()` to read current sheet data (instant)
- **Pull Fresh Reviews** — calls `refreshAndGetData()` which hits the GBP API for every location first, then returns fresh data (takes 15–30 seconds depending on how many territories you have)

## Adding New Territories

1. Add the new territory to your Google Sheet (columns A–E)
2. The dashboard will automatically pick it up on next reload — no code changes needed

## File Structure

```
gbp-dashboard/
├── apps-script/
│   └── Code.gs          # Google Apps Script (paste into your sheet)
├── dashboard/
│   └── index.html       # The web dashboard (served by Apps Script)
└── README.md
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Could not load data" | Make sure both `Code.gs` and `Dashboard.html` are in your Apps Script project |
| "No OAuth access" on refresh | Open the Google Sheet and run **GBP Dashboard → Authorize GBP** from the menu |
| Data looks stale | Click **Pull Fresh Reviews** to trigger a live GBP API call |
| Dashboard won't load | Verify the web app is deployed and you have access within your organization |
