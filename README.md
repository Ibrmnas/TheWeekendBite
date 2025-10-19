# The Weekend Bite — Orders to Google Sheets (Option B)

This version posts orders from **order.html** to **Google Sheets** (via Apps Script) and emails your business Gmail.

## 1) Create the Google Sheet
- Create a new Google Sheet named **Orders**.
- Add a tab also named **Orders** with headers in row 1:
  `Timestamp | OrderID | Name | Phone | Address | Items(JSON) | EstimatedTotal | Notes | Language | UserAgent`
- Copy your **Sheet ID** from the URL.

## 2) Apps Script backend
- In the Sheet: **Extensions → Apps Script → New project**.
- Paste code from `apps_script/Code.gs`.
- Replace `YOUR_SHEET_ID_HERE` and `yourbiz@gmail.com`.
- **Deploy → New deployment → Web app** → Execute as: **Me**, Who has access: **Anyone**.
- Copy the **Web App URL**.

## 3) Wire the website
- Open `assets/js/backend.js`, paste the Web App URL into `WB_ENDPOINT`.
- Upload the whole folder to GitHub (Pages enabled).

## 4) Test
- Open `/order.html`, add items, fill details, click **Place Order**.
- Check the Google Sheet and Gmail for the order.

Notes: Honeypot anti-spam included; feel free to add reCAPTCHA if needed.