/**
 * Apex Enterprise ERP - Core Application Engine (Arabic Enterprise Edition)
 * نظام أبيكس السحابي المتكامل لإدارة الموارد والمؤسسات باللغة العربية
 */

// Application State
const ERP_STATE = {
  activeModule: 'finance',
  activeSubView: 'invoices',
  language: 'ar',
  currency: ERP_DATA.currency,
  
  // Table Pagination States
  pagination: {
    invoices: { page: 1, perPage: 6, search: '', filter: 'all' },
    products: { page: 1, perPage: 6, search: '', filter: 'all' },
    movements: { page: 1, perPage: 6, search: '', filter: 'all' },
    customers: { page: 1, perPage: 6, search: '', filter: 'all' },
    suppliers: { page: 1, perPage: 6, search: '', filter: 'all' },
    pos: { page: 1, perPage: 6, search: '', filter: 'all' },
    employees: { page: 1, perPage: 6, search: '', filter: 'all' },
    attendance: { page: 1, perPage: 6, search: '', filter: 'all' },
    leave: { page: 1, perPage: 6, search: '', filter: 'all' }
  },
  
  // Live Data cloned from ERP_DATA
  data: JSON.parse(JSON.stringify(ERP_DATA))
};

// ============================================================================
// CURRENCY & FORMATTING UTILITIES (الأموال والعملات)
// ============================================================================

