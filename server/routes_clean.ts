import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
    tempUser?: {
      id: number;
      username: string;
      email: string;
      fullName: string;
      role: string;
    };
  } & Request['session'];
}
import { storage } from "./memory-storage";
import { 
  insertUserSchema, 
  insertSupplierSchema, 
  insertClientSchema, 
  insertProductSchema,
  insertSaleSchema,
  insertPurchaseSchema,
  insertEmployeeSchema,
  insertDeductionSchema,
  insertSalarySchema,
  insertProductCategorySchema,
  insertSupplierPaymentVoucherSchema,
  insertClientReceiptVoucherSchema,
  insertInventoryOpeningBalanceSchema,
  insertWithdrawalVoucherSchema,
  insertAccountingTreeSchema,

  insertPosTerminalSchema,
  insertPosSaleSchema,
  insertBranchTemplateSchema,
  insertBranchSupplierSchema,
  insertBranchClientSchema,
  insertBranchProductCategorySchema,
  insertBranchProductSchema,
  insertBranchSaleSchema,
  insertBranchSaleItemSchema,
  insertHolidaySchema,
  insertInventoryMovementSchema,
  insertGoodsIssueVoucherSchema,
  insertDebtSchema,
  insertDebtPaymentSchema,
  branchSuppliers,
  branchClients,
  branchProductCategories,
  branchProducts,
  branchSales,
  branchSaleItems,
  branches,
  branchEmployees,
  branchSalaries,
  branchAllowances,
  branchDeductions,
  branchEmployeeAttendance,
  companyInfo,
  inventoryMovements,
  products,
  goodsIssueVouchers,
  sales,
  clients
} from "@shared/schema";
import { uploadMiddleware, transcribeAudio } from "./voice";
import { handleAIChat } from "./ai-chat";
import { healthCalculator } from "./health-calculator";
import { handleBranchAccounting } from "./branch-accounting";
import { db, pool } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { 
  users, 
  products, 
  clients, 
  sales, 
  purchases, 
  branches, 
  branchProducts, 
  branchClients, 
  terminals,
  clientReceiptVouchers,
  suppliers,
  supplierPaymentVouchers
} from '../shared/schema';
import multer from 'multer';
import path from 'path';
import * as XLSX from 'xlsx';

// تمديد نوع Request لإضافة الجلسة
interface AuthenticatedRequest extends Request {
  session: {
    userId?: number;
    save: (callback: (err?: any) => void) => void;
    destroy: (callback: (err?: any) => void) => void;
  } & any;
}
import fs from 'fs';

// إعداد رفع الصور
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات الصور (JPEG, JPG, PNG, GIF)'));
    }
  }
});

