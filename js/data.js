/**
 * Apex Enterprise ERP - Core Data Architecture (Clean Cloud Edition)
 * نظام أبيكس السحابي المتكامل لإدارة المؤسسات - نسخة قواعد البيانات السحابية الفارغة
 * تم تفريغ كافة البيانات الوهمية بالكامل للربط المباشر مع Google Firebase Firestore
 */

const ERP_DATA = {
  // إعدادات العملات والتقارير المالية
  currency: {
    code: 'USD',
    symbol: '$',
    rate: 1.0,
    name: 'دولار أمريكي ($)'
  },
  currencies: [
    { code: 'USD', symbol: '$', rate: 1.0, name: 'دولار أمريكي (USD $)' },
    { code: 'EGP', symbol: 'ج.م', rate: 49.5, name: 'جنيه مصري (EGP ج.م)' },
    { code: 'SAR', symbol: 'ر.س', rate: 3.75, name: 'ريال سعودي (SAR ر.س)' },
    { code: 'EUR', symbol: '€', rate: 0.92, name: 'يورو (EUR €)' },
    { code: 'GBP', symbol: '£', rate: 0.79, name: 'جنيه إسترليني (GBP £)' }
  ],

  // 1. ACCOUNTING & FINANCE DATA (المالية والمحاسبة - خالية بالكامل)
  finance: {
    kpis: {
      totalReceivables: 0,
      outstandingInvoices: 0,
      avgCollectionDays: 0,
      badDebtReserve: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      netProfit: 0,
      cashOnHand: 0
    },
    invoices: [],
    monthlyTrend: [
      { month: 'أغسطس', revenue: 0, expenses: 0, profit: 0 },
      { month: 'سبتمبر', revenue: 0, expenses: 0, profit: 0 },
      { month: 'أكتوبر', revenue: 0, expenses: 0, profit: 0 },
      { month: 'نوفمبر', revenue: 0, expenses: 0, profit: 0 },
      { month: 'ديسمبر', revenue: 0, expenses: 0, profit: 0 },
      { month: 'يناير', revenue: 0, expenses: 0, profit: 0 }
    ],
    plStatement: {
      period: "قائمة الدخل السحابية المعتمدة",
      revenue: {
        grossSales: 0,
        salesReturns: 0,
        netRevenue: 0
      },
      cogs: {
        rawMaterials: 0,
        directLabor: 0,
        manufacturingOverhead: 0,
        shippingFreighting: 0,
        totalCogs: 0
      },
      grossProfit: 0,
      grossMargin: 0,
      operatingExpenses: [],
      totalOperatingExpenses: 0,
      operatingIncomeEBIT: 0,
      interestAndTax: 0,
      netIncome: 0
    },
    treasury: {
      accounts: [],
      cashFlowForecast: [],
      recentTransactions: []
    }
  },

  // 2. INVENTORY DATA (المخزون والمستودعات - خالية بالكامل)
  inventory: {
    kpis: {
      totalSKUs: 0,
      totalInventoryValue: 0,
      criticalBreachItems: 0,
      inStockPercentage: 0
    },
    products: [],
    reorderAlerts: [],
    stockMovements: []
  },

  // 3. SALES & CRM DATA (المبيعات والعملاء - خالية بالكامل)
  sales: {
    kpis: {
      totalPipelineValue: 0,
      activeDealsCount: 0,
      winRate: 0,
      avgDealCycleDays: 0
    },
    customers: [],
    orders: [],
    pipeline: {
      new: [],
      processing: [],
      shipped: []
    }
  },

  // 4. PURCHASING DATA (المشتريات والموردين - خالية بالكامل)
  purchasing: {
    kpis: {
      openPOsValue: 0,
      activeSuppliers: 0,
      onTimeDeliveryRate: 0,
      pendingInvoicesCount: 0
    },
    suppliers: [],
    quotes: [],
    purchaseOrders: []
  },

  // 5. HUMAN RESOURCES DATA (الموارد البشرية والرواتب - خالية بالكامل)
  hr: {
    kpis: {
      totalHeadcount: 0,
      todayAttendanceRate: 0,
      pendingLeavesCount: 0,
      monthlyPayrollCost: 0
    },
    employees: [],
    attendanceLog: [],
    leaveRequests: [],
    payroll: []
  }
};

// إتاحة الكائن عالمياً
window.ERP_DATA = ERP_DATA;
