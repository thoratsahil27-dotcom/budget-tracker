/**
 * Storage Manager Module - LocalStorage Persistence & Initial Seed Data
 */
const StorageManager = {
  KEYS: {
    TRANSACTIONS: 'bt_transactions_v1',
    BUDGETS: 'bt_budgets_v1',
    SETTINGS: 'bt_settings_v1'
  },

  DEFAULT_SETTINGS: {
    currency: '₹',
    theme: 'dark',
    userName: 'Alex Dev'
  },

  DEFAULT_BUDGETS: {
    'Food & Dining': 12000,
    'Shopping': 8000,
    'Transportation': 5000,
    'Utilities & Bills': 6000,
    'Entertainment': 4000,
    'Housing': 25000
  },

  DEFAULT_TRANSACTIONS: [
    {
      id: 'txn_101',
      date: '2026-09-27',
      time: '14:32',
      merchant: 'Starbucks Coffee',
      amount: 450,
      type: 'debit',
      category: 'Food & Dining',
      account: 'HDFC Bank **4821',
      refNo: 'UPI/382910482',
      note: 'Parsed from SMS'
    },
    {
      id: 'txn_102',
      date: '2026-09-26',
      time: '18:15',
      merchant: 'Amazon Superstore',
      amount: 3290,
      type: 'debit',
      category: 'Shopping',
      account: 'ICICI Card **9102',
      refNo: 'REF928103',
      note: 'Electronics & Cables'
    },
    {
      id: 'txn_103',
      date: '2026-09-25',
      time: '09:00',
      merchant: 'TechCorp Salary',
      amount: 75000,
      type: 'credit',
      category: 'Salary',
      account: 'HDFC Bank **4821',
      refNo: 'NEFT/SAL820192',
      note: 'Monthly Payroll Deposit'
    },
    {
      id: 'txn_104',
      date: '2026-09-24',
      time: '20:45',
      merchant: 'Uber Rides',
      amount: 380,
      type: 'debit',
      category: 'Transportation',
      account: 'Paytm Wallet',
      refNo: 'UBER81920',
      note: 'Commute to office'
    },
    {
      id: 'txn_105',
      date: '2026-09-22',
      time: '11:10',
      merchant: 'State Electricity Board',
      amount: 2450,
      type: 'debit',
      category: 'Utilities & Bills',
      account: 'HDFC Bank **4821',
      refNo: 'BILL92019',
      note: 'Monthly Electricity Bill'
    },
    {
      id: 'txn_106',
      date: '2026-09-20',
      time: '19:30',
      merchant: 'Netflix Subscription',
      amount: 649,
      type: 'debit',
      category: 'Entertainment',
      account: 'Axis Card **3310',
      refNo: 'SUB481920',
      note: 'Monthly Premium Plan'
    },
    {
      id: 'txn_107',
      date: '2026-09-18',
      time: '16:00',
      merchant: 'FreshMart Groceries',
      amount: 4820,
      type: 'debit',
      category: 'Food & Dining',
      account: 'HDFC Bank **4821',
      refNo: 'POS91820',
      note: 'Weekly provisions'
    }
  ],

  init() {
    if (!localStorage.getItem(this.KEYS.TRANSACTIONS)) {
      this.saveTransactions(this.DEFAULT_TRANSACTIONS);
    }
    if (!localStorage.getItem(this.KEYS.BUDGETS)) {
      this.saveBudgets(this.DEFAULT_BUDGETS);
    }
    if (!localStorage.getItem(this.KEYS.SETTINGS)) {
      this.saveSettings(this.DEFAULT_SETTINGS);
    }
  },

  getTransactions() {
    try {
      const data = localStorage.getItem(this.KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : this.DEFAULT_TRANSACTIONS;
    } catch (e) {
      console.error('Failed to load transactions:', e);
      return [];
    }
  },

  saveTransactions(transactions) {
    localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  addTransaction(transaction) {
    const transactions = this.getTransactions();
    if (!transaction.id) {
      transaction.id = 'txn_' + Date.now();
    }
    transactions.unshift(transaction);
    this.saveTransactions(transactions);
    return transaction;
  },

  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    this.saveTransactions(transactions);
  },

  getBudgets() {
    try {
      const data = localStorage.getItem(this.KEYS.BUDGETS);
      return data ? JSON.parse(data) : this.DEFAULT_BUDGETS;
    } catch (e) {
      return this.DEFAULT_BUDGETS;
    }
  },

  saveBudgets(budgets) {
    localStorage.setItem(this.KEYS.BUDGETS, JSON.stringify(budgets));
  },

  updateCategoryBudget(category, amount) {
    const budgets = this.getBudgets();
    budgets[category] = Number(amount);
    this.saveBudgets(budgets);
  },

  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.DEFAULT_SETTINGS;
    } catch (e) {
      return this.DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  clearAllData() {
    localStorage.removeItem(this.KEYS.TRANSACTIONS);
    localStorage.removeItem(this.KEYS.BUDGETS);
    localStorage.removeItem(this.KEYS.SETTINGS);
    this.init();
  }
};

// Initialize Storage on file load
StorageManager.init();
