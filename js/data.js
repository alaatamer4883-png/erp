/**
 * Apex Enterprise ERP - Core Master Mock Data (Arabic Enterprise Edition)
 * High-density realistic enterprise dataset across all 5 operational modules in Arabic.
 */

const ERP_DATA = {
  // Currency & Settings
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

  // 1. ACCOUNTING & FINANCE DATA (المالية والمحاسبة)
  finance: {
    kpis: {
      totalReceivables: 842500,
      outstandingInvoices: 38,
      avgCollectionDays: 24.6,
      badDebtReserve: 12400,
      monthlyRevenue: 1245000,
      monthlyExpenses: 892000,
      netProfit: 353000,
      cashOnHand: 2840000
    },
    invoices: [
      {
        id: "INV-2025-0891",
        poRef: "PO-99201-US",
        customer: "هوليداي لوجستيكس الدولية",
        email: "billing@horizonlogistics.io",
        avatar: "HL",
        issueDate: "2025-01-12",
        dueDate: "2025-02-11",
        terms: "آجل 30 يوم",
        amount: 54200.00,
        status: "مدفوعة",
        notes: "تمت التسوية الآلية عبر التحويل البنكي لحساب CIB"
      },
      {
        id: "INV-2025-0892",
        poRef: "PO-99204-EU",
        customer: "شركة أبيكس للصناعات الهندسية",
        email: "payables@apexaero.co.uk",
        avatar: "AA",
        issueDate: "2025-01-14",
        dueDate: "2025-02-14",
        terms: "آجل 30 يوم",
        amount: 128450.00,
        status: "معلقة",
        notes: "بانتظار اعتماد المدير المالي لتحويل الدفعة المجمعة"
      },
      {
        id: "INV-2025-0893",
        poRef: "PO-88102-APAC",
        customer: "شركة بيوجين للتشخيصات الطبية",
        email: "accounts@biogendiag.com",
        avatar: "BD",
        issueDate: "2025-01-16",
        dueDate: "2025-02-15",
        terms: "آجل 30 يوم",
        amount: 88100.00,
        status: "مدفوعة",
        notes: "خصم دوري مباشر معتمد"
      },
      {
        id: "INV-2025-0894",
        poRef: "PO-77112-NA",
        customer: "فانغارد للأنظمة البحرية والملاحة",
        email: "vanguard@marinemail.org",
        avatar: "VM",
        issueDate: "2025-01-18",
        dueDate: "2025-02-18",
        terms: "آجل 45 يوم",
        amount: 42300.00,
        status: "معلقة",
        notes: "تم التحقق من استلام محطة التفتيش الثانية"
      },
      {
        id: "INV-2025-0895",
        poRef: "PO-66230-US",
        customer: "أومني كورب للخدمات اللوجستية",
        email: "finance@omnicorp.net",
        avatar: "OC",
        issueDate: "2025-01-20",
        dueDate: "2025-02-20",
        terms: "آجل 30 يوم",
        amount: 76100.00,
        status: "مدفوعة",
        notes: "تم التحصيل عبر المقاصة البنكية الإلكترونية"
      },
      {
        id: "INV-2025-0896",
        poRef: "PO-55119-GL",
        customer: "تيرا لحلول الطاقة المتجددة",
        email: "invoices@terraenergy.com",
        avatar: "TE",
        issueDate: "2025-01-22",
        dueDate: "2025-02-05",
        terms: "آجل 15 يوم",
        amount: 98400.00,
        status: "متأخرة",
        notes: "تم إرسال إشعار المطالبة الثاني من إدارة الخزينة"
      },
      {
        id: "INV-2025-0897",
        poRef: "PO-44102-ME",
        customer: "مجموعة القاهرة الصناعية المتطورة",
        email: "finance@cairoind.eg",
        avatar: "CI",
        issueDate: "2025-01-25",
        dueDate: "2025-02-24",
        terms: "آجل 30 يوم",
        amount: 162500.00,
        status: "معلقة",
        notes: "إجراءات اعتماد المستندات للاعتماد المستندي L/C جارية"
      },
      {
        id: "INV-2025-0898",
        poRef: "PO-33290-US",
        customer: "كوانتوم تك ديناميكس",
        email: "ap@quantumtech.io",
        avatar: "QT",
        issueDate: "2025-01-27",
        dueDate: "2025-02-26",
        terms: "آجل 30 يوم",
        amount: 34900.00,
        status: "مدفوعة",
        notes: "تحويل بنكي سويفت مكتمل بالكامل"
      }
    ],
    // Monthly trend data for Charts
    monthlyTrend: [
      { month: 'أغسطس', revenue: 1120000, expenses: 840000, profit: 280000 },
      { month: 'سبتمبر', revenue: 1180000, expenses: 860000, profit: 320000 },
      { month: 'أكتوبر', revenue: 1250000, expenses: 890000, profit: 360000 },
      { month: 'نوفمبر', revenue: 1210000, expenses: 875000, profit: 335000 },
      { month: 'ديسمبر', revenue: 1390000, expenses: 950000, profit: 440000 },
      { month: 'يناير', revenue: 1245000, expenses: 892000, profit: 353000 }
    ],
    // P&L Statement Structure
    plStatement: {
      period: "الربع الأول 2025 (قائمة الدخل المجمعة المعتمدة)",
      revenue: {
        grossSales: 3845000,
        salesReturns: -42000,
        netRevenue: 3803000
      },
      cogs: {
        rawMaterials: 1120000,
        directLabor: 480000,
        manufacturingOverhead: 310000,
        shippingFreighting: 145000,
        totalCogs: 2055000
      },
      grossProfit: 1748000,
      grossMargin: 46.0,
      operatingExpenses: [
        { category: "البحث والتطوير والهندسة الصناعية", amount: 285000, percentage: 7.5 },
        { category: "المبيعات والتسويق والعمليات التجارية", amount: 320000, percentage: 8.4 },
        { category: "المصروفات الإدارية والعمومية التنفيذية", amount: 245000, percentage: 6.4 },
        { category: "تقنية المعلومات والبنية السحابية", amount: 112000, percentage: 2.9 },
        { category: "تشغيل المنشآت ومخصصات الإهلاك", amount: 88000, percentage: 2.3 }
      ],
      totalOperatingExpenses: 1050000,
      operatingIncomeEBIT: 698000,
      interestAndTax: 145000,
      netIncome: 553000
    },
    // Treasury & Bank Accounts
    treasury: {
      accounts: [
        {
          id: "ACC-CIB-01",
          name: "البنك التجاري الدولي (CIB)",
          nameAr: "البنك التجاري الدولي - حساب الشركات الرئيسي",
          accountNumber: "•••• 8921",
          currency: "USD",
          balance: 1420500.00,
          type: "حساب تشغيلي رئيسي",
          status: "متزامن لحظياً",
          lastSync: "الآن"
        },
        {
          id: "ACC-NBE-02",
          name: "البنك الأهلي المصري (NBE)",
          nameAr: "البنك الأهلي المصري - حساب الاعتمادات والتسويات",
          accountNumber: "•••• 4410",
          currency: "EGP",
          balance: 48500000.00,
          type: "تسويات واعتمادات مستندية",
          status: "متزامن لحظياً",
          lastSync: "منذ 4 دقائق"
        },
        {
          id: "ACC-CHASE-03",
          name: "بنك جيه بي مورغان تشيس (Chase)",
          nameAr: "جيه بي مورغان - حساب المقاصة الدولية",
          accountNumber: "•••• 7712",
          currency: "USD",
          balance: 890000.00,
          type: "تحويلات دولية وسويفت",
          status: "متزامن لحظياً",
          lastSync: "منذ 12 دقيقة"
        },
        {
          id: "ACC-VAULT-04",
          name: "الخزينة المركزية النقدية (HQ Vault)",
          nameAr: "الخزينة النقدية الرئيسية للمقر العام",
          accountNumber: "VLT-001",
          currency: "USD",
          balance: 125000.00,
          type: "نثريات واحتياطي سيولة فوري",
          status: "جرد مدقق معتمد",
          lastSync: "اليوم 08:00 ص"
        }
      ],
      cashFlowForecast: [
        { date: "15 فبراير", inflow: 142000, outflow: 85000, net: 57000 },
        { date: "18 فبراير", inflow: 98000, outflow: 110000, net: -12000 },
        { date: "22 فبراير", inflow: 210000, outflow: 95000, net: 115000 },
        { date: "28 فبراير", inflow: 340000, outflow: 280000, net: 60000 }
      ],
      recentTransactions: [
        { id: "TX-9901", desc: "تحويل وارد من عميل - شركة أبيكس الهندسية", amount: 128450.00, type: "inflow", account: "CIB للشركات", date: "2025-02-10 14:22" },
        { id: "TX-9902", desc: "سداد أمر شراء لمورد - تيتان للصناعات", amount: -45200.00, type: "outflow", account: "جيه بي مورغان", date: "2025-02-10 11:05" },
        { id: "TX-9903", desc: "تغذية نقدية للخزينة المركزية", amount: -15000.00, type: "transfer", account: "البنك الأهلي المصري", date: "2025-02-09 16:40" },
        { id: "TX-9904", desc: "إيداع مقاصة - بيوجين للتشخيصات", amount: 88100.00, type: "inflow", account: "CIB للشركات", date: "2025-02-09 10:15" }
      ]
    }
  },

  // 2. INVENTORY DATA (المخزون والمستودعات)
  inventory: {
    kpis: {
      totalSKUs: 1420,
      totalInventoryValue: 1894320.40,
      criticalBreachItems: 8,
      inStockPercentage: 94.2
    },
    products: [
      {
        code: "SKU-VAL-9920",
        name: "صمام تحكم هيدروليكي صناعي رباعي الاتجاهات 4-Way",
        category: "مكونات الطاقة الهيدروليكية",
        price: 340.00,
        qty: 12,
        minLevel: 45,
        maxLevel: 200,
        unit: "وحدة",
        warehouse: "المستودع الرئيسي أ - قطاع 14",
        status: "خرق حرج (حرجة)" // Red alert
      },
      {
        code: "SKU-BRG-4412",
        name: "رولمان بلي كريات تلامس زاوي فائق الدقة 65 مم",
        category: "ناقلات الحركة الميكانيكية",
        price: 88.50,
        qty: 34,
        minLevel: 80,
        maxLevel: 300,
        unit: "قطعة",
        warehouse: "مستودع القطع ب - رف 08",
        status: "مخزون منخفض" // Yellow alert
      },
      {
        code: "SKU-MTR-7710",
        name: "محرك كهربائي حثي غير متزامن ثلاثي الأطوار 7.5kW",
        category: "المشغلات الكهروميكانيكية",
        price: 920.00,
        qty: 6,
        minLevel: 25,
        maxLevel: 80,
        unit: "وحدة",
        warehouse: "المستودع الرئيسي أ - منصة 02",
        status: "خرق حرج (حرجة)" // Red alert
      },
      {
        code: "SKU-SNS-1190",
        name: "حساس ضغط تفاضلي صناعي 4-20mA معيار IP67",
        category: "أجهزة القياس والاستشعار",
        price: 215.00,
        qty: 145,
        minLevel: 50,
        maxLevel: 250,
        unit: "وحدة",
        warehouse: "مستودع ج - صندوق 22",
        status: "متوفر بالمستودع"
      },
      {
        code: "SKU-PMP-8821",
        name: "مضخة مكبسية هيدروليكية متغيرة الإزاحة عالية الضغط",
        category: "مكونات الطاقة الهيدروليكية",
        price: 1450.00,
        qty: 18,
        minLevel: 40,
        maxLevel: 120,
        unit: "وحدة",
        warehouse: "المستودع الرئيسي أ - منصة 05",
        status: "مخزون منخفض" // Yellow alert
      },
      {
        code: "SKU-PLC-5520",
        name: "وحدة تحكم منطقي قابلة للبرمجة PLC موديولار 24 I/O",
        category: "أنظمة التحكم والتحكم الآلي",
        price: 840.00,
        qty: 82,
        minLevel: 30,
        maxLevel: 150,
        unit: "وحدة",
        warehouse: "مستودع ج - الغرفة المؤمنة",
        status: "متوفر بالمستودع"
      },
      {
        code: "SKU-SEAL-3310",
        name: "طقم حشيات وجوانات فايتون عالية الحرارة Viton O-Ring",
        category: "موانع التسرب والمثبتات",
        price: 32.00,
        qty: 540,
        minLevel: 200,
        maxLevel: 1000,
        unit: "طقم",
        warehouse: "مستودع القطع ب - صندوق 11",
        status: "متوفر بالمستودع"
      },
      {
        code: "SKU-DRV-6604",
        name: "مغير سرعة إلكتروني ومحول تردد VFD 15kW للخدمة الشاقة",
        category: "المشغلات الكهروميكانيكية",
        price: 1120.00,
        qty: 9,
        minLevel: 30,
        maxLevel: 100,
        unit: "وحدة",
        warehouse: "المستودع الرئيسي أ - رف 09",
        status: "خرق حرج (حرجة)" // Red alert
      },
      {
        code: "SKU-FTG-2219",
        name: "وصلات ضغط استيل مقاوم للصدأ Swagelok 316",
        category: "الأنابيب والمحابس الدقيقة",
        price: 45.00,
        qty: 310,
        minLevel: 150,
        maxLevel: 800,
        unit: "قطعة",
        warehouse: "مستودع القطع ب - رف 04",
        status: "متوفر بالمستودع"
      },
      {
        code: "SKU-FLT-9002",
        name: "قلب فلتر زيت هيدروليكي 10 ميكرون مايكروجلاس",
        category: "أنظمة الفلاتر والتنقية",
        price: 64.00,
        qty: 48,
        minLevel: 100,
        maxLevel: 400,
        unit: "وحدة",
        warehouse: "مستودع القطع ب - رف 12",
        status: "مخزون منخفض" // Yellow alert
      }
    ],
    // Audit Trail Log of Stock Movements
    stockMovements: [
      {
        id: "MV-2025-4401",
        timestamp: "2025-02-11 09:30",
        type: "استلام وارد (Receiving)",
        productCode: "SKU-SNS-1190",
        productName: "حساس ضغط تفاضلي صناعي 4-20mA معيار IP67",
        qty: "+50",
        unit: "وحدة",
        refDoc: "PO-2025-0142",
        performedBy: "سارة إبراهيم (اللوجستيات)",
        notes: "تم اجتياز فحص الجودة برصيف التنزيل 3. تشغيلة #LOT-9921."
      },
      {
        id: "MV-2025-4402",
        timestamp: "2025-02-11 08:45",
        type: "صرف صادر (Issuing)",
        productCode: "SKU-VAL-9920",
        productName: "صمام تحكم هيدروليكي صناعي رباعي الاتجاهات 4-Way",
        qty: "-8",
        unit: "وحدة",
        refDoc: "SO-2025-0984",
        performedBy: "كريم طارق (مسؤول الصرف)",
        notes: "تم التجهيز لشحنة شركة هوليداي لوجستيكس."
      },
      {
        id: "MV-2025-4403",
        timestamp: "2025-02-10 16:15",
        type: "استلام وارد (Receiving)",
        productCode: "SKU-SEAL-3310",
        productName: "طقم حشيات وجوانات فايتون عالية الحرارة Viton O-Ring",
        qty: "+200",
        unit: "طقم",
        refDoc: "PO-2025-0139",
        performedBy: "أحمد منصور (أمين المستودع)",
        notes: "استلام دفعة التخليص الجمركي بميناء الإسكندرية."
      },
      {
        id: "MV-2025-4404",
        timestamp: "2025-02-10 14:00",
        type: "صرف صادر (Issuing)",
        productCode: "SKU-MTR-7710",
        productName: "محرك كهربائي حثي غير متزامن ثلاثي الأطوار 7.5kW",
        qty: "-4",
        unit: "وحدة",
        refDoc: "SO-2025-0982",
        performedBy: "ماركوس ستيرلينغ (العمليات)",
        notes: "تخصيص لخط التجميع بأمر الإنتاج WO-440."
      },
      {
        id: "MV-2025-4405",
        timestamp: "2025-02-09 11:20",
        type: "تسوية جردية (Adjustment)",
        productCode: "SKU-BRG-4412",
        productName: "رولمان بلي كريات تلامس زاوي فائق الدقة 65 مم",
        qty: "-2",
        unit: "قطعة",
        refDoc: "AUDIT-Q1-09",
        performedBy: "لجنة الجرد السنوي",
        notes: "تخريد قطعتين بسبب تلف الغلاف الواقي أثناء النقل."
      }
    ]
  },

  // 3. SALES & CRM DATA (المبيعات والعملاء)
  sales: {
    kpis: {
      pipelineTotal: 502700,
      activeOrders: 14,
      avgOrderValue: 71800,
      winRate: 68.5
    },
    customers: [
      {
        id: "CUST-101",
        name: "شركة أبيكس للصناعات الهندسية",
        contactPerson: "م. جوناثان فانس",
        phone: "+44 20 7946 0912",
        email: "j.vance@apexaero.co.uk",
        address: "مجمع هيثرو الصناعي، لندن، المملكة المتحدة",
        totalOrders: 18,
        totalSpend: 642000,
        status: "عميل مميز"
      },
      {
        id: "CUST-102",
        name: "هوليداي لوجستيكس الدولية",
        contactPerson: "أ. إيلينا روستوفا",
        phone: "+1 (555) 349-8812",
        email: "elena@horizonlogistics.io",
        address: "طريق اللوجستيات 4100، شيكاغو، الولايات المتحدة",
        totalOrders: 24,
        totalSpend: 890400,
        status: "نشط"
      },
      {
        id: "CUST-103",
        name: "شركة بيوجين للتشخيصات الطبية",
        contactPerson: "د. آرثر بندلتون",
        phone: "+1 (555) 891-2300",
        email: "arthur@biogendiag.com",
        address: "شارع التكنولوجيا الحيوية 88، بوسطن، الولايات المتحدة",
        totalOrders: 12,
        totalSpend: 410000,
        status: "نشط"
      },
      {
        id: "CUST-104",
        name: "أومني كورب للخدمات اللوجستية",
        contactPerson: "أ. سامانثا فانس",
        phone: "+1 (555) 782-9011",
        email: "svance@omnicorp.net",
        address: "طريق الميناء 99، سياتل، الولايات المتحدة",
        totalOrders: 15,
        totalSpend: 530000,
        status: "نشط"
      },
      {
        id: "CUST-105",
        name: "فانغارد للأنظمة البحرية والملاحة",
        contactPerson: "قبطان روبرت ميلر",
        phone: "+1 (555) 674-1234",
        email: "rmiller@vanguardmarine.com",
        address: "رصيف الملاحة 12، نورفولك، فرجينيا، الولايات المتحدة",
        totalOrders: 9,
        totalSpend: 312000,
        status: "نشط"
      },
      {
        id: "CUST-106",
        name: "مجموعة القاهرة الصناعية المتطورة",
        contactPerson: "م. أحمد السيد",
        phone: "+20 2 2456 7890",
        email: "a.elsayed@cairoind.eg",
        address: "المنطقة الصناعية الرابعة، العاشر من رمضان، مصر",
        totalOrders: 14,
        totalSpend: 580000,
        status: "عميل مميز"
      }
    ],
    // Pipeline board orders
    orders: [
      {
        id: "SO-2025-0981",
        customerId: "CUST-101",
        customerName: "شركة أبيكس للصناعات الهندسية",
        itemsSummary: "صمامات هيدروليكية وحساسات ضغط (4 بنود)",
        amount: 54200.00,
        date: "2025-02-10",
        stage: "new", // "new" | "processing" | "shipped"
        priority: "عاجل",
        discountType: "percent",
        discountValue: 5,
        rep: "ماركوس ستيرلينغ"
      },
      {
        id: "SO-2025-0982",
        customerId: "CUST-103",
        customerName: "شركة بيوجين للتشخيصات الطبية",
        itemsSummary: "وحدات PLC ومغيرات سرعة (8 بنود)",
        amount: 88100.00,
        date: "2025-02-09",
        stage: "new",
        priority: "عادي",
        discountType: "fixed",
        discountValue: 1000,
        rep: "سارة إبراهيم"
      },
      {
        id: "SO-2025-0983",
        customerId: "CUST-102",
        customerName: "هوليداي لوجستيكس الدولية",
        itemsSummary: "مجموعات رولمان بلي دقيقة (15 بند)",
        amount: 98400.00,
        date: "2025-02-08",
        stage: "processing",
        priority: "عاجل",
        discountType: "percent",
        discountValue: 8,
        rep: "ماركوس ستيرلينغ"
      },
      {
        id: "SO-2025-0984",
        customerId: "CUST-104",
        customerName: "أومني كورب للخدمات اللوجستية",
        itemsSummary: "محركات كهربائية حثية 7.5kW (6 وحدات)",
        amount: 76100.00,
        date: "2025-02-07",
        stage: "processing",
        priority: "طارئ جداً",
        discountType: "percent",
        discountValue: 10,
        rep: "كريم طارق"
      },
      {
        id: "SO-2025-0985",
        customerId: "CUST-106",
        customerName: "مجموعة القاهرة الصناعية المتطورة",
        itemsSummary: "مضخات مكبسية عالية الضغط (12 وحدة)",
        amount: 162500.00,
        date: "2025-02-04",
        stage: "shipped",
        priority: "عاجل",
        discountType: "fixed",
        discountValue: 5000,
        rep: "كريم طارق"
      },
      {
        id: "SO-2025-0986",
        customerId: "CUST-105",
        customerName: "فانغارد للأنظمة البحرية والملاحة",
        itemsSummary: "وصلات Swagelok وأطقم حشيات فايتون (200 قطعة)",
        amount: 123400.00,
        date: "2025-02-02",
        stage: "shipped",
        priority: "عادي",
        discountType: "percent",
        discountValue: 5,
        rep: "سارة إبراهيم"
      }
    ]
  },

  // 4. PURCHASING & SUPPLIERS DATA (المشتريات والموردين)
  purchasing: {
    kpis: {
      openPOs: 12,
      totalCommittedSpend: 420800,
      onTimeDeliveryRate: 96.4,
      activeSuppliers: 28
    },
    suppliers: [
      {
        id: "SUP-001",
        name: "تيتان للصناعات الثقيلة AG",
        contactPerson: "د. كلاوس بيكر",
        phone: "+49 89 2345 678",
        email: "klaus.becker@titanindustries.de",
        category: "سبائك صلب ومعدات هيدروليكية ثقيلة",
        rating: 4.9,
        paymentTerms: "آجل 60 يوم",
        activeOrders: 4,
        status: "مورد معتمد موثوق"
      },
      {
        id: "SUP-002",
        name: "جلوبال بريسيشن ديناميكس المحدودة",
        contactPerson: "أ. هيلين دوبوا",
        phone: "+33 1 4455 6677",
        email: "h.dubois@globalprecision.fr",
        category: "صمامات تحكم دقيقة وأنظمة تدفق",
        rating: 4.6,
        paymentTerms: "آجل 30 يوم",
        activeOrders: 3,
        status: "مورد مفضل"
      },
      {
        id: "SUP-003",
        name: "أبيكس لمكونات الحركة والميكانيكا",
        contactPerson: "م. توماس رايت",
        phone: "+1 (555) 432-1098",
        email: "twright@apexmotion.com",
        category: "محامل ورولمان بلي ونواقل حركة",
        rating: 4.8,
        paymentTerms: "آجل 45 يوم",
        activeOrders: 5,
        status: "مورد معتمد موثوق"
      },
      {
        id: "SUP-004",
        name: "دلتا للإلكترونيات الصناعية اليابان",
        contactPerson: "م. كينجي ساتو",
        phone: "+81 3 5555 0192",
        email: "sato.k@deltamicro.jp",
        category: "وحدات PLC وأجهزة التحكم الآلي المبرمج",
        rating: 4.9,
        paymentTerms: "اعتماد مستندي L/C عند الاطلاع",
        activeOrders: 2,
        status: "مورد معتمد موثوق"
      }
    ],
    // Quotations Comparison Matrix for: SKU-VAL-9920
    quotationsComparison: {
      itemCode: "SKU-VAL-9920",
      itemName: "صمام تحكم هيدروليكي صناعي رباعي الاتجاهات 4-Way (الكمية المطلوبة: 100 وحدة)",
      targetBudget: 140.00,
      vendors: [
        {
          vendorName: "أبيكس لمكونات الحركة والميكانيكا",
          badge: "أفضل قيمة وأعلى جودة",
          pricePerUnit: 135.50,
          totalPrice: 13550.00,
          leadTime: "5 أيام عمل (شحن جوي سريع)",
          warranty: "ضمان شامل 24 شهراً",
          rating: 4.9,
          compliance: "شهادة ISO 9001 ومطابقة المعايير الأوروبية CE",
          notes: "يشمل التوريد السريع، شهادة الاختبار الهيدروليكي للمصنع، والدعم الفني المباشر.",
          isRecommended: true
        },
        {
          vendorName: "جلوبال بريسيشن ديناميكس المحدودة",
          badge: "عرض قياسي",
          pricePerUnit: 142.00,
          totalPrice: 14200.00,
          leadTime: "14 يوم عمل (شحن بحري)",
          warranty: "ضمان قياسي 12 شهراً",
          rating: 4.6,
          compliance: "شهادة ISO 9001",
          notes: "الشحن بحري قياسي، الرسوم الجمركية غير مشمولة في العرض.",
          isRecommended: false
        },
        {
          vendorName: "تيتان للصناعات الثقيلة AG",
          badge: "أسرع توريد طارئ",
          pricePerUnit: 150.00,
          totalPrice: 15000.00,
          leadTime: "3 أيام عمل فقط",
          warranty: "ضمان 18 شهراً",
          rating: 4.8,
          compliance: "شهادة TUV الألمانية / DIN EN 10204",
          notes: "خدمة توريد فوري طارئة، تتضمن رسوم الشحن فائق السرعة مدمجة في سعر الوحدة.",
          isRecommended: false
        }
      ]
    },
    // Official Purchase Orders
    purchaseOrders: [
      {
        id: "PO-2025-0142",
        supplier: "أبيكس لمكونات الحركة والميكانيكا",
        itemSummary: "صمامات SKU-VAL-9920 صناعية (100 وحدة)",
        issueDate: "2025-02-08",
        expectedDate: "2025-02-15",
        amount: 13550.00,
        status: "مؤكد وجار التوريد",
        matchingStatus: "مطابقة ثلاثية تامة",
        apStatus: "معتمد للصرف والاستحقاق"
      },
      {
        id: "PO-2025-0141",
        supplier: "تيتان للصناعات الثقيلة AG",
        itemSummary: "أغلفة محركات مسبوكة ثقيلة (40 قطعة)",
        issueDate: "2025-02-05",
        expectedDate: "2025-02-18",
        amount: 38400.00,
        status: "في طريق الشحن",
        matchingStatus: "بانتظار فحص الاستلام",
        apStatus: "معلق (بانتظار بوليصة الشحن)"
      },
      {
        id: "PO-2025-0140",
        supplier: "دلتا للإلكترونيات الصناعية اليابان",
        itemSummary: "وحدات PLC تحكم موديولار (50 وحدة)",
        issueDate: "2025-01-28",
        expectedDate: "2025-02-12",
        amount: 42000.00,
        status: "تم الاستلام بالمستودع",
        matchingStatus: "مطابقة ثلاثية تامة",
        apStatus: "تم السداد عبر الاعتماد المستندي"
      },
      {
        id: "PO-2025-0139",
        supplier: "جلوبال بريسيشن ديناميكس المحدودة",
        itemSummary: "أطقم جوانات فايتون عالية الحرارة (300 طقم)",
        issueDate: "2025-01-20",
        expectedDate: "2025-02-04",
        amount: 9600.00,
        status: "تم الاستلام بالمستودع",
        matchingStatus: "مطابقة ثلاثية تامة",
        apStatus: "تمت التسوية المالية"
      }
    ]
  },

  // 5. HUMAN RESOURCES (HR) DATA (الموارد البشرية وشؤون الموظفين)
  hr: {
    kpis: {
      totalEmployees: 148,
      presentToday: 139,
      onLeaveToday: 6,
      attendanceRate: 95.8,
      monthlyPayrollTotal: 924500
    },
    employees: [
      {
        id: "EMP-001",
        name: "ماركوس ستيرلينغ",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        initials: "MS",
        jobTitle: "نائب الرئيس للعمليات العالمية",
        department: "الإدارة التنفيذية العليا",
        email: "m.sterling@apex-erp.io",
        phone: "+1 (555) 234-9901",
        baseSalary: 14500,
        bonus: 2500,
        deductions: 850,
        absences: 0,
        status: "على رأس العمل",
        attendance: "حاضر (محطة البصمة 08:14 ص)"
      },
      {
        id: "EMP-002",
        name: "سارة إبراهيم",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
        initials: "SI",
        jobTitle: "مدير أول سلاسل الإمداد والتوريد",
        department: "اللوجستيات والمشتريات",
        email: "s.ibrahim@apex-erp.io",
        phone: "+20 100 789 2234",
        baseSalary: 9800,
        bonus: 1200,
        deductions: 540,
        absences: 0,
        status: "على رأس العمل",
        attendance: "حاضرة (مزامنة البصمة 08:28 ص)"
      },
      {
        id: "EMP-003",
        name: "كريم طارق",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        initials: "KT",
        jobTitle: "مدير العمليات اللوجستية والمستودعات",
        department: "إدارة المستودعات",
        email: "k.tarek@apex-erp.io",
        phone: "+20 100 456 7890",
        baseSalary: 6400,
        bonus: 800,
        deductions: 320,
        absences: 0,
        status: "على رأس العمل",
        attendance: "حاضر (تسجيل ويب 08:02 ص)"
      },
      {
        id: "EMP-004",
        name: "إيلينا روستوفا",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
        initials: "ER",
        jobTitle: "كبير المحللين الماليين والمراقب المالي",
        department: "المالية والمحاسبة",
        email: "e.rostova@apex-erp.io",
        phone: "+1 (555) 883-1029",
        baseSalary: 8200,
        bonus: 950,
        deductions: 480,
        absences: 0,
        status: "على رأس العمل",
        attendance: "حاضرة (تسجيل ويب 08:20 ص)"
      },
      {
        id: "EMP-005",
        name: "ديفيد تشن",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
        initials: "DC",
        jobTitle: "مهندس أتمتة وتحكم صناعي أول",
        department: "الهندسة والتحكم",
        email: "d.chen@apex-erp.io",
        phone: "+1 (555) 992-4418",
        baseSalary: 7500,
        bonus: 600,
        deductions: 410,
        absences: 1,
        status: "في إجازة مرضية",
        attendance: "إجازة مرضية معتمدة"
      },
      {
        id: "EMP-006",
        name: "نورهان مصطفى",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
        initials: "NM",
        jobTitle: "أخصائية الموارد البشرية والرواتب",
        department: "الموارد البشرية",
        email: "n.mostafa@apex-erp.io",
        phone: "+20 102 334 5566",
        baseSalary: 5200,
        bonus: 450,
        deductions: 280,
        absences: 0,
        status: "على رأس العمل",
        attendance: "حاضرة (مزامنة البصمة 08:31 ص)"
      }
    ],
    // Punch attendance log for today
    attendanceLog: [
      { id: "PUNCH-101", employee: "ماركوس ستيرلينغ", role: "نائب الرئيس للعمليات", checkIn: "08:14:22 ص", checkOut: "--", syncType: "بصمة جهاز مادي معتمد", status: "في الموعد" },
      { id: "PUNCH-102", employee: "كريم طارق", role: "مدير المستودعات", checkIn: "08:02:11 ص", checkOut: "--", syncType: "محطة الويب الرقمية", status: "في الموعد" },
      { id: "PUNCH-103", employee: "سارة إبراهيم", role: "مدير سلاسل الإمداد", checkIn: "08:28:45 ص", checkOut: "--", syncType: "بصمة جهاز مادي معتمد", status: "في الموعد" },
      { id: "PUNCH-104", employee: "إيلينا روستوفا", role: "محلل مالي أول", checkIn: "08:20:04 ص", checkOut: "--", syncType: "محطة الويب الرقمية", status: "في الموعد" },
      { id: "PUNCH-105", employee: "نورهان مصطفى", role: "أخصائي الموارد البشرية", checkIn: "08:31:18 ص", checkOut: "--", syncType: "بصمة جهاز مادي معتمد", status: "في الموعد" },
      { id: "PUNCH-106", employee: "ديفيد تشن", role: "مهندس أتمتة أول", checkIn: "--", checkOut: "--", syncType: "تقرير إجازة طبية مرفق", status: "مرضي معتمد" }
    ],
    // Pending leave requests for managerial approval
    leaveRequests: [
      {
        id: "LV-2025-081",
        employeeName: "ديفيد تشن",
        department: "الهندسة والتحكم",
        leaveType: "إجازة مرضية",
        startDate: "2025-02-11",
        endDate: "2025-02-12",
        days: 2,
        reason: "نزلة معوية حادة وإجهاد - تم إرفاق التقرير الطبي المعتمد",
        status: "معتمدة",
        appliedOn: "2025-02-10"
      },
      {
        id: "LV-2025-082",
        employeeName: "كريم طارق",
        department: "المستودعات",
        leaveType: "إجازة اعتيادية سنوية",
        startDate: "2025-03-01",
        endDate: "2025-03-05",
        days: 5,
        reason: "إجازة عائلية سنوية قبل بدء ذروة شحنات الربع الثاني",
        status: "قيد المراجعة",
        appliedOn: "2025-02-09"
      },
      {
        id: "LV-2025-083",
        employeeName: "نورهان مصطفى",
        department: "الموارد البشرية",
        leaveType: "إجازة اعتيادية سنوية",
        startDate: "2025-02-24",
        endDate: "2025-02-26",
        days: 3,
        reason: "ظرف عائلي ومناسبة شخصية خاصة",
        status: "قيد المراجعة",
        appliedOn: "2025-02-08"
      }
    ]
  }
};
