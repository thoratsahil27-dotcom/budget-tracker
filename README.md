# 💳 Smart Budget Tracker with SMS Parser & Statement Generator

An open-source, client-side web application for managing personal finances, automatically reading bank SMS notifications, tracking monthly category budgets, and generating itemized account statements (CSV / PDF / JSON).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Dependencies](https://img.shields.io/badge/dependencies-zero-success.svg)

---

## 🌟 Key Features

- **📱 Automatic Bank SMS & Notification Reader**:
  - Auto-extracts **Amount**, **Merchant/Payee**, **Transaction Type (Debit/Credit)**, **Reference Number**, and **Account info** from SMS text.
  - Supports **UPI**, **Net Banking**, **Debit/Credit Card alerts** (HDFC, ICICI, SBI, Axis, Chase, Amex, PayPal, Paytm, etc.).
  - Batch message import mode allows pasting multiple SMS lines at once.
- **📊 Real-time Financial Dashboard**:
  - Tracks **Net Account Balance**, **Total Income**, **Total Expenses**, and **Savings Rate**.
  - Category breakdown chart (Donut SVG visualization with interactive legend).
  - Recent activity feed.
- **🎯 Monthly Budget Monitors**:
  - Set custom budget caps for Food, Shopping, Transportation, Utilities, Entertainment, Housing, etc.
  - Interactive progress bars with visual alert badges for warning (80%+) and exceeded limits.
- **📄 Account Statement Generator**:
  - Filter transactions by custom date range.
  - Calculates Opening Balance, Period Debits, Period Credits, and Closing Balance.
  - Export options: **CSV statement download**, **Print / Save as PDF**, and **JSON backup**.
- **🔒 100% Private & Offline First**:
  - Operates entirely inside your browser using `LocalStorage`.
  - Zero server calls, no third-party tracking, 100% client-side data security.

---

## 📁 Project File Structure

```
Budget tracker/
├── index.html          # Main Single-Page Application (SPA) layout
├── css/
│   └── styles.css      # Glassmorphic dark mode design system & print stylesheet
├── js/
│   ├── storage.js      # LocalStorage manager & seed demo data
│   ├── parser.js       # Multi-pattern SMS regex parsing engine
│   ├── statement.js    # Statement calculation & CSV/JSON exporter
│   └── app.js          # Main UI controller & reactive event bindings
└── README.md           # Project documentation & GitHub setup guide
```

---

## 🚀 Quick Start Guide

Since this is a lightweight, zero-dependency static application, no Node.js build process is required!

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/budget-tracker.git
   cd budget-tracker
   ```
2. **Open in Browser**:
   - Double-click `index.html` or open with Live Server in VS Code.

---

## 📱 Supported SMS Notification Examples

You can test the parser by copying any of the sample SMS strings below into the **SMS Reader** tab:

```text
1. Sent Rs. 450.00 to STARBUCKS on 27-Sep-26. Ref UPI/382910482. A/c **4821 debited.
2. INR 3,290.00 debited from A/C **4821 at AMAZON SUPERSTORE. Ref928103.
3. Your A/c **4821 has been credited by Rs. 50,000.00 by TECHCORP SALARY. NEFT/SAL820192.
4. Paid $49.99 to Netflix Subscription with card ending 3310.
5. Rs 2,450.00 debited via HDFC NetBanking to State Electricity Board ref BILL92019.
```

---

## 🌐 Deploying to GitHub Pages

To publish your budget tracker live for free using GitHub Pages:

1. Push this repository to GitHub.
2. In your repo, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
4. Set the branch to `main` (or `master`) and directory to `/ (root)`.
5. Click **Save**. Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
