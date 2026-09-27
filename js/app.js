/**
 * Main Application Controller - UI Handlers & Reactive Views
 */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeTab: 'dashboard',
  currentCurrency: '₹',
  parsedDrafts: [],

  init() {
    const settings = StorageManager.getSettings();
    this.currentCurrency = settings.currency || '₹';
    this.applyTheme(settings.theme || 'dark');

    this.bindEvents();
    this.renderDashboard();
    this.renderTransactions();
    this.renderBudgets();
    this.renderStatementView();
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  },

  bindEvents() {
    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = link.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Add Transaction Modal Triggers
    const addBtn = document.getElementById('btn-add-txn');
    if (addBtn) {
      addBtn.addEventListener('click', () => this.openModal('modal-add-txn'));
    }

    const modalCloseBtns = document.querySelectorAll('.modal-close, .btn-modal-cancel');
    modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Manual Transaction Form Submission
    const txnForm = document.getElementById('form-add-txn');
    if (txnForm) {
      txnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleManualTxnSubmit(txnForm);
      });
    }

    // SMS Parser Form
    const parseForm = document.getElementById('form-parse-sms');
    if (parseForm) {
      parseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSMSParse();
      });
    }

    // SMS Sample Chip clicks
    document.querySelectorAll('.sms-example-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const sampleText = chip.getAttribute('data-sample');
        const textarea = document.getElementById('sms-input-text');
        if (textarea && sampleText) {
          textarea.value = sampleText;
          this.handleSMSParse();
        }
      });
    });

    // Confirm Import Parsed SMS Button
    const btnImportParsed = document.getElementById('btn-import-parsed');
    if (btnImportParsed) {
      btnImportParsed.addEventListener('click', () => this.importParsedTransactions());
    }

    // Search and Filter Listeners
    const searchInput = document.getElementById('txn-search-input');
    const categoryFilter = document.getElementById('txn-category-filter');
    const typeFilter = document.getElementById('txn-type-filter');

    [searchInput, categoryFilter, typeFilter].forEach(el => {
      if (el) {
        el.addEventListener('input', () => this.renderTransactions());
      }
    });

    // Statement Controls
    const btnGenStatement = document.getElementById('btn-generate-statement');
    if (btnGenStatement) {
      btnGenStatement.addEventListener('click', () => this.renderStatementView());
    }

    const btnExportCSV = document.getElementById('btn-export-csv');
    if (btnExportCSV) {
      btnExportCSV.addEventListener('click', () => {
        StatementGenerator.exportToCSV(StorageManager.getTransactions(), this.currentCurrency);
      });
    }

    const btnPrintStatement = document.getElementById('btn-print-statement');
    if (btnPrintStatement) {
      btnPrintStatement.addEventListener('click', () => window.print());
    }

    // Settings
    const currencySelect = document.getElementById('setting-currency');
    if (currencySelect) {
      currencySelect.value = this.currentCurrency;
      currencySelect.addEventListener('change', (e) => {
        this.currentCurrency = e.target.value;
        const s = StorageManager.getSettings();
        s.currency = this.currentCurrency;
        StorageManager.saveSettings(s);
        this.refreshAll();
        this.showToast('Currency updated to ' + this.currentCurrency, 'success');
      });
    }

    const btnExportBackup = document.getElementById('btn-export-backup');
    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', () => StatementGenerator.exportFullJSONBackup());
    }

    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data to default demo state?')) {
          StorageManager.clearAllData();
          this.refreshAll();
          this.showToast('Data reset to defaults successfully', 'info');
        }
      });
    }
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-page').forEach(p => p.style.display = 'none');

    const activeLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
    const activePage = document.getElementById(`tab-page-${tabId}`);

    if (activeLink) activeLink.classList.add('active');
    if (activePage) activePage.style.display = 'block';

    // Page-specific renders
    if (tabId === 'dashboard') this.renderDashboard();
    if (tabId === 'transactions') this.renderTransactions();
    if (tabId === 'budgets') this.renderBudgets();
    if (tabId === 'statement') this.renderStatementView();
  },

  refreshAll() {
    this.renderDashboard();
    this.renderTransactions();
    this.renderBudgets();
    this.renderStatementView();
  },

  // ------------------------------------------------------------------
  // DASHBOARD RENDERING
  // ------------------------------------------------------------------
  renderDashboard() {
    const transactions = StorageManager.getTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'credit') totalIncome += amt;
      else totalExpense += amt;
    });

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, ((netBalance / totalIncome) * 100)).toFixed(1) : 0;

    // Update Card Elements
    document.getElementById('metric-balance').innerText = `${this.currentCurrency}${netBalance.toLocaleString()}`;
    document.getElementById('metric-income').innerText = `${this.currentCurrency}${totalIncome.toLocaleString()}`;
    document.getElementById('metric-expense').innerText = `${this.currentCurrency}${totalExpense.toLocaleString()}`;
    document.getElementById('metric-savings').innerText = `${savingsRate}%`;

    // Sidebar quick stat
    const quickStat = document.getElementById('sidebar-quick-balance');
    if (quickStat) {
      quickStat.innerText = `${this.currentCurrency}${netBalance.toLocaleString()}`;
    }

    this.renderCategoryChart(transactions);
    this.renderRecentTxnList(transactions.slice(0, 5));
  },

  renderCategoryChart(transactions) {
    const expenses = transactions.filter(t => t.type === 'debit');
    const categoryTotals = {};
    let grandTotal = 0;

    expenses.forEach(t => {
      const cat = t.category || 'Other';
      const amt = Number(t.amount);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      grandTotal += amt;
    });

    const chartContainer = document.getElementById('dashboard-pie-chart');
    const legendContainer = document.getElementById('dashboard-chart-legend');

    if (!chartContainer || !legendContainer) return;

    if (grandTotal === 0) {
      chartContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); margin-top: 4rem;">No expense data available</p>`;
      legendContainer.innerHTML = '';
      return;
    }

    const colors = ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6', '#14b8a6', '#f59e0b', '#64748b'];
    let cumulativePercent = 0;
    const slices = [];
    const legendItems = [];

    const categories = Object.keys(categoryTotals);
    categories.forEach((cat, idx) => {
      const amt = categoryTotals[cat];
      const percent = (amt / grandTotal) * 100;
      const color = colors[idx % colors.length];

      slices.push({ cat, amt, percent, color, startAngle: cumulativePercent * 3.6 });
      cumulativePercent += percent;

      legendItems.push(`
        <div class="legend-item">
          <span class="legend-color" style="background: ${color}"></span>
          <span>${cat}</span>
          <strong>${this.currentCurrency}${amt.toLocaleString()} (${percent.toFixed(0)}%)</strong>
        </div>
      `);
    });

    // Render Donut SVG
    let svgPaths = '';
    let currentDeg = 0;

    slices.forEach(slice => {
      const deg = (slice.percent / 100) * 360;
      const x1 = 50 + 40 * Math.cos(Math.PI * (currentDeg - 90) / 180);
      const y1 = 50 + 40 * Math.sin(Math.PI * (currentDeg - 90) / 180);
      const x2 = 50 + 40 * Math.cos(Math.PI * (currentDeg + deg - 90) / 180);
      const y2 = 50 + 40 * Math.sin(Math.PI * (currentDeg + deg - 90) / 180);
      const largeArc = deg > 180 ? 1 : 0;

      svgPaths += `<path d="M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${slice.color}" opacity="0.95"/>`;
      currentDeg += deg;
    });

    chartContainer.innerHTML = `
      <svg viewBox="0 0 100 100" style="width: 190px; height: 190px; transform: rotate(-90deg); border-radius: 50%;">
        ${svgPaths}
        <circle cx="50" cy="50" r="24" fill="var(--bg-secondary)" />
      </svg>
    `;

    legendContainer.innerHTML = legendItems.join('');
  },

  renderRecentTxnList(recentTxns) {
    const tbody = document.getElementById('recent-transactions-tbody');
    if (!tbody) return;

    if (!recentTxns.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No transactions recorded yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = recentTxns.map(t => `
      <tr>
        <td><strong>${t.merchant}</strong><br><small style="color:var(--text-muted);">${t.date}</small></td>
        <td><span class="badge badge-category">${t.category}</span></td>
        <td><small>${t.account || 'Bank'}</small></td>
        <td><span class="badge ${t.type === 'credit' ? 'badge-credit' : 'badge-debit'}">${t.type.toUpperCase()}</span></td>
        <td style="font-weight:700; color: ${t.type === 'credit' ? 'var(--color-success)' : 'var(--text-primary)'}">
          ${t.type === 'credit' ? '+' : '-'}${this.currentCurrency}${Number(t.amount).toLocaleString()}
        </td>
      </tr>
    `).join('');
  },

  // ------------------------------------------------------------------
  // TRANSACTIONS PAGE RENDERING
  // ------------------------------------------------------------------
  renderTransactions() {
    let transactions = StorageManager.getTransactions();

    const searchVal = (document.getElementById('txn-search-input')?.value || '').toLowerCase();
    const catVal = document.getElementById('txn-category-filter')?.value || '';
    const typeVal = document.getElementById('txn-type-filter')?.value || '';

    if (searchVal) {
      transactions = transactions.filter(t => 
        (t.merchant && t.merchant.toLowerCase().includes(searchVal)) ||
        (t.note && t.note.toLowerCase().includes(searchVal)) ||
        (t.refNo && t.refNo.toLowerCase().includes(searchVal))
      );
    }
    if (catVal) {
      transactions = transactions.filter(t => t.category === catVal);
    }
    if (typeVal) {
      transactions = transactions.filter(t => t.type === typeVal);
    }

    const tbody = document.getElementById('full-transactions-tbody');
    if (!tbody) return;

    if (!transactions.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No transactions match your search filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${t.date}<br><small style="color:var(--text-muted);">${t.time || ''}</small></td>
        <td><strong>${t.merchant}</strong><br><small style="color:var(--text-muted);">${t.refNo || ''}</small></td>
        <td><span class="badge badge-category">${t.category}</span></td>
        <td><span class="badge ${t.type === 'credit' ? 'badge-credit' : 'badge-debit'}">${t.type.toUpperCase()}</span></td>
        <td>${t.account || '-'}</td>
        <td style="font-weight:700; color: ${t.type === 'credit' ? 'var(--color-success)' : 'var(--text-primary)'}">
          ${t.type === 'credit' ? '+' : '-'}${this.currentCurrency}${Number(t.amount).toLocaleString()}
        </td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="App.deleteTxn('${t.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  deleteTxn(id) {
    if (confirm('Delete this transaction entry?')) {
      StorageManager.deleteTransaction(id);
      this.refreshAll();
      this.showToast('Transaction deleted', 'info');
    }
  },

  // ------------------------------------------------------------------
  // SMS PARSER HANDLERS
  // ------------------------------------------------------------------
  handleSMSParse() {
    const rawText = document.getElementById('sms-input-text')?.value;
    if (!rawText || !rawText.trim()) {
      this.showToast('Please paste SMS text or click a sample chip.', 'error');
      return;
    }

    const parsed = MessageParser.parseMessageText(rawText);
    this.parsedDrafts = parsed;

    const previewContainer = document.getElementById('parsed-sms-results');
    const tbody = document.getElementById('parsed-preview-tbody');

    if (!parsed.length) {
      if (previewContainer) previewContainer.style.display = 'block';
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--color-danger);">Could not find valid transaction patterns in input. Try another message format.</td></tr>`;
      return;
    }

    if (tbody) {
      tbody.innerHTML = parsed.map((t, idx) => `
        <tr>
          <td><input type="checkbox" checked data-idx="${idx}" class="sms-select-chk"></td>
          <td>${t.date}</td>
          <td><strong>${t.merchant}</strong></td>
          <td><span class="badge ${t.type === 'credit' ? 'badge-credit' : 'badge-debit'}">${t.type.toUpperCase()}</span></td>
          <td><span class="badge badge-category">${t.category}</span></td>
          <td style="font-weight:700;">${this.currentCurrency}${t.amount.toLocaleString()}</td>
        </tr>
      `).join('');
    }

    if (previewContainer) previewContainer.style.display = 'block';
    this.showToast(`Found ${parsed.length} transaction(s) in SMS message!`, 'success');
  },

  importParsedTransactions() {
    const checkboxes = document.querySelectorAll('.sms-select-chk:checked');
    if (!checkboxes.length) {
      this.showToast('Select at least one transaction to import.', 'error');
      return;
    }

    let count = 0;
    checkboxes.forEach(chk => {
      const idx = parseInt(chk.getAttribute('data-idx'));
      if (this.parsedDrafts[idx]) {
        StorageManager.addTransaction(this.parsedDrafts[idx]);
        count++;
      }
    });

    this.showToast(`Successfully imported ${count} transaction(s)!`, 'success');
    document.getElementById('sms-input-text').value = '';
    document.getElementById('parsed-sms-results').style.display = 'none';
    this.parsedDrafts = [];
    this.refreshAll();
    this.switchTab('transactions');
  },

  // ------------------------------------------------------------------
  // BUDGET MONITOR RENDERING
  // ------------------------------------------------------------------
  renderBudgets() {
    const budgets = StorageManager.getBudgets();
    const transactions = StorageManager.getTransactions();

    // Sum expenses per category
    const actualSpent = {};
    transactions.filter(t => t.type === 'debit').forEach(t => {
      actualSpent[t.category] = (actualSpent[t.category] || 0) + Number(t.amount);
    });

    const budgetListContainer = document.getElementById('budget-progress-list');
    if (!budgetListContainer) return;

    const items = Object.entries(budgets).map(([category, cap]) => {
      const spent = actualSpent[category] || 0;
      const percent = Math.min(100, (spent / cap) * 100);
      
      let statusClass = 'normal';
      let statusBadge = '';

      if (spent > cap) {
        statusClass = 'exceeded';
        statusBadge = `<span class="badge badge-debit">EXCEEDED</span>`;
      } else if (percent >= 80) {
        statusClass = 'warning';
        statusBadge = `<span class="badge" style="background:rgba(245,158,11,0.2); color:#fbbf24;">WARNING (80%+)</span>`;
      }

      return `
        <div class="budget-item card" style="padding: 1rem 1.25rem;">
          <div class="budget-meta">
            <div>
              <span class="budget-category-name">${category}</span>
              ${statusBadge}
            </div>
            <div class="budget-values">
              <strong>${this.currentCurrency}${spent.toLocaleString()}</strong> / ${this.currentCurrency}${cap.toLocaleString()}
            </div>
          </div>
          <div class="progress-bar-bg" style="margin-top: 0.5rem;">
            <div class="progress-bar-fill ${statusClass}" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    });

    budgetListContainer.innerHTML = items.join('');
  },

  // ------------------------------------------------------------------
  // ACCOUNT STATEMENT VIEW RENDERING
  // ------------------------------------------------------------------
  renderStatementView() {
    const startDate = document.getElementById('stmt-start-date')?.value || '';
    const endDate = document.getElementById('stmt-end-date')?.value || '';
    const transactions = StorageManager.getTransactions();

    const stmt = StatementGenerator.generateStatement(transactions, startDate, endDate);

    // Fill Summary Card Elements
    document.getElementById('stmt-opening-bal').innerText = `${this.currentCurrency}${stmt.openingBalance.toLocaleString()}`;
    document.getElementById('stmt-total-credits').innerText = `${this.currentCurrency}${stmt.totalCredits.toLocaleString()}`;
    document.getElementById('stmt-total-debits').innerText = `${this.currentCurrency}${stmt.totalDebits.toLocaleString()}`;
    document.getElementById('stmt-closing-bal').innerText = `${this.currentCurrency}${stmt.closingBalance.toLocaleString()}`;

    const tbody = document.getElementById('statement-table-tbody');
    if (!tbody) return;

    if (!stmt.rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No transactions found in selected period.</td></tr>`;
      return;
    }

    tbody.innerHTML = stmt.rows.map(r => `
      <tr>
        <td>${r.date}</td>
        <td><strong>${r.merchant}</strong></td>
        <td>${r.category}</td>
        <td>${r.refNo || '-'}</td>
        <td style="color:var(--color-success); font-weight:600;">${r.type === 'credit' ? `${this.currentCurrency}${Number(r.amount).toLocaleString()}` : '-'}</td>
        <td style="color:var(--color-danger); font-weight:600;">${r.type === 'debit' ? `${this.currentCurrency}${Number(r.amount).toLocaleString()}` : '-'}</td>
        <td style="font-weight:700;">${this.currentCurrency}${r.runningBalance.toLocaleString()}</td>
      </tr>
    `).join('');
  },

  // ------------------------------------------------------------------
  // MODAL & FORM HANDLERS
  // ------------------------------------------------------------------
  handleManualTxnSubmit(form) {
    const newTxn = {
      id: 'txn_' + Date.now(),
      date: form.date.value || new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      merchant: form.merchant.value.trim(),
      amount: parseFloat(form.amount.value),
      type: form.type.value,
      category: form.category.value,
      account: form.account.value.trim() || 'Cash/Manual',
      refNo: form.refNo.value.trim() || 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
      note: form.note.value.trim()
    };

    StorageManager.addTransaction(newTxn);
    this.closeModals();
    form.reset();
    this.refreshAll();
    this.showToast('Transaction added successfully!', 'success');
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
};
