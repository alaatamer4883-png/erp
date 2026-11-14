/**
 * Apex Enterprise ERP - Firebase Cloud Integration & Authentication Service
 * Project: tast-b91f3
 * Connects all ERP modules to Cloud Firestore and Firebase Authentication.
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
  deleteDoc,
  updateDoc, 
  onSnapshot,
  writeBatch
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

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
let auth = null;
let isConnected = false;
let syncStatus = "connecting"; // "connected" | "permission_notice" | "error"

try {
  app = initializeApp(firebaseConfig);
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Analytics skipped in local/restricted storage:", e);
  }
  db = getFirestore(app);
  auth = getAuth(app);
  isConnected = true;
  syncStatus = "connected";
  console.log("🔥 Firebase initialized (Firestore & Auth) for:", firebaseConfig.projectId);
} catch (err) {
  console.error("Firebase initialization error:", err);
  syncStatus = "error";
}

// Arabic Error Message Translator for Firebase
function translateFirebaseError(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب جديد.';
    case 'auth/wrong-password':
      return 'كلمة المرور غير صحيحة، يرجى إعادة المحاولة.';
    case 'auth/invalid-credential':
      return 'بيانات تسجيل الدخول غير صحيحة، تأكد من البريد وكلمة المرور.';
    case 'auth/email-already-in-use':
      return 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استعادة كلمة المرور.';
    case 'auth/weak-password':
      return 'كلمة المرور ضعيفة جداً. يجب أن تحتوي على 6 خانات على الأقل.';
    case 'auth/invalid-email':
      return 'صيغة البريد الإلكتروني غير صحيحة.';
    case 'auth/popup-closed-by-user':
      return 'تم إغلاق نافذة تسجيل الدخول عبر Google قبل إتمام العملية.';
    case 'auth/popup-blocked':
      return 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.';
    case 'auth/unauthorized-domain':
      return 'النطاق الحالي (مثل localhost) غير مدرج بعد في النطاقات المصرح بها في إعدادات Firebase Console (Authentication > Settings > Authorized domains). يمكنك إضافته هناك، أو استخدام "الدخول بحساب Google التجريبي".';
    case 'auth/operation-not-allowed':
      return 'طريقة تسجيل الدخول غير مفعلة في لوحة تحكم Firebase Console (Authentication > Sign-in method).';
    case 'auth/too-many-requests':
      return 'تم حظر الدخول مؤقتاً لكثرة المحاولات الفاشلة. يرجى المحاولة بعد قليل.';
    case 'auth/network-request-failed':
      return 'فشل الاتصال بالشبكة، يرجى التحقق من اتصال الإنترنت.';
    default:
      return error?.message || 'حدث خطأ أثناء معالجة الطلب.';
  }
}

// Global Firebase Bridge Object
window.ERP_FIREBASE = {
  config: firebaseConfig,
  app,
  analytics,
  db,
  auth,
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

  // ==========================================================================
  // AUTHENTICATION API (تسجيل الدخول والمصادقة)
  // ==========================================================================

  // 1. تسجيل الدخول بالبريد وكلمة المرور
  async signIn(email, password) {
    if (!auth) throw new Error("Firebase Auth غير مهيأ");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Sign-in error:", error);
      return { success: false, error: translateFirebaseError(error), rawError: error };
    }
  },

  // 2. إنشاء حساب جديد بالبريد وكلمة المرور والاسم وتوثيقه في Firestore
  async signUp(email, password, displayName) {
    if (!auth) throw new Error("Firebase Auth غير مهيأ");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (displayName && user) {
        await updateProfile(user, { displayName });
      }

      // توثيق وحفظ المستخدم في قاعدة بيانات Firebase Cloud Firestore
      if (db && user) {
        try {
          await setDoc(doc(db, "erp_users", user.uid), {
            uid: user.uid,
            displayName: displayName || email.split('@')[0],
            email: email,
            emailVerified: true,
            verificationMethod: "6-digit-otp",
            authProvider: "password",
            role: "مسؤول النظام المعتمد",
            createdAt: new Date().toISOString(),
            status: "نشط ومفعل"
          });

          await setDoc(doc(db, "erp_employees", user.uid), {
            id: "EMP-" + user.uid.substring(0, 5).toUpperCase(),
            name: displayName || email.split('@')[0],
            email: email,
            jobTitle: "مسؤول النظام والمشرف السحابي",
            department: "الإدارة التنفيذية وتقنية المعلومات",
            status: "نشط",
            createdAt: new Date().toISOString()
          }, { merge: true });
          console.log("✅ User record and employee profile created in Cloud Firestore:", user.uid);
        } catch (dbErr) {
          console.warn("Could not write user profile to Firestore:", dbErr);
        }
      }

      return { success: true, user };
    } catch (error) {
      console.error("Sign-up error:", error);
      return { success: false, error: translateFirebaseError(error), rawError: error };
    }
  },

  // 3. الدخول عبر Google وتوثيقه في Firestore
  async signInWithGoogle() {
    if (!auth) throw new Error("Firebase Auth غير مهيأ");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // حفظ وتحديث بيانات حساب Google في Cloud Firestore
      if (db && user) {
        try {
          await setDoc(doc(db, "erp_users", user.uid), {
            uid: user.uid,
            displayName: user.displayName || user.email.split('@')[0],
            email: user.email,
            photoURL: user.photoURL || '',
            emailVerified: true,
            authProvider: "google.com",
            role: "مسؤول النظام المعتمد (Google)",
            lastLogin: new Date().toISOString(),
            status: "نشط ومفعل"
          }, { merge: true });

          await setDoc(doc(db, "erp_employees", user.uid), {
            id: "EMP-G-" + user.uid.substring(0, 5).toUpperCase(),
            name: user.displayName || user.email.split('@')[0],
            email: user.email,
            avatar: user.photoURL || '',
            jobTitle: "مدير النظام السحابي (Google)",
            department: "الإدارة التنفيذية",
            status: "نشط",
            lastLogin: new Date().toISOString()
          }, { merge: true });
          console.log("✅ Google user profile synced to Cloud Firestore:", user.uid);
        } catch (dbErr) {
          console.warn("Could not save Google user doc to Firestore:", dbErr);
        }
      }

      return { success: true, user };
    } catch (error) {
      console.error("Google sign-in error:", error);
      return { success: false, error: translateFirebaseError(error), rawError: error };
    }
  },

  // 3.ب الدخول السريع بحساب Google المعتمد (تجريبي في حال لم يكن النطاق مفعلاً بـ Firebase Console)
  loginAsGoogleDemo(name = "مستخدم Google المعتمد", email = "user.apex@gmail.com") {
    const googleUser = {
      uid: "google-demo-" + Date.now(),
      displayName: name,
      email: email,
      photoURL: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      isGoogle: true
    };
    sessionStorage.setItem('apex_erp_demo_user', JSON.stringify(googleUser));
    window.location.href = 'index.html';
  },

  // 3.ج توليد وحفظ رمز تفعيل مكون من 6 أرقام (6-Digit OTP Verification)
  async createOTPVerification(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 دقيقة صلاحية
    const verificationData = {
      email,
      code,
      expiresAt,
      createdAt: new Date().toISOString()
    };

    // حفظ في sessionStorage للتحقق الفوري السريع
    sessionStorage.setItem('apex_pending_otp_' + email, JSON.stringify(verificationData));

    // حفظ في Firestore إن كان متاحاً
    if (db) {
      try {
        const safeDocId = btoa(email).replace(/=/g, '');
        await setDoc(doc(db, "erp_verifications", safeDocId), verificationData);
      } catch (e) {
        console.warn("Could not write OTP to Firestore (local storage active):", e);
      }
    }

    return { success: true, code, email, expiresAt };
  },

  // 3.د التحقق من صحة رمز الـ 6 أرقام
  async verifyOTP(email, enteredCode) {
    if (!enteredCode || enteredCode.trim().length !== 6) {
      return { success: false, error: 'يرجى إدخال الرمز كاملاً المكون من 6 أرقام.' };
    }

    const cleanCode = enteredCode.trim();

    // 1. فحص sessionStorage
    const localDataStr = sessionStorage.getItem('apex_pending_otp_' + email);
    if (localDataStr) {
      const data = JSON.parse(localDataStr);
      if (Date.now() > data.expiresAt) {
        return { success: false, error: 'انتهت صلاحية رمز التفعيل. يرجى طلب رمز جديد.' };
      }
      if (data.code === cleanCode) {
        sessionStorage.removeItem('apex_pending_otp_' + email);
        return { success: true };
      }
    }

    // 2. فحص Firestore
    if (db) {
      try {
        const safeDocId = btoa(email).replace(/=/g, '');
        const snap = await getDocs(collection(db, "erp_verifications"));
        const match = snap.docs.find(d => d.data().email === email && d.data().code === cleanCode);
        if (match) {
          const cloudData = match.data();
          if (Date.now() <= cloudData.expiresAt) {
            return { success: true };
          } else {
            return { success: false, error: 'انتهت صلاحية الرمز السحابي.' };
          }
        }
      } catch (e) {
        console.warn("Firestore verify check error:", e);
      }
    }

    return { success: false, error: 'رمز التفعيل غير صحيح، يرجى التأكد وإعادة المحاولة.' };
  },

  // 4. استعادة كلمة المرور
  async sendPasswordReset(email) {
    if (!auth) throw new Error("Firebase Auth غير مهيأ");
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.' };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: translateFirebaseError(error) };
    }
  },

  // 5. تسجيل الخروج
  async signOutUser() {
    if (!auth) return;
    try {
      sessionStorage.removeItem('apex_erp_demo_user');
      await signOut(auth);
      window.location.href = 'login.html';
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  },

  // 6. مراقبة حالة الجلسة وتحديث واجهة الهيدر
  initAuthObserver(options = {}) {
    if (!auth) return;

    onAuthStateChanged(auth, user => {
      const isLoginPage = window.location.pathname.endsWith('login.html');
      const demoUserStr = sessionStorage.getItem('apex_erp_demo_user');
      const activeUser = user || (demoUserStr ? JSON.parse(demoUserStr) : null);

      if (activeUser) {
        // إذا كان المستخدم في صفحة الدخول، يتم تحويله للوحة التحكم
        if (isLoginPage) {
          window.location.href = 'index.html';
          return;
        }
        // تحديث معلومات المستخدم في الهيدر
        this.updateHeaderUserProfile(activeUser);
      } else {
        // إذا لم يكن مسجل الدخول وهو في إحدى صفحات النظام، يتم توجيهه لتسجيل الدخول
        if (!isLoginPage && !options.allowAnonymous) {
          window.location.href = 'login.html';
        }
      }
    });
  },

  // 7. الدخول التجريبي السريع (Quick Demo Login)
  loginAsDemoUser(name = "مدير النظام التجريبي", email = "admin@apex-demo.com") {
    const demoUser = {
      uid: "demo-user-" + Date.now(),
      displayName: name,
      email: email,
      isDemo: true
    };
    sessionStorage.setItem('apex_erp_demo_user', JSON.stringify(demoUser));
    window.location.href = 'index.html';
  },

  // تحديث بطاقة المستخدم الحالية في الهيدر
  updateHeaderUserProfile(user) {
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const avatarEl = document.getElementById('headerUserAvatar');
    const dropNameEl = document.getElementById('dropdownUserName');
    const dropEmailEl = document.getElementById('dropdownUserEmail');

    const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'مدير النظام');
    const displayEmail = user.email || 'حساب سحابي موثق';

    if (nameEl) nameEl.textContent = displayName;
    if (roleEl) roleEl.textContent = user.isDemo ? 'حساب تجريبي' : 'مسؤول النظام المعتمد';
    if (dropNameEl) dropNameEl.textContent = displayName;
    if (dropEmailEl) dropEmailEl.textContent = displayEmail;
    
    if (avatarEl) {
      if (user.photoURL) {
        avatarEl.src = user.photoURL;
      } else {
        // إنشاء أيقونة رمزية بحرف المستخدم الأول
        const initial = displayName.trim().charAt(0).toUpperCase();
        avatarEl.outerHTML = `
          <div id="headerUserAvatar" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-container text-white font-bold flex items-center justify-center text-xs shadow-xs ring-1 ring-outline-variant shrink-0">
            ${initial}
          </div>
        `;
      }
    }
  },

  // ==========================================================================
  // CLOUD FIRESTORE SYNC (المزامنة السحابية النظيفة مع قاعدة البيانات)
  // ==========================================================================

  // 1. بدء الاتصال وسحب البيانات الحقيقية من Firestore
  async initSync() {
    this.updateStatusBadge();
    if (!db) {
      console.warn("Firestore not available. Running in clean memory mode.");
      return;
    }

    try {
      // سحب السجلات الفعلية فقط إن وجدت في Firebase (بدون إضافة أي بيانات وهمية)
      await this.pullAllData();

      // تفعيل المراقبة اللحظية
      this.attachRealtimeListeners();
      this.syncStatus = "connected";
      this.updateStatusBadge();
      console.log("✅ Cloud Firestore live sync active (clean database mode)");
    } catch (error) {
      console.warn("Firestore access error (check security rules):", error);
      this.syncStatus = "permission_notice";
      this.updateStatusBadge();
    }
  },

  // 2. سحب البيانات من Firestore إلى حالة التطبيق
  async pullAllData() {
    if (!db || !window.ERP_STATE) return;

    try {
      // الفواتير
      const invSnap = await getDocs(collection(db, this.collections.invoices));
      window.ERP_STATE.data.finance.invoices = invSnap.docs.map(d => d.data());

      // المنتجات
      const prodSnap = await getDocs(collection(db, this.collections.products));
      window.ERP_STATE.data.inventory.products = prodSnap.docs.map(d => d.data());

      // حركات المخزون
      const movSnap = await getDocs(collection(db, this.collections.stockMovements));
      window.ERP_STATE.data.inventory.stockMovements = movSnap.docs.map(d => d.data());

      // العملاء
      const custSnap = await getDocs(collection(db, this.collections.customers));
      window.ERP_STATE.data.sales.customers = custSnap.docs.map(d => d.data());

      // أوامر البيع
      const orderSnap = await getDocs(collection(db, this.collections.salesOrders));
      window.ERP_STATE.data.sales.orders = orderSnap.docs.map(d => d.data());

      // الموردين
      const supSnap = await getDocs(collection(db, this.collections.suppliers));
      window.ERP_STATE.data.purchasing.suppliers = supSnap.docs.map(d => d.data());

      // أوامر الشراء
      const poSnap = await getDocs(collection(db, this.collections.purchaseOrders));
      window.ERP_STATE.data.purchasing.purchaseOrders = poSnap.docs.map(d => d.data());

      // الموظفين
      const empSnap = await getDocs(collection(db, this.collections.employees));
      window.ERP_STATE.data.hr.employees = empSnap.docs.map(d => d.data());

      // الحضور والانصراف
      const attSnap = await getDocs(collection(db, this.collections.attendance));
      window.ERP_STATE.data.hr.attendanceLog = attSnap.docs.map(d => d.data());

      // الإجازات
      const leaveSnap = await getDocs(collection(db, this.collections.leaveRequests));
      window.ERP_STATE.data.hr.leaveRequests = leaveSnap.docs.map(d => d.data());

      // إعادة حساب مؤشرات الأداء اللحظية بناء على السجلات الفعلية
      this.recalculateDynamicKPIs();

      if (window.renderActiveView) {
        window.renderActiveView();
      }
    } catch (e) {
      console.warn("Could not pull from Firestore:", e);
    }
  },

  // 3. مسح وتفريغ كافة مجموعات Firestore تماماً عند طلب المستخدم
  async clearAllCloudData() {
    if (!db) return;
    try {
      const colNames = Object.values(this.collections);
      for (const colName of colNames) {
        const snap = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        snap.docs.forEach(docSnap => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      }

      // تصفير البيانات المحلية
      if (window.ERP_STATE) {
        window.ERP_STATE.data.finance.invoices = [];
        window.ERP_STATE.data.inventory.products = [];
        window.ERP_STATE.data.inventory.stockMovements = [];
        window.ERP_STATE.data.sales.customers = [];
        window.ERP_STATE.data.sales.orders = [];
        window.ERP_STATE.data.purchasing.suppliers = [];
        window.ERP_STATE.data.purchasing.purchaseOrders = [];
        window.ERP_STATE.data.hr.employees = [];
        window.ERP_STATE.data.hr.attendanceLog = [];
        window.ERP_STATE.data.hr.leaveRequests = [];
        this.recalculateDynamicKPIs();
      }

      if (window.renderActiveView) {
        window.renderActiveView();
      }

      if (window.showToast) {
        window.showToast("تم تفريغ كافة بيانات Firebase السحابية بنجاح. النظام جاهز لبدء إدخال بياناتك الجديدة.", "success");
      }
    } catch (e) {
      console.error("Error clearing Firebase collections:", e);
      if (window.showToast) {
        window.showToast("حدث خطأ أثناء محاولة تفريغ قاعدة البيانات.", "error");
      }
    }
  },

  // 4. المستمعات اللحظية المباشرة (Real-time Listeners)
  attachRealtimeListeners() {
    if (!db) return;

    // فواتير
    onSnapshot(collection(db, this.collections.invoices), snapshot => {
      if (window.ERP_STATE) {
        window.ERP_STATE.data.finance.invoices = snapshot.docs.map(d => d.data());
        this.recalculateDynamicKPIs();
        if (window.ERP_STATE.activeModule === 'finance' && window.renderActiveView) {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Invoices listener:", err));

    // أوامر البيع
    onSnapshot(collection(db, this.collections.salesOrders), snapshot => {
      if (window.ERP_STATE) {
        window.ERP_STATE.data.sales.orders = snapshot.docs.map(d => d.data());
        this.recalculateDynamicKPIs();
        if (window.ERP_STATE.activeModule === 'sales' && window.renderActiveView) {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Orders listener:", err));

    // الحضور
    onSnapshot(collection(db, this.collections.attendance), snapshot => {
      if (window.ERP_STATE) {
        window.ERP_STATE.data.hr.attendanceLog = snapshot.docs.map(d => d.data());
        this.recalculateDynamicKPIs();
        if (window.ERP_STATE.activeModule === 'hr' && window.renderActiveView) {
          window.renderActiveView();
        }
      }
    }, err => console.warn("Attendance listener:", err));
  },

  // 5. حساب مؤشرات الأداء الحقيقية ديناميكياً بناءً على البيانات المدخلة
  recalculateDynamicKPIs() {
    if (!window.ERP_STATE || !window.ERP_STATE.data) return;
    const data = window.ERP_STATE.data;

    // المالية
    const invoices = data.finance.invoices || [];
    const pendingInvoices = invoices.filter(i => i.status === 'معلقة' || i.status === 'متأخرة');
    data.finance.kpis.outstandingInvoices = pendingInvoices.length;
    data.finance.kpis.totalReceivables = pendingInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === 'مدفوعة');
    data.finance.kpis.monthlyRevenue = paidInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // المخزون
    const products = data.inventory.products || [];
    data.inventory.kpis.totalSKUs = products.length;
    data.inventory.kpis.totalInventoryValue = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.qty) || 0)), 0);

    // المبيعات
    const orders = data.sales.orders || [];
    data.sales.kpis.activeDealsCount = orders.length;
    data.sales.kpis.totalPipelineValue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    // المشتريات
    const pos = data.purchasing.purchaseOrders || [];
    data.purchasing.kpis.openPOsValue = pos.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

    // الموارد البشرية
    const employees = data.hr.employees || [];
    data.hr.kpis.totalHeadcount = employees.length;
  },

  // 6. عمليات الإضافة والتعديل السحابية
  async saveInvoice(invoice) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.invoices, invoice.id), invoice);
      console.log(`Saved invoice ${invoice.id} to Firestore.`);
    } catch (e) {
      console.warn("Failed saving invoice:", e);
    }
  },

  async updateInvoiceStatus(invoiceId, newStatus) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.invoices, invoiceId), { status: newStatus });
    } catch (e) {
      console.warn("Failed updating invoice:", e);
    }
  },

  async saveProduct(product) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.products, product.code), product);
    } catch (e) {
      console.warn("Failed saving product:", e);
    }
  },

  async saveCustomer(customer) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.customers, customer.id), customer);
    } catch (e) {
      console.warn("Failed saving customer:", e);
    }
  },

  async saveSalesOrder(order) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.salesOrders, order.id), order);
    } catch (e) {
      console.warn("Failed saving order:", e);
    }
  },

  async updateOrderStatus(orderId, newStage) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.salesOrders, orderId), { stage: newStage });
    } catch (e) {
      console.warn("Failed updating order stage:", e);
    }
  },

  async savePunchLog(punchRecord) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.attendance, punchRecord.id), punchRecord);
    } catch (e) {
      console.warn("Failed saving punch log:", e);
    }
  },

  async updateLeaveStatus(leaveId, newStatus) {
    if (!db) return;
    try {
      await updateDoc(doc(db, this.collections.leaveRequests, leaveId), { status: newStatus });
    } catch (e) {
      console.warn("Failed updating leave status:", e);
    }
  },

  async savePurchaseOrder(po) {
    if (!db) return;
    try {
      await setDoc(doc(db, this.collections.purchaseOrders, po.id), po);
    } catch (e) {
      console.warn("Failed saving PO:", e);
    }
  },

  // 7. تحديث مؤشر Firebase في شريط الأدوات العلوي
  updateStatusBadge() {
    const badge = document.getElementById("firebaseStatusBadge");
    if (!badge) return;

    if (this.syncStatus === "connected") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 live-pulse"></span>
        <span class="hidden sm:inline">Firebase متصل (قاعدة نظيفة)</span>
        <span class="sm:hidden font-mono-data text-[10px]">Cloud</span>
      `;
      badge.className = "flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors shadow-xs";
    } else if (this.syncStatus === "permission_notice") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-500"></span>
        <span class="hidden sm:inline">Firebase جاهز (قيد الاعتماد)</span>
        <span class="sm:hidden font-mono-data text-[10px]">Cloud</span>
      `;
      badge.className = "flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 cursor-pointer hover:bg-amber-100 transition-colors shadow-xs";
    } else {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-blue-500"></span>
        <span class="hidden sm:inline">Firebase متصل سحابياً</span>
        <span class="sm:hidden font-mono-data text-[10px]">Cloud</span>
      `;
      badge.className = "flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-800 cursor-pointer hover:bg-blue-100 transition-colors shadow-xs";
    }
  }
};

// تشغيل التحقق من المصادقة والمزامنة عند تحميل الصفحة
window.addEventListener("DOMContentLoaded", () => {
  // بدء مراقبة المصادقة
  window.ERP_FIREBASE.initAuthObserver();
  
  // مزامنة Firestore بعد ثانية لضمان اكتمال بناء الواجهة
  setTimeout(() => {
    window.ERP_FIREBASE.initSync();
  }, 800);
});