// إعداد رفع ملفات Excel
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'excel');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'products-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const excelUpload = multer({
  storage: excelStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      return cb(null, true);
    } else {
      cb(new Error('يُسمح فقط بملفات Excel (.xlsx, .xls) أو CSV'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // خدمة الملفات المرفوعة
  app.use('/uploads', (req, res, next) => {
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });
  
  // خدمة الملفات الثابتة
  app.get('/uploads/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', folder, filename);
    res.sendFile(filePath);
  });

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, fullName, password, role } = req.body;
      
      if (!username || !email || !fullName || !password) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      // إنشاء المستخدم الجديد بدون فحص التكرار
      const newUser = await storage.createUser({
        username,
        email,
        fullName,
        password, // في الإنتاج يجب تشفير كلمة المرور
        role: role || 'user'
      });

      // تسجيل دخول المستخدم مباشرة بعد إنشاء الحساب
      const authReq = req as AuthenticatedRequest;
      authReq.session.userId = newUser.id;

      // إزالة كلمة المرور من الاستجابة
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      console.log(`تسجيل دخول: اسم المستخدم="${username}", كلمة المرور="${password}"`);
      
      if (!username || !password) {
        return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
      }

      // نظام دخول مؤقت مبسط
      if ((username === "admin" && password === "admin") || 
          (username === "YOUNIS1234" && password === "Aa123456")) {
        const tempUser = {
          id: 1,
          username: username,
          email: username === "admin" ? "admin@test.com" : "younis@test.com",
          fullName: username === "admin" ? "المدير العام" : "يونس المدير",
          role: "admin"
        };

        // حفظ المستخدم في الجلسة
        const authReq = req as AuthenticatedRequest;
        authReq.session.userId = tempUser.id;
        authReq.session.tempUser = tempUser;
        console.log(`تم حفظ المستخدم في الجلسة: ${tempUser.id}`);

        res.json(tempUser);
      } else {
        console.log(`بيانات دخول خاطئة`);
        return res.status(401).json({ message: "استخدم YOUNIS1234/Aa123456 أو admin/admin للدخول" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // التحقق من حالة المصادقة
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }

      // نظام مؤقت - إرجاع المستخدم المحفوظ في الجلسة
      if (authReq.session.tempUser) {
        res.json(authReq.session.tempUser);
        return;
      }

      // في حالة عدم وجود مستخدم مؤقت، إنشاء واحد
      const tempUser = {
        id: 1,
        username: "admin",
        email: "admin@test.com",
        fullName: "المدير العام",
        role: "admin"
      };
      
      authReq.session.tempUser = tempUser;
      res.json(tempUser);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ message: "خطأ في التحقق من المصادقة" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      authReq.session.destroy(() => {
        res.json({ message: "تم تسجيل الخروج بنجاح" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    }
  });

  app.get("/api/auth/status", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }

      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const { password, ...safeUser } = currentUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "فشل في جلب بيانات المستخدم" });
    }
  });

  app.put("/api/auth/profile", async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const { password, ...safeUser } = updatedUser;
      res.json(safeUser);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "فشل في تحديث الملف الشخصي" });
    }
  });

  // رفع الصورة الشخصية
  app.post("/api/auth/upload-avatar", avatarUpload.single('avatar'), async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "لم يتم رفع أي ملف" });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      
      const updatedUser = await storage.updateUser(userId, { avatar: avatarPath });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json({ 
        message: "تم رفع الصورة بنجاح",
        avatarUrl: avatarPath 
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });



  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const allSuppliers = await storage.getAllSuppliers();
      
      // حساب الرصيد الحالي بناءً على سندات الصرف
      const suppliersWithCurrentBalance = await Promise.all(
        allSuppliers.map(async (supplier) => {
          try {
            // جلب سندات الصرف الخاصة بالمورد
            const paymentVouchers = await db.select()
              .from(supplierPaymentVouchers)
              .where(eq(supplierPaymentVouchers.supplierId, supplier.id));
            
            // حساب إجمالي المدفوعات
            const totalPayments = paymentVouchers.reduce((total, voucher) => {
              return total + parseFloat(voucher.amount || '0');
            }, 0);
            
            // الرصيد الحالي = الرصيد الافتتاحي - إجمالي المدفوعات
            const openingBalance = parseFloat(supplier.balance || '0');
            const currentBalance = openingBalance - totalPayments;
            
            console.log(`المورد ${supplier.name}: رصيد افتتاحي ${openingBalance}, مدفوعات ${totalPayments}, رصيد حالي ${currentBalance}`);
            
            return {
              ...supplier,
              currentBalance: currentBalance.toString(),
              totalPayments: totalPayments.toString()
            };
          } catch (error) {
            console.error(`خطأ في حساب رصيد المورد ${supplier.id}:`, error);
            return {
              ...supplier,
              currentBalance: supplier.balance || '0',
              totalPayments: '0'
            };
          }
        })
      );
      
      res.json(suppliersWithCurrentBalance);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      console.log("بيانات المورد الواردة:", req.body);
      
      // تنظيف البيانات قبل التحقق
      const cleanedData = {
        ...req.body,
        creditLimit: req.body.creditLimit === '' ? null : req.body.creditLimit,
        balance: req.body.balance === '' ? '0' : req.body.balance,
        email: req.body.email === '' ? null : req.body.email,
        phone: req.body.phone === '' ? null : req.body.phone,
        address: req.body.address === '' ? null : req.body.address,
        taxNumber: req.body.taxNumber === '' ? null : req.body.taxNumber
      };
      
      const validatedData = insertSupplierSchema.parse(cleanedData);
      console.log("البيانات بعد التحقق:", validatedData);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error: any) {
      console.error("خطأ في إضافة المورد:", error);
      res.status(400).json({ message: "بيانات المورد غير صحيحة", error: error?.message || "خطأ غير معروف" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // تنظيف البيانات قبل التحقق
      const cleanedData = {
        ...req.body,
        creditLimit: req.body.creditLimit === '' ? null : req.body.creditLimit,
        balance: req.body.balance === '' ? '0' : req.body.balance,
        email: req.body.email === '' ? null : req.body.email,
        phone: req.body.phone === '' ? null : req.body.phone,
        address: req.body.address === '' ? null : req.body.address,
        taxNumber: req.body.taxNumber === '' ? null : req.body.taxNumber
      };
      
      const validatedData = insertSupplierSchema.parse(cleanedData);
      const supplier = await storage.updateSupplier(id, validatedData);
      if (supplier) {
        res.json(supplier);
      } else {
        res.status(404).json({ message: "المورد غير موجود" });
      }
    } catch (error: any) {
      console.error("خطأ في تحديث المورد:", error);
      res.status(400).json({ message: "بيانات المورد غير صحيحة", error: error?.message || "خطأ غير معروف" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      console.log('بيانات المورد الواردة:', data);
      
      // تنظيف البيانات
      const cleanedData = {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        taxNumber: data.taxNumber || null,
        creditLimit: data.creditLimit || '0',
        balance: data.balance || '0'
      };
      
      console.log('البيانات بعد التحقق:', cleanedData);
      
      const updatedSupplier = await storage.updateSupplier(id, cleanedData);
      
      if (!updatedSupplier) {
        return res.status(404).json({ error: "Supplier not found" });
      }
      
      res.json(updatedSupplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSupplier(id);
      if (deleted) {
        res.json({ message: "Supplier deleted successfully" });
      } else {
        res.status(404).json({ message: "Supplier not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      console.log("البيانات الواردة:", req.body);
      
      // تنظيف وتجهيز البيانات
      const clientData = {
        name: req.body.name,
        phone: req.body.phone || null,
        email: req.body.email || null,
        address: req.body.address || null,
        group: req.body.group || 'عام',
        balance: String(req.body.openingBalance || 0),
        openingBalance: String(req.body.openingBalance || 0),
        currentBalance: String(req.body.openingBalance || 0),
        creditLimit: String(req.body.creditLimit || 0),
        accountType: req.body.accountType || 'cash',
        status: req.body.status || 'active'
      };
      
      console.log("البيانات بعد المعالجة:", clientData);
      
      const validatedData = insertClientSchema.parse(clientData);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error: any) {
      console.error("خطأ في إضافة العميل:", error);
      res.status(400).json({ 
        message: "بيانات العميل غير صحيحة",
        error: error?.message,
        details: error?.issues || []
      });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (deleted) {
        res.json({ message: "Client deleted successfully" });
      } else {
        res.status(404).json({ message: "Client not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Product creation error:", error);
      
      // معالجة أخطاء قاعدة البيانات
      if (error?.code === '23505') {
        if (error.constraint === 'products_code_unique') {
          return res.status(400).json({ 
            message: "كود الصنف موجود بالفعل، يرجى استخدام كود آخر",
            field: "code"
          });
        }
        if (error.constraint === 'products_barcode_unique') {
          return res.status(400).json({ 
            message: "الباركود موجود بالفعل، يرجى استخدام باركود آخر",
            field: "barcode"
          });
        }
      }
      
      if (error instanceof Error) {
        res.status(400).json({ message: "بيانات الصنف غير صحيحة", error: error.message });
      } else {
        res.status(400).json({ message: "بيانات الصنف غير صحيحة" });
      }
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (deleted) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      console.log("بيانات المبيعة المرسلة:", JSON.stringify(req.body, null, 2));
      
      const insertSaleSchemaLocal = z.object({
        clientId: z.number().optional(),
        total: z.union([z.string(), z.number()]).transform(val => String(val)),
        branchId: z.number().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
          total: z.number(),
          productName: z.string().optional(),
        })).optional(),
        notes: z.string().optional(),
      });
      
      const validatedData = insertSaleSchemaLocal.parse(req.body);
      
      // إنشاء فاتورة المبيعات
      const sale = await storage.createSale(validatedData);
      
      // تحديث رصيد العميل تلقائياً (زيادة الدين)
      if (validatedData.clientId && validatedData.total) {
        try {
          const totalAmount = parseFloat(validatedData.total);
          await storage.updateClientBalance(validatedData.clientId, totalAmount, 'increase');
          console.log(`تم تحديث رصيد العميل ${validatedData.clientId} بإضافة ${totalAmount} ر.س للفاتورة ${sale.id}`);
        } catch (error) {
          console.error(`خطأ في تحديث رصيد العميل ${validatedData.clientId}:`, error);
        }
      }
      
      // تحديث المخزون تلقائياً عند البيع
      if (validatedData.items && Array.isArray(validatedData.items)) {
        for (const item of validatedData.items) {
          if (item.productId && item.quantity) {
            try {
              await storage.processInventoryTransaction(
                item.productId, 
                item.quantity, 
                'sale'
              );
              console.log(`تم خصم ${item.quantity} قطعة من المنتج ${item.productId} للفاتورة ${sale.id}`);
            } catch (error) {
              console.error(`خطأ في تحديث المخزون للمنتج ${item.productId}:`, error);
            }
          }
        }
      }
      
      res.status(201).json(sale);
    } catch (error) {
      console.error("خطأ في إنشاء فاتورة المبيعات:", error);
      res.status(400).json({ message: "Invalid sale data", error: error.message });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSale(id);
      if (deleted) {
        res.json({ message: "Sale deleted successfully" });
      } else {
        res.status(404).json({ message: "Sale not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sale" });
    }
  });

  // Purchases routes
  app.get("/api/purchases", async (req, res) => {
    try {
      const purchases = await storage.getAllPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      const validatedData = insertPurchaseSchema.parse(req.body);
      
      // إنشاء فاتورة المشتريات
      const purchase = await storage.createPurchase(validatedData);
      
      // تحديث رصيد المورد تلقائياً (زيادة الدين)
      if (validatedData.supplierId && validatedData.total) {
        try {
          const totalAmount = parseFloat(validatedData.total);
          await storage.updateSupplierBalance(validatedData.supplierId, totalAmount, 'increase');
          console.log(`تم تحديث رصيد المورد ${validatedData.supplierId} بإضافة ${totalAmount} ر.س للفاتورة ${purchase.id}`);
        } catch (error) {
          console.error(`خطأ في تحديث رصيد المورد ${validatedData.supplierId}:`, error);
        }
      }
      
      // تحديث المخزون تلقائياً عند الشراء
      if (validatedData.items && Array.isArray(validatedData.items)) {
        for (const item of validatedData.items) {
          if (item.productId && item.quantity) {
            try {
              await storage.processInventoryTransaction(
                item.productId, 
                item.quantity, 
                'purchase'
              );
              console.log(`تم إضافة ${item.quantity} قطعة للمنتج ${item.productId} للفاتورة ${purchase.id}`);
            } catch (error) {
              console.error(`خطأ في تحديث المخزون للمنتج ${item.productId}:`, error);
            }
          }
        }
      }
      
      res.status(201).json(purchase);
    } catch (error) {
      console.error("خطأ في إنشاء فاتورة المشتريات:", error);
      res.status(400).json({ message: "Invalid purchase data" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Auto-register product
  app.post("/api/products/auto-register", async (req, res) => {
    try {
      const productData = req.body;
      const product = await storage.autoRegisterProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("خطأ في التسجيل التلقائي للمنتج:", error);
      res.status(500).json({ message: "Failed to auto-register product" });
    }
  });

  // Update product (including inventory adjustments)
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Update product with full replacement
  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, validatedData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Employees routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      console.log("Received employee data:", req.body);
      const validatedData = insertEmployeeSchema.parse(req.body);
      console.log("Validated employee data:", validatedData);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      console.log("Error creating employee:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid employee data" });
      }
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating employee ID:", id, "with data:", req.body);
      const validatedData = insertEmployeeSchema.parse(req.body);
      console.log("Validated update data:", validatedData);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      console.log("Error updating employee:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid employee data" });
      }
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const employee = await storage.updateEmployee(id, updateData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (deleted) {
        res.json({ message: "Employee deleted successfully" });
      } else {
        res.status(404).json({ message: "Employee not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Deductions routes
  app.get("/api/deductions", async (req, res) => {
    try {
      const deductions = await storage.getAllDeductions();
      res.json(deductions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deductions" });
    }
  });

  app.post("/api/deductions", async (req, res) => {
    try {
      console.log("بيانات الخصم المستلمة:", req.body);
      
      // مخطط محدد للتحقق من بيانات الخصم مع تحويل التاريخ
      const deductionSchema = z.object({
        employeeId: z.number(),
        type: z.string(),
        amount: z.string(),
        description: z.string().optional(),
        date: z.string().transform(val => new Date(val)),
        recurring: z.boolean().optional().default(false)
      });
      
      const validatedData = deductionSchema.parse(req.body);
      console.log("بيانات الخصم بعد التحقق:", validatedData);
      const deduction = await storage.createDeduction(validatedData);
      res.status(201).json(deduction);
    } catch (error) {
      console.error("خطأ في إنشاء الخصم:", error);
      res.status(400).json({ message: "Invalid deduction data", error: error.message });
    }
  });

  app.patch("/api/deductions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const deduction = await storage.updateDeduction(id, updateData);
      if (!deduction) {
        return res.status(404).json({ message: "Deduction not found" });
      }
      res.json(deduction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update deduction" });
    }
  });

  app.delete("/api/deductions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDeduction(id);
      if (deleted) {
        res.json({ message: "Deduction deleted successfully" });
      } else {
        res.status(404).json({ message: "Deduction not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete deduction" });
    }
  });

  // Salaries routes
  app.get("/api/salaries", async (req, res) => {
    try {
      const salaries = await storage.getAllSalaries();
      res.json(salaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch salaries" });
    }
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      console.log("بيانات الراتب الواردة:", req.body);
      const validatedData = insertSalarySchema.parse(req.body);
      console.log("بيانات الراتب بعد التحقق:", validatedData);
      const salary = await storage.createSalary(validatedData);
      res.status(201).json(salary);
    } catch (error) {
      console.error("خطأ في إنشاء الراتب:", error);
      res.status(400).json({ message: "Invalid salary data", error: error.message });
    }
  });

  app.patch("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const salary = await storage.updateSalary(id, updateData);
      if (!salary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      res.json(salary);
    } catch (error) {
      res.status(400).json({ message: "Failed to update salary" });
    }
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSalary(id);
      if (deleted) {
        res.json({ message: "Salary deleted successfully" });
      } else {
        res.status(404).json({ message: "Salary not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete salary" });
    }
  });

  // Product Categories routes
  app.get("/api/product-categories", async (req, res) => {
    try {
      const categories = await storage.getAllProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/product-categories", async (req, res) => {
    try {
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.createProductCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating product category:", error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/product-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertProductCategorySchema.partial().parse(req.body);
      const category = await storage.updateProductCategory(id, updateData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating product category:", error);
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/product-categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Quotes routes
  app.get('/api/quotes', async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/quotes', async (req, res) => {
    try {
      const insertQuoteSchema = z.object({
        clientId: z.number().optional(),
        quoteNumber: z.string(),
        total: z.string(),
        tax: z.string().optional(),
        discount: z.string().optional(),
        status: z.string().optional(),
        validUntil: z.string(),
        notes: z.string().optional(),
        items: z.any().optional(),
      });
      
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote({
        ...validatedData,
        validUntil: new Date(validatedData.validUntil),
      });
      
      res.status(201).json(quote);
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  });

  app.put('/api/quotes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      if (updateData.validUntil) {
        updateData.validUntil = new Date(updateData.validUntil);
      }
      
      const quote = await storage.updateQuote(id, updateData);
      
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      res.json(quote);
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Failed to update quote' });
    }
  });

  app.delete('/api/quotes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteQuote(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({ error: 'Failed to delete quote' });
    }
  });

  // Sales Returns routes
  app.get('/api/sales-returns', async (req, res) => {
    try {
      const salesReturns = await storage.getAllSalesReturns();
      res.json(salesReturns);
    } catch (error) {
      console.error('Error fetching sales returns:', error);
      res.status(500).json({ error: 'Failed to fetch sales returns' });
    }
  });

  app.post('/api/sales-returns', async (req, res) => {
    try {
      const insertSalesReturnSchema = z.object({
        saleId: z.number().optional(),
        returnNumber: z.string(),
        total: z.string(),
        reason: z.string(),
        status: z.string().optional(),
        notes: z.string().optional(),
        items: z.any().optional(),
      });
      
      const validatedData = insertSalesReturnSchema.parse(req.body);
      
      // إنشاء سند الإخراج
      const salesReturn = await storage.createSalesReturn(validatedData);
      
      // إذا كان مرتبط بفاتورة مبيعات، قم بخصم المبلغ وإرجاع الكمية للمخزن
      if (validatedData.saleId && validatedData.items) {
        // جلب الفاتورة الأصلية
        const originalSale = await storage.getSale(validatedData.saleId);
        if (originalSale) {
          // خصم مبلغ المرتجع من إجمالي الفاتورة
          const originalTotal = parseFloat(originalSale.total);
          const returnAmount = parseFloat(validatedData.total);
          const newTotal = Math.max(0, originalTotal - returnAmount);
          
          await storage.updateSale(validatedData.saleId, {
            total: newTotal.toFixed(2)
          });
          
          console.log(`تم خصم ${returnAmount} من فاتورة المبيعات رقم ${validatedData.saleId}`);
          
          // إرجاع الكميات للمخزن
          for (const item of validatedData.items) {
            if (item.productId && item.quantity) {
              const product = await storage.getProduct(item.productId);
              if (product) {
                const currentStock = parseInt(product.quantity?.toString() || '0') || 0;
                const returnQuantity = parseInt(item.quantity) || 0;
                const newStock = currentStock + returnQuantity;
                
                await storage.updateProduct(item.productId, {
                  quantity: newStock
                });
                
                console.log(`تم إرجاع ${returnQuantity} قطعة من المنتج ${product.name} للمخزن. الكمية الجديدة: ${newStock}`);
              }
            }
          }
        }
      }
      
      res.status(201).json(salesReturn);
    } catch (error) {
      console.error('Error creating sales return:', error);
      res.status(500).json({ error: 'Failed to create sales return' });
    }
  });

  app.put('/api/sales-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const salesReturn = await storage.updateSalesReturn(id, updateData);
      
      if (!salesReturn) {
        return res.status(404).json({ error: 'Sales return not found' });
      }
      
      res.json(salesReturn);
    } catch (error) {
      console.error('Error updating sales return:', error);
      res.status(500).json({ error: 'Failed to update sales return' });
    }
  });

  app.patch('/api/sales-returns/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be: approved, pending, or rejected' });
      }
      
      const salesReturn = await storage.updateSalesReturn(id, { status });
      
      if (!salesReturn) {
        return res.status(404).json({ error: 'Sales return not found' });
      }
      
      console.log(`تم تحديث حالة مرتجع المبيعات رقم ${id} إلى: ${status}`);
      res.json(salesReturn);
    } catch (error) {
      console.error('Error updating sales return status:', error);
      res.status(500).json({ error: 'Failed to update sales return status' });
    }
  });

  app.delete('/api/sales-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSalesReturn(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Sales return not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting sales return:', error);
      res.status(500).json({ error: 'Failed to delete sales return' });
    }
  });

  // Purchase Returns routes
  app.get('/api/purchase-returns', async (req, res) => {
    try {
      const purchaseReturns = await storage.getAllPurchaseReturns();
      res.json(purchaseReturns);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
      res.status(500).json({ error: 'Failed to fetch purchase returns' });
    }
  });

  app.post('/api/purchase-returns', async (req, res) => {
    try {
      const insertPurchaseReturnSchema = z.object({
        purchaseId: z.number().optional(),
        returnNumber: z.string(),
        total: z.string(),
        reason: z.string(),
        status: z.string().optional(),
        notes: z.string().optional(),
        items: z.any().optional(),
      });
      
      const validatedData = insertPurchaseReturnSchema.parse(req.body);
      
      // إنشاء المرتجع
      const purchaseReturn = await storage.createPurchaseReturn(validatedData);
      
      // إذا كان المرتجع مرتبط بفاتورة محددة، قم بخصم المبلغ من الفاتورة الأصلية
      if (validatedData.purchaseId) {
        const originalPurchase = await storage.getPurchase(validatedData.purchaseId);
        if (originalPurchase) {
          const originalTotal = parseFloat(originalPurchase.total);
          const returnAmount = parseFloat(validatedData.total);
          const newTotal = Math.max(0, originalTotal - returnAmount);
          
          await storage.updatePurchase(validatedData.purchaseId, {
            total: newTotal.toFixed(2)
          });
          
          console.log(`تم خصم ${returnAmount} من فاتورة المشتريات رقم ${validatedData.purchaseId}. المبلغ الجديد: ${newTotal}`);
        }
      }

      // تحديث المخزون تلقائياً عند مرتجعات المشتريات
      if (validatedData.items && Array.isArray(validatedData.items)) {
        for (const item of validatedData.items) {
          if (item.productId && item.quantity) {
            try {
              // خصم الكمية من المخزون مباشرة
              const product = await storage.getProduct(item.productId);
              if (product) {
                const currentQuantity = parseInt(product.quantity?.toString() || '0') || 0;
                const newQuantity = Math.max(0, currentQuantity - item.quantity);
                await storage.updateProduct(item.productId, { quantity: newQuantity });
                console.log(`تم خصم ${item.quantity} قطعة من المنتج ${item.productId} - الكمية السابقة: ${currentQuantity}, الكمية الجديدة: ${newQuantity}`);
              }
            } catch (error) {
              console.error(`خطأ في تحديث المخزون للمنتج ${item.productId}:`, error);
            }
          }
        }
      }
      
      res.status(201).json(purchaseReturn);
    } catch (error) {
      console.error('Error creating purchase return:', error);
      res.status(500).json({ error: 'Failed to create purchase return' });
    }
  });

  app.put('/api/purchase-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // الحصول على المرتجع الحالي قبل التحديث
      const currentReturn = await storage.getPurchaseReturn(id);
      if (!currentReturn) {
        return res.status(404).json({ error: 'Purchase return not found' });
      }
      
      const purchaseReturn = await storage.updatePurchaseReturn(id, updateData);
      
      // إذا تم تغيير حالة المرتجع إلى معتمد وكان مرتبط بفاتورة
      if (updateData.status === 'approved' && currentReturn.status !== 'approved' && currentReturn.purchaseId) {
        const originalPurchase = await storage.getPurchase(currentReturn.purchaseId);
        if (originalPurchase) {
          const originalTotal = parseFloat(originalPurchase.total);
          const returnAmount = parseFloat(currentReturn.total);
          const newTotal = Math.max(0, originalTotal - returnAmount);
          
          await storage.updatePurchase(currentReturn.purchaseId, {
            total: newTotal.toFixed(2)
          });
          
          console.log(`تم اعتماد المرتجع وخصم ${returnAmount} من فاتورة المشتريات رقم ${currentReturn.purchaseId}`);
        }
      }
      
      res.json(purchaseReturn);
    } catch (error) {
      console.error('Error updating purchase return:', error);
      res.status(500).json({ error: 'Failed to update purchase return' });
    }
  });

  app.patch('/api/purchase-returns/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['approved', 'pending', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be: approved, pending, or rejected' });
      }
      
      const purchaseReturn = await storage.updatePurchaseReturn(id, { status });
      
      if (!purchaseReturn) {
        return res.status(404).json({ error: 'Purchase return not found' });
      }
      
      console.log(`تم تحديث حالة مرتجع المشتريات رقم ${id} إلى: ${status}`);
      res.json(purchaseReturn);
    } catch (error) {
      console.error('Error updating purchase return status:', error);
      res.status(500).json({ error: 'Failed to update purchase return status' });
    }
  });

  app.delete('/api/purchase-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePurchaseReturn(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Purchase return not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting purchase return:', error);
      res.status(500).json({ error: 'Failed to delete purchase return' });
    }
  });

  // Purchase Orders routes
  app.get('/api/purchase-orders', async (req, res) => {
    try {
      const purchaseOrders = await storage.getAllPurchaseOrders();
      res.json(purchaseOrders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
  });

  app.post('/api/purchase-orders', async (req, res) => {
    try {
      const insertPurchaseOrderSchema = z.object({
        orderNumber: z.string(),
        supplierId: z.number().optional(),
        supplierName: z.string().optional(),
        total: z.string().optional(),
        status: z.string().optional(),
        requestedBy: z.string().optional(),
        notes: z.string().optional(),
        items: z.any().optional(),
      });
      
      const validatedData = insertPurchaseOrderSchema.parse(req.body);
      const purchaseOrder = await storage.createPurchaseOrder(validatedData);
      res.status(201).json(purchaseOrder);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      res.status(500).json({ error: 'Failed to create purchase order' });
    }
  });

  app.put('/api/purchase-orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const purchaseOrder = await storage.updatePurchaseOrder(id, updateData);
      
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      
      res.json(purchaseOrder);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      res.status(500).json({ error: 'Failed to update purchase order' });
    }
  });

  app.delete('/api/purchase-orders/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePurchaseOrder(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Purchase order not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      res.status(500).json({ error: 'Failed to delete purchase order' });
    }
  });

  // Goods Receipt Vouchers routes
  app.get('/api/goods-receipt-vouchers', async (req, res) => {
    try {
      const vouchers = await storage.getAllGoodsReceiptVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching goods receipt vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch goods receipt vouchers' });
    }
  });

  app.post('/api/goods-receipt-vouchers', async (req, res) => {
    try {
      // تحويل التاريخ للتنسيق الصحيح
      const data = req.body;
      if (data.receivedDate && typeof data.receivedDate === 'string') {
        data.receivedDate = new Date(data.receivedDate);
      }
      
      const validatedData = data;
      const voucher = await storage.createGoodsReceiptVoucher(validatedData);
      res.status(201).json(voucher);
    } catch (error) {
      console.error('Error creating goods receipt voucher:', error);
      res.status(500).json({ error: 'Failed to create goods receipt voucher' });
    }
  });

  app.put('/api/goods-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const voucher = await storage.updateGoodsReceiptVoucher(id, updateData);
      
      if (!voucher) {
        return res.status(404).json({ error: 'Goods receipt voucher not found' });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error('Error updating goods receipt voucher:', error);
      res.status(500).json({ error: 'Failed to update goods receipt voucher' });
    }
  });

  app.delete('/api/goods-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoodsReceiptVoucher(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Goods receipt voucher not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting goods receipt voucher:', error);
      res.status(500).json({ error: 'Failed to delete goods receipt voucher' });
    }
  });

  // Supplier Payment Vouchers routes
  app.get('/api/supplier-payment-vouchers', async (req, res) => {
    try {
      const vouchers = await storage.getAllSupplierPaymentVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching supplier payment vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch supplier payment vouchers' });
    }
  });

  app.get('/api/supplier-payment-vouchers/supplier/:supplierId', async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const vouchers = await storage.getSupplierPaymentVouchersBySupplierId(supplierId);
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching supplier payment vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch supplier payment vouchers' });
    }
  });

  app.post('/api/supplier-payment-vouchers', async (req, res) => {
    try {
      const validatedData = insertSupplierPaymentVoucherSchema.parse(req.body);
      
      // إنشاء سند الصرف
      const voucher = await storage.createSupplierPaymentVoucher(validatedData);
      
      // لا نخصم من الرصيد الافتتاحي هنا - الحساب يتم في GET /api/suppliers
      console.log(`تم إضافة سند صرف بقيمة ${validatedData.amount} للمورد ${validatedData.supplierId}`);
      
      res.status(201).json(voucher);
    } catch (error) {
      console.error('Error creating supplier payment voucher:', error);
      res.status(500).json({ error: 'Failed to create supplier payment voucher' });
    }
  });

  app.put('/api/supplier-payment-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const voucher = await storage.updateSupplierPaymentVoucher(id, updateData);
      
      if (!voucher) {
        return res.status(404).json({ error: 'Supplier payment voucher not found' });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error('Error updating supplier payment voucher:', error);
      res.status(500).json({ error: 'Failed to update supplier payment voucher' });
    }
  });

  app.delete('/api/supplier-payment-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteSupplierPaymentVoucher(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Supplier payment voucher not found' });
      }
      
      console.log(`تم حذف سند الصرف رقم ${id} - الرصيد الحالي سيتحدث تلقائياً`);
      
      res.json({ message: 'Supplier payment voucher deleted successfully' });
    } catch (error) {
      console.error('Error deleting supplier payment voucher:', error);
      res.status(500).json({ error: 'Failed to delete supplier payment voucher' });
    }
  });

  // Client Receipt Vouchers routes
  app.get('/api/client-receipt-vouchers', async (req, res) => {
    try {
      const vouchers = await storage.getAllClientReceiptVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching client receipt vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch client receipt vouchers' });
    }
  });

  app.get('/api/client-receipt-vouchers/client/:clientId', async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const vouchers = await storage.getClientReceiptVouchersByClientId(clientId);
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching client receipt vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch client receipt vouchers' });
    }
  });

  app.post('/api/client-receipt-vouchers', async (req, res) => {
    try {
      console.log("البيانات الواردة لسند القبض:", req.body);
      
      // تنظيف وتجهيز البيانات
      const voucherData = {
        ...req.body,
        amount: String(req.body.amount || 0),
        receiptDate: req.body.receiptDate || new Date().toISOString().split('T')[0],
        paymentMethod: req.body.paymentMethod || 'نقدي',
        status: req.body.status || 'مؤكد'
      };
      
      console.log("البيانات بعد المعالجة:", voucherData);
      
      const validatedData = insertClientReceiptVoucherSchema.parse(voucherData);
      
      // إنشاء سند القبض
      const voucher = await storage.createClientReceiptVoucher(validatedData);
      
      // إضافة المبلغ إلى رصيد العميل (تقليل الدين)
      const client = await storage.getClient(validatedData.clientId);
      if (client) {
        const currentBalance = parseFloat(client.balance || '0') || 0;
        const voucherAmount = parseFloat(validatedData.amount);
        const newBalance = (currentBalance - voucherAmount).toString();
        
        await storage.updateClient(validatedData.clientId, {
          balance: newBalance
        });
        
        console.log(`تم خصم ${voucherAmount} من دين العميل ${client.name}. الرصيد الجديد: ${newBalance}`);
      }
      
      res.status(201).json(voucher);
    } catch (error: any) {
      console.error('خطأ في إنشاء سند القبض:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء سند القبض",
        message: error?.message,
        details: error?.issues || []
      });
    }
  });

  app.put('/api/client-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientReceiptVoucherSchema.partial().parse(req.body);
      
      const voucher = await storage.updateClientReceiptVoucher(id, validatedData);
      
      if (!voucher) {
        return res.status(404).json({ error: 'Client receipt voucher not found' });
      }
      
      res.json(voucher);
    } catch (error) {
      console.error('Error updating client receipt voucher:', error);
      res.status(500).json({ error: 'Failed to update client receipt voucher' });
    }
  });

  app.delete('/api/client-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // الحصول على بيانات السند قبل الحذف لإعادة المبلغ للرصيد
      const voucher = await storage.getClientReceiptVoucher(id);
      if (!voucher) {
        return res.status(404).json({ error: 'Client receipt voucher not found' });
      }
      
      const success = await storage.deleteClientReceiptVoucher(id);
      if (!success) {
        return res.status(404).json({ error: 'Client receipt voucher not found' });
      }
      
      // إعادة المبلغ إلى دين العميل
      const client = await storage.getClient(voucher.clientId);
      if (client) {
        const currentBalance = parseFloat(client.balance || '0') || 0;
        const voucherAmount = parseFloat(voucher.amount);
        const newBalance = (currentBalance + voucherAmount).toString();
        
        await storage.updateClient(voucher.clientId, {
          balance: newBalance
        });
        
        console.log(`تم إعادة ${voucherAmount} إلى دين العميل ${client.name}. الرصيد الجديد: ${newBalance}`);
      }
      
      res.json({ message: 'Client receipt voucher deleted successfully' });
    } catch (error) {
      console.error('Error deleting client receipt voucher:', error);
      res.status(500).json({ error: 'Failed to delete client receipt voucher' });
    }
  });

  // Inventory Opening Balances routes
  app.get('/api/inventory-opening-balances', async (req, res) => {
    try {
      const balances = await storage.getAllInventoryOpeningBalances();
      res.json(balances);
    } catch (error) {
      console.error('Error fetching inventory opening balances:', error);
      res.status(500).json({ error: 'Failed to fetch inventory opening balances' });
    }
  });

  app.get('/api/inventory-opening-balances/product/:productId', async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const balance = await storage.getInventoryOpeningBalanceByProductId(productId);
      res.json(balance);
    } catch (error) {
      console.error('Error fetching inventory opening balance:', error);
      res.status(500).json({ error: 'Failed to fetch inventory opening balance' });
    }
  });

  app.post('/api/inventory-opening-balances', async (req, res) => {
    try {
      const validatedData = insertInventoryOpeningBalanceSchema.parse(req.body);
      
      // التحقق من وجود رصيد افتتاحي مسبق للمنتج
      const existingBalance = await storage.getInventoryOpeningBalanceByProductId(validatedData.productId);
      if (existingBalance) {
        return res.status(400).json({ error: 'يوجد رصيد افتتاحي مسجل لهذا المنتج مسبقاً' });
      }
      
      const balance = await storage.createInventoryOpeningBalance(validatedData);
      res.status(201).json(balance);
    } catch (error) {
      console.error('Error creating inventory opening balance:', error);
      res.status(500).json({ error: 'Failed to create inventory opening balance' });
    }
  });

  app.put('/api/inventory-opening-balances/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInventoryOpeningBalanceSchema.partial().parse(req.body);
      
      const balance = await storage.updateInventoryOpeningBalance(id, validatedData);
      
      if (!balance) {
        return res.status(404).json({ error: 'Inventory opening balance not found' });
      }
      
      res.json(balance);
    } catch (error) {
      console.error('Error updating inventory opening balance:', error);
      res.status(500).json({ error: 'Failed to update inventory opening balance' });
    }
  });

  app.delete('/api/inventory-opening-balances/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await storage.deleteInventoryOpeningBalance(id);
      if (!success) {
        return res.status(404).json({ error: 'Inventory opening balance not found' });
      }
      
      res.json({ message: 'Inventory opening balance deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory opening balance:', error);
      res.status(500).json({ error: 'Failed to delete inventory opening balance' });
    }
  });

  // Suppliers Excel Import
  app.post('/api/suppliers/import-excel', excelUpload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لا يوجد ملف Excel مرفق' });
      }

      const filePath = req.file.path;
      
      // قراءة ملف Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
      }

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // معالجة كل صف في ملف Excel
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // استخراج البيانات من الصف
          const supplierData = {
            name: row['اسم المورد'] || row['name'] || row['Name'] || row['المورد'],
            phone: row['الهاتف'] || row['phone'] || row['Phone'] || row['رقم الهاتف'] || '',
            email: row['البريد الإلكتروني'] || row['email'] || row['Email'] || '',
            address: row['العنوان'] || row['address'] || row['Address'] || '',
            taxNumber: row['الرقم الضريبي'] || row['taxNumber'] || row['Tax Number'] || '',
            contactPerson: row['الشخص المسؤول'] || row['contactPerson'] || row['Contact Person'] || '',
            notes: row['ملاحظات'] || row['notes'] || row['Notes'] || ''
          };

          // التحقق من البيانات المطلوبة
          if (!supplierData.name) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: اسم المورد مطلوب`);
            continue;
          }

          // التحقق من عدم وجود مورد بنفس الاسم
          const existingSuppliers = await storage.getAllSuppliers();
          const duplicateName = existingSuppliers.find(s => s.name === supplierData.name);
          
          if (duplicateName) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: المورد "${supplierData.name}" موجود مسبقاً`);
            continue;
          }

          // إنشاء المورد
          await storage.createSupplier(supplierData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          (results.errors as string[]).push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      // حذف الملف المؤقت
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      res.json({
        message: `تم استيراد ${results.success} مورد من أصل ${results.total}`,
        results
      });

    } catch (error) {
      console.error('Error importing suppliers from Excel:', error);
      
      // حذف الملف المؤقت في حالة الخطأ
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file after error:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'حدث خطأ أثناء استيراد الموردين من ملف Excel',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Client Opening Balances endpoints
  app.get('/api/opening-balances', async (req, res) => {
    try {
      const result = await db.select().from(clientOpeningBalances).orderBy(desc(clientOpeningBalances.createdAt));
      res.json(result);
    } catch (error) {
      console.error('Error fetching opening balances:', error);
      res.status(500).json({ error: 'Failed to fetch opening balances' });
    }
  });

  app.post('/api/opening-balances', async (req, res) => {
    try {
      const result = await db.insert(clientOpeningBalances).values(req.body).returning();
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating opening balance:', error);
      res.status(500).json({ error: 'Failed to create opening balance' });
    }
  });

  app.post('/api/opening-balances/import', async (req, res) => {
    try {
      const { balances } = req.body;
      if (!Array.isArray(balances)) {
        return res.status(400).json({ error: 'Balances must be an array' });
      }
      
      const results = await db.insert(clientOpeningBalances).values(balances).returning();
      res.json({ success: true, imported: results.length });
    } catch (error) {
      console.error('Error importing opening balances:', error);
      res.status(500).json({ error: 'Failed to import opening balances' });
    }
  });

  // Clients Excel Import
  app.post('/api/clients/import-excel', excelUpload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لا يوجد ملف Excel مرفق' });
      }

      const filePath = req.file.path;
      
      // قراءة ملف Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
      }

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // معالجة كل صف في ملف Excel
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // استخراج البيانات من الصف
          const clientData = {
            name: row['اسم العميل'] || row['name'] || row['Name'] || row['العميل'],
            phone: row['الهاتف'] || row['phone'] || row['Phone'] || row['رقم الهاتف'] || '',
            email: row['البريد الإلكتروني'] || row['email'] || row['Email'] || '',
            address: row['العنوان'] || row['address'] || row['Address'] || '',
            taxNumber: row['الرقم الضريبي'] || row['taxNumber'] || row['Tax Number'] || '',
            notes: row['ملاحظات'] || row['notes'] || row['Notes'] || ''
          };

          // التحقق من البيانات المطلوبة
          if (!clientData.name) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: اسم العميل مطلوب`);
            continue;
          }

          // التحقق من عدم وجود عميل بنفس الاسم
          const existingClients = await storage.getAllClients();
          const duplicateName = existingClients.find(c => c.name === clientData.name);
          
          if (duplicateName) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: العميل "${clientData.name}" موجود مسبقاً`);
            continue;
          }

          // إنشاء العميل
          await storage.createClient(clientData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          (results.errors as string[]).push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      // حذف الملف المؤقت
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      res.json({
        message: `تم استيراد ${results.success} عميل من أصل ${results.total}`,
        results
      });

    } catch (error) {
      console.error('Error importing clients from Excel:', error);
      
      // حذف الملف المؤقت في حالة الخطأ
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file after error:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'حدث خطأ أثناء استيراد العملاء من ملف Excel',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Inventory Opening Balances Excel Import
  app.post('/api/inventory-opening-balances/import-excel', excelUpload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لا يوجد ملف Excel مرفق' });
      }

      const filePath = req.file.path;
      
      // قراءة ملف Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
      }

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // جلب جميع المنتجات لمطابقة الأكواد
      const allProducts = await storage.getAllProducts();

      // معالجة كل صف في ملف Excel
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // استخراج البيانات من الصف
          const balanceData = {
            productCode: row['كود المنتج'] || row['productCode'] || row['Product Code'] || row['الكود'],
            productName: row['اسم المنتج'] || row['productName'] || row['Product Name'] || row['المنتج'],
            openingQuantity: row['الكمية الافتتاحية'] || row['openingQuantity'] || row['Opening Quantity'] || '0',
            unitCost: row['تكلفة الوحدة'] || row['unitCost'] || row['Unit Cost'] || '0',
            location: row['الموقع'] || row['location'] || row['Location'] || '',
            notes: row['ملاحظات'] || row['notes'] || row['Notes'] || '',
            dateRecorded: row['تاريخ التسجيل'] || row['dateRecorded'] || row['Date Recorded'] || new Date().toISOString().split('T')[0]
          };

          // التحقق من البيانات المطلوبة
          if (!balanceData.productCode && !balanceData.productName) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: كود المنتج أو اسم المنتج مطلوب`);
            continue;
          }

          // البحث عن المنتج
          let product = null;
          if (balanceData.productCode) {
            product = allProducts.find(p => p.code === balanceData.productCode);
          } else if (balanceData.productName) {
            product = allProducts.find(p => p.name === balanceData.productName);
          }

          if (!product) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: المنتج غير موجود في النظام`);
            continue;
          }

          // التحقق من عدم وجود رصيد افتتاحي مسبق للمنتج
          const existingBalance = await storage.getInventoryOpeningBalanceByProductId(product.id);
          if (existingBalance) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: يوجد رصيد افتتاحي مسجل للمنتج "${product.name}" مسبقاً`);
            continue;
          }

          // حساب القيمة الإجمالية
          const openingValue = (parseFloat(balanceData.openingQuantity) * parseFloat(balanceData.unitCost)).toString();

          const insertData = {
            productId: product.id,
            openingQuantity: balanceData.openingQuantity.toString(),
            unitCost: balanceData.unitCost.toString(),
            openingValue,
            location: balanceData.location || '',
            notes: balanceData.notes || '',
            dateRecorded: balanceData.dateRecorded
          };

          // إنشاء الرصيد الافتتاحي
          await storage.createInventoryOpeningBalance(insertData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          (results.errors as string[]).push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      // حذف الملف المؤقت
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      res.json({
        message: `تم استيراد ${results.success} رصيد افتتاحي من أصل ${results.total}`,
        results
      });

    } catch (error) {
      console.error('Error importing inventory opening balances from Excel:', error);
      
      // حذف الملف المؤقت في حالة الخطأ
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file after error:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'حدث خطأ أثناء استيراد الأرصدة الافتتاحية من ملف Excel',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Products Excel Import
  app.post('/api/products/import-excel', excelUpload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لا يوجد ملف Excel مرفق' });
      }

      const filePath = req.file.path;
      
      // قراءة ملف Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
      }

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // معالجة كل صف في ملف Excel
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // استخراج البيانات من الصف (يدعم أسماء الأعمدة بالعربي والإنجليزي)
          const productData = {
            name: row['اسم المنتج'] || row['name'] || row['Name'] || row['اسم الصنف'] || row['المنتج'],
            code: row['الكود'] || row['code'] || row['Code'] || row['رقم الصنف'] || row['كود المنتج'],
            barcode: row['الباركود'] || row['barcode'] || row['Barcode'] || '',
            description: row['الوصف'] || row['description'] || row['Description'] || '',
            price: row['السعر'] || row['price'] || row['Price'] || row['سعر البيع'] || '0',
            cost: row['التكلفة'] || row['cost'] || row['Cost'] || row['سعر التكلفة'] || '0',
            categoryId: row['فئة المنتج'] || row['category'] || row['Category'] || row['الفئة'] || null,
            unit: row['الوحدة'] || row['unit'] || row['Unit'] || row['وحدة القياس'] || 'قطعة',
            minStock: row['الحد الأدنى'] || row['minStock'] || row['Min Stock'] || row['الحد الأدنى للمخزون'] || '0',
            maxStock: row['الحد الأقصى'] || row['maxStock'] || row['Max Stock'] || row['الحد الأقصى للمخزون'] || '0'
          };

          // التحقق من البيانات المطلوبة
          if (!productData.name || !productData.code) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: اسم المنتج والكود مطلوبان`);
            continue;
          }

          // التحقق من عدم وجود منتج بنفس الكود
          const existingProduct = await storage.getAllProducts();
          const duplicateCode = existingProduct.find(p => p.code === productData.code);
          
          if (duplicateCode) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: كود المنتج "${productData.code}" موجود مسبقاً`);
            continue;
          }

          // تحويل الأرقام إلى نص
          const insertData = {
            name: productData.name.toString(),
            code: productData.code.toString(),
            barcode: productData.barcode?.toString() || '',
            description: productData.description?.toString() || '',
            price: productData.price.toString(),
            cost: productData.cost.toString(),
            categoryId: productData.categoryId ? parseInt(productData.categoryId.toString()) : null,
            unit: productData.unit?.toString() || 'قطعة',
            minStock: productData.minStock.toString(),
            maxStock: productData.maxStock.toString()
          };

          // إنشاء المنتج
          await storage.createProduct(insertData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          (results.errors as string[]).push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      // حذف الملف المؤقت
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      res.json({
        message: `تم استيراد ${results.success} منتج من أصل ${results.total}`,
        results
      });

    } catch (error) {
      console.error('Error importing products from Excel:', error);
      
      // حذف الملف المؤقت في حالة الخطأ
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file after error:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'حدث خطأ أثناء استيراد الأصناف من ملف Excel',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Branches routes
  app.get('/api/branches', async (req, res) => {
    try {
      const branches = await storage.getAllBranches();
      res.json(branches);
    } catch (error) {
      console.error('Error fetching branches:', error);
      res.status(500).json({ error: 'Failed to fetch branches' });
    }
  });

  app.get('/api/branches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const branch = await storage.getBranch(id);
      
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      
      res.json(branch);
    } catch (error) {
      console.error('Error fetching branch:', error);
      res.status(500).json({ error: 'Failed to fetch branch' });
    }
  });

  app.post('/api/branches', async (req, res) => {
    try {
      const { insertBranchSchema } = await import('@shared/schema');
      const data = req.body;
      
      // تنظيف تاريخ الافتتاح
      if (data.openingDate === '') {
        data.openingDate = null;
      }
      
      const validatedData = insertBranchSchema.parse(data);
      
      const branch = await storage.createBranch(validatedData);
      res.status(201).json(branch);
    } catch (error) {
      console.error('Error creating branch:', error);
      res.status(500).json({ error: 'Failed to create branch' });
    }
  });

  app.put('/api/branches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      const branch = await storage.updateBranch(id, updateData);
      
      if (!branch) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      
      res.json(branch);
    } catch (error) {
      console.error('Error updating branch:', error);
      res.status(500).json({ error: 'Failed to update branch' });
    }
  });

  app.delete('/api/branches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBranch(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Branch not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting branch:', error);
      res.status(500).json({ error: 'Failed to delete branch' });
    }
  });

  // Branch Stats API
  app.get('/api/branches/:id/stats', async (req, res) => {
    try {
      const branchId = parseInt(req.params.id);
      
      // استرجاع إحصائيات الفرع
      const stats = {
        totalProducts: 0,
        totalSales: '0.00',
        totalClients: 0,
        inventoryValue: '0.00',
        todaySales: '0.00',
        monthlyGrowth: 0
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching branch stats:', error);
      res.status(500).json({ error: 'Failed to fetch branch stats' });
    }
  });

  // Branch Health Metrics API
  app.get('/api/branches/:id/health', async (req, res) => {
    try {
      const branchId = parseInt(req.params.id);
      
      const healthMetrics = await healthCalculator.calculateBranchHealth(branchId);
      res.json(healthMetrics);
    } catch (error) {
      console.error('Error fetching branch health:', error);
      res.status(500).json({ error: 'Failed to fetch branch health metrics' });
    }
  });

  // Update all branches health metrics
  app.post('/api/branches/update-health', async (req, res) => {
    try {
      await healthCalculator.updateAllBranchesHealth();
      res.json({ message: 'تم تحديث مؤشرات صحة جميع الفروع بنجاح' });
    } catch (error) {
      console.error('Error updating branch health:', error);
      res.status(500).json({ error: 'Failed to update branch health metrics' });
    }
  });

  // Branches Excel Import
  app.post('/api/branches/import-excel', excelUpload.single('excel'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'لا يوجد ملف Excel مرفق' });
      }

      const filePath = req.file.path;
      
      // قراءة ملف Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على بيانات صالحة' });
      }

      const results = {
        total: jsonData.length,
        success: 0,
        failed: 0,
        errors: [] as string[]
      };

      // معالجة كل صف في ملف Excel
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // استخراج البيانات من الصف
          const branchData = {
            name: row['اسم الفرع'] || row['name'] || row['Name'],
            code: row['كود الفرع'] || row['code'] || row['Code'],
            address: row['العنوان'] || row['address'] || row['Address'] || '',
            phone: row['الهاتف'] || row['phone'] || row['Phone'] || '',
            email: row['البريد الإلكتروني'] || row['email'] || row['Email'] || '',
            managerName: row['اسم المدير'] || row['managerName'] || row['Manager Name'] || '',
            managerPhone: row['هاتف المدير'] || row['managerPhone'] || row['Manager Phone'] || '',
            openingDate: row['تاريخ الافتتاح'] || row['openingDate'] || row['Opening Date'] || null,
            notes: row['ملاحظات'] || row['notes'] || row['Notes'] || '',
            isActive: row['نشط'] !== false && row['isActive'] !== false && row['Active'] !== false
          };

          // التحقق من البيانات المطلوبة
          if (!branchData.name || !branchData.code) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: اسم الفرع والكود مطلوبان`);
            continue;
          }

          // التحقق من عدم وجود فرع بنفس الكود
          const existingBranches = await storage.getAllBranches();
          const duplicateCode = existingBranches.find(b => b.code === branchData.code);
          
          if (duplicateCode) {
            results.failed++;
            (results.errors as string[]).push(`الصف ${i + 1}: كود الفرع "${branchData.code}" موجود مسبقاً`);
            continue;
          }

          // إنشاء الفرع
          await storage.createBranch(branchData);
          results.success++;
          
        } catch (error) {
          results.failed++;
          (results.errors as string[]).push(`الصف ${i + 1}: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }

      // حذف الملف المؤقت
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Error deleting temporary file:', error);
      }

      res.json({
        message: `تم استيراد ${results.success} فرع من أصل ${results.total}`,
        results
      });

    } catch (error) {
      console.error('Error importing branches from Excel:', error);
      
      // حذف الملف المؤقت في حالة الخطأ
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file after error:', unlinkError);
        }
      }
      
      res.status(500).json({ 
        error: 'حدث خطأ أثناء استيراد الفروع من ملف Excel',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  });

  // Voice Assistant - Audio transcription and analysis
  app.post("/api/voice/transcribe", uploadMiddleware, transcribeAudio);

  // AI Chat
  app.post("/api/ai/chat", handleAIChat);

  // Simple SQL Query endpoint for accounting data
  app.post('/api/sql-query', async (req, res) => {
    try {
      const { query } = req.body;
      
      // Only allow SELECT queries for security
      if (!query.trim().toLowerCase().startsWith('select')) {
        return res.status(400).json({ error: 'Only SELECT queries are allowed' });
      }
      
      const result = await db.execute(query);
      res.json(result.rows);
    } catch (error) {
      console.error('SQL Query Error:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  // Chart of Accounts - Simple implementation
  app.get('/api/chart-of-accounts', async (req, res) => {
    try {
      const categoriesResult = await db.execute('SELECT * FROM account_categories ORDER BY code');
      const accountsResult = await db.execute('SELECT * FROM accounts ORDER BY code');
      
      res.json({
        categories: categoriesResult.rows,
        accounts: accountsResult.rows
      });
    } catch (error) {
      console.error('Error fetching chart of accounts:', error);
      res.status(500).json({ error: 'Failed to fetch chart of accounts' });
    }
  });
