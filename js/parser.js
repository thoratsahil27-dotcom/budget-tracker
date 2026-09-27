/**
 * SMS & Transaction Message Parser Engine
 * Reads text/SMS bank notification messages and parses structured financial data.
 */
const MessageParser = {
  // Keyword mapping dictionary for auto-categorization
  CATEGORY_KEYWORDS: {
    'Food & Dining': ['starbucks', 'zomato', 'swiggy', 'mcdonald', 'dominos', 'freshmart', 'grocery', 'groceries', 'restaurant', 'cafe', 'food', 'pizza', 'subway', 'dining', 'dunkin'],
    'Shopping': ['amazon', 'flipkart', 'walmart', 'zara', 'myntra', 'nike', 'adidas', 'electronics', 'apple', 'store', 'mall', 'superstore', 'apparel', 'fashion'],
    'Transportation': ['uber', 'ola', 'rapido', 'lyft', 'fuel', 'shell', 'petrol', 'diesel', 'metro', 'transit', 'train', 'irctc', 'cab', 'taxi', 'parking'],
    'Utilities & Bills': ['electricity', 'water', 'gas', 'mobile', 'broadband', 'airtel', 'jio', 'vi', 'recharge', 'power', 'bill', 'bescom', 'utility', 'dth'],
    'Entertainment': ['netflix', 'spotify', 'prime', 'hbo', 'youtube', 'cinema', 'pvr', 'inox', 'steam', 'playstation', 'movie', 'game', 'subscription'],
    'Housing': ['rent', 'landlord', 'society', 'maintenance', 'mortgage', 'apartment'],
    'Salary': ['salary', 'payroll', 'stipend', 'bonus', 'deposit', 'dividend', 'dividend']
  },

  /**
   * Auto-categorize based on merchant or text content
   */
  detectCategory(text, type) {
    if (type === 'credit' && (text.toLowerCase().includes('salary') || text.toLowerCase().includes('payroll'))) {
      return 'Salary';
    }

    const cleanText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(this.CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => cleanText.includes(kw))) {
        return category;
      }
    }
    return type === 'credit' ? 'Income' : 'Other Expenses';
  },

  /**
   * Main parsing entry point - handles single or batch SMS strings
   */
  parseMessageText(rawText) {
    if (!rawText || !rawText.trim()) return [];

    // Split text into individual messages by line breaks or double line breaks
    const rawLines = rawText.split(/\n+/).map(l => l.trim()).filter(l => l.length > 10);
    const parsedResults = [];

    for (const line of rawLines) {
      const parsed = this.parseSingleMessage(line);
      if (parsed) {
        parsedResults.push(parsed);
      }
    }

    return parsedResults;
  },

  /**
   * Parse a single SMS notification line
   */
  parseSingleMessage(msg) {
    // Clean string
    const cleanMsg = msg.replace(/\s+/g, ' ');

    // 1. Detect Amount (e.g., Rs 450.00, Rs.450, INR 1,290.00, $49.99, £15, €20.50)
    const amountRegex = /(?:Rs\.?|INR|\$|£|€)\s*([\d,]+(?:\.\d{1,2})?)|([\d,]+(?:\.\d{1,2})?)\s*(?:INR|Rs)/i;
    const amountMatch = cleanMsg.match(amountRegex);

    if (!amountMatch) {
      return null; // Could not reliably find amount
    }

    const amountStr = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) return null;

    // 2. Detect Transaction Type (Debit vs Credit)
    const isCredit = /(?:credited|received|deposited|added to|refund|credit)/i.test(cleanMsg) &&
                     !/(?:debited|spent|paid|sent to|deducted)/i.test(cleanMsg);
    const type = isCredit ? 'credit' : 'debit';

    // 3. Extract Merchant / Payee
    let merchant = 'Unknown Merchant';
    
    // Pattern A: "to STARBUCKS", "paid to AMAZON", "at STARBUCKS", "from ACME CORP"
    const merchantMatch = cleanMsg.match(/(?:to|at|vpa|paid|from|merchant)\s+([A-Za-z0-9\s&'-]+?)(?=\s+(?:on|via|ref|bal|avail|a\/c|card|\.|$))/i);
    if (merchantMatch && merchantMatch[1].trim().length > 2) {
      merchant = merchantMatch[1].trim();
    } else {
      // Fallback: extract capitalized word sequence
      const capMatch = cleanMsg.match(/([A-Z][A-Za-z0-9&']*(?:\s+[A-Z][A-Za-z0-9&']*){1,3})/);
      if (capMatch && !/Rs|INR|Debit|Credit|Account|Bank|Avail|Total/i.test(capMatch[1])) {
        merchant = capMatch[1].trim();
      }
    }

    // 4. Extract Account / Card info (e.g. A/C **4821, card ending 9102)
    let account = 'Bank Account';
    const accMatch = cleanMsg.match(/(?:a\/c|account|card|vpa)\s*(?:no\.?|ending|xx|\*\*)*\s*([0-9xX*]{4,})/i);
    if (accMatch) {
      account = `Account **${accMatch[1].slice(-4)}`;
    }

    // 5. Extract Reference Number
    let refNo = 'SMS-' + Math.floor(100000 + Math.random() * 900000);
    const refMatch = cleanMsg.match(/(?:ref|upi|txn|id)\.?\s*[:\/#]?\s*([A-Za-z0-9]+)/i);
    if (refMatch) {
      refNo = refMatch[1];
    }

    // 6. Extract or default Date & Time
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Auto-detect Category
    const category = this.detectCategory(cleanMsg + ' ' + merchant, type);

    return {
      id: 'sms_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      date: today,
      time: nowTime,
      merchant: merchant,
      amount: amount,
      type: type,
      category: category,
      account: account,
      refNo: refNo,
      note: 'Parsed from SMS: "' + (cleanMsg.length > 50 ? cleanMsg.substring(0, 47) + '...' : cleanMsg) + '"'
    };
  }
};
