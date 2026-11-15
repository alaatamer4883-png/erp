/**
 * Apex Enterprise ERP - Live Operations & Action Handler Engine
 * Fully handles live executions for:
 * - Adding Products & Initial Stock
 * - Stock In (Receiving)
 * - Reorder & Direct Restock / Purchase Order generation
 * - Bulk Reorder for Critical items
 * - Official Purchase Orders (PO)
 * - New Customers, Suppliers, Employees, and Leave Requests
 * - Live sync to Firebase Cloud Firestore and ERP_STATE
 */

// ============================================================================
// 1. DYNAMIC MODALS INJECTION
// ============================================================================

function injectEnterpriseModals() {
  if (document.getElementById('erpDynamicModalsContainer')) return;
  if (!document.body) {
    window.addEventListener('DOMContentLoaded', injectEnterpriseModals);
    return;
  }

  const container = document.createElement('div');
  container.id = 'erpDynamicModalsContainer';
  container.innerHTML = `
<!-- ====================================================================== -->
<!-- 1. نافذة إضافة صنف جديد للمخزون (New Product Modal)                   -->
<!-- ====================================================================== -->
<div id="newProductModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">إضافة صنف جديد إلى دليل المخزون</h3>
          <span class="text-xs text-secondary">تسجيل منتج جديد، تسعيره، وتحديد مستويات الأمان والمستودع</span>
        </div>
        <button onclick="closeNewProductModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newProductForm" onsubmit="handleSaveNewProduct(event)" class="space-y-3.5 text-xs">
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="block font-bold text-secondary mb-1">كود الصنف (SKU) *</label>
            <input type="text" id="newProdCode" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-primary focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">&nbsp;</label>
            <button type="button" onclick="generateProductCode()" class="w-full h-9 px-2 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 font-bold text-[11px] text-secondary flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[15px]">refresh</span>
              توليد كود
            </button>
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">اسم الصنف والبيان التجاري *</label>
          <input type="text" id="newProdName" placeholder="مثال: محرك هيدروليكي 500 بار أو خادم سحابي R740" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">التصنيف الرئيسي *</label>
            <select id="newProdCategory" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-semibold">
              <option value="أنظمة هيدروليكية وميكانيكية">أنظمة هيدروليكية وميكانيكية</option>
              <option value="حواسيب وخوادم وشبكات">حواسيب وخوادم وشبكات</option>
              <option value="أجهزة ومعدات إلكترونية">أجهزة ومعدات إلكترونية</option>
              <option value="قطع غيار ومستهلكات">قطع غيار ومستهلكات</option>
              <option value="كابلات وتوصيلات">كابلات وتوصيلات</option>
              <option value="مواد خام وتصنيع">مواد خام وتصنيع</option>
              <option value="مستلزمات عامة">مستلزمات عامة</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">وحدة القياس</label>
            <select id="newProdUnit" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="قطعة">قطعة</option>
              <option value="وحدة">وحدة</option>
              <option value="كرتونة">كرتونة</option>
              <option value="طقم">طقم</option>
              <option value="متر">متر</option>
              <option value="لتر">لتر</option>
              <option value="كيلوجرام">كيلوجرام</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">سعر الوحدة ($) *</label>
            <input type="number" id="newProdPrice" min="0" step="0.01" value="150.00" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">الرصيد الافتتاحي بالمخزن *</label>
            <input type="number" id="newProdQty" min="0" step="1" value="50" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-emerald-700 focus:border-primary focus:outline-none" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">حد الأمان الأدنى (Reorder Level) *</label>
            <input type="number" id="newProdMinLevel" min="0" step="1" value="15" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-amber-700 focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">الحد الأقصى لسعة المخزون</label>
            <input type="number" id="newProdMaxLevel" min="1" step="1" value="200" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">المستودع المخصص *</label>
            <select id="newProdWarehouse" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="المستودع الرئيسي - القاهرة">المستودع الرئيسي - القاهرة</option>
              <option value="مستودع المنطقة الحرة - الإسكندرية">مستودع المنطقة الحرة - الإسكندرية</option>
              <option value="مستودع العمليات اللوجستية - العاشر">مستودع العمليات اللوجستية - العاشر</option>
              <option value="مستودع الصيانة وقطع الغيار">مستودع الصيانة وقطع الغيار</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">موقع الرف أو الحاوية</label>
            <input type="text" id="newProdLocation" placeholder="مثال: ممر 3 - رف A-14" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 text-secondary focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div class="p-3 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed font-sans">
          <span class="font-bold block mb-0.5">تسجيل حركة وارد آلي ومزامنة سحابية:</span>
          فور الحفظ، سيتم تسجيل رصيد افتتاحي في سجل تدقيق حركات المخزون، وتحديث مؤشرات تقييم المخزون والمزامنة مع Firebase فورياً.
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeNewProductModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveNewProduct()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">save</span>
        <span>حفظ وإضافة الصنف للمخزون</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 2. نافذة توريد واستلام مخزني (Stock In Modal)                         -->
<!-- ====================================================================== -->
<div id="stockInModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">إذن توريد واستلام مخزني (Stock In)</h3>
          <span class="text-xs text-secondary">إضافة كميات واردة وتحديث الرصيد الفعلي للصنف فورياً في المستودع</span>
        </div>
        <button onclick="closeStockInModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="stockInForm" onsubmit="handleSaveStockIn(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اختر الصنف المراد توريده *</label>
          <select id="stockInProductSelect" onchange="updateStockInInfo()" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold">
          </select>
        </div>

        <div id="stockInProdPreview" class="p-3 rounded bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs">
          <div>
            <span class="text-secondary block text-[10px]">الرصيد المتوفر حالياً:</span>
            <span id="stockInCurrentQty" class="font-bold font-mono-data text-primary text-base">0 قطعة</span>
          </div>
          <div>
            <span class="text-secondary block text-[10px]">المستودع الافتراضي:</span>
            <span id="stockInWarehouseName" class="font-bold text-on-surface">المستودع الرئيسي</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">الكمية الموردة الجديدة *</label>
            <input type="number" id="stockInQty" min="1" step="1" value="25" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-emerald-700 focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">جهة التوريد / المورد</label>
            <input type="text" id="stockInSupplier" placeholder="مثال: شركة شنايدر للتوريدات" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">رقم المستند المرجعي (فاتورة شراء / إذن استلام)</label>
          <input type="text" id="stockInRefDoc" placeholder="مثال: PO-2025-492 أو فاتورة رقم 8940" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">ملاحظات الفحص والاستلام</label>
          <textarea id="stockInNotes" rows="2" class="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/60" placeholder="مثال: تم فحص البضاعة ومطابقة المواصفات الفنية مع أمر الشراء."></textarea>
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeStockInModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveStockIn()" class="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">move_to_inbox</span>
        <span>اعتماد التوريد وزيادة الرصيد فوراً</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 3. نافذة إصدار وتنفيذ طلب توريد وشراء الصنف (Reorder & Restock)       -->
<!-- ====================================================================== -->
<div id="reorderProductModal" class="fixed inset-0 z-50 modal-overlay flex items-center justify-center hidden p-4">
  <div class="w-full max-w-lg bg-surface-container-lowest rounded-xl shadow-2xl p-space-xl modal-content-panel space-y-4">
    <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[24px]">shopping_cart</span>
        <div>
          <h3 class="font-bold text-base text-on-surface">إصدار وتنفيذ طلب توريد الصنف</h3>
          <span class="text-xs text-secondary">إعادة تعبئة المخزون والتنفيذ الفوري المباشر أو إصدار أمر شراء رسمي</span>
        </div>
      </div>
      <button onclick="closeReorderProductModal()" class="p-1 rounded-full hover:bg-surface-container text-secondary">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>

    <div class="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40 space-y-2">
      <div class="flex items-center justify-between">
        <span id="reorderProdName" class="font-bold text-sm text-primary">اسم المنتج</span>
        <span id="reorderProdCode" class="font-mono-data text-xs font-bold bg-white px-2 py-0.5 rounded border">PRD-000</span>
      </div>
      <div class="grid grid-cols-3 gap-2 text-center text-xs font-mono-data pt-1 border-t border-outline-variant/30">
        <div>
          <span class="text-secondary block text-[10px]">الرصيد الحالي بالمخزن</span>
          <span id="reorderCurrentQty" class="font-bold text-on-surface">0</span>
        </div>
        <div>
          <span class="text-secondary block text-[10px]">حد الأمان (Min)</span>
          <span id="reorderMinLevel" class="font-bold text-amber-600">0</span>
        </div>
        <div>
          <span class="text-secondary block text-[10px]">عجز المخزون</span>
          <span id="reorderDeficit" class="font-bold text-rose-600">0</span>
        </div>
      </div>
    </div>

    <form id="reorderProductForm" onsubmit="handleExecuteReorder(event)" class="space-y-3 text-xs">
      <input type="hidden" id="reorderTargetSku" />

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-secondary mb-1">الكمية المطلوبة للتوريد *</label>
          <input type="number" id="reorderQtyInput" min="1" step="1" value="50" oninput="calculateReorderTotal()" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-primary focus:border-primary focus:outline-none" required />
        </div>
        <div>
          <label class="block font-bold text-secondary mb-1">سعر الوحدة التقديري ($) *</label>
          <input type="number" id="reorderUnitPriceInput" min="0" step="0.01" value="100" oninput="calculateReorderTotal()" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm focus:border-primary focus:outline-none" required />
        </div>
      </div>

      <div class="flex items-center justify-between p-2.5 rounded bg-blue-50 border border-blue-200 text-xs">
        <span class="font-bold text-blue-900">إجمالي قيمة أمر التوريد:</span>
        <span id="reorderTotalPriceDisplay" class="font-mono-data font-bold text-base text-primary">$0.00</span>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم المورد المعتمد *</label>
          <input type="text" id="reorderSupplierInput" value="شركة التوريدات العامة المعتمدة" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>
        <div>
          <label class="block font-bold text-secondary mb-1">تاريخ الاستلام المتوقع *</label>
          <input type="date" id="reorderExpectedDateInput" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
        </div>
      </div>

      <div class="pt-2 border-t border-outline-variant/30 space-y-2">
        <label class="block font-bold text-secondary">طريقة وإجراء التنفيذ المطلوب *</label>
        
        <label class="flex items-start gap-2.5 p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/60 cursor-pointer hover:bg-emerald-50 transition-all">
          <input type="radio" name="reorderExecutionMode" value="direct" checked class="accent-emerald-600 mt-1" />
          <div class="text-xs">
            <span class="font-bold text-emerald-950 block">⚡ تنفيذ فوري وتوريد للمخزن الآن (Direct Restock)</span>
            <span class="text-[11px] text-emerald-800">يضيف الكمية فورياً إلى رصيد المخزن، ويرفع حالة الصنف إلى "متوفر"، ويسجل حركة وارد وأمر شراء مكتمل.</span>
          </div>
        </label>

        <label class="flex items-start gap-2.5 p-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all">
          <input type="radio" name="reorderExecutionMode" value="po" class="accent-primary mt-1" />
          <div class="text-xs">
            <span class="font-bold text-on-surface block">📄 إصدار أمر شراء رسمي فقط (Pending PO)</span>
            <span class="text-[11px] text-secondary">يصدر أمر شراء رسمي بحالة "بانتظار التوريد" في قسم المشتريات لحين الاستلام الفعلي لاحقاً.</span>
          </div>
        </label>
      </div>
    </form>

    <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeReorderProductModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleExecuteReorder()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">task_alt</span>
        <span>تأكيد وتنفيذ الأمر الآن</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 4. نافذة إصدار أمر شراء رسمي (New PO Modal)                            -->
<!-- ====================================================================== -->
<div id="newPurchaseOrderModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">إصدار أمر شراء رسمي (Purchase Order - PO)</h3>
          <span class="text-xs text-secondary">أمر توريد رسمي للمورد، التحقق من المطابقة الثلاثية، والحسابات الدائنة</span>
        </div>
        <button onclick="closeCreatePOModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newPOForm" onsubmit="handleSaveNewPO(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم المورد المعتمد *</label>
          <input type="text" id="poSupplierInput" placeholder="مثال: شركة شنايدر للتوريدات الصناعية" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">بيان الأصناف والمنتجات المطلوبة *</label>
          <input type="text" id="poItemSummaryInput" placeholder="مثال: 50 وحدة - محرك هيدروليكي 500 بار" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" required />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">القيمة المالية الإجمالية ($) *</label>
            <input type="number" id="poAmountInput" min="1" step="0.01" value="12500.00" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-primary focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">تاريخ التوريد المتوقع *</label>
            <input type="date" id="poExpectedDateInput" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">حالة الأمر المبدئية</label>
            <select id="poStatusSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="بانتظار التوريد">بانتظار التوريد</option>
              <option value="تم الاستلام والمطابقة">تم الاستلام والمطابقة فوراً</option>
              <option value="قيد المعالجة اللوجستية">قيد المعالجة اللوجستية</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">موقف الصرف (AP)</label>
            <select id="poAPSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="مستحق عند التوريد">مستحق عند التوريد</option>
              <option value="آجل 30 يوماً">آجل 30 يوماً</option>
              <option value="مسدد نقداً">مسدد نقداً</option>
            </select>
          </div>
        </div>

        <div class="p-3 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed font-sans">
          <span class="font-bold block mb-0.5">المطابقة الثلاثية (3-Way Matching):</span>
          يتم ربط أمر الشراء بفاتورة المورد وإذن استلام المستودع لمطابقة الكميات والأسعار قبل إتمام الصرف المالي.
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeCreatePOModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveNewPO()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">send</span>
        <span>اعتماد وإصدار أمر الشراء</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 5. نافذة تسجيل عميل جديد (New Customer Modal)                         -->
<!-- ====================================================================== -->
<div id="newCustomerModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">تسجيل حساب عميل جديد</h3>
          <span class="text-xs text-secondary">إضافة عميل لدليل المبيعات وربطه بأوامر البيع والفواتير</span>
        </div>
        <button onclick="closeNewCustomerModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newCustomerForm" onsubmit="handleSaveNewCustomer(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم المؤسسة أو العميل *</label>
          <input type="text" id="custNameInput" placeholder="مثال: شركة النيل للتصنيع المتطور" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">المسؤول التجاري / جهة الاتصال</label>
          <input type="text" id="custContactInput" placeholder="مثال: م. أحمد عبد العزيز" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">رقم الهاتف *</label>
            <input type="text" id="custPhoneInput" placeholder="+20 100 123 4567" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">البريد الإلكتروني</label>
            <input type="email" id="custEmailInput" placeholder="contact@company.com" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">العنوان والمقر الرئيسي</label>
          <input type="text" id="custAddressInput" placeholder="مثال: المنطقة الصناعية، مدينة السادس من أكتوبر، مصر" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">تصنيف حساب العميل</label>
          <select id="custStatusSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
            <option value="عميل نشط">عميل نشط</option>
            <option value="عميل مميز">عميل مميز (VIP Account)</option>
            <option value="تحت التدقيق الائتماني">تحت التدقيق الائتماني</option>
          </select>
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeNewCustomerModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveNewCustomer()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">person_add</span>
        <span>حفظ وتسجيل العميل</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 6. نافذة تسجيل مورد جديد (New Supplier Modal)                         -->
<!-- ====================================================================== -->
<div id="newSupplierModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">تسجيل مورد معتمد جديد</h3>
          <span class="text-xs text-secondary">إضافة مورد لقاعدة بيانات المشتريات ومقارنة عروض الأسعار</span>
        </div>
        <button onclick="closeNewSupplierModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newSupplierForm" onsubmit="handleSaveNewSupplier(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم شركة المورد *</label>
          <input type="text" id="supNameInput" placeholder="مثال: شركة سيمنز للصناعات التكنولوجية" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">مجال التوريد والتخصص *</label>
          <input type="text" id="supCategoryInput" placeholder="مثال: أنظمة التحكم الآلي والكابلات الصناعية" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" required />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">المسؤول عن الحساب / جهة الاتصال</label>
          <input type="text" id="supContactInput" placeholder="مثال: أ. طارق الشناوي - مدير الحسابات" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">رقم الهاتف *</label>
            <input type="text" id="supPhoneInput" placeholder="+20 2 2450 1234" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">البريد الإلكتروني</label>
            <input type="email" id="supEmailInput" placeholder="sales@siemens-dist.com" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">شروط السداد المعتمدة</label>
          <select id="supTermsSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
            <option value="آجل 30 يوماً">آجل 30 يوماً</option>
            <option value="آجل 60 يوماً">آجل 60 يوماً</option>
            <option value="نقداً عند الاستلام">نقداً عند الاستلام</option>
            <option value="دفعة مقدمة 50%">دفعة مقدمة 50%</option>
          </select>
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeNewSupplierModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveNewSupplier()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">add_business</span>
        <span>حفظ وتسجيل المورد</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 7. نافذة إضافة موظف جديد (New Employee Modal)                         -->
<!-- ====================================================================== -->
<div id="newEmployeeModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">إضافة وتعيين موظف جديد</h3>
          <span class="text-xs text-secondary">تسجيل بيانات الموظف، المسمى الوظيفي، والراتب في مسير الرواتب</span>
        </div>
        <button onclick="closeNewEmployeeModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newEmployeeForm" onsubmit="handleSaveNewEmployee(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم الموظف الرباعي *</label>
          <input type="text" id="empNameInput" placeholder="مثال: ياسمين أحمد محمود" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">المسمى الوظيفي *</label>
            <input type="text" id="empJobTitleInput" placeholder="مثال: مهندس شبكات وسحابة" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">القسم / الإدارة *</label>
            <select id="empDepartmentSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="إدارة تقنية المعلومات والسحابة">إدارة تقنية المعلومات والسحابة</option>
              <option value="العمليات واللوجستيات والمخازن">العمليات واللوجستيات والمخازن</option>
              <option value="المالية والحسابات العامة">المالية والحسابات العامة</option>
              <option value="المبيعات وتطوير الأعمال">المبيعات وتطوير الأعمال</option>
              <option value="الموارد البشرية والشؤون الإدارية">الموارد البشرية والشؤون الإدارية</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">الراتب الأساسي الشهري ($ أو ج.م) *</label>
            <input type="number" id="empSalaryInput" min="1000" step="100" value="18000" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-primary focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">رقم الهاتف *</label>
            <input type="text" id="empPhoneInput" placeholder="+20 100 123 4567" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">البريد الإلكتروني المؤسسي</label>
          <input type="email" id="empEmailInput" placeholder="employee@apex-cloud.com" dir="ltr" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" />
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeNewEmployeeModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveNewEmployee()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">person_add</span>
        <span>اعتماد وتعيين الموظف</span>
      </button>
    </div>
  </div>
</div>

<!-- ====================================================================== -->
<!-- 8. نافذة تقديم طلب إجازة (Leave Request Modal)                        -->
<!-- ====================================================================== -->
<div id="newLeaveRequestModal" class="fixed inset-0 z-50 modal-overlay flex justify-start hidden">
  <div class="w-full max-w-lg bg-surface-container-lowest h-full shadow-2xl flex flex-col justify-between modal-content-panel p-space-xl overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-space-lg">
        <div>
          <h3 class="font-bold text-base text-on-surface">تقديم طلب إجازة رسمي</h3>
          <span class="text-xs text-secondary">إرسال طلب إجازة سنوية أو مرضية للمدير المباشر للاعتماد</span>
        </div>
        <button onclick="closeLeaveRequestModal()" class="p-1.5 rounded-full hover:bg-surface-container text-secondary">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <form id="newLeaveForm" onsubmit="handleSaveLeaveRequest(event)" class="space-y-3.5 text-xs">
        <div>
          <label class="block font-bold text-secondary mb-1">اسم الموظف مقدم الطلب *</label>
          <input type="text" id="leaveEmpName" value="ياسمين أحمد" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none font-bold" required />
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">القسم / الإدارة</label>
            <input type="text" id="leaveDepartment" value="إدارة تقنية المعلومات" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">نوع الإجازة المطلوبة *</label>
            <select id="leaveTypeSelect" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none">
              <option value="إجازة اعتيادية سنوية">إجازة اعتيادية سنوية</option>
              <option value="إجازة مرضية">إجازة مرضية</option>
              <option value="إجازة طارئة">إجازة طارئة</option>
              <option value="إجازة بدون راتب">إجازة بدون راتب</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-space-md">
          <div>
            <label class="block font-bold text-secondary mb-1">تاريخ البدء *</label>
            <input type="date" id="leaveStartDate" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
          <div>
            <label class="block font-bold text-secondary mb-1">تاريخ الانتهاء *</label>
            <input type="date" id="leaveEndDate" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data focus:border-primary focus:outline-none" required />
          </div>
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">عدد أيام العمل المطلوبة *</label>
          <input type="number" id="leaveDays" min="1" max="30" value="3" class="w-full h-9 px-3 rounded bg-surface-container-low border border-outline-variant/60 font-mono-data font-bold text-sm text-primary focus:border-primary focus:outline-none" required />
        </div>

        <div>
          <label class="block font-bold text-secondary mb-1">أسباب ومبررات الإجازة</label>
          <textarea id="leaveReason" rows="3" placeholder="يرجى كتابة سبب طلب الإجازة وترتيبات تسليم المهام..." class="w-full p-2.5 rounded bg-surface-container-low border border-outline-variant/60 focus:border-primary focus:outline-none"></textarea>
        </div>
      </form>
    </div>

    <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-end gap-2">
      <button type="button" onclick="closeLeaveRequestModal()" class="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold">
        إلغاء
      </button>
      <button type="button" onclick="handleSaveLeaveRequest()" class="px-5 py-2 rounded bg-primary-container text-on-primary hover:bg-primary text-xs font-bold shadow-sm transition-all flex items-center gap-1.5">
        <span class="material-symbols-outlined text-[17px]">send</span>
        <span>إرسال الطلب للاعتماد</span>
      </button>
    </div>
  </div>
</div>
  `;

  document.body.appendChild(container);
  console.log("✅ Enterprise Operations Modals successfully injected into DOM.");
}