function formatMoney(amount, showSymbol = true) {
  const converted = amount * ERP_STATE.currency.rate;
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  if (!showSymbol) return formatted;
  return `${formatted} ${ERP_STATE.currency.symbol}`;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast flex items-center gap-2';

  let icon = 'check_circle';
  let iconColor = 'text-emerald-400';
  if (type === 'error') {
    icon = 'error';
    iconColor = 'text-rose-400';
  } else if (type === 'warning') {
    icon = 'warning';
    iconColor = 'text-amber-400';
  } else if (type === 'info') {
    icon = 'info';
    iconColor = 'text-blue-400';
  }

  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-[20px]">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// ROUTING & VIEW NAVIGATION (التوجيه والتنقل بين الصفحات)
// ============================================================================

const MODULE_TITLES = {
  finance: {
    title: 'المالية والمحاسبة',
    views: {
      invoices: { title: 'إدارة الفواتير والذمم المدينة', desc: 'إدارة فواتير العملاء، متابعة المستحقات النقدية، وإصدار المطالبات المالية.' },
      reports: { title: 'التقارير والتحليلات المالية', desc: 'لوحة رسوم بيانية وتحليلات دقيقة للإيرادات مقابل المصروفات الشهرية وهيكل التكاليف.' },
      pl: { title: 'قائمة الأرباح والخسائر (P&L)', desc: 'بيان قائمة الدخل التفصيلي: إجمالي المبيعات ناقص التكاليف المباشرة والمصروفات التشغيلية.' },
      treasury: { title: 'الخزينة والحسابات البنكية', desc: 'مراقبة السيولة اللحظية، الحسابات البنكية المربوطة، وتوقعات التدفقات النقدية.' }
    }
  },
  inventory: {
    title: 'المخزون والمستودعات',
    views: {
      products: { title: 'دليل المنتجات والأصناف', desc: 'سجل المنتجات والقطع، الكميات المتوفرة بالمستودعات، والتسعير المعتمد.' },
      alerts: { title: 'تنبيهات حد إعادة الطلب', desc: 'أصناف بلغت الحد الحرج وتحتاج أوامر شراء تعويضية عاجلة (تمييز أصفر وأحمر).' },
      movement: { title: 'سجل حركات وتدقيق المخزون', desc: 'سجل تدقيق كامل للحركات الواردة (Receiving) والصادرة (Issuing) مع المستخدمين والتوثيق.' }
    }
  },
  sales: {
    title: 'المبيعات وإدارة العملاء',
    views: {
      customers: { title: 'دليل وحسابات العملاء', desc: 'بيانات الاتصال بالعملاء المعتمدين، عناوين الفروع، وحجم المشتريات التاريخي.' },
      orders: { title: 'نموذج إنشاء أمر بيع تفاعلي', desc: 'إضافة المنتجات للعملاء، تطبيق الخصم (نسبة مئوية أو مبلغ ثابت)، وحساب الإجمالي فورياً.' },
      pipeline: { title: 'خط سير وتتبع الطلبات (كانبان)', desc: 'لوحة تفاعلية لمتابعة تقدم الطلبات من "جديد" ➔ "قيد التجهيز" ➔ "تم الشحن".' }
    }
  },
  purchasing: {
    title: 'المشتريات والموردين',
    views: {
      suppliers: { title: 'دليل الموردين المعتمدين', desc: 'بيانات الموردين المسجلين، تقييمات الجودة والتسليم، وشروط السداد المعتمدة.' },
      quotes: { title: 'مصفوفة مقارنة عروض الأسعار', desc: 'مقارنة جنباً إلى جنب لعروض أسعار الموردين لنفس الصنف مع تمييز العرض الأفضل.' },
      po: { title: 'أوامر الشراء والحسابات الدائنة', desc: 'إصدار وتتبع أوامر الشراء الرسمية مع المطابقة الثلاثية (3-Way Matching) والفواتير.' }
    }
  },
  hr: {
    title: 'الموارد البشرية وشؤون الموظفين',
    views: {
      employees: { title: 'دليل وملفات الموظفين', desc: 'سجل الموظفين والوظائف، الرواتب الأساسية، الأقسام، والحالة الوظيفية.' },
      attendance: { title: 'محطة تسجيل الحضور والانصراف', desc: 'محطة الويب الرقمية لتسجيل الحضور والانصراف مع مزامنة البصمة المادية.' },
      leave: { title: 'إدارة واعتماد الإجازات', desc: 'شاشة مراجعة طلبات الإجازات السنوية والمرضية للمدراء مع خيارات القبول والرفض.' },
      payroll: { title: 'مسير الرواتب الآلي', desc: 'احتساب دقيق لرواتب الشهر: الراتب الأساسي + المكافآت - الاستقطاعات والغياب.' }
    }
  }
};

// ============================================================================
// RESPONSIVE SIDEBAR & MOBILE DRAWER CONTROLLER (التحكم في القائمة الجانبية والهاتف)
// ============================================================================

function toggleSidebar(forceState = null) {
  const isMobile = window.innerWidth < 1024;
  const sidebar = document.getElementById('mainSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (isMobile) {
    const isCurrentlyOpen = document.body.classList.contains('sidebar-mobile-open') || 
                            (sidebar && sidebar.classList.contains('mobile-open'));
    const nextState = forceState !== null ? forceState : !isCurrentlyOpen;

    if (nextState) {
      document.body.classList.add('sidebar-mobile-open');
      if (sidebar) sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    } else {
      closeSidebar();
    }
  } else {
    // Desktop: Toggle collapsed / expanded focus mode
    const isCollapsed = document.body.classList.contains('sidebar-desktop-collapsed');
    const nextState = forceState !== null ? forceState : !isCollapsed;
    
    if (nextState) {
      document.body.classList.add('sidebar-desktop-collapsed');
      showToast('تم تفعيل وضع التركيز الكامل (Full Focus Mode).', 'info');
    } else {
      document.body.classList.remove('sidebar-desktop-collapsed');
    }
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('mainSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  document.body.classList.remove('sidebar-mobile-open');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
  document.body.style.overflow = '';
}

// Ensure global accessibility for onclick attributes
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;

// Close drawer automatically on resize above mobile breakpoint
window.addEventListener('resize', () => {
  if (window.innerWidth >= 1024) {
    closeSidebar();
  }
});

function navigateTo(module, subView = null) {
  // Automatically close mobile sidebar drawer upon selecting any page
  if (window.innerWidth < 1024) {
    closeSidebar();
  }

  if (!MODULE_TITLES[module]) module = 'finance';
  ERP_STATE.activeModule = module;

  if (!subView) {
    if (module === 'finance') subView = 'invoices';
    else if (module === 'inventory') subView = 'products';
    else if (module === 'sales') subView = 'orders';
    else if (module === 'purchasing') subView = 'quotes';
    else if (module === 'hr') subView = 'employees';
  }
  ERP_STATE.activeSubView = subView;

  // Update URL hash
  window.location.hash = `#${module}/${subView}`;

  updateBreadcrumbs();
  updateSidebarActive();
  renderActiveView();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateBreadcrumbs() {
  const modInfo = MODULE_TITLES[ERP_STATE.activeModule];
  const viewInfo = modInfo.views[ERP_STATE.activeSubView] || {};

  const breadcrumbEl = document.getElementById('topBreadcrumb');
  const pageTitleEl = document.getElementById('topPageTitle');

  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <span class="hover:text-primary cursor-pointer transition-colors" onclick="navigateTo('${ERP_STATE.activeModule}')">${modInfo.title}</span>
      <span class="material-symbols-outlined text-[14px]">chevron_left</span>
      <span class="text-on-surface font-bold">${viewInfo.title}</span>
    `;
  }

  if (pageTitleEl) {
    pageTitleEl.innerText = viewInfo.title;
  }
}

function updateSidebarActive() {
  document.querySelectorAll('aside nav a[data-path]').forEach(link => {
    link.classList.remove('bg-primary-container', 'text-on-primary', 'font-bold', 'active');
    link.classList.add('text-inverse-on-surface');
  });

  const currentPath = `${ERP_STATE.activeModule}-${ERP_STATE.activeSubView}`;
  const directLink = document.querySelector(`aside nav a[data-path="${currentPath}"]`) ||
                     document.querySelector(`aside nav a[data-path="${ERP_STATE.activeSubView}"]`);

  if (directLink) {
    directLink.classList.remove('text-inverse-on-surface');
    directLink.classList.add('bg-primary-container', 'text-on-primary', 'font-bold', 'active');
  }
}

// Sub-nav Tab Header Builder in Arabic with Smooth Mobile Touch Scrolling
function renderSubNavTabs(module, activeView) {
  const modInfo = MODULE_TITLES[module];
  const tabs = Object.keys(modInfo.views).map(key => {
    const isAct = key === activeView;
    const name = modInfo.views[key].title;
    return `
      <button onclick="navigateTo('${module}', '${key}')" 
              class="subnav-tab px-3 md:px-4 py-2 text-xs font-bold rounded-t border-b-2 whitespace-nowrap shrink-0 transition-all duration-150 ${
                isAct 
                  ? 'border-primary-container text-primary-container bg-surface-container-low shadow-sm' 
                  : 'border-transparent text-secondary hover:text-on-surface hover:bg-surface-container-low/50'
              }">
        ${name}
      </button>
    `;
  }).join('');

  return `
    <div class="flex items-center gap-1 border-b border-outline-variant/40 mb-space-md overflow-x-auto no-scrollbar scroll-smooth py-0.5">
      ${tabs}
    </div>
  `;
}

// ============================================================================
// VIEW RENDERING ENGINE
// ============================================================================

function renderActiveView() {
  const container = document.getElementById('mainContentArea');
  if (!container) return;

  const { activeModule, activeSubView } = ERP_STATE;

  if (activeModule === 'finance') {
    if (activeSubView === 'invoices') container.innerHTML = renderInvoicesView();
    else if (activeSubView === 'reports') container.innerHTML = renderFinancialReportsView();
    else if (activeSubView === 'pl') container.innerHTML = renderProfitAndLossView();
    else if (activeSubView === 'treasury') container.innerHTML = renderTreasuryView();
    initFinanceCharts();
  } else if (activeModule === 'inventory') {
    if (activeSubView === 'products') container.innerHTML = renderProductsView();
    else if (activeSubView === 'alerts') container.innerHTML = renderReorderAlertsView();
    else if (activeSubView === 'movement') container.innerHTML = renderStockMovementView();
  } else if (activeModule === 'sales') {
    if (activeSubView === 'customers') container.innerHTML = renderCustomersView();
    else if (activeSubView === 'orders') container.innerHTML = renderSalesOrdersView();
    else if (activeSubView === 'pipeline') container.innerHTML = renderSalesPipelineView();
  } else if (activeModule === 'purchasing') {
    if (activeSubView === 'suppliers') container.innerHTML = renderSuppliersView();
    else if (activeSubView === 'quotes') container.innerHTML = renderQuotationsView();
    else if (activeSubView === 'po') container.innerHTML = renderPurchaseOrdersView();
  } else if (activeModule === 'hr') {
    if (activeSubView === 'employees') container.innerHTML = renderEmployeesView();
    else if (activeSubView === 'attendance') container.innerHTML = renderAttendanceView();
    else if (activeSubView === 'leave') container.innerHTML = renderLeaveManagementView();
    else if (activeSubView === 'payroll') container.innerHTML = renderPayrollView();
  }

  bindViewEvents();
}

// ============================================================================
// 1. ACCOUNTING & FINANCE MODULE (وحدة المالية والمحاسبة)
// ============================================================================

function renderInvoicesView() {
  const { invoices, kpis } = ERP_STATE.data.finance;
  const pState = ERP_STATE.pagination.invoices;

  let filtered = invoices.filter(inv => {
    const matchesSearch = inv.id.toLowerCase().includes(pState.search.toLowerCase()) ||
                          inv.customer.toLowerCase().includes(pState.search.toLowerCase()) ||
                          inv.poRef.toLowerCase().includes(pState.search.toLowerCase());
    const matchesFilter = pState.filter === 'all' || inv.status === pState.filter;
    return matchesSearch && matchesFilter;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pState.perPage) || 1;
  const start = (pState.page - 1) * pState.perPage;
  const paged = filtered.slice(start, start + pState.perPage);

  const rows = paged.map(inv => {
    const isPaid = inv.status === 'مدفوعة';
    const isPending = inv.status === 'معلقة';
    const badgeClass = isPaid ? 'badge-success' : (isPending ? 'badge-warning' : 'badge-danger');
    const badgeIcon = isPaid ? 'check_circle' : (isPending ? 'schedule' : 'report');

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors group">
        <td class="px-space-md py-space-sm text-center">
          <input type="checkbox" class="rounded accent-primary-container w-4 h-4 cursor-pointer" />
        </td>
        <td class="px-space-md py-space-sm">
          <div class="flex flex-col">
            <span class="font-mono-data text-primary font-bold hover:underline cursor-pointer" onclick="showToast('عرض تفاصيل الفاتورة ${inv.id}')">${inv.id}</span>
            <span class="text-[11px] text-secondary font-mono-data">${inv.poRef}</span>
          </div>
        </td>
        <td class="px-space-md py-space-sm">
          <div class="flex items-center gap-space-sm">
            <div class="w-8 h-8 rounded bg-primary-fixed flex items-center justify-center font-bold text-xs text-on-primary-fixed">
              ${inv.avatar}
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-on-surface text-xs">${inv.customer}</span>
              <span class="text-[11px] text-secondary font-mono-data">${inv.email}</span>
            </div>
          </div>
        </td>
        <td class="px-space-md py-space-sm font-mono-data text-xs text-secondary">
          ${inv.issueDate} / <span class="text-on-surface font-semibold">${inv.dueDate}</span>
        </td>
        <td class="px-space-md py-space-sm text-xs text-secondary font-medium">${inv.terms}</td>
        <td class="px-space-md py-space-sm text-left font-mono-data font-bold text-on-surface text-sm">
          ${formatMoney(inv.amount)}
        </td>
        <td class="px-space-md py-space-sm text-center">
          <span class="badge-pill ${badgeClass}">
            <span class="material-symbols-outlined text-[13px]">${badgeIcon}</span>
            ${inv.status}
          </span>
        </td>
        <td class="px-space-md py-space-sm text-left">
          <div class="flex items-center justify-end gap-1">
            <button onclick="markInvoiceStatus('${inv.id}', '${isPaid ? 'معلقة' : 'مدفوعة'}')" 
                    class="p-1 rounded hover:bg-surface-container text-secondary hover:text-primary transition-colors" 
                    title="تبديل الحالة (مدفوعة / معلقة)">
              <span class="material-symbols-outlined text-[18px]">swap_horiz</span>
            </button>
            <button onclick="window.print()" 
                    class="p-1 rounded hover:bg-surface-container text-secondary hover:text-on-surface transition-colors" 
                    title="طباعة الفاتورة">
              <span class="material-symbols-outlined text-[18px]">print</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    ${renderSubNavTabs('finance', 'invoices')}

    <!-- Header Actions & Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">إدارة الفواتير والذمم المدينة</h2>
        <p class="text-xs text-secondary">دفتر قيود الفواتير المعتمدة، متابعة تحصيل المستحقات النقدية من العملاء، وإصدار المطالبات.</p>
      </div>
      <div class="flex items-center flex-wrap gap-2">
        <button onclick="exportTableToCSV('invoices')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all">
          <span class="material-symbols-outlined text-[18px] text-secondary">download</span>
          <span>تصدير كشف CSV</span>
        </button>
        <button onclick="window.print()" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs shadow-sm border border-outline-variant/40 hover:bg-surface-container-low transition-all">
          <span class="material-symbols-outlined text-[18px] text-secondary">print</span>
          <span>طباعة دفعات</span>
        </button>
        <button onclick="openCreateInvoiceModal()" class="flex items-center gap-1.5 h-9 px-4 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary transition-all">
          <span class="material-symbols-outlined text-[18px]">add_circle</span>
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>
    </div>

    <!-- KPI Metric Summary Tiles Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      <div class="erp-card p-space-lg flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-secondary uppercase">إجمالي المستحقات والذمم</span>
          <span class="p-1.5 rounded bg-blue-50 text-primary-container material-symbols-outlined text-[20px]">account_balance_wallet</span>
        </div>
        <div class="text-2xl font-bold font-mono-data text-on-surface">${formatMoney(kpis.totalReceivables)}</div>
        <div class="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <span class="material-symbols-outlined text-[14px]">trending_up</span>+12.4% مقارنة بالشهر السابق
        </div>
      </div>

      <div class="erp-card p-space-lg flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-secondary uppercase">الفواتير المعلقة غير المحصلة</span>
          <span class="p-1.5 rounded bg-amber-50 text-amber-600 material-symbols-outlined text-[20px]">pending_actions</span>
        </div>
        <div class="text-2xl font-bold font-mono-data text-on-surface">${kpis.outstandingInvoices} فاتورة</div>
        <div class="mt-2 text-xs text-secondary">موزعة على 18 عميل رئيسي</div>
      </div>

      <div class="erp-card p-space-lg flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-secondary uppercase">متوسط دورة التحصيل</span>
          <span class="p-1.5 rounded bg-emerald-50 text-emerald-600 material-symbols-outlined text-[20px]">history_toggle_off</span>
        </div>
        <div class="text-2xl font-bold font-mono-data text-on-surface">${kpis.avgCollectionDays} يوم</div>
        <div class="mt-2 text-xs font-semibold text-emerald-600">تحسن بمعدل 3.2 أيام في الربع الحالي</div>
      </div>

      <div class="erp-card p-space-lg flex flex-col justify-between">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-secondary uppercase">مستهدف التدفق النقدي الشهري</span>
          <span class="p-1.5 rounded bg-blue-50 text-primary material-symbols-outlined text-[20px]">savings</span>
        </div>
        <div class="text-2xl font-bold font-mono-data text-on-surface">${formatMoney(kpis.monthlyRevenue)}</div>
        <div class="mt-2 text-xs text-secondary">تم تحقيق 92% من مستهدف الربع الأول</div>
      </div>
    </div>

    <!-- Data Table Container with Search, Filter & Pagination -->
    <div class="erp-card overflow-hidden">
      <!-- Toolbar -->
      <div class="p-space-md border-b border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-low/40">
        <div class="flex items-center gap-space-sm w-full sm:w-auto">
          <div class="relative flex-1 sm:w-72">
            <span class="material-symbols-outlined absolute right-2.5 top-2 text-[18px] text-secondary">search</span>
            <input type="text" id="invoiceSearchInput" value="${pState.search}" placeholder="بحث برقم الفاتورة، العميل، أمر الشراء..." 
                   class="w-full h-8 pr-8 pl-3 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:outline-none"
                   oninput="handleTableSearch('invoices', this.value)" />
          </div>
          <select id="invoiceFilterSelect" 
                  class="h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 text-secondary focus:border-primary focus:outline-none"
                  onchange="handleTableFilter('invoices', this.value)">
            <option value="all" ${pState.filter === 'all' ? 'selected' : ''}>جميع الحالات</option>
            <option value="مدفوعة" ${pState.filter === 'مدفوعة' ? 'selected' : ''}>مدفوعة فقط</option>
            <option value="معلقة" ${pState.filter === 'معلقة' ? 'selected' : ''}>معلقة فقط</option>
            <option value="متأخرة" ${pState.filter === 'متأخرة' ? 'selected' : ''}>متأخرة فقط</option>
          </select>
        </div>
        <div class="text-xs text-secondary font-mono-data">
          عرض <b>${start + 1}-${Math.min(start + pState.perPage, total)}</b> من أصل <b>${total}</b> فاتورة
        </div>
      </div>

      <!-- Table Element -->
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider select-none">
              <th class="w-10 px-space-md text-center"><input type="checkbox" class="rounded accent-primary-container" /></th>
              <th class="px-space-md">رقم الفاتورة</th>
              <th class="px-space-md">حساب العميل والبريد</th>
              <th class="px-space-md">تاريخ الإصدار / الاستحقاق</th>
              <th class="px-space-md">شروط الدفع</th>
              <th class="px-space-md text-left">المبلغ المستحق</th>
              <th class="px-space-md text-center">حالة الفاتورة</th>
              <th class="px-space-md text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface">
            ${rows.length ? rows : `<tr><td colspan="8" class="text-center py-8 text-secondary">لا توجد فواتير تطابق معايير البحث المحددة.</td></tr>`}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-space-md border-t border-outline-variant/30 flex items-center justify-between text-xs text-secondary bg-surface-container-low/20">
        <div>الصفحة ${pState.page} من إجمالي ${totalPages}</div>
        <div class="flex items-center gap-1 font-mono-data">
          <button onclick="changePage('invoices', ${pState.page - 1})" ${pState.page <= 1 ? 'disabled class="px-2.5 py-1 rounded bg-surface-container opacity-40 cursor-not-allowed"' : 'class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high"'}>
            السابق
          </button>
          ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
            <button onclick="changePage('invoices', ${p})" class="px-3 py-1 rounded text-xs font-bold ${p === pState.page ? 'bg-primary-container text-white' : 'bg-surface-container hover:bg-surface-container-high'}">${p}</button>
          `).join('')}
          <button onclick="changePage('invoices', ${pState.page + 1})" ${pState.page >= totalPages ? 'disabled class="px-2.5 py-1 rounded bg-surface-container opacity-40 cursor-not-allowed"' : 'class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high"'}>
            التالي
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFinancialReportsView() {
  const { plStatement } = ERP_STATE.data.finance;

  return `
    ${renderSubNavTabs('finance', 'reports')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">لوحة التقارير والتحليلات المالية</h2>
        <p class="text-xs text-secondary">تحليلات بصرية متقدمة لمسار تدفق الإيرادات مقابل المصروفات الشهرية وهيكل التكاليف التشغيلية.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="window.print()" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
          <span class="material-symbols-outlined text-[18px]">print</span>
          <span>طباعة البيان المالي</span>
        </button>
        <button onclick="showToast('تمت إعادة حساب النماذج المالية وفق أسعار الصرف اللحظية.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
          <span class="material-symbols-outlined text-[18px]">refresh</span>
          <span>تحديث التحليلات</span>
        </button>
      </div>
    </div>

    <!-- Chart Analytics Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-md mb-space-lg">
      <!-- Main Trend Chart -->
      <div class="erp-card p-space-lg lg:col-span-2 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-headline-sm font-bold text-on-surface">مقارنة تدفقات الإيرادات مقابل المصروفات</h3>
            <span class="text-xs text-secondary">الأداء التشغيلي الشهري المجمع (آخر 6 أشهر)</span>
          </div>
          <div class="flex items-center gap-3 text-xs font-semibold">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-blue-700"></span> الإيرادات</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-slate-400"></span> المصروفات</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-emerald-500"></span> صافي الأرباح</span>
          </div>
        </div>
        <div class="relative h-64 w-full">
          <canvas id="revenueExpensesChart"></canvas>
        </div>
      </div>

      <!-- Expense Composition Donut -->
      <div class="erp-card p-space-lg flex flex-col justify-between">
        <div class="mb-4">
          <h3 class="font-headline-sm font-bold text-on-surface">هيكل وتوزيع المصروفات التشغيلية</h3>
          <span class="text-xs text-secondary">توزيع بنود الصرف حسب القطاعات المؤسسية</span>
        </div>
        <div class="relative h-48 w-full flex items-center justify-center">
          <canvas id="expenseCompositionChart"></canvas>
        </div>
        <div class="space-y-1.5 mt-3 pt-3 border-t border-outline-variant/30 text-xs">
          ${plStatement.operatingExpenses.map(item => `
            <div class="flex items-center justify-between">
              <span class="text-secondary truncate ml-2">${item.category}</span>
              <span class="font-mono-data font-bold text-on-surface">${formatMoney(item.amount)} (${item.percentage}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Summary Performance Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">إجمالي الإيرادات منذ بداية العام (YTD)</span>
        <div class="text-xl font-bold font-mono-data text-on-surface mt-1">${formatMoney(3845000)}</div>
        <div class="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">trending_up</span> +16.2% نمو سنوي مقارن
        </div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">هامش الربح التشغيلي (EBIT)</span>
        <div class="text-xl font-bold font-mono-data text-primary-container mt-1">18.35%</div>
        <div class="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">check</span> أعلى من المستهدف المؤسسي (15%)
        </div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">معدل تحويل السيولة (EBITDA Conversion)</span>
        <div class="text-xl font-bold font-mono-data text-on-surface mt-1">79.2%</div>
        <div class="text-xs text-secondary mt-1">كفاءة تشغيلية نقدية عالية للمؤسسة</div>
      </div>
    </div>
  `;
}

function renderProfitAndLossView() {
  const { plStatement } = ERP_STATE.data.finance;

  return `
    ${renderSubNavTabs('finance', 'pl')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">قائمة الأرباح والخسائر والتحليل المالي (P&L)</h2>
        <p class="text-xs text-secondary">ملخص مالي دقيق: إجمالي المبيعات ناقص التكاليف المباشرة والمشتريات والمصروفات التشغيلية.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="window.print()" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          <span>تصدير بيان الدخل المعتمد</span>
        </button>
      </div>
    </div>

    <!-- P&L Financial Summary Container -->
    <div class="erp-card p-space-xl">
      <div class="flex items-center justify-between pb-space-md border-b border-outline-variant/40 mb-space-md">
        <div>
          <h3 class="font-headline-md font-bold text-on-surface">بيان قائمة الدخل التفصيلي المجمع</h3>
          <span class="text-xs text-secondary font-semibold">${plStatement.period}</span>
        </div>
        <span class="badge-pill badge-success">مدقق ومعتمد محاسبياً</span>
      </div>

      <div class="space-y-4 text-xs font-mono-data">
        <!-- 1. Revenue -->
        <div>
          <div class="flex justify-between font-bold text-sm text-on-surface py-1 border-b border-outline-variant/20 bg-surface-container-low px-3">
            <span>أولاً: إجمالي المبيعات والإيرادات التشغيلية</span>
            <span></span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-secondary">
            <span>إجمالي المبيعات وتوريدات المنتجات للعملاء</span>
            <span>${formatMoney(plStatement.revenue.grossSales)}</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-rose-600">
            <span>يخصم: مردودات ومسموحات المبيعات والخصومات</span>
            <span>(${formatMoney(Math.abs(plStatement.revenue.salesReturns))})</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 font-bold text-on-surface bg-surface-container-low/50">
            <span>صافي الإيرادات التشغيلية (Net Revenue)</span>
            <span class="text-primary text-sm">${formatMoney(plStatement.revenue.netRevenue)}</span>
          </div>
        </div>

        <!-- 2. Cost of Goods Sold (COGS) -->
        <div>
          <div class="flex justify-between font-bold text-sm text-on-surface py-1 border-b border-outline-variant/20 bg-surface-container-low px-3">
            <span>ثانياً: تكلفة البضاعة المباعة (COGS)</span>
            <span></span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-secondary">
            <span>مشتريات المواد الخام والقطع الهيدروليكية</span>
            <span>${formatMoney(plStatement.cogs.rawMaterials)}</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-secondary">
            <span>تكلفة أجور عمالة التصنيع والتجميع المباشرة</span>
            <span>${formatMoney(plStatement.cogs.directLabor)}</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-secondary">
            <span>مصروفات التصنيع الإضافية واستهلاك الطاقة</span>
            <span>${formatMoney(plStatement.cogs.manufacturingOverhead)}</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 text-secondary">
            <span>الشحن الوارد والتخليص الجمركي بموانئ الوصول</span>
            <span>${formatMoney(plStatement.cogs.shippingFreighting)}</span>
          </div>
          <div class="flex justify-between py-1.5 px-4 font-bold text-rose-700 bg-surface-container-low/50">
            <span>إجمالي تكلفة المبيعات المباشرة</span>
            <span>(${formatMoney(plStatement.cogs.totalCogs)})</span>
          </div>
        </div>

        <!-- GROSS PROFIT HIGHLIGHT -->
        <div class="p-3 rounded bg-blue-50/80 border border-blue-200 flex justify-between font-bold text-sm text-primary-container">
          <span>مجمل الربح (هامش مجمل الربح: ${plStatement.grossMargin}%)</span>
          <span class="text-base font-bold">${formatMoney(plStatement.grossProfit)}</span>
        </div>

        <!-- 3. Operating Expenses -->
        <div>
          <div class="flex justify-between font-bold text-sm text-on-surface py-1 border-b border-outline-variant/20 bg-surface-container-low px-3">
            <span>ثالثاً: المصروفات البيعية والإدارية والعمومية (OPEX)</span>
            <span></span>
          </div>
          ${plStatement.operatingExpenses.map(exp => `
            <div class="flex justify-between py-1.5 px-4 text-secondary">
              <span>${exp.category}</span>
              <span>${formatMoney(exp.amount)}</span>
            </div>
          `).join('')}
          <div class="flex justify-between py-1.5 px-4 font-bold text-rose-700 bg-surface-container-low/50">
            <span>إجمالي المصروفات التشغيلية</span>
            <span>(${formatMoney(plStatement.totalOperatingExpenses)})</span>
          </div>
        </div>

        <!-- OPERATING INCOME (EBIT) -->
        <div class="p-3 rounded bg-emerald-50/80 border border-emerald-200 flex justify-between font-bold text-sm text-emerald-800">
          <span>الربح التشغيلي قبل الفوائد والضرائب (EBIT)</span>
          <span class="text-base font-bold">${formatMoney(plStatement.operatingIncomeEBIT)}</span>
        </div>

        <!-- Taxes & Net Income -->
        <div class="flex justify-between py-1.5 px-4 text-secondary">
          <span>تكاليف التمويل، فروق العملة، ومخصص الضرائب</span>
          <span>(${formatMoney(plStatement.interestAndTax)})</span>
        </div>

        <!-- FINAL NET PROFIT -->
        <div class="p-4 rounded-lg bg-primary-container text-on-primary flex justify-between font-bold text-base shadow-sm">
          <span>صافي الدخل النهائي للمؤسسة (Net Profit)</span>
          <span class="text-lg font-bold">${formatMoney(plStatement.netIncome)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderTreasuryView() {
  const { treasury } = ERP_STATE.data.finance;

  return `
    ${renderSubNavTabs('finance', 'treasury')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">الخزينة والحسابات البنكية</h2>
        <p class="text-xs text-secondary">مراقبة السيولة اللحظية، الحسابات البنكية المربوطة، وتوقعات التدفقات النقدية الداخلة والخارجة.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="showToast('تمت مزامنة البنوك وتحديث أرصدة 4 حسابات بنجاح.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700">
          <span class="material-symbols-outlined text-[18px]">sync</span>
          <span>مزامنة البنوك الحية</span>
        </button>
      </div>
    </div>

    <!-- Connected Bank Accounts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      ${treasury.accounts.map(acc => `
        <div class="erp-card p-space-md flex flex-col justify-between">
          <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-xs text-on-surface truncate">${acc.name}</span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 live-pulse"></span>
          </div>
          <div class="font-mono-data text-xs text-secondary mb-2">${acc.accountNumber} • ${acc.type}</div>
          <div class="font-bold text-on-surface font-mono-data text-xl text-left">
            ${acc.currency === 'EGP' ? (acc.balance).toLocaleString('en-US') + ' ج.م' : formatMoney(acc.balance)}
          </div>
          <div class="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] text-secondary">
            <span>الحالة: <b class="text-emerald-700 font-bold">${acc.status}</b></span>
            <span>${acc.lastSync}</span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Cash Flow Forecast & Recent Movements -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
      <!-- 14-Day Forecast -->
      <div class="erp-card p-space-lg">
        <h3 class="font-headline-sm font-bold text-on-surface mb-1">توقعات التدفقات النقدية للأيام القادمة</h3>
        <p class="text-xs text-secondary mb-4">جدول الاستحقاقات المتوقعة من الفواتير المعلقة والتزامات أوامر الشراء المؤكدة.</p>
        <div class="space-y-3 font-mono-data text-xs">
          ${treasury.cashFlowForecast.map(item => `
            <div class="p-2.5 rounded bg-surface-container-low flex items-center justify-between">
              <span class="font-bold text-on-surface">${item.date}</span>
              <div class="flex items-center gap-4">
                <span class="text-emerald-600 font-bold">+${formatMoney(item.inflow)}</span>
                <span class="text-rose-600 font-bold">-${formatMoney(item.outflow)}</span>
                <span class="font-bold ${item.net >= 0 ? 'text-primary' : 'text-amber-600'}">الصافي: ${formatMoney(item.net)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Recent Treasury Operations -->
      <div class="erp-card p-space-lg">
        <h3 class="font-headline-sm font-bold text-on-surface mb-1">سجل حركات الخزينة والتحويلات الحديثة</h3>
        <p class="text-xs text-secondary mb-4">بيان تدقيق الحركات المالية المنفذة عبر مختلف القنوات المصرفية.</p>
        <div class="divide-y divide-outline-variant/30 font-mono-data text-xs">
          ${treasury.recentTransactions.map(tx => `
            <div class="py-2.5 flex items-center justify-between">
              <div>
                <div class="font-bold text-on-surface">${tx.desc}</div>
                <div class="text-[11px] text-secondary">${tx.account} • ${tx.date}</div>
              </div>
              <span class="font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-on-surface'}">
                ${tx.amount > 0 ? '+' : ''}${formatMoney(tx.amount)}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initFinanceCharts() {
  const revCanvas = document.getElementById('revenueExpensesChart');
  const expCanvas = document.getElementById('expenseCompositionChart');

  if (revCanvas && typeof Chart !== 'undefined') {
    const trend = ERP_STATE.data.finance.monthlyTrend;
    new Chart(revCanvas, {
      type: 'bar',
      data: {
        labels: trend.map(t => t.month),
        datasets: [
          {
            label: 'الإيرادات',
            data: trend.map(t => t.revenue),
            backgroundColor: '#1e40af',
            borderRadius: 4
          },
          {
            label: 'المصروفات',
            data: trend.map(t => t.expenses),
            backgroundColor: '#94a3b8',
            borderRadius: 4
          },
          {
            label: 'صافي الربح',
            data: trend.map(t => t.profit),
            type: 'line',
            borderColor: '#10b981',
            backgroundColor: '#10b981',
            borderWidth: 2,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            position: 'right',
            ticks: {
              callback: value => '$' + (value / 1000) + 'k'
            }
          }
        }
      }
    });
  }

  if (expCanvas && typeof Chart !== 'undefined') {
    const expenses = ERP_STATE.data.finance.plStatement.operatingExpenses;
    new Chart(expCanvas, {
      type: 'doughnut',
      data: {
        labels: expenses.map(e => e.category),
        datasets: [{
          data: expenses.map(e => e.amount),
          backgroundColor: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } }
      }
    });
  }
}

// ============================================================================
// 2. INVENTORY & STOCK MODULE (وحدة المخزون والمستودعات)
// ============================================================================

function renderProductsView() {
  const { products, kpis } = ERP_STATE.data.inventory;
  const pState = ERP_STATE.pagination.products;

  let filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(pState.search.toLowerCase()) ||
                        p.code.toLowerCase().includes(pState.search.toLowerCase()) ||
                        p.category.toLowerCase().includes(pState.search.toLowerCase());
    const matchFilter = pState.filter === 'all' || p.status.includes(pState.filter);
    return matchSearch && matchFilter;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pState.perPage) || 1;
  const start = (pState.page - 1) * pState.perPage;
  const paged = filtered.slice(start, start + pState.perPage);

  const rows = paged.map(p => {
    const isCritical = p.status.includes('حرج');
    const isLow = p.status.includes('منخفض');
    const badgeClass = isCritical ? 'badge-danger' : (isLow ? 'badge-warning' : 'badge-success');

    return `
      <tr class="hover:bg-surface-container-low/60 transition-colors">
        <td class="px-space-md py-space-sm font-mono-data font-bold text-primary">${p.code}</td>
        <td class="px-space-md py-space-sm">
          <div class="font-bold text-xs text-on-surface">${p.name}</div>
          <div class="text-[11px] text-secondary">${p.category} • ${p.warehouse}</div>
        </td>
        <td class="px-space-md py-space-sm text-left font-mono-data font-bold text-on-surface">
          ${formatMoney(p.price)}
        </td>
        <td class="px-space-md py-space-sm text-center font-mono-data font-bold ${isCritical ? 'text-rose-600' : (isLow ? 'text-amber-600' : 'text-on-surface')}">
          ${p.qty} <span class="text-xs font-normal text-secondary">${p.unit}</span>
        </td>
        <td class="px-space-md py-space-sm text-center font-mono-data text-xs text-secondary">
          ${p.minLevel} / ${p.maxLevel}
        </td>
        <td class="px-space-md py-space-sm text-center">
          <span class="badge-pill ${badgeClass}">${p.status}</span>
        </td>
        <td class="px-space-md py-space-sm text-left">
          <button onclick="reorderProduct('${p.code}')" class="px-3 py-1 rounded bg-surface-container hover:bg-primary-container hover:text-white text-xs font-bold transition-all">
            إعادة طلب
          </button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    ${renderSubNavTabs('inventory', 'products')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">إدارة المنتجات ومراقبة المخزون</h2>
        <p class="text-xs text-secondary">دليل الأصناف الرئيسي، تخصيص المستودعات، والكميات المتاحة لحظياً في مراكز التوزيع.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="exportTableToCSV('products')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
          <span class="material-symbols-outlined text-[18px]">download</span>
          <span>تصدير دليل الأصناف</span>
        </button>
        <button onclick="navigateTo('inventory', 'alerts')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600">
          <span class="material-symbols-outlined text-[18px]">warning</span>
          <span>تنبيهات إعادة الطلب (${kpis.criticalBreachItems})</span>
        </button>
      </div>
    </div>

    <!-- Inventory KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">إجمالي الأصناف النشطة (SKUs)</span>
        <div class="text-2xl font-bold font-mono-data text-on-surface mt-1">${kpis.totalSKUs}</div>
        <div class="text-xs text-secondary mt-1">موزعة على 3 مستودعات إقليمية</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">تقييم المخزون الإجمالي</span>
        <div class="text-2xl font-bold font-mono-data text-primary mt-1">${formatMoney(kpis.totalInventoryValue)}</div>
        <div class="text-xs text-secondary mt-1">وفق المتوسط المرجح للتكلفة (WAC)</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">أصناف دون حد الأمان الحرج</span>
        <div class="text-2xl font-bold font-mono-data text-rose-600 mt-1">${kpis.criticalBreachItems} أصناف</div>
        <div class="text-xs text-rose-600 mt-1 font-bold">تتطلب أوامر شراء عاجلة</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">نسبة توافر المخزون المكتمل</span>
        <div class="text-2xl font-bold font-mono-data text-emerald-600 mt-1">${kpis.inStockPercentage}%</div>
        <div class="text-xs text-emerald-600 mt-1 font-semibold">أداء تسليم لوجستي متميز</div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="erp-card overflow-hidden">
      <div class="p-space-md border-b border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm bg-surface-container-low/40">
        <div class="flex items-center gap-space-sm w-full sm:w-auto">
          <div class="relative flex-1 sm:w-72">
            <span class="material-symbols-outlined absolute right-2.5 top-2 text-[18px] text-secondary">search</span>
            <input type="text" value="${pState.search}" placeholder="بحث بكود الصنف، الاسم، التصنيف..." 
                   class="w-full h-8 pr-8 pl-3 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:outline-none"
                   oninput="handleTableSearch('products', this.value)" />
          </div>
          <select class="h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 text-secondary focus:border-primary focus:outline-none"
                  onchange="handleTableFilter('products', this.value)">
            <option value="all">جميع حالات المخزون</option>
            <option value="متوفر">متوفر بالمستودع</option>
            <option value="منخفض">مخزون منخفض</option>
            <option value="حرج">خرق حرج</option>
          </select>
        </div>
        <div class="text-xs text-secondary font-mono-data">
          عرض <b>${start + 1}-${Math.min(start + pState.perPage, total)}</b> من أصل <b>${total}</b> صنف
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
              <th class="px-space-md">كود الصنف (SKU)</th>
              <th class="px-space-md">اسم القطعة والتصنيف</th>
              <th class="px-space-md text-left">سعر الوحدة</th>
              <th class="px-space-md text-center">الكمية المتاحة</th>
              <th class="px-space-md text-center">حد الأمان (أدنى / أقصى)</th>
              <th class="px-space-md text-center">حالة المخزون</th>
              <th class="px-space-md text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface">
            ${rows}
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="p-space-md border-t border-outline-variant/30 flex items-center justify-between text-xs text-secondary bg-surface-container-low/20">
        <div>الصفحة ${pState.page} من أصل ${totalPages}</div>
        <div class="flex items-center gap-1 font-mono-data">
          <button onclick="changePage('products', ${pState.page - 1})" ${pState.page <= 1 ? 'disabled class="px-2.5 py-1 rounded bg-surface-container opacity-40"' : 'class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high"'}>السابق</button>
          <button onclick="changePage('products', ${pState.page + 1})" ${pState.page >= totalPages ? 'disabled class="px-2.5 py-1 rounded bg-surface-container opacity-40"' : 'class="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high"'}>التالي</button>
        </div>
      </div>
    </div>
  `;
}

function renderReorderAlertsView() {
  const criticalItems = ERP_STATE.data.inventory.products.filter(p => p.status.includes('حرج') || p.status.includes('منخفض'));

  return `
    ${renderSubNavTabs('inventory', 'alerts')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-rose-600">notification_important</span>
          تنبيهات حد إعادة الطلب الحرج
        </h2>
        <p class="text-xs text-secondary">أصناف بلغت مستويات مخزون حرجة دون حاجز الأمان التشغيلي مع تمييز بصري بالألوان (أصفر / أحمر).</p>
      </div>
      <button onclick="showToast('تم إنشاء حزمة أوامر شراء تعويضية لجميع الأصناف الحرجة.')" class="flex items-center gap-1.5 h-9 px-4 rounded bg-rose-600 text-white font-bold text-xs shadow-sm hover:bg-rose-700">
        <span class="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
        <span>إصدار أوامر توريد مجمعة</span>
      </button>
    </div>

    <!-- Highlight Alert Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md mb-space-lg">
      ${criticalItems.map(item => {
        const isRed = item.status.includes('حرج');
        const cardBorder = isRed ? 'border-rose-400 bg-rose-50/40' : 'border-amber-400 bg-amber-50/40';
        const badgeColor = isRed ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white';

        return `
          <div class="erp-card p-space-lg border-2 ${cardBorder} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono-data text-xs font-bold text-primary">${item.code}</span>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeColor}">
                  ${item.status}
                </span>
              </div>
              <h4 class="font-bold text-sm text-on-surface leading-tight mb-1">${item.name}</h4>
              <p class="text-xs text-secondary mb-3">${item.category} • ${item.warehouse}</p>
              
              <div class="grid grid-cols-3 gap-2 p-2 rounded bg-surface-container-lowest/90 text-center font-mono-data text-xs mb-3 border border-outline-variant/30">
                <div>
                  <span class="text-secondary block text-[10px]">الكمية الحالية</span>
                  <span class="font-bold text-base ${isRed ? 'text-rose-600' : 'text-amber-600'}">${item.qty}</span>
                </div>
                <div>
                  <span class="text-secondary block text-[10px]">حد الأمان</span>
                  <span class="font-bold text-base text-on-surface">${item.minLevel}</span>
                </div>
                <div>
                  <span class="text-secondary block text-[10px]">عجز المخزون</span>
                  <span class="font-bold text-base text-rose-600">-${item.minLevel - item.qty}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-outline-variant/30">
              <span class="font-mono-data text-xs font-bold text-secondary">سعر الوحدة: ${formatMoney(item.price)}</span>
              <button onclick="reorderProduct('${item.code}')" class="px-3 py-1.5 rounded bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all">
                طلب شراء عاجل
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderStockMovementView() {
  const { stockMovements } = ERP_STATE.data.inventory;

  return `
    ${renderSubNavTabs('inventory', 'movement')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">سجل حركات وتدقيق المخزون (Audit Trail)</h2>
        <p class="text-xs text-secondary">سجل مفصل وتاريخي للحركات الواردة (Receiving) والصادرة (Issuing) مع التوقيت والمسؤول المعتمد.</p>
      </div>
      <button onclick="exportTableToCSV('movements')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
        <span class="material-symbols-outlined text-[18px]">download</span>
        <span>تحميل سجل التدقيق</span>
      </button>
    </div>

    <!-- Movement Audit Table -->
    <div class="erp-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
              <th class="px-space-md">رقم الحركة والتاريخ</th>
              <th class="px-space-md">نوع الحركة</th>
              <th class="px-space-md">بيان الصنف والكود</th>
              <th class="px-space-md text-center">الكمية المسجلة</th>
              <th class="px-space-md">المستند المرجعي</th>
              <th class="px-space-md">المستخدم المنفذ</th>
              <th class="px-space-md">ملاحظات الفحص والتشغيل</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface">
            ${stockMovements.map(m => {
              const isRecv = m.type.includes('وارد');
              const isIssue = m.type.includes('صادر');
              const badgeClass = isRecv ? 'badge-success' : (isIssue ? 'badge-info' : 'badge-warning');

              return `
                <tr class="hover:bg-surface-container-low/60 transition-colors">
                  <td class="px-space-md py-space-sm font-mono-data text-xs">
                    <div class="font-bold text-primary">${m.id}</div>
                    <div class="text-[11px] text-secondary">${m.timestamp}</div>
                  </td>
                  <td class="px-space-md py-space-sm">
                    <span class="badge-pill ${badgeClass}">
                      <span class="material-symbols-outlined text-[13px]">${isRecv ? 'call_received' : (isIssue ? 'call_made' : 'tune')}</span>
                      ${m.type}
                    </span>
                  </td>
                  <td class="px-space-md py-space-sm">
                    <div class="font-bold text-on-surface text-xs">${m.productName}</div>
                    <div class="font-mono-data text-[11px] text-secondary">${m.productCode}</div>
                  </td>
                  <td class="px-space-md py-space-sm text-center font-mono-data font-bold ${isRecv ? 'text-emerald-600' : 'text-rose-600'}">
                    ${m.qty} ${m.unit}
                  </td>
                  <td class="px-space-md py-space-sm font-mono-data text-xs font-bold text-primary">${m.refDoc}</td>
                  <td class="px-space-md py-space-sm text-xs font-bold text-on-surface">${m.performedBy}</td>
                  <td class="px-space-md py-space-sm text-xs text-secondary">${m.notes}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 3. SALES & CRM MODULE (وحدة المبيعات والعملاء)
// ============================================================================

function renderCustomersView() {
  const { customers } = ERP_STATE.data.sales;

  return `
    ${renderSubNavTabs('sales', 'customers')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">دليل وحسابات العملاء</h2>
        <p class="text-xs text-secondary">قاعدة بيانات العملاء المعتمدين، جهات الاتصال، العناوين، وإجمالي المبيعات المحققة.</p>
      </div>
      <button onclick="showToast('تم فتح نافذة تسجيل عميل جديد.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">person_add</span>
        <span>تسجيل عميل جديد</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
      ${customers.map(c => `
        <div class="erp-card p-space-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono-data text-xs font-bold text-primary">${c.id}</span>
              <span class="badge-pill ${c.status === 'عميل مميز' ? 'badge-success' : 'badge-info'}">${c.status}</span>
            </div>
            <h3 class="font-bold text-sm text-on-surface mb-1">${c.name}</h3>
            <div class="text-xs text-secondary flex items-center gap-1 mb-3">
              <span class="material-symbols-outlined text-[14px]">person</span> ${c.contactPerson}
            </div>

            <div class="space-y-1.5 text-xs text-secondary mb-4 bg-surface-container-low p-2.5 rounded">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">call</span>
                <span class="font-mono-data text-on-surface font-semibold" dir="ltr">${c.phone}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">mail</span>
                <span class="font-mono-data">${c.email}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">location_on</span>
                <span class="truncate">${c.address}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono-data">
            <div>
              <span class="text-secondary block text-[10px]">عدد الطلبات</span>
              <span class="font-bold text-on-surface">${c.totalOrders} طلب</span>
            </div>
            <div class="text-left">
              <span class="text-secondary block text-[10px]">إجمالي المعاملات</span>
              <span class="font-bold text-primary">${formatMoney(c.totalSpend)}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSalesOrdersView() {
  const { customers } = ERP_STATE.data.sales;
  const { products } = ERP_STATE.data.inventory;

  return `
    ${renderSubNavTabs('sales', 'orders')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">نموذج إنشاء أمر بيع تفاعلي</h2>
        <p class="text-xs text-secondary">اختيار العميل، إضافة بنود المنتجات، تطبيق الخصم (نسبة مئوية أو مبلغ ثابت)، واحتساب الإجمالي فورياً.</p>
      </div>
      <button onclick="navigateTo('sales', 'pipeline')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
        <span class="material-symbols-outlined text-[18px]">view_kanban</span>
        <span>عرض لوحة متابعة الطلبات</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
      <!-- Order Creation Form -->
      <div class="erp-card p-space-xl lg:col-span-2 space-y-space-md">
        <h3 class="font-bold text-sm text-on-surface border-b border-outline-variant/30 pb-2">بيانات ومواصفات أمر البيع الجديد</h3>

        <!-- Customer Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
          <div>
            <label class="block text-xs font-bold text-secondary mb-1">اختر حساب العميل *</label>
            <select id="soCustomerSelect" class="w-full h-9 px-3 text-xs rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              ${customers.map(c => `<option value="${c.id}">${c.name} (${c.contactPerson})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-secondary mb-1">مندوب المبيعات المسؤول</label>
            <input type="text" id="soRepInput" value="ماركوس ستيرلينغ" class="w-full h-9 px-3 text-xs rounded bg-surface-container-low border border-outline-variant/60 text-secondary" readonly />
          </div>
        </div>

        <!-- Product Line Items -->
        <div>
          <label class="block text-xs font-bold text-secondary mb-2">بنود الطلب وأصناف المنتجات</label>
          <div class="space-y-2" id="orderItemsContainer">
            <!-- Default item 1 -->
            <div class="flex items-center gap-2 p-2 rounded bg-surface-container-low/60 border border-outline-variant/30 order-item-row">
              <select class="flex-1 h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 item-product-select" onchange="recalculateSalesOrder()">
                ${products.map(p => `<option value="${p.code}" data-price="${p.price}">${p.name} - ${formatMoney(p.price)}</option>`).join('')}
              </select>
              <input type="number" min="1" value="10" class="w-20 h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 text-center item-qty-input font-mono-data font-bold" oninput="recalculateSalesOrder()" />
              <button onclick="removeOrderItemRow(this)" class="p-1 rounded text-secondary hover:text-rose-600">
                <span class="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
          <button onclick="addOrderItemRow()" class="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            <span class="material-symbols-outlined text-[16px]">add</span> إضافة بند منتج آخر
          </button>
        </div>

        <!-- Discount Setting (Percentage or Fixed) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-2 border-t border-outline-variant/30">
          <div>
            <label class="block text-xs font-bold text-secondary mb-1">نوع الخصم التجاري الممنوح</label>
            <div class="flex items-center gap-4 text-xs font-bold">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="discountType" value="percent" checked onchange="recalculateSalesOrder()" class="accent-primary" />
                نسبة مئوية (%)
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="radio" name="discountType" value="fixed" onchange="recalculateSalesOrder()" class="accent-primary" />
                مبلغ خصم ثابت ($)
              </label>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-secondary mb-1">قيمة الخصم</label>
            <input type="number" id="soDiscountValue" value="5" min="0" class="w-full h-8 px-3 text-xs rounded bg-surface-container-lowest border border-outline-variant/60 font-mono-data font-bold" oninput="recalculateSalesOrder()" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-secondary mb-1">شروط وملاحظات التعاقد</label>
          <textarea id="soNotes" rows="2" class="w-full p-2.5 text-xs rounded bg-surface-container-lowest border border-outline-variant/60" placeholder="مثال: تسليم المستودع F.O.B، شروط الدفع آجل 30 يوماً، شحن سريع."></textarea>
        </div>

        <button onclick="submitSalesOrder()" class="w-full h-10 rounded bg-primary-container text-on-primary font-bold text-xs hover:bg-primary shadow-sm transition-all flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[18px]">send</span>
          <span>اعتماد الطلب وتحويله لخط سير الطلبات</span>
        </button>
      </div>

      <!-- Real-time Costing Summary Panel -->
      <div class="erp-card p-space-lg h-fit space-y-space-md">
        <h3 class="font-bold text-sm text-on-surface">ملخص القيمة المالية للطلب</h3>
        <div class="space-y-3 font-mono-data text-xs">
          <div class="flex justify-between py-1 text-secondary">
            <span>المجموع الفرعي (Subtotal)</span>
            <span id="summarySubtotal" class="font-bold text-on-surface">$3,400.00</span>
          </div>
          <div class="flex justify-between py-1 text-rose-600">
            <span>الخصم المطبق</span>
            <span id="summaryDiscount" class="font-bold">-$170.00</span>
          </div>
          <div class="flex justify-between py-1 text-secondary">
            <span>ضريبة القيمة المضافة (10%)</span>
            <span id="summaryTax" class="font-bold text-on-surface">$323.00</span>
          </div>
          <div class="pt-3 border-t border-outline-variant/30 flex justify-between font-bold text-sm text-primary">
            <span>القيمة الإجمالية الصافية</span>
            <span id="summaryTotal" class="text-base font-bold font-mono-data">$3,553.00</span>
          </div>
        </div>

        <div class="p-3 rounded bg-surface-container-low text-[11px] text-secondary space-y-1">
          <div class="flex items-center gap-1 text-on-surface font-bold">
            <span class="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
            ربط آلي مع دفتر الأستاذ العام (GL)
          </div>
          <p>يتم حجز الأصناف آلياً من المخزون بمجرد ترحيل أمر البيع وتحديث حساب العميل التراكمي.</p>
        </div>
      </div>
    </div>
  `;
}

function renderSalesPipelineView() {
  const { orders } = ERP_STATE.data.sales;

  const newOrders = orders.filter(o => o.stage === 'new');
  const procOrders = orders.filter(o => o.stage === 'processing');
  const shipOrders = orders.filter(o => o.stage === 'shipped');

  function renderCard(order) {
    return `
      <div class="erp-card p-3 mb-2.5 kanban-card bg-surface-container-lowest border-r-4 ${order.stage === 'new' ? 'border-r-blue-500' : (order.stage === 'processing' ? 'border-r-amber-500' : 'border-r-emerald-500')}">
        <div class="flex items-center justify-between mb-1.5">
          <span class="font-mono-data text-[11px] font-bold text-primary">${order.id}</span>
          <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${order.priority.includes('عاجل') || order.priority.includes('طارئ') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-secondary'}">${order.priority}</span>
        </div>
        <div class="font-bold text-xs text-on-surface mb-1">${order.customerName}</div>
        <div class="text-[11px] text-secondary mb-2">${order.itemsSummary}</div>
        <div class="flex items-center justify-between pt-2 border-t border-outline-variant/20">
          <span class="font-mono-data font-bold text-xs text-on-surface">${formatMoney(order.amount)}</span>
          <div class="flex items-center gap-1">
            ${order.stage === 'new' ? `
              <button onclick="advanceOrderStatus('${order.id}', 'processing')" class="px-2 py-0.5 rounded bg-blue-100 hover:bg-blue-200 text-primary text-[10px] font-bold">
                تجهيز ←
              </button>
            ` : (order.stage === 'processing' ? `
              <button onclick="advanceOrderStatus('${order.id}', 'shipped')" class="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                شحن ←
              </button>
            ` : `
              <span class="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px]">done_all</span> تم التسليم</span>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  return `
    ${renderSubNavTabs('sales', 'pipeline')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">خط سير وتتبع الطلبات (Order Pipeline)</h2>
        <p class="text-xs text-secondary">لوحة كانبان تفاعلية لنقل الطلبات عبر المراحل التشغيلية الثلاث: "جديد" ➔ "قيد التجهيز" ➔ "تم الشحن والتسليم".</p>
      </div>
      <button onclick="navigateTo('sales', 'orders')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span>إنشاء أمر بيع جديد</span>
      </button>
    </div>

    <!-- Kanban Progression Board Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      <!-- 1. New Orders -->
      <div class="kanban-col">
        <div class="flex items-center justify-between mb-3 px-1">
          <span class="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> طلبات جديدة وعروض أسعار
          </span>
          <span class="px-2 py-0.5 rounded-full bg-surface-container-high font-mono-data text-xs font-bold">${newOrders.length}</span>
        </div>
        <div>${newOrders.map(renderCard).join('')}</div>
      </div>

      <!-- 2. Processing Orders -->
      <div class="kanban-col">
        <div class="flex items-center justify-between mb-3 px-1">
          <span class="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> قيد التجهيز والتجميع
          </span>
          <span class="px-2 py-0.5 rounded-full bg-surface-container-high font-mono-data text-xs font-bold">${procOrders.length}</span>
        </div>
        <div>${procOrders.map(renderCard).join('')}</div>
      </div>

      <!-- 3. Shipped Orders -->
      <div class="kanban-col">
        <div class="flex items-center justify-between mb-3 px-1">
          <span class="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> تم الشحن والتسليم
          </span>
          <span class="px-2 py-0.5 rounded-full bg-surface-container-high font-mono-data text-xs font-bold">${shipOrders.length}</span>
        </div>
        <div>${shipOrders.map(renderCard).join('')}</div>
      </div>
    </div>
  `;
}

// ============================================================================
// 4. PURCHASING & SUPPLIERS MODULE (وحدة المشتريات والموردين)
// ============================================================================

function renderSuppliersView() {
  const { suppliers } = ERP_STATE.data.purchasing;

  return `
    ${renderSubNavTabs('purchasing', 'suppliers')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">دليل الموردين المعتمدين</h2>
        <p class="text-xs text-secondary">قاعدة بيانات الموردين المعتمدين، تقييمات الجودة والالتزام، وشروط السداد التعاقدية.</p>
      </div>
      <button onclick="showToast('تم فتح نافذة تسجيل مورد معتمد جديد.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">add_business</span>
        <span>تسجيل مورد جديد</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
      ${suppliers.map(s => `
        <div class="erp-card p-space-lg flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono-data text-xs font-bold text-primary">${s.id}</span>
              <span class="badge-pill badge-success flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">star</span> ${s.rating} / 5.0
              </span>
            </div>
            <h3 class="font-bold text-sm text-on-surface mb-1">${s.name}</h3>
            <p class="text-xs text-secondary mb-3">${s.category}</p>

            <div class="space-y-1.5 text-xs text-secondary bg-surface-container-low p-2.5 rounded mb-3">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">person</span>
                <span class="font-bold text-on-surface">${s.contactPerson}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">call</span>
                <span class="font-mono-data" dir="ltr">${s.phone}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">mail</span>
                <span class="font-mono-data">${s.email}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono-data">
            <div>
              <span class="text-secondary block text-[10px]">شروط السداد</span>
              <span class="font-bold text-on-surface">${s.paymentTerms}</span>
            </div>
            <div>
              <span class="text-secondary block text-[10px]">أوامر شراء نشطة</span>
              <span class="font-bold text-primary">${s.activeOrders} أوامر</span>
            </div>
            <button onclick="navigateTo('purchasing', 'quotes')" class="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
              مقارنة العروض
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderQuotationsView() {
  const { quotationsComparison } = ERP_STATE.data.purchasing;

  return `
    ${renderSubNavTabs('purchasing', 'quotes')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">مصفوفة مقارنة عروض الأسعار (Quotations Matrix)</h2>
        <p class="text-xs text-secondary">تقييم عروض الأسعار التنافسية الواردة من عدة موردين لنفس الصنف لاختيار العرض الأفضل.</p>
      </div>
      <button onclick="navigateTo('purchasing', 'po')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
        <span class="material-symbols-outlined text-[18px]">receipt_long</span>
        <span>أوامر الشراء الرسمية</span>
      </button>
    </div>

    <!-- Active Requisition Target Info -->
    <div class="erp-card p-space-md mb-space-lg bg-surface-container-low/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <span class="text-xs font-bold text-secondary uppercase">الصنف المطلوب شراؤه</span>
        <h3 class="font-bold text-sm text-on-surface">${quotationsComparison.itemName}</h3>
        <span class="font-mono-data text-xs text-primary font-bold">كود الصنف: ${quotationsComparison.itemCode}</span>
      </div>
      <div class="text-left">
        <span class="text-xs font-bold text-secondary uppercase">الميزانية التقديرية</span>
        <div class="font-mono-data font-bold text-base text-on-surface">${formatMoney(quotationsComparison.targetBudget)} / للوحدة</div>
      </div>
    </div>

    <!-- Comparison Matrix Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-space-md">
      ${quotationsComparison.vendors.map(v => `
        <div class="erp-card p-space-lg flex flex-col justify-between relative overflow-hidden ${v.isRecommended ? 'border-2 border-primary-container ring-2 ring-primary-container/20' : ''}">
          ${v.isRecommended ? `
            <div class="absolute top-0 left-0 bg-primary-container text-on-primary px-3 py-0.5 text-[10px] font-bold rounded-br uppercase tracking-wider">
              العرض الموصى به
            </div>
          ` : ''}

          <div>
            <div class="mb-3 pt-1">
              <span class="badge-pill ${v.isRecommended ? 'badge-success' : 'badge-neutral'} mb-2">${v.badge}</span>
              <h4 class="font-bold text-sm text-on-surface">${v.vendorName}</h4>
            </div>

            <div class="p-3 rounded bg-surface-container-low mb-4 text-center">
              <span class="text-xs text-secondary block">سعر الوحدة المعروض</span>
              <div class="font-mono-data text-2xl font-bold text-primary">${formatMoney(v.pricePerUnit)}</div>
              <span class="font-mono-data text-xs text-secondary">إجمالي الدفعة (100 وحدة): ${formatMoney(v.totalPrice)}</span>
            </div>

            <div class="space-y-2 text-xs font-mono-data mb-4">
              <div class="flex justify-between py-1 border-b border-outline-variant/20">
                <span class="text-secondary">مدة التوريد</span>
                <span class="font-bold text-on-surface">${v.leadTime}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-outline-variant/20">
                <span class="text-secondary">فترة الضمان</span>
                <span class="font-bold text-on-surface">${v.warranty}</span>
              </div>
              <div class="flex justify-between py-1 border-b border-outline-variant/20">
                <span class="text-secondary">تقييم جودة المورد</span>
                <span class="font-bold text-emerald-700">${v.rating} / 5.0</span>
              </div>
              <div class="flex justify-between py-1 border-b border-outline-variant/20">
                <span class="text-secondary">الشهادات والاعتمادات</span>
                <span class="font-bold text-on-surface text-[11px]">${v.compliance}</span>
              </div>
            </div>

            <p class="text-[11px] text-secondary italic mb-4 leading-relaxed">${v.notes}</p>
          </div>

          <button onclick="acceptQuotationAndGeneratePO('${v.vendorName}', ${v.totalPrice})" 
                  class="w-full py-2.5 rounded text-xs font-bold transition-all ${v.isRecommended ? 'bg-primary-container text-white hover:bg-primary shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'}">
            اعتماد العرض وإصدار أمر شراء رسمي
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPurchaseOrdersView() {
  const { purchaseOrders } = ERP_STATE.data.purchasing;

  return `
    ${renderSubNavTabs('purchasing', 'po')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">أوامر الشراء والحسابات الدائنة (PO & AP)</h2>
        <p class="text-xs text-secondary">أوامر الشراء الرسمية الصادرة للموردين، التحقق من المطابقة الثلاثية، ومتابعة الاستحقاقات الدائنة.</p>
      </div>
      <button onclick="showToast('تم فتح نافذة إصدار أمر شراء رسمي جديد.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        <span>إصدار أمر شراء جديد</span>
      </button>
    </div>

    <div class="erp-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
              <th class="px-space-md">رقم أمر الشراء</th>
              <th class="px-space-md">اسم المورد</th>
              <th class="px-space-md">بيان الأصناف والكميات</th>
              <th class="px-space-md">تاريخ الإصدار / التوريد المتوقع</th>
              <th class="px-space-md text-left">القيمة المالية</th>
              <th class="px-space-md text-center">حالة الأمر</th>
              <th class="px-space-md text-center">المطابقة الثلاثية (3-Way)</th>
              <th class="px-space-md text-left">موقف الصرف (AP)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface">
            ${purchaseOrders.map(po => `
              <tr class="hover:bg-surface-container-low/60 transition-colors">
                <td class="px-space-md py-space-sm font-mono-data font-bold text-primary">${po.id}</td>
                <td class="px-space-md py-space-sm font-bold text-on-surface text-xs">${po.supplier}</td>
                <td class="px-space-md py-space-sm text-xs text-secondary">${po.itemSummary}</td>
                <td class="px-space-md py-space-sm font-mono-data text-xs text-secondary">
                  ${po.issueDate} / <span class="text-on-surface font-bold">${po.expectedDate}</span>
                </td>
                <td class="px-space-md py-space-sm text-left font-mono-data font-bold text-on-surface text-sm">
                  ${formatMoney(po.amount)}
                </td>
                <td class="px-space-md py-space-sm text-center">
                  <span class="badge-pill ${po.status.includes('استلام') ? 'badge-success' : 'badge-info'}">${po.status}</span>
                </td>
                <td class="px-space-md py-space-sm text-center">
                  <span class="badge-pill ${po.matchingStatus.includes('تامة') ? 'badge-success' : 'badge-warning'}">
                    ${po.matchingStatus}
                  </span>
                </td>
                <td class="px-space-md py-space-sm text-left text-xs text-secondary font-bold">${po.apStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 5. HUMAN RESOURCES (HR) MODULE (وحدة الموارد البشرية والرواتب)
// ============================================================================

function renderEmployeesView() {
  const { employees, kpis } = ERP_STATE.data.hr;

  return `
    ${renderSubNavTabs('hr', 'employees')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">سجل وملفات الموظفين (Employee Profiles)</h2>
        <p class="text-xs text-secondary">دليل الموظفين الإداري، المسميات الوظيفية، الرواتب الأساسية، والحالة اليومية المحدثة.</p>
      </div>
      <button onclick="showToast('تم فتح نموذج تعيين موظف جديد.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">person_add</span>
        <span>إضافة موظف جديد</span>
      </button>
    </div>

    <!-- HR KPIs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">إجمالي القوى العاملة</span>
        <div class="text-2xl font-bold font-mono-data text-on-surface mt-1">${kpis.totalEmployees} موظف</div>
        <div class="text-xs text-secondary mt-1">عقود عمل بدوام كامل</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">نسبة الحضور اليومية</span>
        <div class="text-2xl font-bold font-mono-data text-emerald-600 mt-1">${kpis.attendanceRate}%</div>
        <div class="text-xs text-emerald-600 mt-1 font-semibold">139 موظف حاضر اليوم</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">الموظفون في إجازات معتمدة</span>
        <div class="text-2xl font-bold font-mono-data text-amber-600 mt-1">${kpis.onLeaveToday} موظفين</div>
        <div class="text-xs text-secondary mt-1">إجازات سنوية ومرضية مصرحة</div>
      </div>
      <div class="erp-card p-space-md">
        <span class="text-xs font-bold text-secondary uppercase">إجمالي مسير الرواتب الشهري</span>
        <div class="text-2xl font-bold font-mono-data text-primary mt-1">${formatMoney(kpis.monthlyPayrollTotal)}</div>
        <div class="text-xs text-secondary mt-1">جاهز للمصادقة البنكية للتحويل</div>
      </div>
    </div>

    <!-- Employee Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
      ${employees.map(emp => `
        <div class="erp-card p-space-lg flex flex-col justify-between">
          <div>
            <div class="flex items-start gap-3 mb-3">
              <img src="${emp.avatar}" alt="${emp.name}" class="w-12 h-12 rounded-full object-cover ring-2 ring-outline-variant/40" />
              <div>
                <h3 class="font-bold text-sm text-on-surface leading-tight">${emp.name}</h3>
                <span class="text-xs text-primary font-bold block">${emp.jobTitle}</span>
                <span class="font-mono-data text-[11px] text-secondary">${emp.id} • ${emp.department}</span>
              </div>
            </div>

            <div class="space-y-1.5 text-xs text-secondary bg-surface-container-low p-2.5 rounded mb-3">
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">mail</span>
                <span class="font-mono-data truncate">${emp.email}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">call</span>
                <span class="font-mono-data" dir="ltr">${emp.phone}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px] text-emerald-600">fingerprint</span>
                <span class="text-[11px] font-bold text-on-surface truncate">${emp.attendance}</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between text-xs font-mono-data">
            <div>
              <span class="text-secondary block text-[10px]">الراتب الأساسي</span>
              <span class="font-bold text-primary">${formatMoney(emp.baseSalary)}</span>
            </div>
            <button onclick="navigateTo('hr', 'payroll')" class="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
              كشف الراتب
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAttendanceView() {
  const { attendanceLog } = ERP_STATE.data.hr;

  return `
    ${renderSubNavTabs('hr', 'attendance')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">محطة تسجيل الحضور والانصراف (Punch Terminal)</h2>
        <p class="text-xs text-secondary">محطة تسجيل الحضور والانصراف الرقمية مع التوقيت المباشر والمزامنة مع أجهزة البصمة المادية.</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="simulateBiometricSync()" class="flex items-center gap-1.5 h-9 px-3 rounded bg-surface-container-lowest text-on-surface font-semibold text-xs border border-outline-variant/40 hover:bg-surface-container-low shadow-sm">
          <span class="material-symbols-outlined text-[18px] text-primary">sync</span>
          <span>مزامنة أجهزة البصمة الحية</span>
        </button>
      </div>
    </div>

    <!-- Web Punch Terminal Widget -->
    <div class="erp-card p-space-lg mb-space-lg bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-space-md shadow-md">
      <div class="flex items-center gap-space-md">
        <div class="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-primary-fixed">
          <span class="material-symbols-outlined text-[32px]">schedule</span>
        </div>
        <div>
          <span class="text-xs text-blue-200 font-bold uppercase tracking-wider">محطة تسجيل الويب الرقمية • Workstation #04</span>
          <div class="text-3xl font-bold font-mono-data tracking-tight text-left" dir="ltr" id="liveClockDisplay">08:42:15 AM</div>
          <span class="text-xs text-emerald-300 flex items-center gap-1 mt-0.5 font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span> المحطة متصلة ومتزامنة مع الخادم المركزي
          </span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button onclick="performWebPunch('تسجيل حضور')" class="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-white shadow-sm transition-all flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">login</span>
          <span>تسجيل حضور (Check-In)</span>
        </button>
        <button onclick="performWebPunch('تسجيل انصراف')" class="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white shadow-sm transition-all flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[18px]">logout</span>
          <span>تسجيل انصراف (Check-Out)</span>
        </button>
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="erp-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
              <th class="px-space-md">رقم التسجيل</th>
              <th class="px-space-md">اسم الموظف والوظيفة</th>
              <th class="px-space-md text-center">وقت الحضور</th>
              <th class="px-space-md text-center">وقت الانصراف</th>
              <th class="px-space-md">طريقة التحقق والمصادقة</th>
              <th class="px-space-md text-left">حالة الحضور</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface" id="attendanceTableBody">
            ${attendanceLog.map(log => `
              <tr class="hover:bg-surface-container-low/60 transition-colors">
                <td class="px-space-md py-space-sm font-mono-data text-xs text-primary font-bold">${log.id}</td>
                <td class="px-space-md py-space-sm">
                  <div class="font-bold text-xs text-on-surface">${log.employee}</div>
                  <div class="text-[11px] text-secondary">${log.role}</div>
                </td>
                <td class="px-space-md py-space-sm text-center font-mono-data text-xs font-bold text-on-surface">${log.checkIn}</td>
                <td class="px-space-md py-space-sm text-center font-mono-data text-xs text-secondary">${log.checkOut}</td>
                <td class="px-space-md py-space-sm text-xs text-secondary flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  ${log.syncType}
                </td>
                <td class="px-space-md py-space-sm text-left">
                  <span class="badge-pill ${log.status.includes('الموعد') ? 'badge-success' : 'badge-warning'}">${log.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLeaveManagementView() {
  const { leaveRequests } = ERP_STATE.data.hr;

  return `
    ${renderSubNavTabs('hr', 'leave')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">إدارة واعتماد الإجازات (Leave Management)</h2>
        <p class="text-xs text-secondary">متابعة طلبات الإجازات السنوية والمرضية للموظفين مع لوحة اعتماد/رفض فورية للمدراء المباشرين.</p>
      </div>
      <button onclick="openLeaveRequestModal()" class="flex items-center gap-1.5 h-9 px-3 rounded bg-primary-container text-on-primary font-bold text-xs shadow-sm hover:bg-primary">
        <span class="material-symbols-outlined text-[18px]">add</span>
        <span>تقديم طلب إجازة</span>
      </button>
    </div>

    <!-- Pending Requests Review Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
      ${leaveRequests.map(req => {
        const isPending = req.status.includes('مراجعة');
        const isApproved = req.status.includes('معتمدة');
        const badgeClass = isApproved ? 'badge-success' : (isPending ? 'badge-warning' : 'badge-danger');

        return `
          <div class="erp-card p-space-lg flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="font-mono-data text-xs font-bold text-primary">${req.id}</span>
                <span class="badge-pill ${badgeClass}">${req.status}</span>
              </div>
              <h3 class="font-bold text-sm text-on-surface mb-0.5">${req.employeeName}</h3>
              <span class="text-xs text-secondary block mb-3">${req.department} • <b class="text-primary">${req.leaveType}</b></span>

              <div class="p-2.5 rounded bg-surface-container-low text-xs font-mono-data space-y-1 mb-3">
                <div class="flex justify-between">
                  <span class="text-secondary">المدة المطلوبة</span>
                  <span class="font-bold text-on-surface">${req.days} أيام عمل</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-secondary">الفترة</span>
                  <span>${req.startDate} ➔ ${req.endDate}</span>
                </div>
              </div>

              <p class="text-xs text-secondary italic mb-4">"${req.reason}"</p>
            </div>

            <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
              ${isPending ? `
                <button onclick="handleLeaveDecision('${req.id}', 'مرفوضة')" class="px-3 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all">
                  رفض الطلب
                </button>
                <button onclick="handleLeaveDecision('${req.id}', 'معتمدة')" class="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-all">
                  قبول واعتماد الإجازة
                </button>
              ` : `
                <span class="text-xs text-secondary font-semibold">تم اتخاذ القرار النهائي في ${req.appliedOn}</span>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPayrollView() {
  const { employees } = ERP_STATE.data.hr;

  return `
    ${renderSubNavTabs('hr', 'payroll')}

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
      <div>
        <h2 class="font-headline-lg font-bold text-on-surface">مسير الرواتب الآلي (Monthly Payroll Calculation)</h2>
        <p class="text-xs text-secondary">احتساب آلي دقيق لصافي الراتب الشهري يشمل الراتب الأساسي، الحوافز، استقطاعات الضرائب والتأمينات، وخصم الغياب.</p>
      </div>
      <button onclick="showToast('تم اعتماد مسير الرواتب وإرسال ملف الإيداع البنكي المجمع.')" class="flex items-center gap-1.5 h-9 px-3 rounded bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700">
        <span class="material-symbols-outlined text-[18px]">payments</span>
        <span>اعتماد وإيداع الرواتب شهرياً</span>
      </button>
    </div>

    <div class="erp-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr class="h-10 bg-surface-container-low text-xs font-bold text-secondary uppercase tracking-wider">
              <th class="px-space-md">كود الموظف</th>
              <th class="px-space-md">اسم الموظف والمسمى الوظيفي</th>
              <th class="px-space-md text-left">الراتب الأساسي</th>
              <th class="px-space-md text-left">الحوافز والمكافآت</th>
              <th class="px-space-md text-left">الاستقطاعات</th>
              <th class="px-space-md text-left">خصم الغياب</th>
              <th class="px-space-md text-left">صافي الراتب المستحق</th>
              <th class="px-space-md text-center">حالة الاحتساب</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container/60 font-body-md text-on-surface">
            ${employees.map(emp => {
              const absenceDeduction = emp.absences * (emp.baseSalary / 30);
              const netSalary = emp.baseSalary + emp.bonus - emp.deductions - absenceDeduction;

              return `
                <tr class="hover:bg-surface-container-low/60 transition-colors">
                  <td class="px-space-md py-space-sm font-mono-data text-xs font-bold text-primary">${emp.id}</td>
                  <td class="px-space-md py-space-sm">
                    <div class="font-bold text-xs text-on-surface">${emp.name}</div>
                    <div class="text-[11px] text-secondary">${emp.jobTitle}</div>
                  </td>
                  <td class="px-space-md py-space-sm text-left font-mono-data font-bold text-on-surface">
                    ${formatMoney(emp.baseSalary)}
                  </td>
                  <td class="px-space-md py-space-sm text-left font-mono-data text-emerald-600 font-bold">
                    +${formatMoney(emp.bonus)}
                  </td>
                  <td class="px-space-md py-space-sm text-left font-mono-data text-rose-600 font-bold">
                    -${formatMoney(emp.deductions)}
                  </td>
                  <td class="px-space-md py-space-sm text-left font-mono-data text-xs ${emp.absences > 0 ? 'text-rose-600 font-bold' : 'text-secondary'}">
                    ${emp.absences} يوم (-${formatMoney(absenceDeduction)})
                  </td>
                  <td class="px-space-md py-space-sm text-left font-mono-data font-bold text-base text-primary">
                    ${formatMoney(netSalary)}
                  </td>
                  <td class="px-space-md py-space-sm text-center">
                    <span class="badge-pill badge-success">تم الاحتساب بدقة</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// EVENT HANDLERS & MODAL WORKFLOWS
// ============================================================================

function bindViewEvents() {
  if (document.getElementById('liveClockDisplay')) {
    updateTerminalClock();
  }
}

function updateTerminalClock() {
  const clockEl = document.getElementById('liveClockDisplay');
  if (!clockEl) return;
  const now = new Date();
  clockEl.innerText = now.toLocaleTimeString('en-US');
}
setInterval(updateTerminalClock, 1000);

// Invoices Actions
function markInvoiceStatus(invId, newStatus) {
  const inv = ERP_STATE.data.finance.invoices.find(i => i.id === invId);
  if (inv) {
    inv.status = newStatus;
    if (window.ERP_FIREBASE?.updateInvoiceStatus) {
      window.ERP_FIREBASE.updateInvoiceStatus(invId, newStatus);
    }
    showToast(`تم تغيير حالة الفاتورة ${invId} إلى "${newStatus}". (متزامن سحابياً)`);
    renderActiveView();
  }
}

function openCreateInvoiceModal() {
  const modal = document.getElementById('newInvoiceModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCreateInvoiceModal() {
  const modal = document.getElementById('newInvoiceModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveNewInvoice(e) {
  if (e) e.preventDefault();
  const customer = document.getElementById('modalCustomerInput')?.value || "شركة أبيكس للصناعات الهندسية";
  const amount = parseFloat(document.getElementById('modalAmountInput')?.value || "45000");
  const dueDate = document.getElementById('modalDueDateInput')?.value || "2025-03-15";
  const terms = document.getElementById('modalTermsSelect')?.value || "آجل 30 يوم";

  const newId = `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`;
  const newInvoice = {
    id: newId,
    poRef: `PO-${Math.floor(10000 + Math.random() * 90000)}-ME`,
    customer: customer,
    email: `billing@${customer.substring(0, 8)}.com`,
    avatar: customer.substring(0, 2),
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: dueDate,
    terms: terms,
    amount: amount,
    status: "معلقة",
    notes: "تم الإنشاء عبر واجهة أبيكس السحابية المتزامنة مع Firebase"
  };

  ERP_STATE.data.finance.invoices.unshift(newInvoice);

  // Sync to Firebase Cloud
  if (window.ERP_FIREBASE?.saveInvoice) {
    window.ERP_FIREBASE.saveInvoice(newInvoice);
  }

  ERP_STATE.data.finance.kpis.totalReceivables += amount;
  ERP_STATE.data.finance.kpis.outstandingInvoices += 1;

  closeCreateInvoiceModal();
  showToast(`تم حفظ الفاتورة ${newId} سحابياً في Firebase بنجاح!`);
  renderActiveView();
}

// Sales Order Calculator Actions
function addOrderItemRow() {
  const container = document.getElementById('orderItemsContainer');
  const products = ERP_STATE.data.inventory.products;
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 p-2 rounded bg-surface-container-low/60 border border-outline-variant/30 order-item-row';
  row.innerHTML = `
    <select class="flex-1 h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 item-product-select" onchange="recalculateSalesOrder()">
      ${products.map(p => `<option value="${p.code}" data-price="${p.price}">${p.name} - ${formatMoney(p.price)}</option>`).join('')}
    </select>
    <input type="number" min="1" value="5" class="w-20 h-8 px-2 text-xs rounded bg-surface-container-lowest border border-outline-variant/50 text-center item-qty-input font-mono-data font-bold" oninput="recalculateSalesOrder()" />
    <button onclick="removeOrderItemRow(this)" class="p-1 rounded text-secondary hover:text-rose-600">
      <span class="material-symbols-outlined text-[18px]">delete</span>
    </button>
  `;
  container.appendChild(row);
  recalculateSalesOrder();
}

function removeOrderItemRow(btn) {
  const container = document.getElementById('orderItemsContainer');
  if (container.children.length > 1) {
    btn.closest('.order-item-row').remove();
    recalculateSalesOrder();
  } else {
    showToast('يجب أن يحتوي أمر البيع على بند منتج واحد على الأقل.', 'warning');
  }
}

function recalculateSalesOrder() {
  const rows = document.querySelectorAll('.order-item-row');
  let subtotal = 0;

  rows.forEach(r => {
    const select = r.querySelector('.item-product-select');
    const qtyInput = r.querySelector('.item-qty-input');
    const price = parseFloat(select.selectedOptions[0]?.getAttribute('data-price') || 0);
    const qty = parseInt(qtyInput?.value || 0, 10);
    subtotal += (price * qty);
  });

  const discountType = document.querySelector('input[name="discountType"]:checked')?.value || 'percent';
  const discountVal = parseFloat(document.getElementById('soDiscountValue')?.value || 0);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = subtotal * (discountVal / 100);
  } else {
    discountAmount = Math.min(discountVal, subtotal);
  }

  const tax = (subtotal - discountAmount) * 0.10;
  const total = (subtotal - discountAmount) + tax;

  const subEl = document.getElementById('summarySubtotal');
  const discEl = document.getElementById('summaryDiscount');
  const taxEl = document.getElementById('summaryTax');
  const totalEl = document.getElementById('summaryTotal');

  if (subEl) subEl.innerText = formatMoney(subtotal);
  if (discEl) discEl.innerText = `-${formatMoney(discountAmount)}`;
  if (taxEl) taxEl.innerText = formatMoney(tax);
  if (totalEl) totalEl.innerText = formatMoney(total);
}

function submitSalesOrder() {
  const custSelect = document.getElementById('soCustomerSelect');
  const custName = custSelect.options[custSelect.selectedIndex].text;
  const totalText = document.getElementById('summaryTotal')?.innerText || "$0";
  const totalVal = parseFloat(totalText.replace(/[^0-9.-]+/g, '')) || 3500;

  const newOrder = {
    id: `SO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: custSelect.value,
    customerName: custName.split('(')[0].trim(),
    itemsSummary: "باقة مخصصة من المنتجات الهيدروليكية المعتمدة",
    amount: totalVal,
    date: new Date().toISOString().split('T')[0],
    stage: "new",
    priority: "عادي",
    discountType: "percent",
    discountValue: 5,
    rep: "ماركوس ستيرلينغ"
  };

  ERP_STATE.data.sales.orders.unshift(newOrder);

  // Sync to Firebase
  if (window.ERP_FIREBASE?.saveSalesOrder) {
    window.ERP_FIREBASE.saveSalesOrder(newOrder);
  }

  showToast(`تم إدراج أمر البيع ${newOrder.id} وحفظه سحابياً في Firebase!`);
  navigateTo('sales', 'pipeline');
}

function advanceOrderStatus(orderId, nextStage) {
  const order = ERP_STATE.data.sales.orders.find(o => o.id === orderId);
  if (order) {
    order.stage = nextStage;
    if (window.ERP_FIREBASE?.updateOrderStatus) {
      window.ERP_FIREBASE.updateOrderStatus(orderId, nextStage);
    }
    const stageName = nextStage === 'processing' ? 'قيد التجهيز والتجميع' : 'تم الشحن والتسليم';
    showToast(`تم تحديث حالة الطلب ${orderId} سحابياً إلى: ${stageName}.`);
    renderActiveView();
  }
}

// Purchasing Actions
function acceptQuotationAndGeneratePO(vendorName, amount) {
  const newPO = {
    id: `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier: vendorName,
    itemSummary: "صمامات SKU-VAL-9920 صناعية (100 وحدة)",
    issueDate: new Date().toISOString().split('T')[0],
    expectedDate: "2025-02-25",
    amount: amount,
    status: "مؤكد وجار التوريد",
    matchingStatus: "مطابقة ثلاثية تامة",
    apStatus: "معتمد للصرف والاستحقاق"
  };

  ERP_STATE.data.purchasing.purchaseOrders.unshift(newPO);

  // Sync to Firebase
  if (window.ERP_FIREBASE?.savePurchaseOrder) {
    window.ERP_FIREBASE.savePurchaseOrder(newPO);
  }

  showToast(`تم قبول عرض ${vendorName} وإصدار أمر الشراء ${newPO.id} سحابياً!`);
  navigateTo('purchasing', 'po');
}

function reorderProduct(sku) {
  const prod = ERP_STATE.data.inventory.products.find(p => p.code === sku);
  if (prod) {
    showToast(`تم تحويل طلب توريد عاجل للصنف: ${prod.name}.`);
    navigateTo('purchasing', 'quotes');
  }
}

// HR Actions
function performWebPunch(type) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US');

  const newPunch = {
    id: `PUNCH-${Math.floor(1000 + Math.random() * 9000)}`,
    employee: "ماركوس ستيرلينغ",
    role: "نائب الرئيس للعمليات",
    checkIn: type.includes('حضور') ? timeStr : "08:14:22 ص",
    checkOut: type.includes('انصراف') ? timeStr : "--",
    syncType: "محطة الويب الرقمية (Firebase)",
    status: "في الموعد"
  };

  ERP_STATE.data.hr.attendanceLog.unshift(newPunch);

  // Sync to Firebase
  if (window.ERP_FIREBASE?.savePunchLog) {
    window.ERP_FIREBASE.savePunchLog(newPunch);
  }

  showToast(`تم تسجيل ${type} وحفظه سحابياً في تمام ${timeStr}.`);
  renderActiveView();
}

function simulateBiometricSync() {
  if (window.ERP_FIREBASE?.initSync) {
    window.ERP_FIREBASE.initSync();
  }
  showToast('تم الاتصال بسحابة Firebase ومزامنة سجلات البصمة والحضور بنجاح!');
}

function handleLeaveDecision(id, decision) {
  const req = ERP_STATE.data.hr.leaveRequests.find(r => r.id === id);
  if (req) {
    req.status = decision;
    if (window.ERP_FIREBASE?.updateLeaveStatus) {
      window.ERP_FIREBASE.updateLeaveStatus(id, decision);
    }
    showToast(`تم تحديث قرار طلب الإجازة ${id} سحابياً إلى "${decision}".`);
    renderActiveView();
  }
}

// ============================================================================
// FIREBASE CLOUD SYNC MANAGER
// ============================================================================

function openFirebaseModal() {
  const modal = document.getElementById('firebaseSyncModal');
  if (modal) modal.classList.remove('hidden');
}

function closeFirebaseModal() {
  const modal = document.getElementById('firebaseSyncModal');
  if (modal) modal.classList.add('hidden');
}

async function triggerFirebasePush() {
  if (window.ERP_FIREBASE?.seedAllData) {
    showToast('جار رفع ومزامنة كافة بيانات المؤسسة إلى سحابة Firebase...', 'info');
    try {
      await window.ERP_FIREBASE.seedAllData();
      showToast('تم رفع كافة بيانات الوحدات الخمسة إلى Firebase بنجاح!', 'success');
      closeFirebaseModal();
    } catch (e) {
      showToast('حدث خطأ أثناء الرفع إلى Firebase: ' + (e.message || e), 'error');
    }
  } else {
    showToast('خدمة Firebase غير مهيأة بعد.', 'warning');
  }
}

async function triggerFirebasePull() {
  if (window.ERP_FIREBASE?.pullAllData) {
    showToast('جار سحب وتحديث البيانات من سحابة Firebase...', 'info');
    try {
      await window.ERP_FIREBASE.pullAllData();
      showToast('تم سحب وتحديث كافة بيانات الوحدات من Firebase بنجاح!', 'success');
      closeFirebaseModal();
    } catch (e) {
      showToast('حدث خطأ أثناء السحب من Firebase: ' + (e.message || e), 'error');
    }
  } else {
    showToast('خدمة Firebase غير مهيأة بعد.', 'warning');
  }
}

// ============================================================================
// CURRENCY SELECTION
// ============================================================================

function openCurrencyModal() {
  const modal = document.getElementById('currencyModal');
  if (modal) modal.classList.remove('hidden');
}

function closeCurrencyModal() {
  const modal = document.getElementById('currencyModal');
  if (modal) modal.classList.add('hidden');
}

function setCurrency(code) {
  const curr = ERP_STATE.data.currencies.find(c => c.code === code);
  if (curr) {
    ERP_STATE.currency = curr;
    const badge = document.getElementById('nav-currency-label');
    if (badge) badge.innerText = `${curr.code} (${curr.symbol})`;
    closeCurrencyModal();
    showToast(`تم تغيير عملة التقارير إلى: ${curr.name}.`);
    renderActiveView();
  }
}

// ============================================================================
// TABLE SEARCH, FILTER & PAGINATION ENGINE
// ============================================================================

function handleTableSearch(tableKey, query) {
  ERP_STATE.pagination[tableKey].search = query;
  ERP_STATE.pagination[tableKey].page = 1;
  renderActiveView();
}

function handleTableFilter(tableKey, filterValue) {
  ERP_STATE.pagination[tableKey].filter = filterValue;
  ERP_STATE.pagination[tableKey].page = 1;
  renderActiveView();
}

function changePage(tableKey, pageNum) {
  ERP_STATE.pagination[tableKey].page = pageNum;
  renderActiveView();
}

function exportTableToCSV(tableKey) {
  let rows = [];
  let filename = `${tableKey}-export-${new Date().toISOString().split('T')[0]}.csv`;

  if (tableKey === 'invoices') {
    rows = [["رقم الفاتورة", "العميل", "تاريخ الإصدار", "تاريخ الاستحقاق", "المبلغ", "الحالة"]];
    ERP_STATE.data.finance.invoices.forEach(i => {
      rows.push([i.id, i.customer, i.issueDate, i.dueDate, i.amount, i.status]);
    });
  } else if (tableKey === 'products') {
    rows = [["كود الصنف", "الاسم", "التصنيف", "السعر", "الكمية المتاحة", "الحالة"]];
    ERP_STATE.data.inventory.products.forEach(p => {
      rows.push([p.code, p.name, p.category, p.price, p.qty, p.status]);
    });
  }

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();

  showToast(`تم تصدير كشف ${tableKey} بصيغة CSV بنجاح.`);
}

// Global Command Palette
function openGlobalSearch() {
  const modal = document.getElementById('globalSearchModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.getElementById('cmdPaletteInput')?.focus();
  }
}

function closeGlobalSearch() {
  const modal = document.getElementById('globalSearchModal');
  if (modal) modal.classList.add('hidden');
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  let mod = window.INITIAL_MODULE || 'finance';
  let sub = window.INITIAL_SUBVIEW || null;
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const parts = hash.split('/');
    if (parts[0]) mod = parts[0];
    if (parts[1]) sub = parts[1];
  }
  navigateTo(mod, sub);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openGlobalSearch();
    }
    if (e.key === 'Escape') {
      closeSidebar();
      closeGlobalSearch();
      closeCreateInvoiceModal();
      closeCurrencyModal();
    }
  });
});
