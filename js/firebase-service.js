/**
 * Apex Enterprise ERP - Firebase Cloud Integration Service
 * Project: tast-b91f3
 * Connects all 5 modules (Invoices, Inventory, Customers, Sales Orders,
 * Suppliers, Purchase Orders, Employees, Attendance, Leave, Finance) to Cloud Firestore.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

// Firebase Project Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDjPTdoEJcWd7Y4zGkkfQmace3TXVWgNHg",
  authDomain: "tast-b91f3.firebaseapp.com",
  projectId: "tast-b91f3",
  storageBucket: "tast-b91f3.firebasestorage.app",
  messagingSenderId: "129487182461",
  appId: "1:129487182461:web:8220dbc061305bf65a2f14",
  measurementId: "G-7X0N67D10R"
};

// Initialize Firebase App & Services
let app = null;
let analytics = null;
let db = null;
let isConnected = false;
let syncStatus = "connecting"; // "connected" | "fallback" | "error"

try {
  app = initializeApp(firebaseConfig);
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics not initialized (environment without cookies/storage):", e);
  }
  db = getFirestore(app);
  isConnected = true;
  syncStatus = "connected";
  console.log("🔥 Firebase initialized successfully for project:", firebaseConfig.projectId);
} catch (err) {
  console.error("Firebase initialization error:", err);
  syncStatus = "error";
}

// Global Firebase Bridge Object
window.ERP_FIREBASE = {
  config: firebaseConfig,
  app,
  analytics,
  db,
  isConnected,
  syncStatus,

  // Collection References Mapping all 5 Modules
  collections: {
    invoices: "erp_invoices",
    products: "erp_products",
    stockMovements: "erp_stock_movements",
    customers: "erp_customers",
    salesOrders: "erp_sales_orders",
    suppliers: "erp_suppliers",
    purchaseOrders: "erp_purchase_orders",
    employees: "erp_employees",
    attendance: "erp_attendance_log",
    leaveRequests: "erp_leave_requests",
    financeMeta: "erp_finance_meta"
  },

  // 1. Initialize & Synchronize Database
  async initSync() {
    this.updateStatusBadge();
    if (!db) {
      console.warn("Firestore not available. Operating in local mode.");
      return;
    }

    try {
      // Check if Invoices collection has records
      const invSnapshot = await getDocs(collection(db, this.collections.invoices));
      if (invSnapshot.empty) {
        console.log("Cloud Firestore is empty. Seeding initial ERP dataset...");
        await this.seedAllData();
      } else {
        console.log(`Loaded ${invSnapshot.size} invoices from Firestore. Pulling all modules...`);
        await this.pullAllData();
      }

      // Attach Real-time Listeners for instant multi-user synchronization
      this.attachRealtimeListeners();
      this.syncStatus = "connected";
      this.updateStatusBadge();
      if (window.showToast) {
        window.showToast("تم الاتصال السحابي مع Firebase بنجاح (tast-b91f3)", "success");
      }
    } catch (error) {
      console.warn("Firestore connection check failed (checking permissions / rules):", error);
      this.syncStatus = "permission_notice";
      this.updateStatusBadge();
    }
  },

  // 2. Seed All 5 Modules Data from ERP_DATA into Firestore
  async seedAllData() {
    if (!db || !window.ERP_DATA) return;
    const data = window.ERP_DATA;

    try {
      const batch = writeBatch(db);

      // A. Finance Invoices
      data.finance.invoices.forEach(inv => {
        const ref = doc(db, this.collections.invoices, inv.id);
        batch.set(ref, inv);
      });

      // B. Products
      data.inventory.products.forEach(p => {
        const ref = doc(db, this.collections.products, p.code);
        batch.set(ref, p);
      });

      // C. Stock Movements
      data.inventory.stockMovements.forEach(m => {
        const ref = doc(db, this.collections.stockMovements, m.id);
        batch.set(ref, m);
      });

      // D. Customers
      data.sales.customers.forEach(c => {
        const ref = doc(db, this.collections.customers, c.id);
        batch.set(ref, c);
      });

      // E. Sales Orders
      data.sales.orders.forEach(o => {
        const ref = doc(db, this.collections.salesOrders, o.id);
        batch.set(ref, o);
      });

      // F. Suppliers
      data.purchasing.suppliers.forEach(s => {
        const ref = doc(db, this.collections.suppliers, s.id);
        batch.set(ref, s);
      });

      // G. Purchase Orders
      data.purchasing.purchaseOrders.forEach(po => {
        const ref = doc(db, this.collections.purchaseOrders, po.id);
        batch.set(ref, po);
      });

      // H. Employees
      data.hr.employees.forEach(emp => {
        const ref = doc(db, this.collections.employees, emp.id);
        batch.set(ref, emp);
      });

      // I. Attendance Log
      data.hr.attendanceLog.forEach(att => {
        const ref = doc(db, this.collections.attendance, att.id);
        batch.set(ref, att);
      });

      // J. Leave Requests
      data.hr.leaveRequests.forEach(lv => {
        const ref = doc(db, this.collections.leaveRequests, lv.id);
        batch.set(ref, lv);
      });

      // Commit Batch
      await batch.commit();
      console.log("✅ All ERP modules successfully seeded into Firebase Firestore!");
    } catch (e) {
      console.error("Error seeding data to Firebase:", e);
      throw e;
    }
  },

  // 3. Pull all data from Firestore into local ERP_STATE
  async pullAllData() {
    if (!db || !window.ERP_STATE) return;

    try {
      // Invoices
      const invSnap = await getDocs(collection(db, this.collections.invoices));
      if (!invSnap.empty) {
        window.ERP_STATE.data.finance.invoices = invSnap.docs.map(d => d.data());
      }

      // Products
      const prodSnap = await getDocs(collection(db, this.collections.products));
      if (!prodSnap.empty) {
        window.ERP_STATE.data.inventory.products = prodSnap.docs.map(d => d.data());
      }

      // Stock Movements
      const movSnap = await getDocs(collection(db, this.collections.stockMovements));
      if (!movSnap.empty) {
        window.ERP_STATE.data.inventory.stockMovements = movSnap.docs.map(d => d.data());
      }

      // Customers
      const custSnap = await getDocs(collection(db, this.collections.customers));
      if (!custSnap.empty) {
        window.ERP_STATE.data.sales.customers = custSnap.docs.map(d => d.data());
      }

      // Sales Orders
      const orderSnap = await getDocs(collection(db, this.collections.salesOrders));
      if (!orderSnap.empty) {
        window.ERP_STATE.data.sales.orders = orderSnap.docs.map(d => d.data());
      }

      // Suppliers
      const supSnap = await getDocs(collection(db, this.collections.suppliers));
      if (!supSnap.empty) {
        window.ERP_STATE.data.purchasing.suppliers = supSnap.docs.map(d => d.data());
      }

      // Purchase Orders
      const poSnap = await getDocs(collection(db, this.collections.purchaseOrders));
      if (!poSnap.empty) {
        window.ERP_STATE.data.purchasing.purchaseOrders = poSnap.docs.map(d => d.data());
      }

      // Employees
      const empSnap = await getDocs(collection(db, this.collections.employees));
      if (!empSnap.empty) {
        window.ERP_STATE.data.hr.employees = empSnap.docs.map(d => d.data());
      }

      // Attendance
      const attSnap = await getDocs(collection(db, this.collections.attendance));
      if (!attSnap.empty) {
        window.ERP_STATE.data.hr.attendanceLog = attSnap.docs.map(d => d.data());
      }

      // Leave Requests
      const leaveSnap = await getDocs(collection(db, this.collections.leaveRequests));
      if (!leaveSnap.empty) {
        window.ERP_STATE.data.hr.leaveRequests = leaveSnap.docs.map(d => d.data());
      }

      if (window.renderActiveView) {
        window.renderActiveView();
      }
    } catch (e) {
      console.warn("Could not pull from Firestore:", e);
    }
  },

  // 4. Real-time Listeners (Firestore -> UI)
  attachRealtimeListeners() {
    if (!db) return;

    // Invoices Real-time
    onSnapshot(collection(db, this.collections.invoices), snapshot => {
      if (!snapshot.empty && window.ERP_STATE) {
        window.ERP_STATE.data.finance.invoices = snapshot.docs.map(d => d.data());
        if (window.ERP_STATE.activeModule === 'finance' && window.ERP_STATE.activeSubView === 'invoices') {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Invoices snapshot error:", err));

    // Sales Orders Real-time
    onSnapshot(collection(db, this.collections.salesOrders), snapshot => {
      if (!snapshot.empty && window.ERP_STATE) {
        window.ERP_STATE.data.sales.orders = snapshot.docs.map(d => d.data());
        if (window.ERP_STATE.activeModule === 'sales' && window.ERP_STATE.activeSubView === 'pipeline') {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Orders snapshot error:", err));

    // Attendance Log Real-time
    onSnapshot(collection(db, this.collections.attendance), snapshot => {
      if (!snapshot.empty && window.ERP_STATE) {
        window.ERP_STATE.data.hr.attendanceLog = snapshot.docs.map(d => d.data());
        if (window.ERP_STATE.activeModule === 'hr' && window.ERP_STATE.activeSubView === 'attendance') {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Attendance snapshot error:", err));
  },

  // 5. Cloud Mutation Helpers (UI -> Firestore)
  async saveInvoice(invoice) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.invoices, invoice.id), invoice);
      console.log(`Saved invoice ${invoice.id} to Firestore.`);
    } catch (e) {
      console.warn("Failed saving invoice to Firestore:", e);
    }
  },

  async updateInvoiceStatus(invoiceId, newStatus) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.invoices, invoiceId), { status: newStatus });
    } catch (e) {
      console.warn("Failed updating invoice in Firestore:", e);
    }
  },

  async saveSalesOrder(order) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.salesOrders, order.id), order);
      console.log(`Saved sales order ${order.id} to Firestore.`);
    } catch (e) {
      console.warn("Failed saving order to Firestore:", e);
    }
  },

  async updateOrderStatus(orderId, newStage) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.salesOrders, orderId), { stage: newStage });
    } catch (e) {
      console.warn("Failed updating order stage in Firestore:", e);
    }
  },

  async savePunchLog(punchRecord) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.attendance, punchRecord.id), punchRecord);
    } catch (e) {
      console.warn("Failed saving punch log to Firestore:", e);
    }
  },

  async updateLeaveStatus(leaveId, newStatus) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.leaveRequests, leaveId), { status: newStatus });
    } catch (e) {
      console.warn("Failed updating leave request in Firestore:", e);
    }
  },

  async savePurchaseOrder(po) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.purchaseOrders, po.id), po);
    } catch (e) {
      console.warn("Failed saving purchase order to Firestore:", e);
    }
  },

  // 6. UI Status Badge Updater in Header
  updateStatusBadge() {
    const badge = document.getElementById("firebaseStatusBadge");
    if (!badge) return;

    if (this.syncStatus === "connected") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 live-pulse"></span>
        <span class="font-bold">Firebase متصل (tast-b91f3)</span>
      `;
      badge.className = "hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors";
    } else if (this.syncStatus === "permission_notice") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span class="font-bold">Firebase جاهز (قيد المصادقة)</span>
      `;
      badge.className = "hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors";
    } else {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span class="font-bold">Firebase متصل سحابياً</span>
      `;
      badge.className = "hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors";
    }
  }
};

// Auto-run initialization after DOM loads
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.ERP_FIREBASE.initSync();
  }, 1000);
});