// ============================================================================
// 2. OPERATIONS & EVENT HANDLERS
// ============================================================================

// إعادة حساب مؤشرات أداء المخزون
function recalculateInventoryKPIs() {
  if (!window.ERP_STATE || !window.ERP_STATE.data) return;
  const inv = window.ERP_STATE.data.inventory;
  const products = inv.products || [];
  inv.kpis.totalSKUs = products.length;
  inv.kpis.totalInventoryValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.qty) || 0)), 0);
  const critical = products.filter(p => (Number(p.qty) || 0) <= (Number(p.minLevel) || 0) || (p.status && p.status.includes('حرج')));
  inv.kpis.criticalBreachItems = critical.length;
  inv.kpis.inStockPercentage = products.length ? Math.round(((products.length - critical.length) / products.length) * 100) : 100;

  if (window.ERP_FIREBASE?.recalculateDynamicKPIs) {
    window.ERP_FIREBASE.recalculateDynamicKPIs();
  }
}

// ----------------------------------------------------------------------------
// A. إضافة صنف جديد (New Product)
// ----------------------------------------------------------------------------
function openNewProductModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newProductModal');
  if (modal) {
    generateProductCode();
    document.getElementById('newProdName').value = '';
    document.getElementById('newProdPrice').value = '150.00';
    document.getElementById('newProdQty').value = '50';
    document.getElementById('newProdMinLevel').value = '15';
    document.getElementById('newProdMaxLevel').value = '200';
    document.getElementById('newProdLocation').value = '';
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('newProdName')?.focus(), 100);
  }
}

