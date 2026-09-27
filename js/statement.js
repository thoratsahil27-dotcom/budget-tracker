/**
 * Account Statement Generator & Data Exporter
 */
const StatementGenerator = {
  /**
   * Calculate statement details for a given date range
   */
  generateStatement(transactions, startDate, endDate, initialBaseBalance = 100000) {
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2099-12-31');

    // 1. Calculate Opening Balance before start date
    let openingBalance = initialBaseBalance;
    const priorTxns = transactions.filter(t => new Date(t.date) < start);
    for (const t of priorTxns) {
      if (t.type === 'credit') openingBalance += Number(t.amount);
      else openingBalance -= Number(t.amount);
    }

    // 2. Filter transactions in selected period (sorted chronologically ascending for statement)
    const periodTxns = transactions
      .filter(t => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. Compute period subtotals & running balance
    let totalCredits = 0;
    let totalDebits = 0;
    let runningBalance = openingBalance;

    const statementRows = periodTxns.map(t => {
      const amt = Number(t.amount);
      if (t.type === 'credit') {
        totalCredits += amt;
        runningBalance += amt;
      } else {
        totalDebits += amt;
        runningBalance -= amt;
      }

      return {
        ...t,
        runningBalance: runningBalance
      };
    });

    const closingBalance = openingBalance + totalCredits - totalDebits;

    return {
      startDate: startDate || 'Beginning',
      endDate: endDate || 'Present',
      openingBalance,
      totalCredits,
      totalDebits,
      closingBalance,
      transactionCount: periodTxns.length,
      rows: statementRows
    };
  },

  /**
   * Export transactions list as CSV file download
   */
  exportToCSV(transactions, currencySymbol = '₹') {
    if (!transactions || !transactions.length) {
      alert('No transactions available to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Time', 'Merchant/Description', 'Type', 'Category', 'Account', 'Reference No', `Amount (${currencySymbol})`, 'Notes'];
    const csvRows = [headers.join(',')];

    for (const t of transactions) {
      const row = [
        `"${t.id || ''}"`,
        `"${t.date || ''}"`,
        `"${t.time || ''}"`,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        `"${t.type || ''}"`,
        `"${t.category || ''}"`,
        `"${t.account || ''}"`,
        `"${t.refNo || ''}"`,
        t.amount,
        `"${(t.note || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Budget_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Export complete application backup as JSON
   */
  exportFullJSONBackup() {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      transactions: StorageManager.getTransactions(),
      budgets: StorageManager.getBudgets(),
      settings: StorageManager.getSettings()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `BudgetTracker_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