function closeNewProductModal() {
  const modal = document.getElementById('newProductModal');
  if (modal) modal.classList.add('hidden');
}

function generateProductCode() {
  const codeEl = document.getElementById('newProdCode');
  if (codeEl) {
    codeEl.value = `PRD-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

function handleSaveNewProduct(e) {
  if (e) e.preventDefault();
  const code = document.getElementById('newProdCode')?.value?.trim();
  const name = document.getElementById('newProdName')?.value?.trim();
  const category = document.getElementById('newProdCategory')?.value || "أجهزة ومعدات";
  const unit = document.getElementById('newProdUnit')?.value || "قطعة";
  const price = parseFloat(document.getElementById('newProdPrice')?.value || "0");
  const qty = parseInt(document.getElementById('newProdQty')?.value || "0", 10);
  const minLevel = parseInt(document.getElementById('newProdMinLevel')?.value || "10", 10);
  const maxLevel = parseInt(document.getElementById('newProdMaxLevel')?.value || "100", 10);
  const warehouse = document.getElementById('newProdWarehouse')?.value || "المستودع الرئيسي - القاهرة";
  const location = document.getElementById('newProdLocation')?.value || "";

  if (!code || !name) {
    showToast("يرجى إدخال كود الصنف واسمه بالكامل.", "error");
    return;
  }

  // فحص تكرار الكود
  const existing = ERP_STATE.data.inventory.products.find(p => p.code === code);
  if (existing) {
    showToast(`كود الصنف ${code} مسجل بالفعل مسبقاً، يرجى اختيار كود آخر.`, "warning");
    return;
  }

  // تحديد الحالة التشغيلية
  let status = "متوفر بالمستودع";
  if (qty === 0) {
    status = "خرق حرج";
  } else if (qty <= minLevel) {
    status = "مخزون منخفض";
  }

  const newProd = {
    code,
    name,
    category,
    unit,
    price,
    qty,
    minLevel,
    maxLevel,
    warehouse,
    location,
    status
  };

  ERP_STATE.data.inventory.products.unshift(newProd);

  // إذا كانت الكمية أكبر من صفر، نسجل حركة وارد رصيد تأسيسي
  if (qty > 0) {
    const mov = {
      id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      type: "وارد مستودعي (Receiving)",
      item: name,
      code: code,
      qty: qty,
      reference: "رصيد افتتاحي تأسيسي",
      user: ERP_STATE.currentUser?.name || "مدير المستودعات",
      notes: `تأسيس صنف جديد بالمخزون بمستودع ${warehouse}`
    };
    ERP_STATE.data.inventory.stockMovements.unshift(mov);
    if (window.ERP_FIREBASE?.saveStockMovement) {
      window.ERP_FIREBASE.saveStockMovement(mov);
    }
  }

  // حفظ سحابي في Firebase
  if (window.ERP_FIREBASE?.saveProduct) {
    window.ERP_FIREBASE.saveProduct(newProd);
  }

  recalculateInventoryKPIs();
  closeNewProductModal();
  renderActiveView();
  showToast(`🎉 تمت إضافة الصنف "${name}" (${code}) بنجاح إلى المخزون وسحابة Firebase!`);
}

// ----------------------------------------------------------------------------
// B. توريد واستلام مخزني لصنف قائم (Stock In)
// ----------------------------------------------------------------------------
function openStockInModal(presetSku = null) {
  injectEnterpriseModals();
  const modal = document.getElementById('stockInModal');
  const select = document.getElementById('stockInProductSelect');
  if (!modal || !select) return;

  const products = ERP_STATE.data.inventory.products || [];
  if (products.length === 0) {
    showToast("لا توجد منتجات مسجلة بالمخزون بعد. يرجى إضافة صنف جديد أولاً.", "warning");
    openNewProductModal();
    return;
  }

  select.innerHTML = products.map(p => `<option value="${p.code}">${p.code} - ${p.name} (متوفر: ${p.qty} ${p.unit || ''})</option>`).join('');

  if (presetSku) {
    select.value = presetSku;
  }

  updateStockInInfo();
  document.getElementById('stockInQty').value = '25';
  document.getElementById('stockInSupplier').value = '';
  document.getElementById('stockInRefDoc').value = `RC-${Math.floor(1000 + Math.random() * 9000)}`;
  document.getElementById('stockInNotes').value = '';

  modal.classList.remove('hidden');
}

function closeStockInModal() {
  const modal = document.getElementById('stockInModal');
  if (modal) modal.classList.add('hidden');
}

function updateStockInInfo() {
  const select = document.getElementById('stockInProductSelect');
  if (!select) return;
  const sku = select.value;
  const prod = ERP_STATE.data.inventory.products.find(p => p.code === sku);
  if (prod) {
    document.getElementById('stockInCurrentQty').innerText = `${prod.qty} ${prod.unit || 'وحدة'}`;
    document.getElementById('stockInWarehouseName').innerText = prod.warehouse || "المستودع الرئيسي";
  }
}

function handleSaveStockIn(e) {
  if (e) e.preventDefault();
  const select = document.getElementById('stockInProductSelect');
  const sku = select?.value;
  const qty = parseInt(document.getElementById('stockInQty')?.value || "0", 10);
  const supplier = document.getElementById('stockInSupplier')?.value || "مورد معتمد";
  const refDoc = document.getElementById('stockInRefDoc')?.value || "إذن توريد مستودعي";
  const notes = document.getElementById('stockInNotes')?.value || "استلام بضاعة وفحص جودة";

  if (!sku || qty <= 0) {
    showToast("يرجى إدخال كمية توريد صحيحة أكبر من الصفر.", "error");
    return;
  }

  const prod = ERP_STATE.data.inventory.products.find(p => p.code === sku);
  if (!prod) {
    showToast("لم يتم العثور على الصنف في المخزون.", "error");
    return;
  }

  prod.qty = (Number(prod.qty) || 0) + qty;
  if (prod.qty > (Number(prod.minLevel) || 0)) {
    prod.status = "متوفر بالمستودع";
  } else if (prod.qty > 0) {
    prod.status = "مخزون منخفض";
  }

  // تسجيل حركة وارد
  const mov = {
    id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleString('ar-EG'),
    type: "وارد مستودعي (Receiving)",
    item: prod.name,
    code: prod.code,
    qty: qty,
    reference: refDoc,
    user: ERP_STATE.currentUser?.name || "أمين المستودع",
    notes: `توريد من ${supplier} - ${notes}`
  };
  ERP_STATE.data.inventory.stockMovements.unshift(mov);

  if (window.ERP_FIREBASE?.saveStockMovement) {
    window.ERP_FIREBASE.saveStockMovement(mov);
  }
  if (window.ERP_FIREBASE?.updateProductStock) {
    window.ERP_FIREBASE.updateProductStock(prod.code, prod.qty, prod.status);
  }

  recalculateInventoryKPIs();
  closeStockInModal();
  renderActiveView();
  showToast(`✅ تم توريد ${qty} وحدة للصنف "${prod.name}" بنجاح! الرصيد الجديد: ${prod.qty} وحدة.`);
}

// ----------------------------------------------------------------------------
// C. إعادة طلب / طلب شراء عاجل للصنف (Reorder & Restock Product)
// ----------------------------------------------------------------------------
function reorderProduct(sku) {
  openReorderProductModal(sku);
}

function openReorderProductModal(sku) {
  injectEnterpriseModals();
  const prod = ERP_STATE.data.inventory.products.find(p => p.code === sku);
  if (!prod) {
    showToast("هذا الصنف غير مسجل في المخزون، يمكنك إضافته الآن.", "info");
    openNewProductModal();
    return;
  }

  const modal = document.getElementById('reorderProductModal');
  if (!modal) return;

  document.getElementById('reorderTargetSku').value = prod.code;
  document.getElementById('reorderProdName').innerText = prod.name;
  document.getElementById('reorderProdCode').innerText = prod.code;
  document.getElementById('reorderCurrentQty').innerText = `${prod.qty} ${prod.unit || ''}`;
  document.getElementById('reorderMinLevel').innerText = `${prod.minLevel} ${prod.unit || ''}`;

  const deficit = Math.max(0, (prod.minLevel || 0) - (prod.qty || 0));
  document.getElementById('reorderDeficit').innerText = deficit > 0 ? `-${deficit}` : 'لا يوجد عجز';

  // حساب كمية مقترحة
  const suggestedQty = deficit > 0 ? (deficit + Math.max(prod.minLevel, 20)) : Math.max(prod.minLevel || 20, 30);
  document.getElementById('reorderQtyInput').value = suggestedQty;
  document.getElementById('reorderUnitPriceInput').value = prod.price || 100;

  // المورد المقترح
  const supList = ERP_STATE.data.purchasing.suppliers || [];
  document.getElementById('reorderSupplierInput').value = supList.length ? supList[0].name : "شركة التوريدات الصناعية المعتمدة";

  // تاريخ متوقع
  const nextWeek = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
  document.getElementById('reorderExpectedDateInput').value = nextWeek;

  calculateReorderTotal();
  modal.classList.remove('hidden');
}

function closeReorderProductModal() {
  const modal = document.getElementById('reorderProductModal');
  if (modal) modal.classList.add('hidden');
}

function calculateReorderTotal() {
  const qty = parseFloat(document.getElementById('reorderQtyInput')?.value || "0");
  const price = parseFloat(document.getElementById('reorderUnitPriceInput')?.value || "0");
  const total = qty * price;
  const el = document.getElementById('reorderTotalPriceDisplay');
  if (el) el.innerText = formatMoney(total);
}

function handleExecuteReorder(e) {
  if (e) e.preventDefault();
  const sku = document.getElementById('reorderTargetSku')?.value;
  const prod = ERP_STATE.data.inventory.products.find(p => p.code === sku);
  if (!prod) {
    showToast("لم يتم العثور على الصنف المحدد.", "error");
    return;
  }

  const qty = parseInt(document.getElementById('reorderQtyInput')?.value || "0", 10);
  const price = parseFloat(document.getElementById('reorderUnitPriceInput')?.value || "0");
  const supplier = document.getElementById('reorderSupplierInput')?.value || "مورد معتمد";
  const expectedDate = document.getElementById('reorderExpectedDateInput')?.value || new Date().toISOString().split('T')[0];
  const mode = document.querySelector('input[name="reorderExecutionMode"]:checked')?.value || 'direct';
  const totalAmount = qty * price;

  if (qty <= 0) {
    showToast("يرجى إدخال كمية طلب صحيحة أكبر من الصفر.", "error");
    return;
  }

  if (mode === 'direct') {
    // ⚡ تنفيذ فوري واستلام بالمخزن الآن
    prod.qty = (Number(prod.qty) || 0) + qty;
    if (prod.qty > (Number(prod.minLevel) || 0)) {
      prod.status = "متوفر بالمستودع";
    } else {
      prod.status = "مخزون منخفض";
    }

    // حركة وارد
    const mov = {
      id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleString('ar-EG'),
      type: "وارد مستودعي (Receiving)",
      item: prod.name,
      code: prod.code,
      qty: qty,
      reference: `أمر شراء مباشر - مورد: ${supplier}`,
      user: ERP_STATE.currentUser?.name || "أمين المستودع",
      notes: "تم تنفيذ أمر التوريد واستلام الشحنة بالمستودع فورياً"
    };
    ERP_STATE.data.inventory.stockMovements.unshift(mov);

    // أمر شراء مكتمل
    const po = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: supplier,
      itemSummary: `${qty} ${prod.unit || 'وحدة'} - ${prod.name}`,
      issueDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate,
      amount: totalAmount,
      status: "تم الاستلام والمطابقة التامة",
      matchingStatus: "مطابقة ثلاثية تامة",
      apStatus: "معتمد للصرف والاستحقاق"
    };
    ERP_STATE.data.purchasing.purchaseOrders.unshift(po);

    if (window.ERP_FIREBASE?.saveStockMovement) {
      window.ERP_FIREBASE.saveStockMovement(mov);
    }
    if (window.ERP_FIREBASE?.updateProductStock) {
      window.ERP_FIREBASE.updateProductStock(prod.code, prod.qty, prod.status);
    }
    if (window.ERP_FIREBASE?.savePurchaseOrder) {
      window.ERP_FIREBASE.savePurchaseOrder(po);
    }

    recalculateInventoryKPIs();
    closeReorderProductModal();
    renderActiveView();
    showToast(`🎉 تم تنفيذ الأمر بنجاح! تم استلام وتوريد ${qty} وحدة من "${prod.name}" بالمخزن فورياً، والرصيد الحالي أصبح: ${prod.qty} وحدة.`);

  } else {
    // 📄 إصدار أمر شراء رسمي للمورد
    const po = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: supplier,
      itemSummary: `${qty} ${prod.unit || 'وحدة'} - ${prod.name}`,
      issueDate: new Date().toISOString().split('T')[0],
      expectedDate: expectedDate,
      amount: totalAmount,
      status: "بانتظار التوريد",
      matchingStatus: "معلق قيد الفحص",
      apStatus: "مستحق عند التوريد"
    };
    ERP_STATE.data.purchasing.purchaseOrders.unshift(po);

    if (window.ERP_FIREBASE?.savePurchaseOrder) {
      window.ERP_FIREBASE.savePurchaseOrder(po);
    }

    closeReorderProductModal();
    navigateTo('purchasing', 'po');
    showToast(`تم إصدار أمر الشراء الرسمي ${po.id} للمورد "${supplier}" بنجاح وحفظه سحابياً!`);
  }
}

// ----------------------------------------------------------------------------
// D. إصدار أوامر شراء تعويضية مجمعة (Bulk Reorder)
// ----------------------------------------------------------------------------
function executeBulkReorder() {
  const criticalItems = ERP_STATE.data.inventory.products.filter(p => (Number(p.qty) || 0) <= (Number(p.minLevel) || 0) || p.status?.includes('حرج') || p.status?.includes('منخفض'));

  if (!criticalItems.length) {
    showToast("جميع الأصناف في الحدود الآمنة والمستودع مكتمل، لا توجد نواقص حرجة حالياً.", "info");
    return;
  }

  let count = 0;
  criticalItems.forEach(item => {
    const neededQty = Math.max(((item.minLevel || 20) * 2) - (item.qty || 0), 50);
    const totalAmount = neededQty * (item.price || 100);
    const po = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: "مورد توريدات معتمد",
      itemSummary: `${neededQty} ${item.unit || 'وحدة'} - ${item.name}`,
      issueDate: new Date().toISOString().split('T')[0],
      expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      amount: totalAmount,
      status: "بانتظار التوريد",
      matchingStatus: "معلق قيد الفحص",
      apStatus: "مستحق عند التوريد"
    };
    ERP_STATE.data.purchasing.purchaseOrders.unshift(po);
    if (window.ERP_FIREBASE?.savePurchaseOrder) {
      window.ERP_FIREBASE.savePurchaseOrder(po);
    }
    count++;
  });

  showToast(`⚡ تم إصدار وتثبيت ${count} أوامر شراء تعويضية لجميع الأصناف الحرجة بنجاح!`);
  navigateTo('purchasing', 'po');
}

// ----------------------------------------------------------------------------
// E. إصدار أمر شراء رسمي جديد (New Purchase Order)
// ----------------------------------------------------------------------------
function openCreatePOModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newPurchaseOrderModal');
  if (modal) {
    document.getElementById('poSupplierInput').value = '';
    document.getElementById('poItemSummaryInput').value = '';
    document.getElementById('poAmountInput').value = '12500.00';
    document.getElementById('poExpectedDateInput').value = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('poSupplierInput')?.focus(), 100);
  }
}

function closeCreatePOModal() {
  const modal = document.getElementById('newPurchaseOrderModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveNewPO(e) {
  if (e) e.preventDefault();
  const supplier = document.getElementById('poSupplierInput')?.value?.trim();
  const itemSummary = document.getElementById('poItemSummaryInput')?.value?.trim();
  const amount = parseFloat(document.getElementById('poAmountInput')?.value || "0");
  const expectedDate = document.getElementById('poExpectedDateInput')?.value || new Date().toISOString().split('T')[0];
  const status = document.getElementById('poStatusSelect')?.value || "بانتظار التوريد";
  const apStatus = document.getElementById('poAPSelect')?.value || "مستحق عند التوريد";

  if (!supplier || !itemSummary || amount <= 0) {
    showToast("يرجى ملء اسم المورد وبيان الأصناف والمبلغ الإجمالي.", "error");
    return;
  }

  const newPO = {
    id: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    supplier,
    itemSummary,
    issueDate: new Date().toISOString().split('T')[0],
    expectedDate,
    amount,
    status,
    matchingStatus: status.includes('استلام') ? "مطابقة ثلاثية تامة" : "معلق قيد الفحص",
    apStatus
  };

  ERP_STATE.data.purchasing.purchaseOrders.unshift(newPO);

  if (window.ERP_FIREBASE?.savePurchaseOrder) {
    window.ERP_FIREBASE.savePurchaseOrder(newPO);
  }

  closeCreatePOModal();
  renderActiveView();
  showToast(`✅ تم اعتماد وإصدار أمر الشراء ${newPO.id} سحابياً بنجاح!`);
}

// ----------------------------------------------------------------------------
// F. إضافة عميل جديد (New Customer)
// ----------------------------------------------------------------------------
function openNewCustomerModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newCustomerModal');
  if (modal) {
    document.getElementById('custNameInput').value = '';
    document.getElementById('custContactInput').value = '';
    document.getElementById('custPhoneInput').value = '';
    document.getElementById('custEmailInput').value = '';
    document.getElementById('custAddressInput').value = '';
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('custNameInput')?.focus(), 100);
  }
}

function closeNewCustomerModal() {
  const modal = document.getElementById('newCustomerModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveNewCustomer(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('custNameInput')?.value?.trim();
  const contactPerson = document.getElementById('custContactInput')?.value?.trim() || "المسؤول التجاري";
  const phone = document.getElementById('custPhoneInput')?.value?.trim() || "+20 100 000 0000";
  const email = document.getElementById('custEmailInput')?.value?.trim() || `info@${name.substring(0, 6)}.com`;
  const address = document.getElementById('custAddressInput')?.value?.trim() || "القاهرة، جمهورية مصر العربية";
  const status = document.getElementById('custStatusSelect')?.value || "عميل نشط";

  if (!name) {
    showToast("يرجى إدخال اسم العميل بالكامل.", "error");
    return;
  }

  const newCust = {
    id: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    contactPerson,
    phone,
    email,
    address,
    totalOrders: 0,
    totalSpend: 0,
    status
  };

  ERP_STATE.data.sales.customers.unshift(newCust);

  if (window.ERP_FIREBASE?.saveCustomer) {
    window.ERP_FIREBASE.saveCustomer(newCust);
  }

  closeNewCustomerModal();
  renderActiveView();
  showToast(`🎉 تم تسجيل العميل "${name}" بنجاح في دليل العملاء وقاعدة البيانات!`);
}

// ----------------------------------------------------------------------------
// G. تسجيل مورد جديد (New Supplier)
// ----------------------------------------------------------------------------
function openNewSupplierModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newSupplierModal');
  if (modal) {
    document.getElementById('supNameInput').value = '';
    document.getElementById('supCategoryInput').value = '';
    document.getElementById('supContactInput').value = '';
    document.getElementById('supPhoneInput').value = '';
    document.getElementById('supEmailInput').value = '';
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('supNameInput')?.focus(), 100);
  }
}

function closeNewSupplierModal() {
  const modal = document.getElementById('newSupplierModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveNewSupplier(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('supNameInput')?.value?.trim();
  const category = document.getElementById('supCategoryInput')?.value?.trim() || "معدات ومستلزمات عامة";
  const contactPerson = document.getElementById('supContactInput')?.value?.trim() || "مدير المبيعات";
  const phone = document.getElementById('supPhoneInput')?.value?.trim() || "+20 2 2450 0000";
  const email = document.getElementById('supEmailInput')?.value?.trim() || "sales@supplier.com";
  const paymentTerms = document.getElementById('supTermsSelect')?.value || "آجل 30 يوماً";

  if (!name) {
    showToast("يرجى إدخال اسم المورد بالكامل.", "error");
    return;
  }

  const newSup = {
    id: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    category,
    contactPerson,
    phone,
    email,
    paymentTerms,
    rating: 4.8,
    activeOrders: 0
  };

  ERP_STATE.data.purchasing.suppliers.unshift(newSup);

  if (window.ERP_FIREBASE?.saveSupplier) {
    window.ERP_FIREBASE.saveSupplier(newSup);
  }

  closeNewSupplierModal();
  renderActiveView();
  showToast(`🎉 تم تسجيل المورد "${name}" بنجاح في دليل الموردين المعتمدين!`);
}

// ----------------------------------------------------------------------------
// H. إضافة وتعيين موظف جديد (New Employee)
// ----------------------------------------------------------------------------
function openNewEmployeeModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newEmployeeModal');
  if (modal) {
    document.getElementById('empNameInput').value = '';
    document.getElementById('empJobTitleInput').value = '';
    document.getElementById('empPhoneInput').value = '';
    document.getElementById('empEmailInput').value = '';
    document.getElementById('empSalaryInput').value = '18000';
    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('empNameInput')?.focus(), 100);
  }
}

function closeNewEmployeeModal() {
  const modal = document.getElementById('newEmployeeModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveNewEmployee(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('empNameInput')?.value?.trim();
  const jobTitle = document.getElementById('empJobTitleInput')?.value?.trim() || "أخصائي عمليات";
  const department = document.getElementById('empDepartmentSelect')?.value || "إدارة العمليات واللوجستيات";
  const salary = parseFloat(document.getElementById('empSalaryInput')?.value || "15000");
  const phone = document.getElementById('empPhoneInput')?.value?.trim() || "+20 100 000 0000";
  const email = document.getElementById('empEmailInput')?.value?.trim() || `emp@apex-cloud.com`;

  if (!name) {
    showToast("يرجى إدخال اسم الموظف بالكامل.", "error");
    return;
  }

  const newEmp = {
    id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    jobTitle,
    department,
    email,
    phone,
    baseSalary: salary,
    bonus: 0,
    deductions: 0,
    absences: 0,
    attendance: "حاضر بالمقر",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
  };

  ERP_STATE.data.hr.employees.unshift(newEmp);

  // تحديث مؤشرات الموارد البشرية
  ERP_STATE.data.hr.kpis.totalEmployees = ERP_STATE.data.hr.employees.length;
  ERP_STATE.data.hr.kpis.monthlyPayrollTotal += salary;

  if (window.ERP_FIREBASE?.saveEmployee) {
    window.ERP_FIREBASE.saveEmployee(newEmp);
  }

  closeNewEmployeeModal();
  renderActiveView();
  showToast(`🎉 تم تعيين وإضافة الموظف "${name}" إلى سجلات المؤسسة بنجاح!`);
}

// ----------------------------------------------------------------------------
// I. تقديم طلب إجازة رسمي (Leave Request)
// ----------------------------------------------------------------------------
function openLeaveRequestModal() {
  injectEnterpriseModals();
  const modal = document.getElementById('newLeaveRequestModal');
  if (modal) {
    document.getElementById('leaveEmpName').value = ERP_STATE.currentUser?.name || "ياسمين أحمد";
    document.getElementById('leaveStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('leaveEndDate').value = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
    document.getElementById('leaveDays').value = '3';
    document.getElementById('leaveReason').value = '';
    modal.classList.remove('hidden');
  }
}

function closeLeaveRequestModal() {
  const modal = document.getElementById('newLeaveRequestModal');
  if (modal) modal.classList.add('hidden');
}

function handleSaveLeaveRequest(e) {
  if (e) e.preventDefault();
  const employeeName = document.getElementById('leaveEmpName')?.value?.trim() || "موظف معتمد";
  const department = document.getElementById('leaveDepartment')?.value || "الإدارة العامة";
  const leaveType = document.getElementById('leaveTypeSelect')?.value || "إجازة اعتيادية سنوية";
  const startDate = document.getElementById('leaveStartDate')?.value || new Date().toISOString().split('T')[0];
  const endDate = document.getElementById('leaveEndDate')?.value || new Date().toISOString().split('T')[0];
  const days = parseInt(document.getElementById('leaveDays')?.value || "2", 10);
  const reason = document.getElementById('leaveReason')?.value || "ظروف شخصية";

  const newReq = {
    id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
    employeeName,
    department,
    leaveType,
    startDate,
    endDate,
    days,
    reason,
    status: "قيد مراجعة المدير",
    appliedOn: new Date().toISOString().split('T')[0]
  };

  ERP_STATE.data.hr.leaveRequests.unshift(newReq);

  if (window.ERP_FIREBASE?.saveLeaveRequest) {
    window.ERP_FIREBASE.saveLeaveRequest(newReq);
  }

  closeLeaveRequestModal();
  renderActiveView();
  showToast(`✅ تم تقديم طلب الإجازة (${newReq.id}) بنجاح وإرساله للمدير المباشر!`);
}

// ============================================================================
// 3. EXPORT TO GLOBAL WINDOW SCOPE & AUTO-INIT
// ============================================================================

window.injectEnterpriseModals = injectEnterpriseModals;
window.recalculateInventoryKPIs = recalculateInventoryKPIs;
window.openNewProductModal = openNewProductModal;
window.closeNewProductModal = closeNewProductModal;
window.generateProductCode = generateProductCode;
window.handleSaveNewProduct = handleSaveNewProduct;
window.openStockInModal = openStockInModal;
window.closeStockInModal = closeStockInModal;
window.updateStockInInfo = updateStockInInfo;
window.handleSaveStockIn = handleSaveStockIn;
window.reorderProduct = reorderProduct;
window.openReorderProductModal = openReorderProductModal;
window.closeReorderProductModal = closeReorderProductModal;
window.calculateReorderTotal = calculateReorderTotal;
window.handleExecuteReorder = handleExecuteReorder;
window.executeBulkReorder = executeBulkReorder;
window.openCreatePOModal = openCreatePOModal;
window.closeCreatePOModal = closeCreatePOModal;
window.handleSaveNewPO = handleSaveNewPO;
window.openNewCustomerModal = openNewCustomerModal;
window.closeNewCustomerModal = closeNewCustomerModal;
window.handleSaveNewCustomer = handleSaveNewCustomer;
window.openNewSupplierModal = openNewSupplierModal;
window.closeNewSupplierModal = closeNewSupplierModal;
window.handleSaveNewSupplier = handleSaveNewSupplier;
window.openNewEmployeeModal = openNewEmployeeModal;
window.closeNewEmployeeModal = closeNewEmployeeModal;
window.handleSaveNewEmployee = handleSaveNewEmployee;
window.openLeaveRequestModal = openLeaveRequestModal;
window.closeLeaveRequestModal = closeLeaveRequestModal;
window.handleSaveLeaveRequest = handleSaveLeaveRequest;

// حقن النوافذ المنبثقة تلقائياً عند تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectEnterpriseModals);
} else {
  injectEnterpriseModals();
}

// ربط زر الـ Escape لإغلاق أي نافذة مفتوحة
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNewProductModal();
    closeStockInModal();
    closeReorderProductModal();
    closeCreatePOModal();
    closeNewCustomerModal();
    closeNewSupplierModal();
    closeNewEmployeeModal();
    closeLeaveRequestModal();
  }
});
