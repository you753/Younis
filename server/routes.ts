import express, { Express } from "express";
import { createServer, type Server } from "http";
import session from 'express-session';
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./memory-storage-fixed";
import { db, pool } from "./db";
import { dbStorage } from "./db-storage";
import { inventoryTransfers, sales as salesTable } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { 
  type InsertUser, 
  type Employee, 
  type Deduction, 
  type InsertEmployee, 
  type InsertDeduction,
  type InsertProduct,
  type Product,
  type Sale,
  type InsertSale,
  type Purchase,
  type InsertPurchase,
  type Client,
  type InsertClient,
  type Supplier,
  type InsertSupplier,
  type Quote,
  type InsertQuote,
  type SalesReturn,
  type InsertSalesReturn,
  type PurchaseReturn,
  type InsertPurchaseReturn,
  type Salary,
  type InsertSalary,
  type Holiday,
  type InsertHoliday,
  type Branch,
  type InsertBranch
} from "@shared/schema";

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    tempUser?: {
      id: number;
      username: string;
      email: string;
      fullName: string;
      role: string;
      avatar?: string;
      phone?: string;
      address?: string;
      bio?: string;
      profession?: string;
    }
  }
}

let branchClients: any[] = [];
let branchUsers: any[] = [];
let branchProducts: any[] = [];
let branchSales: any[] = [];
let branches: any[] = [];

// Mock data for development
const mockBranches = [
  { id: 1, name: 'الفرع الرئيسي', code: 'MAIN', manager: 'أحمد محمد', phone: '011234567', isActive: true },
  { id: 2, name: 'فرع الرياض', code: 'RYD', manager: 'سارة أحمد', phone: '011234568', isActive: true }
];

const mockClients = [
  { id: 1, name: 'عميل أول', phone: '0501234567', email: 'client1@example.com' },
  { id: 2, name: 'عميل ثاني', phone: '0501234568', email: 'client2@example.com' }
];

const products = storage.getAllProducts();
const sales = storage.getAllSales();
const clients = storage.getAllClients();

const mockRecentTransactions = [
  { id: 1, type: 'sale', amount: 1250.00, client: 'عميل أول', date: new Date().toISOString() },
  { id: 2, type: 'purchase', amount: 800.00, supplier: 'مورد رئيسي', date: new Date().toISOString() }
];

const mockStats = {
  totalSales: sales.length,
  totalPurchases: 0,
  totalClients: clients.length,
  totalProducts: products.length,
  branchProducts: products.length,
  branchClients: clients.length,
  terminals: []
};

interface RequestSession extends Request {
  session: any;
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "غير مسجل دخول" });
  }
  next();
}

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function generateBarcodeFromId(id: number): string {
  return `BAR${id.toString().padStart(8, '0')}`;
}

// Generate barcode for products that don't have one
function ensureProductBarcode(product: any) {
  if (!product.barcode) {
    product.barcode = generateBarcodeFromId(product.id);
  }
  return product;
}

export function registerRoutes(app: Express): Server {
  
  // إنشاء مجلد uploads إذا لم يكن موجوداً
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // إعداد multer لرفع الصور
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('يجب أن تكون الملفات صوراً فقط'));
      }
    }
  });

  // إتاحة ملفات uploads للعرض
  app.use('/uploads', express.static(uploadsDir));
  
  // Session configuration
  app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
  }));

  // مسارات المصادقة
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, fullName, password, role } = req.body;
      
      if (!username || !email || !fullName || !password) {
        return res.status(400).json({ message: "جميع الحقول مطلوبة" });
      }

      // إنشاء المستخدم الجديد
      const newUser = storage.createUser({
        username,
        email,
        fullName,
        password, // في الإنتاج يجب تشفير كلمة المرور
        role: role || 'user'
      });

      // تسجيل دخول المستخدم مباشرة بعد إنشاء الحساب
      req.session.userId = newUser.id;
      req.session.tempUser = newUser;

      console.log(`تم إنشاء حساب جديد وتسجيل الدخول: ${newUser.id}`);

      // إزالة كلمة المرور من الاستجابة
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("خطأ في إنشاء الحساب:", error);
      res.status(500).json({ message: "حدث خطأ أثناء إنشاء الحساب" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`تسجيل دخول: اسم المستخدم="${username}", كلمة المرور="${password}"`);
      
      // البحث عن المستخدم في memory storage أولاً
      let user = storage.getUserByUsername(username);
      
      // إذا لم يوجد في memory storage، ابحث في PostgreSQL
      if (!user) {
        console.log(`لم يتم العثور على المستخدم في memory storage، البحث في PostgreSQL...`);
        const result = await pool.query(
          'SELECT id, username, email, password, full_name as "fullName", profession, phone, address, bio, avatar, role, created_at as "createdAt" FROM users WHERE username = $1',
          [username]
        );
        
        if (result.rows.length > 0) {
          user = result.rows[0];
          console.log(`✅ تم العثور على المستخدم في PostgreSQL: ${username}`);
        }
      }
      
      if (user && user.password === password) {
        const userResponse = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role || 'user',
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          bio: user.bio,
          profession: user.profession,
          createdAt: user.createdAt || new Date().toISOString()
        };
        
        req.session.userId = user.id;
        req.session.tempUser = userResponse as any;
        console.log(`✅ تم حفظ المستخدم في الجلسة: ${req.session.userId}`);
        
        res.json(userResponse);
      } else {
        console.log(`❌ فشل تسجيل الدخول للمستخدم: ${username}`);
        res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }
    } catch (error) {
      console.error("خطأ في تسجيل الدخول:", error);
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "غير مسجل دخول" });
    }
    res.json(req.session.tempUser);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // Profile management routes
  app.get("/api/auth/user", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "غير مسجل دخول" });
    }
    
    // إرجاع بيانات المستخدم المحفوظة في الجلسة
    if (req.session.tempUser) {
      res.json(req.session.tempUser);
    } else {
      res.status(404).json({ message: "بيانات المستخدم غير موجودة" });
    }
  });

  app.put("/api/auth/profile", (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "غير مسجل دخول" });
    }

    try {
      const { username, email, fullName, phone, address, bio, profession, profileImageUrl } = req.body;
      
      console.log("تحديث الملف الشخصي:", { username, email, fullName, phone, address, bio, profession });
      
      // تحديث بيانات المستخدم في الجلسة
      if (req.session.tempUser) {
        req.session.tempUser = {
          ...req.session.tempUser,
          username: username || req.session.tempUser.username,
          email: email || req.session.tempUser.email,
          fullName: fullName || req.session.tempUser.fullName,
          phone: phone || req.session.tempUser.phone,
          address: address || req.session.tempUser.address,
          bio: bio || req.session.tempUser.bio,
          profession: profession || req.session.tempUser.profession,
          avatar: profileImageUrl || req.session.tempUser.avatar
        };
        
        console.log("المستخدم بعد التحديث:", req.session.tempUser);
        res.json(req.session.tempUser);
      } else {
        res.status(404).json({ message: "بيانات المستخدم غير موجودة" });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "فشل في تحديث الملف الشخصي" });
    }
  });

  // رفع صورة الملف الشخصي
  app.post("/api/upload/profile-image", upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار صورة" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("خطأ في رفع الصورة:", error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });

  // رفع صورة الملف الشخصي للمستخدم
  app.post("/api/auth/upload-avatar", upload.single('avatar'), (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "غير مسجل دخول" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "لم يتم اختيار صورة" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      
      // تحديث صورة المستخدم في الجلسة
      if (req.session.tempUser) {
        req.session.tempUser.avatar = avatarUrl;
        console.log("تم تحديث الصورة الشخصية:", avatarUrl);
        res.json({ avatar: avatarUrl, user: req.session.tempUser });
      } else {
        res.status(404).json({ message: "بيانات المستخدم غير موجودة" });
      }
    } catch (error) {
      console.error("خطأ في رفع الصورة الشخصية:", error);
      res.status(500).json({ message: "فشل في رفع الصورة" });
    }
  });

  // مسارات المنتجات
  app.get("/api/products", async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // جلب المنتجات من PostgreSQL مباشرة
      const { pool } = await import("./db");
      let query = 'SELECT * FROM products WHERE user_id = $1';
      const params: any[] = [userId];
      
      if (branchId !== undefined) {
        query += ' AND branch_id = $2';
        params.push(branchId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      const products = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        barcode: row.barcode || `${row.id}`,
        description: row.description || '',
        category: row.category || '',
        purchasePrice: row.purchase_price,
        salePrice: row.sale_price,
        quantity: row.quantity,
        minQuantity: row.min_quantity || row.min_stock || 0,
        minStock: row.min_stock || row.min_quantity || 0,
        branchId: row.branch_id,
        createdAt: row.created_at
      }));
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const productId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await pool.query(
        'SELECT * FROM products WHERE id = $1 AND user_id = $2',
        [productId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not found or unauthorized" });
      }
      
      const row = result.rows[0];
      const product = {
        id: row.id,
        name: row.name,
        code: row.code,
        barcode: row.barcode || `${row.id}`,
        description: row.description || '',
        category: row.category || '',
        purchasePrice: row.purchase_price,
        salePrice: row.sale_price,
        quantity: row.quantity,
        minQuantity: row.min_quantity,
        branchId: row.branch_id,
        createdAt: row.created_at
      };
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // توليد code تلقائي إذا لم يتم توفيره
      let productCode = req.body.code;
      if (!productCode) {
        const branchId = req.body.branchId;
        if (branchId) {
          // جلب آخر code في الفرع
          const lastCodeResult = await pool.query(
            `SELECT code FROM products 
             WHERE branch_id = $1 AND user_id = $2 AND code ~ '^[0-9]+$'
             ORDER BY CAST(code AS INTEGER) DESC 
             LIMIT 1`,
            [branchId, userId]
          );
          
          if (lastCodeResult.rows.length > 0) {
            const lastCode = parseInt(lastCodeResult.rows[0].code);
            productCode = String(lastCode + 1);
          } else {
            productCode = '1';
          }
        } else {
          productCode = `AUTO-${Date.now()}`;
        }
      }
      
      // حفظ المنتج مباشرة في PostgreSQL مع user_id
      const result = await pool.query(
        `INSERT INTO products (name, code, barcode, description, category, purchase_price, sale_price, quantity, min_quantity, branch_id, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          req.body.name, 
          productCode, 
          req.body.barcode || '', 
          req.body.description || '',
          req.body.category || '',
          req.body.purchasePrice || '0', 
          req.body.salePrice || '0', 
          req.body.quantity || 0,
          req.body.minQuantity || 0, 
          req.body.branchId || null,
          userId
        ]
      );
      
      const dbProduct = result.rows[0];
      const product = {
        id: dbProduct.id,
        name: dbProduct.name,
        code: dbProduct.code,
        barcode: dbProduct.barcode || `${dbProduct.id}`,
        description: dbProduct.description,
        category: dbProduct.category,
        purchasePrice: dbProduct.purchase_price,
        salePrice: dbProduct.sale_price,
        quantity: dbProduct.quantity,
        minQuantity: dbProduct.min_quantity,
        branchId: dbProduct.branch_id
      };
      
      // حفظ في الذاكرة أيضاً للتوافق
      storage.createProduct({
        id: product.id,
        ...req.body
      });
      
      console.log('✅ تم حفظ المنتج في قاعدة البيانات:', product);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ 
        error: "Failed to create product",
        message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // تحديث المنتج فقط إذا كان ينتمي للمستخدم
      const result = await pool.query(
        `UPDATE products SET 
         name = $1, code = $2, barcode = $3, description = $4, category = $5, 
         purchase_price = $6, sale_price = $7, quantity = $8, min_quantity = $9, branch_id = $10
         WHERE id = $11 AND user_id = $12
         RETURNING *`,
        [
          req.body.name, 
          req.body.code || '', 
          req.body.barcode || `${productId}`, 
          req.body.description || '',
          req.body.category || '',
          req.body.purchasePrice || '0', 
          req.body.salePrice || '0', 
          req.body.quantity || 0,
          req.body.minQuantity || 0, 
          req.body.branchId || null,
          productId,
          userId
        ]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Product not found or unauthorized" });
      }
      
      const updatedRow = result.rows[0];
      const product = {
        id: updatedRow.id,
        name: updatedRow.name,
        code: updatedRow.code,
        barcode: updatedRow.barcode,
        description: updatedRow.description,
        category: updatedRow.category,
        purchasePrice: updatedRow.purchase_price,
        salePrice: updatedRow.sale_price,
        quantity: updatedRow.quantity,
        minQuantity: updatedRow.min_quantity,
        branchId: updatedRow.branch_id
      };
      
      console.log('✅ تم تحديث المنتج في قاعدة البيانات:', product);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ 
        error: "Failed to update product",
        message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
      });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // حذف المنتج فقط إذا كان ينتمي للمستخدم
      const result = await pool.query(
        'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
        [productId, userId]
      );
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Product not found or unauthorized" });
      }
      
      // حذف من الذاكرة أيضاً
      storage.deleteProduct(productId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Inventory movement tracking
  app.get("/api/inventory-movements", (req, res) => {
    const movements = storage.getAllInventoryMovements();
    res.json(movements);
  });

  app.get("/api/inventory-movements/summary", (req, res) => {
    const movements = storage.getAllInventoryMovements();
    const summary = movements.reduce((acc, movement) => {
      const productId = movement.productId.toString();
      if (!acc[productId]) {
        acc[productId] = { 
          productId: movement.productId,
          productName: movement.productName,
          totalIn: 0, 
          totalOut: 0, 
          net: 0,
          movements: []
        };
      }
      
      const quantity = movement.quantity;
      if (movement.movementType === 'in') {
        acc[productId].totalIn += quantity;
      } else {
        acc[productId].totalOut += quantity;
      }
      acc[productId].net = acc[productId].totalIn - acc[productId].totalOut;
      acc[productId].movements.push(movement);
      
      return acc;
    }, {});
    
    res.json(Object.values(summary));
  });

  app.post("/api/inventory-movements", async (req, res) => {
    try {
      console.log('إنشاء حركة مخزون جديدة:', req.body);
      
      // الحصول على بيانات المنتج
      const product = storage.getProduct(req.body.productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // إنشاء حركة المخزون
      const movementData = {
        productId: req.body.productId,
        productName: product.name,
        productCode: product.code,
        movementType: req.body.movementType,
        quantity: parseInt(req.body.quantity),
        referenceType: req.body.referenceType || 'manual',
        referenceNumber: req.body.referenceNumber || '',
        notes: req.body.notes || '',
        branchId: req.body.branchId || 1,
        createdBy: req.body.createdBy || 1,
        movementDate: req.body.movementDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const movement = storage.addInventoryMovement(movementData);

      // تحديث كمية المنتج
      const currentQuantity = parseInt(product.quantity || '0') || 0;
      let newQuantity = currentQuantity;
      
      if (req.body.movementType === 'in') {
        newQuantity = currentQuantity + parseInt(req.body.quantity);
      } else if (req.body.movementType === 'out') {
        newQuantity = Math.max(0, currentQuantity - parseInt(req.body.quantity));
      } else if (req.body.movementType === 'adjustment') {
        newQuantity = parseInt(req.body.quantity);
      }

      storage.updateProduct(req.body.productId, { quantity: newQuantity.toString() });
      
      console.log(`تم تحديث كمية المنتج ${product.name} من ${currentQuantity} إلى ${newQuantity}`);

      res.status(201).json(movement);
    } catch (error) {
      console.error("خطأ في إنشاء حركة المخزون:", error);
      res.status(500).json({ error: "Failed to create inventory movement" });
    }
  });

  // مسارات الأرصدة الافتتاحية للمخزون
  app.get("/api/inventory-opening-balances", (req, res) => {
    try {
      const openingBalances = storage.getAllInventoryOpeningBalances();
      res.json(openingBalances);
    } catch (error) {
      console.error("Error fetching inventory opening balances:", error);
      res.status(500).json({ error: "Failed to fetch inventory opening balances" });
    }
  });

  app.post("/api/inventory-opening-balances", async (req, res) => {
    try {
      console.log('إنشاء رصيد افتتاحي جديد:', req.body);
      
      const openingBalanceData = {
        productId: req.body.productId,
        productName: req.body.productName,
        openingQuantity: parseFloat(req.body.openingQuantity || '0'),
        openingValue: parseFloat(req.body.openingValue || '0'),
        date: req.body.date || new Date().toISOString().split('T')[0],
        notes: req.body.notes || ''
      };

      const openingBalance = storage.createInventoryOpeningBalance(openingBalanceData);
      
      res.status(201).json(openingBalance);
    } catch (error) {
      console.error("Error creating opening balance:", error);
      res.status(500).json({ 
        error: "Failed to create opening balance",
        message: error?.message
      });
    }
  });

  // مسارات إرسال واستقبال المخزون بين الفروع
  app.get("/api/inventory-transfers", async (req, res) => {
    try {
      const transfers = await db.select().from(inventoryTransfers);
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching inventory transfers:", error);
      res.status(500).json({ error: "Failed to fetch inventory transfers" });
    }
  });

  app.post("/api/inventory-transfers/send", async (req, res) => {
    try {
      console.log('إرسال مخزون:', req.body);
      
      const { fromBranchId, toBranchId, productId, quantity, notes, sentBy } = req.body;
      
      // التحقق من البيانات
      if (!toBranchId || !productId || !quantity) {
        return res.status(400).json({ error: "المرجو ملء جميع الحقول المطلوبة" });
      }

      // التحقق من أن الفرع المستقبل مختلف عن الفرع المرسل
      if (fromBranchId && fromBranchId === toBranchId) {
        return res.status(400).json({ error: "لا يمكن إرسال المخزون لنفس الفرع" });
      }

      // الحصول على بيانات المنتج
      const product = storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }

      // التحقق من أن المنتج ينتمي للفرع المرسل (أو مشترك)
      if (fromBranchId && product.branchId && product.branchId !== fromBranchId) {
        return res.status(403).json({ error: "لا يمكن إرسال منتج لا ينتمي لفرعك" });
      }

      // التحقق من الكمية المتاحة
      const currentQuantity = parseInt(product.quantity || '0') || 0;
      if (currentQuantity < quantity) {
        return res.status(400).json({ 
          error: `الكمية المتاحة غير كافية. المتوفر: ${currentQuantity}، المطلوب: ${quantity}`,
          available: currentQuantity,
          requested: quantity
        });
      }

      // إنشاء رقم تحويل فريد
      const transferNumber = `TR-${Date.now()}`;

      // إنشاء عملية التحويل في قاعدة البيانات
      const [transfer] = await db.insert(inventoryTransfers).values({
        transferNumber,
        fromBranchId: fromBranchId || null,
        toBranchId,
        productId,
        quantity,
        status: 'sent',
        notes: notes || null,
        sentBy: sentBy || null,
        receivedBy: null,
        sentAt: new Date(),
        receivedAt: null
      }).returning();

      // تحديث كمية المخزون (الخصم من الفرع المرسل)
      const newQuantity = currentQuantity - quantity;
      await storage.updateProduct(productId, { quantity: newQuantity });

      console.log(`✅ تم إرسال ${quantity} من المنتج ${product.name}. الكمية المتبقية: ${newQuantity}`);

      res.status(201).json(transfer);
    } catch (error) {
      console.error("خطأ في إرسال المخزون:", error);
      res.status(500).json({ error: "فشل في إرسال المخزون" });
    }
  });

  app.post("/api/inventory-transfers/:id/receive", async (req, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const { receivedBy } = req.body;

      console.log(`استلام مخزون رقم ${transferId}`);

      const [transfer] = await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, transferId));
      if (!transfer) {
        return res.status(404).json({ error: "عملية النقل غير موجودة" });
      }

      if (transfer.status === 'received') {
        return res.status(400).json({ error: "تم استلام هذه العملية مسبقاً" });
      }

      // الحصول على بيانات المنتج الأصلي
      const sourceProduct = storage.getProduct(transfer.productId);
      if (!sourceProduct) {
        return res.status(404).json({ error: "المنتج الأصلي غير موجود" });
      }

      // البحث عن المنتج في الفرع المستقبل (باستخدام الباركود أو الكود أو الاسم)
      let targetProduct;
      const branchProducts = storage.getAllProducts(transfer.toBranchId);
      
      // محاولة البحث بالباركود أولاً
      if (sourceProduct.barcode) {
        targetProduct = branchProducts.find(p => p.barcode === sourceProduct.barcode);
      }
      
      // إذا لم يُعثر عليه، محاولة البحث بالكود
      if (!targetProduct && sourceProduct.code) {
        targetProduct = branchProducts.find(p => p.code === sourceProduct.code);
      }
      
      // إذا لم يُعثر عليه، محاولة البحث بالاسم
      if (!targetProduct && sourceProduct.name) {
        targetProduct = branchProducts.find(p => p.name === sourceProduct.name);
      }

      // إذا لم يكن المنتج موجوداً في الفرع المستقبل، إنشاؤه
      if (!targetProduct) {
        console.log(`إنشاء نسخة من المنتج "${sourceProduct.name}" في الفرع المستقبل (${transfer.toBranchId})`);
        targetProduct = storage.createProduct({
          name: sourceProduct.name,
          code: sourceProduct.code,
          barcode: sourceProduct.barcode,
          description: sourceProduct.description,
          category: sourceProduct.category,
          purchasePrice: sourceProduct.purchasePrice,
          salePrice: sourceProduct.salePrice,
          quantity: 0, // سيتم إضافة الكمية لاحقاً
          minQuantity: sourceProduct.minQuantity,
          branchId: transfer.toBranchId
        });
      }

      // تحديث كمية المخزون في الفرع المستقبل
      const currentQuantity = parseInt(targetProduct.quantity || '0') || 0;
      const newQuantity = currentQuantity + transfer.quantity;
      await storage.updateProduct(targetProduct.id, { quantity: newQuantity });

      // تحديث حالة التحويل في قاعدة البيانات وتخزين receivedProductId
      const [updatedTransfer] = await db.update(inventoryTransfers)
        .set({
          status: 'received',
          receivedBy: receivedBy || null,
          receivedAt: new Date(),
          receivedProductId: targetProduct.id
        })
        .where(eq(inventoryTransfers.id, transferId))
        .returning();

      console.log(`✅ تم استلام ${transfer.quantity} من المنتج ${sourceProduct.name}. الكمية الجديدة في الفرع المستقبل: ${newQuantity}`);

      res.json(updatedTransfer);
    } catch (error) {
      console.error("خطأ في استلام المخزون:", error);
      res.status(500).json({ error: "فشل في استلام المخزون" });
    }
  });

  app.delete("/api/inventory-transfers/:id", async (req, res) => {
    try {
      const transferId = parseInt(req.params.id);
      const [transfer] = await db.select().from(inventoryTransfers).where(eq(inventoryTransfers.id, transferId));
      
      if (!transfer) {
        return res.status(404).json({ error: "Transfer not found" });
      }

      // لا يمكن حذف تحويل تم استلامه
      if (transfer.status === 'received') {
        return res.status(400).json({ error: "Cannot delete received transfer" });
      }

      // إذا كان التحويل تم إرساله، نعيد الكمية للمخزون
      if (transfer.status === 'sent') {
        const product = storage.getProduct(transfer.productId);
        if (product) {
          const currentQuantity = parseInt(product.quantity || '0') || 0;
          const newQuantity = currentQuantity + transfer.quantity;
          await storage.updateProduct(transfer.productId, { quantity: newQuantity });
          console.log(`✅ تم إرجاع ${transfer.quantity} للمخزون. الكمية الجديدة: ${newQuantity}`);
        }
      }

      await db.delete(inventoryTransfers).where(eq(inventoryTransfers.id, transferId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting inventory transfer:", error);
      res.status(500).json({ error: "Failed to delete inventory transfer" });
    }
  });

  // ============================================
  // نظام تحويل المخزون الجديد - New Branch Transfers System
  // ============================================
  
  // جلب جميع التحويلات أو حسب الفرع (مع المنتجات)
  app.get("/api/branch-transfers", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      let query = 'SELECT * FROM branch_transfers';
      let params: any[] = [];
      
      if (branchId) {
        query += ' WHERE from_branch_id = $1 OR to_branch_id = $1';
        params.push(branchId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await pool.query(query, params);
      
      // جلب منتجات كل تحويل
      const transfers = await Promise.all(result.rows.map(async (row: any) => {
        // جلب المنتجات من جدول branch_transfer_items
        const itemsResult = await pool.query(
          'SELECT * FROM branch_transfer_items WHERE transfer_id = $1 ORDER BY id',
          [row.id]
        );
        
        const items = itemsResult.rows.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productCode: item.product_code,
          productBarcode: item.product_barcode,
          quantity: item.quantity,
        }));
        
        return {
          id: row.id,
          transferNumber: row.transfer_number,
          fromBranchId: row.from_branch_id,
          toBranchId: row.to_branch_id,
          // للتوافق مع البيانات القديمة (تحويلات منتج واحد)
          productId: row.product_id,
          productName: row.product_name,
          productCode: row.product_code,
          productBarcode: row.product_barcode,
          quantity: row.quantity,
          status: row.status,
          notes: row.notes,
          sentBy: row.sent_by,
          receivedBy: row.received_by,
          receivedProductId: row.received_product_id,
          sentAt: row.sent_at,
          receivedAt: row.received_at,
          createdAt: row.created_at,
          totalItems: row.total_items || 0,
          items: items.length > 0 ? items : undefined, // المنتجات (إذا كانت إرسالية جديدة)
        };
      }));
      
      res.json(transfers);
    } catch (error) {
      console.error("Error fetching branch transfers:", error);
      res.status(500).json({ error: "Failed to fetch branch transfers" });
    }
  });
  
  // إرسال منتج من فرع لآخر
  app.post("/api/branch-transfers/send", async (req, res) => {
    const { pool } = await import("./db");
    
    try {
      const { fromBranchId, toBranchId, productId, quantity, notes, sentBy } = req.body;
      
      // التحقق من البيانات
      if (!fromBranchId || !toBranchId || !productId || !quantity) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }
      
      if (fromBranchId === toBranchId) {
        return res.status(400).json({ error: "لا يمكن الإرسال لنفس الفرع" });
      }
      
      // بدء Transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // جلب بيانات المنتج والتحقق من انتمائه للفرع
        const productResult = await client.query(
          'SELECT * FROM products WHERE id = $1',
          [productId]
        );
        
        if (productResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(404).json({ error: "المنتج غير موجود" });
        }
        
        const product = productResult.rows[0];
        
        // التحقق من أن المنتج ينتمي للفرع المرسل أو مشترك (null)
        // تحويل branch_id من قاعدة البيانات لـ number للمقارنة
        const productBranchId = product.branch_id ? parseInt(product.branch_id) : null;
        if (productBranchId !== null && productBranchId !== fromBranchId) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(403).json({ error: "المنتج لا ينتمي لهذا الفرع" });
        }
        
        // التحقق من الكمية المتاحة
        if (product.quantity < quantity) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: `الكمية المتاحة: ${product.quantity} فقط` });
        }
        
        // خصم الكمية من المنتج الأصلي
        const newQuantity = product.quantity - quantity;
        await client.query(
          'UPDATE products SET quantity = $1 WHERE id = $2',
          [newQuantity, productId]
        );
        
        console.log(`✅ تم خصم ${quantity} من المنتج "${product.name}". الكمية الجديدة: ${newQuantity}`);
        
        // إنشاء رقم تحويل فريد
        const transferNumber = `BT-${Date.now()}`;
        
        // حفظ التحويل في قاعدة البيانات
        const result = await client.query(
          `INSERT INTO branch_transfers 
           (transfer_number, from_branch_id, to_branch_id, product_id, product_name, product_code, product_barcode, quantity, status, notes, sent_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sent', $9, $10) 
           RETURNING *`,
          [transferNumber, fromBranchId, toBranchId, productId, product.name, product.code, product.barcode, quantity, notes, sentBy]
        );
        
        await client.query('COMMIT');
        client.release();
        
        // تحديث المخزون في الذاكرة بعد نجاح التحديث في قاعدة البيانات
        storage.updateProduct(productId, { quantity: newQuantity });
        
        const transfer = result.rows[0];
        
        res.status(201).json({
          id: transfer.id,
          transferNumber: transfer.transfer_number,
          fromBranchId: transfer.from_branch_id,
          toBranchId: transfer.to_branch_id,
          productId: transfer.product_id,
          productName: transfer.product_name,
          productCode: transfer.product_code,
          productBarcode: transfer.product_barcode,
          quantity: transfer.quantity,
          status: transfer.status,
          notes: transfer.notes,
          sentBy: transfer.sent_by,
          sentAt: transfer.sent_at,
          createdAt: transfer.created_at,
        });
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } catch (error) {
      console.error("Error sending branch transfer:", error);
      res.status(500).json({ error: "Failed to send transfer" });
    }
  });
  
  // إرسال إرسالية واحدة بعدة منتجات (تحويل مخزون)
  app.post("/api/branch-transfers/send-multiple", async (req, res) => {
    const { pool } = await import("./db");
    
    try {
      const { fromBranchId, toBranchId, transferDate, items, notes, sentBy } = req.body;
      
      // التحقق من البيانات
      if (!fromBranchId || !toBranchId || !items || items.length === 0) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة" });
      }
      
      if (fromBranchId === toBranchId) {
        return res.status(400).json({ error: "لا يمكن الإرسال لنفس الفرع" });
      }
      
      // بدء Transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        const transferNumber = `BT-${Date.now()}`;
        
        // إنشاء سجل التحويل الرئيسي (إرسالية واحدة)
        const transferResult = await client.query(
          `INSERT INTO branch_transfers 
           (transfer_number, from_branch_id, to_branch_id, status, notes, sent_by, sent_at, total_items) 
           VALUES ($1, $2, $3, 'sent', $4, $5, $6, $7) 
           RETURNING *`,
          [transferNumber, fromBranchId, toBranchId, notes, sentBy, transferDate || new Date(), items.length]
        );
        
        const transfer = transferResult.rows[0];
        const transferId = transfer.id;
        
        // معالجة كل منتج وإضافته لجدول المنتجات
        const transferItems = [];
        for (const item of items) {
          const { productId, quantity } = item;
          
          // جلب بيانات المنتج
          const productResult = await client.query(
            'SELECT * FROM products WHERE id = $1',
            [productId]
          );
          
          if (productResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ error: `المنتج #${productId} غير موجود` });
          }
          
          const product = productResult.rows[0];
          
          // التحقق من أن المنتج ينتمي للفرع المرسل أو مشترك (null)
          const productBranchId = product.branch_id ? parseInt(product.branch_id) : null;
          if (productBranchId !== null && productBranchId !== fromBranchId) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(403).json({ error: `المنتج "${product.name}" لا ينتمي لهذا الفرع` });
          }
          
          // التحقق من الكمية المتاحة
          if (product.quantity < quantity) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: `الكمية المتاحة للمنتج "${product.name}": ${product.quantity} فقط` });
          }
          
          // خصم الكمية من المنتج الأصلي
          const newQuantity = product.quantity - quantity;
          await client.query(
            'UPDATE products SET quantity = $1 WHERE id = $2',
            [newQuantity, productId]
          );
          
          console.log(`✅ تم خصم ${quantity} من المنتج "${product.name}". الكمية الجديدة: ${newQuantity}`);
          
          // إضافة المنتج لجدول منتجات التحويل
          const itemResult = await client.query(
            `INSERT INTO branch_transfer_items 
             (transfer_id, product_id, product_name, product_code, product_barcode, quantity) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [transferId, productId, product.name, product.code, product.barcode, quantity]
          );
          
          transferItems.push(itemResult.rows[0]);
          
          // تحديث المخزون في الذاكرة
          storage.updateProduct(productId, { quantity: newQuantity });
        }
        
        await client.query('COMMIT');
        client.release();
        
        console.log(`✅ تم إنشاء إرسالية رقم ${transferNumber} بـ ${items.length} منتج`);
        
        res.status(201).json({
          success: true,
          message: `تم إرسال إرسالية واحدة بـ ${items.length} منتج بنجاح`,
          transfer: {
            id: transfer.id,
            transferNumber: transfer.transfer_number,
            fromBranchId: transfer.from_branch_id,
            toBranchId: transfer.to_branch_id,
            status: transfer.status,
            notes: transfer.notes,
            sentAt: transfer.sent_at,
            totalItems: transfer.total_items,
            items: transferItems.map((ti: any) => ({
              id: ti.id,
              productId: ti.product_id,
              productName: ti.product_name,
              productCode: ti.product_code,
              productBarcode: ti.product_barcode,
              quantity: ti.quantity,
            })),
          },
        });
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } catch (error) {
      console.error("Error sending transfer:", error);
      res.status(500).json({ error: "Failed to send transfer" });
    }
  });

  // استلام منتج في الفرع المستقبل
  app.post("/api/branch-transfers/:id/receive", async (req, res) => {
    const { pool } = await import("./db");
    
    try {
      const transferId = parseInt(req.params.id);
      const { receivedBy } = req.body;
      
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // جلب بيانات التحويل
        const transferResult = await client.query(
          'SELECT * FROM branch_transfers WHERE id = $1',
          [transferId]
        );
        
        if (transferResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(404).json({ error: "التحويل غير موجود" });
        }
        
        const transfer = transferResult.rows[0];
        
        if (transfer.status === 'received') {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: "تم استلام هذا التحويل مسبقاً" });
        }
        
        // جلب جميع المنتجات من branch_transfer_items
        const transferItemsResult = await client.query(
          'SELECT * FROM branch_transfer_items WHERE transfer_id = $1',
          [transferId]
        );
        
        if (transferItemsResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(404).json({ error: "لا توجد منتجات في هذا التحويل" });
        }
        
        const productsToUpdate = [];
        
        // معالجة كل منتج في التحويل
        for (const item of transferItemsResult.rows) {
          // البحث عن منتج مطابق في الفرع المستقبل
          let productQuery = `SELECT * FROM products WHERE branch_id = $1`;
          let params = [transfer.to_branch_id];
          
          if (item.product_barcode) {
            productQuery += ` AND barcode = $2`;
            params.push(item.product_barcode);
          } else if (item.product_code) {
            productQuery += ` AND code = $2`;
            params.push(item.product_code);
          } else if (item.product_name) {
            productQuery += ` AND name = $2`;
            params.push(item.product_name);
          }
          
          const targetProductResult = await client.query(productQuery, params);
          
          if (targetProductResult.rows.length > 0) {
            // المنتج موجود - إضافة الكمية
            const targetProduct = targetProductResult.rows[0];
            const newQuantity = targetProduct.quantity + item.quantity;
            
            await client.query(
              'UPDATE products SET quantity = $1 WHERE id = $2',
              [newQuantity, targetProduct.id]
            );
            
            productsToUpdate.push({ id: targetProduct.id, quantity: newQuantity });
            console.log(`✅ تمت إضافة ${item.quantity} إلى المنتج الموجود "${targetProduct.name}". الكمية الجديدة: ${newQuantity}`);
          } else {
            // المنتج غير موجود - إنشاء نسخة جديدة
            const sourceProductResult = await client.query(
              'SELECT * FROM products WHERE id = $1',
              [item.product_id]
            );
            
            if (sourceProductResult.rows.length === 0) {
              console.warn(`⚠️ المنتج الأصلي ${item.product_id} غير موجود، سيتم تخطي هذا المنتج`);
              continue;
            }
            
            const sourceProduct = sourceProductResult.rows[0];
            
            const newProductResult = await client.query(
              `INSERT INTO products 
               (name, code, barcode, description, category, purchase_price, sale_price, quantity, min_stock, unit, is_active, branch_id) 
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
               RETURNING *`,
              [
                item.product_name,
                item.product_code,
                item.product_barcode,
                sourceProduct.description,
                sourceProduct.category,
                sourceProduct.purchase_price,
                sourceProduct.sale_price,
                item.quantity,
                sourceProduct.min_stock,
                sourceProduct.unit,
                sourceProduct.is_active,
                transfer.to_branch_id
              ]
            );
            
            const newProduct = newProductResult.rows[0];
            productsToUpdate.push({ 
              id: newProduct.id, 
              quantity: newProduct.quantity,
              isNew: true,
              productData: newProduct
            });
            console.log(`✅ تم إنشاء منتج جديد "${newProduct.name}" في الفرع المستقبل بكمية ${item.quantity}`);
          }
        }
        
        // تحديث التحويل
        const updateResult = await client.query(
          `UPDATE branch_transfers 
           SET status = 'received', received_by = $1, received_at = NOW() 
           WHERE id = $2 
           RETURNING *`,
          [receivedBy, transferId]
        );
        
        await client.query('COMMIT');
        client.release();
        
        // تحديث الذاكرة بعد نجاح التحديث في قاعدة البيانات
        for (const product of productsToUpdate) {
          if (product.isNew) {
            const p = product.productData;
            storage.createProduct({
              name: p.name,
              code: p.code,
              barcode: p.barcode,
              description: p.description,
              category: p.category,
              purchasePrice: p.purchase_price,
              salePrice: p.sale_price,
              quantity: p.quantity,
              minQuantity: p.min_stock,
              branchId: p.branch_id,
            });
          } else {
            storage.updateProduct(product.id, { quantity: product.quantity });
          }
        }
        
        const updatedTransfer = updateResult.rows[0];
        
        res.json({
          id: updatedTransfer.id,
          transferNumber: updatedTransfer.transfer_number,
          fromBranchId: updatedTransfer.from_branch_id,
          toBranchId: updatedTransfer.to_branch_id,
          status: updatedTransfer.status,
          notes: updatedTransfer.notes,
          sentBy: updatedTransfer.sent_by,
          receivedBy: updatedTransfer.received_by,
          sentAt: updatedTransfer.sent_at,
          receivedAt: updatedTransfer.received_at,
          createdAt: updatedTransfer.created_at,
          totalItems: updatedTransfer.total_items,
          productsUpdated: productsToUpdate.length
        });
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } catch (error) {
      console.error("Error receiving branch transfer:", error);
      res.status(500).json({ error: "Failed to receive transfer" });
    }
  });
  
  // حذف تحويل
  app.delete("/api/branch-transfers/:id", async (req, res) => {
    const { pool } = await import("./db");
    
    try {
      const transferId = parseInt(req.params.id);
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // جلب بيانات التحويل
        const transferResult = await client.query(
          'SELECT * FROM branch_transfers WHERE id = $1',
          [transferId]
        );
        
        if (transferResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(404).json({ error: "التحويل غير موجود" });
        }
        
        const transfer = transferResult.rows[0];
        
        if (transfer.status === 'received') {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: "لا يمكن حذف تحويل مستلم" });
        }
        
        // إرجاع الكمية للمنتج الأصلي في قاعدة البيانات
        const productResult = await client.query(
          'SELECT * FROM products WHERE id = $1',
          [transfer.product_id]
        );
        
        let updatedProduct = null;
        
        if (productResult.rows.length > 0) {
          const product = productResult.rows[0];
          const newQuantity = product.quantity + transfer.quantity;
          
          await client.query(
            'UPDATE products SET quantity = $1 WHERE id = $2',
            [newQuantity, transfer.product_id]
          );
          
          updatedProduct = { id: transfer.product_id, quantity: newQuantity };
          console.log(`✅ تم إرجاع ${transfer.quantity} للمخزون. الكمية الجديدة: ${newQuantity}`);
        }
        
        // حذف التحويل
        await client.query('DELETE FROM branch_transfers WHERE id = $1', [transferId]);
        
        await client.query('COMMIT');
        client.release();
        
        // تحديث الذاكرة بعد نجاح التحديث في قاعدة البيانات
        if (updatedProduct) {
          storage.updateProduct(updatedProduct.id, { quantity: updatedProduct.quantity });
        }
        
        res.json({ success: true });
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } catch (error) {
      console.error("Error deleting branch transfer:", error);
      res.status(500).json({ error: "Failed to delete transfer" });
    }
  });

  // مسارات المبيعات
  app.get("/api/sales", async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      console.log('Fetching sales from PostgreSQL, branchId:', branchId, 'userId:', userId);
      
      // جلب الفواتير من قاعدة البيانات PostgreSQL مع الفلترة حسب branchId و user_id
      const { pool } = await import("./db");
      
      let query = 'SELECT * FROM sales WHERE user_id = $1';
      const params: any[] = [userId];
      
      if (branchId !== undefined) {
        query += ' AND branch_id = $2';
        params.push(branchId);
      }
      
      query += ' ORDER BY date DESC, id DESC';
      
      const result = await pool.query(query, params);
      const dbSales = result.rows;
      
      // تحويل أسماء الأعمدة من snake_case إلى camelCase للتوافق مع Frontend
      const formattedSales = dbSales.map((sale: any) => ({
        ...sale,
        clientId: sale.client_id,
        branchId: sale.branch_id,
        invoiceNumber: sale.invoice_number,
        sentToClientAccount: sale.sent_to_client_account,
        sentToClientAccountAt: sale.sent_to_client_account_at,
        grandTotal: sale.total,
        paymentMethod: sale.payment_method || 'نقداً',
        // إضافة حالة افتراضية إذا لم تكن موجودة
        status: sale.status || 'unpaid'
      }));
      
      console.log(`Sales fetched successfully: ${formattedSales.length}${branchId ? ` for branch ${branchId}` : ''} للمستخدم ${userId}`);
      res.json(formattedSales);
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({ error: 'Failed to fetch sales' });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      console.log('محاولة إنشاء فاتورة مبيعات:', req.body);
      
      // التحقق من وجود العناصر
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ error: 'لا يمكن إنشاء فاتورة بدون عناصر' });
      }

      // إنشاء الفاتورة في Memory (للتوافق مع الكود القديم)
      const sale = storage.createSale(req.body);
      console.log('تم إنشاء فاتورة المبيعات:', sale);

      // حفظ الفاتورة في قاعدة البيانات PostgreSQL
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const saleDate = req.body.date ? new Date(req.body.date) : new Date();
      const result = await pool.query(
        `INSERT INTO sales (client_id, total, date, notes, branch_id, invoice_number, items, sent_to_client_account, payment_method, user_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9) 
         RETURNING *`,
        [sale.clientId, sale.total, saleDate, sale.notes, sale.branchId, sale.invoiceNumber, JSON.stringify(sale.items), req.body.paymentMethod || 'نقداً', userId]
      );
      const dbSale = result.rows[0];
      console.log('✅ تم حفظ الفاتورة في قاعدة البيانات:', dbSale);

      // 🔥 تحديث كميات المنتجات في PostgreSQL مباشرة (خصم الكميات المباعة)
      for (const item of req.body.items) {
        if (item.productId && item.quantity) {
          const productId = parseInt(item.productId);
          const quantity = parseFloat(item.quantity);
          
          // الحصول على الكمية الحالية
          const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
          if (productResult.rows.length > 0) {
            const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
            const newQuantity = currentQuantity - quantity;
            
            // تحديث الكمية
            await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
            console.log(`✅ تم خصم ${quantity} من المنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }

      // ملاحظة: رصيد العميل لا يُحدّث تلقائياً - يجب استخدام الزر اليدوي
      
      res.status(201).json({ ...sale, id: dbSale.id });
    } catch (error: unknown) {
      console.error("Error creating sale:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: `فشل في إنشاء فاتورة المبيعات: ${errorMessage}` });
    }
  });

  app.put("/api/sales/:id", async (req, res) => {
    try {
      const sale = storage.updateSale(parseInt(req.params.id), req.body);
      if (!sale) {
        return res.status(404).json({ error: "Sale not found" });
      }

      // تحديث رصيد العميل
      if (req.body.clientId && sale.totalAmount) {
        try {
          await storage.updateSupplierBalance(req.body.clientId, sale.totalAmount);
          console.log(`تم تحديث رصيد العميل ${req.body.clientId} بمبلغ ${sale.totalAmount}`);
        } catch (balanceError) {
          console.error('خطأ في تحديث رصيد العميل:', balanceError);
        }
      }

      res.json(sale);
    } catch (error) {
      console.error("Error updating sale:", error);
      res.status(500).json({ error: "Failed to update sale" });
    }
  });

  app.post("/api/sales/:id/send-to-client-account", async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      
      // الحصول على الفاتورة من قاعدة البيانات
      const { pool } = await import("./db");
      const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
      const dbSale = saleResult.rows[0];
      
      if (!dbSale) {
        return res.status(404).json({ error: "الفاتورة غير موجودة" });
      }
      
      // التحقق من أن الفاتورة لها عميل
      if (!dbSale.client_id) {
        return res.status(400).json({ error: "الفاتورة لا تحتوي على عميل" });
      }
      
      // التحقق من أنه لم يتم إرسال الرصيد مسبقاً
      if (dbSale.sent_to_client_account) {
        return res.status(400).json({ error: "تم إرسال رصيد هذه الفاتورة مسبقاً إلى حساب العميل" });
      }
      
      // تحديث رصيد العميل من PostgreSQL
      const clientResult = await pool.query('SELECT * FROM clients WHERE id = $1', [dbSale.client_id]);
      const client = clientResult.rows[0];
      
      if (!client) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }
      
      // إضافة رصيد الفاتورة إلى رصيد العميل
      const saleTotal = parseFloat(dbSale.total || '0');
      const currentBalance = parseFloat(client.balance || '0');
      const newBalance = currentBalance + saleTotal;
      
      // تحديث رصيد العميل في PostgreSQL
      await pool.query(
        'UPDATE clients SET balance = $1 WHERE id = $2',
        [newBalance, dbSale.client_id]
      );
      
      // تحديث حالة الفاتورة في قاعدة البيانات
      await pool.query(
        'UPDATE sales SET sent_to_client_account = true, sent_to_client_account_at = NOW() WHERE id = $1',
        [saleId]
      );
      
      console.log(`✅ تم إرسال رصيد الفاتورة ${saleId} (${saleTotal} ريال) إلى حساب العميل ${client.name}`);
      
      res.json({ 
        success: true, 
        message: `تم إضافة ${saleTotal} ريال إلى حساب العميل ${client.name}`,
        newBalance: newBalance 
      });
    } catch (error) {
      console.error("Error sending sale to client account:", error);
      res.status(500).json({ error: "فشل في إرسال رصيد الفاتورة إلى حساب العميل" });
    }
  });

  app.delete("/api/sales/:id", async (req, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { pool } = await import("./db");
      
      // الحصول على الفاتورة من قاعدة البيانات قبل الحذف
      const result = await pool.query('SELECT * FROM sales WHERE id = $1', [saleId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Sale not found" });
      }
      
      const sale = result.rows[0];
      console.log("بيانات الفاتورة المراد حذفها:", sale);
      
      // عكس تأثير الفاتورة على المخزون: إعادة الكميات المباعة إلى المخزون
      if (sale.items && Array.isArray(sale.items)) {
        for (const item of sale.items) {
          const product = storage.getProduct(item.productId);
          if (product) {
            storage.updateProduct(item.productId, {
              quantity: product.quantity + item.quantity
            });
            console.log(`تمت إعادة ${item.quantity} من المنتج ${product.name} إلى المخزون`);
          }
        }
      }
      
      // إذا كانت الفاتورة مرسلة لحساب العميل، نعكس الرصيد
      if (sale.sent_to_client_account) {
        const client = storage.getClient(sale.client_id);
        if (client) {
          const saleTotal = parseFloat(sale.total || '0');
          storage.updateClient(sale.client_id, {
            balance: client.balance - saleTotal
          });
          console.log(`تم خصم ${saleTotal} ريال من رصيد العميل ${client.name}`);
        }
      }
      
      // حذف الفاتورة من قاعدة البيانات
      await pool.query('DELETE FROM sales WHERE id = $1', [saleId]);
      
      // حذف الفاتورة من الذاكرة أيضاً (إن وجدت)
      storage.deleteSale(saleId);
      
      res.json({ success: true, message: "تم حذف فاتورة المبيعات وعكس العمليات بنجاح" });
    } catch (error) {
      console.error("Error deleting sale:", error);
      res.status(500).json({ error: "Failed to delete sale" });
    }
  });

  // مسارات المشتريات
  app.get("/api/purchases", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      let query = `
        SELECT 
          p.id, 
          p.invoice_number as "invoiceNumber",
          p.supplier_id as "supplierId",
          p.branch_id as "branchId",
          p.total,
          p.date,
          p.payment_method as "paymentMethod",
          p.sent_to_supplier_account as "sentToSupplierAccount",
          p.sent_to_supplier_account_at as "sentToSupplierAccountAt",
          p.notes,
          p.items,
          s.name as "supplierName"
        FROM purchases p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        WHERE p.user_id = $1
      `;
      
      const params: any[] = [userId];
      if (branchId) {
        query += ` AND p.branch_id = $2`;
        params.push(branchId);
      }
      
      query += ` ORDER BY p.date DESC`;
      
      const result = await pool.query(query, params);
      console.log(`📦 جلب ${result.rows.length} فاتورة مشتريات${branchId ? ` للفرع ${branchId}` : ''} للمستخدم ${userId}`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", async (req, res) => {
    try {
      console.log('محاولة إنشاء فاتورة مشتريات:', req.body);
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // إنشاء رقم فاتورة تلقائي إذا لم يكن موجوداً
      const invoiceNumber = req.body.invoiceNumber || `PUR-${Date.now()}`;
      const purchaseDate = req.body.date || new Date().toISOString();
      
      // حفظ الفاتورة في PostgreSQL
      const insertResult = await pool.query(
        `INSERT INTO purchases (
          supplier_id, branch_id, invoice_number, total, date, 
          payment_method, sent_to_supplier_account, sent_to_supplier_account_at, notes, items, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          req.body.supplierId || null,
          req.body.branchId || null,
          invoiceNumber,
          req.body.total,
          purchaseDate,
          req.body.paymentMethod || null,
          req.body.sentToSupplierAccount || false,
          req.body.sentToSupplierAccount ? new Date() : null,
          req.body.notes || null,
          JSON.stringify(req.body.items || []),
          userId
        ]
      );
      
      const savedPurchase = insertResult.rows[0];
      console.log('✅ تم حفظ فاتورة المشتريات في قاعدة البيانات:', savedPurchase);

      // 🔥 تحديث كميات المنتجات في PostgreSQL (زيادة الكميات المشتراة)
      for (const item of req.body.items || []) {
        if (item.productId && item.quantity) {
          const productId = parseInt(item.productId);
          const quantity = parseFloat(item.quantity);
          
          // الحصول على الكمية الحالية
          const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
          if (productResult.rows.length > 0) {
            const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
            const newQuantity = currentQuantity + quantity;
            
            // تحديث الكمية
            await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
            console.log(`✅ تم إضافة ${quantity} للمنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }

      // 💰 إذا كان الدفع آجل، إضافة المبلغ لحساب المورد تلقائياً
      if (req.body.sentToSupplierAccount === true && req.body.supplierId) {
        const supplier = storage.getSupplier(req.body.supplierId);
        if (supplier) {
          const purchaseTotal = parseFloat(req.body.total);
          const newBalance = parseFloat(supplier.balance || '0') + purchaseTotal;
          
          storage.updateSupplier(req.body.supplierId, {
            balance: newBalance.toString()
          });
          
          console.log(`✅ تم إضافة ${purchaseTotal} ريال لحساب المورد ${supplier.name}. الرصيد الجديد: ${newBalance}`);
        }
      }

      res.status(201).json({
        id: savedPurchase.id,
        invoiceNumber: savedPurchase.invoice_number,
        supplierId: savedPurchase.supplier_id,
        branchId: savedPurchase.branch_id,
        total: savedPurchase.total,
        date: savedPurchase.date,
        paymentMethod: savedPurchase.payment_method,
        sentToSupplierAccount: savedPurchase.sent_to_supplier_account,
        sentToSupplierAccountAt: savedPurchase.sent_to_supplier_account_at,
        notes: savedPurchase.notes,
        items: savedPurchase.items
      });
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ error: "Failed to create purchase" });
    }
  });

  app.put("/api/purchases/:id", async (req, res) => {
    try {
      const purchase = storage.updatePurchase(parseInt(req.params.id), req.body);
      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      res.json(purchase);
    } catch (error) {
      console.error("Error updating purchase:", error);
      res.status(500).json({ error: "Failed to update purchase" });
    }
  });

  // ترحيل فاتورة مشتريات إلى رصيد المورد
  app.post("/api/purchases/:id/send-to-supplier-account", async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      
      // الحصول على الفاتورة من قاعدة البيانات
      const { pool } = await import("./db");
      const purchaseResult = await pool.query('SELECT * FROM purchases WHERE id = $1', [purchaseId]);
      const dbPurchase = purchaseResult.rows[0];
      
      if (!dbPurchase) {
        return res.status(404).json({ error: "الفاتورة غير موجودة" });
      }
      
      // التحقق من أن الفاتورة لها مورد
      if (!dbPurchase.supplier_id) {
        return res.status(400).json({ error: "الفاتورة لا تحتوي على مورد" });
      }
      
      // التحقق من أنه لم يتم إرسال الرصيد مسبقاً
      if (dbPurchase.sent_to_supplier_account) {
        return res.status(400).json({ error: "تم إرسال رصيد هذه الفاتورة مسبقاً إلى حساب المورد" });
      }
      
      // تحديث رصيد المورد
      const supplier = storage.getSupplier(dbPurchase.supplier_id);
      if (!supplier) {
        return res.status(404).json({ error: "المورد غير موجود" });
      }
      
      // إضافة رصيد الفاتورة إلى رصيد المورد (دين علينا)
      const purchaseTotal = parseFloat(dbPurchase.total || '0');
      const currentBalance = parseFloat(supplier.balance || '0');
      const newBalance = currentBalance + purchaseTotal;
      
      storage.updateSupplier(dbPurchase.supplier_id, { balance: newBalance.toString() });
      
      // تحديث حالة الفاتورة في قاعدة البيانات
      await pool.query(
        'UPDATE purchases SET sent_to_supplier_account = true, sent_to_supplier_account_at = NOW() WHERE id = $1',
        [purchaseId]
      );
      
      console.log(`✅ تم ترحيل فاتورة المشتريات #${purchaseId} إلى رصيد المورد ${supplier.name}. المبلغ: ${purchaseTotal} ريال. الرصيد الجديد: ${newBalance} ريال`);
      
      res.json({ 
        success: true, 
        message: `تم إضافة رصيد الفاتورة (${purchaseTotal} ريال) إلى حساب المورد ${supplier.name} بنجاح`,
        newBalance: newBalance
      });
    } catch (error) {
      console.error("Error sending purchase to supplier account:", error);
      res.status(500).json({ error: "حدث خطأ أثناء ترحيل الفاتورة" });
    }
  });

  app.delete("/api/purchases/:id", async (req, res) => {
    try {
      const purchaseId = parseInt(req.params.id);
      
      // الحصول على الفاتورة من قاعدة البيانات قبل الحذف لعكس العمليات
      const { pool } = await import("./db");
      const purchaseResult = await pool.query('SELECT * FROM purchases WHERE id = $1', [purchaseId]);
      const dbPurchase = purchaseResult.rows[0];
      
      if (!dbPurchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }
      
      console.log("بيانات فاتورة المشتريات المراد حذفها:", dbPurchase);
      
      // تحليل items من JSON
      const items = typeof dbPurchase.items === 'string' 
        ? JSON.parse(dbPurchase.items || '[]') 
        : (dbPurchase.items || []);
      
      // عكس العمليات على المخزون (طرح الكميات المضافة)
      for (const item of items) {
        const productId = item.productId;
        const quantity = parseFloat(item.quantity || 0);
        
        const product = storage.getProduct(productId);
        if (product) {
          const currentQuantity = parseFloat(product.quantity || '0');
          const newQuantity = currentQuantity - quantity;
          storage.updateProduct(productId, { quantity: newQuantity.toString() });
          
          // تحديث في قاعدة البيانات أيضاً
          await pool.query(
            'UPDATE products SET quantity = $1 WHERE id = $2',
            [newQuantity, productId]
          );
          
          console.log(`✅ تم طرح ${quantity} من المنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
        }
      }
      
      // حذف الفاتورة من قاعدة البيانات
      await pool.query('DELETE FROM purchases WHERE id = $1', [purchaseId]);
      
      console.log(`✅ تم حذف فاتورة المشتريات #${purchaseId} من قاعدة البيانات`);
      
      res.json({ success: true, message: "تم حذف فاتورة المشتريات بنجاح" });
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ error: "Failed to delete purchase" });
    }
  });

  // مسارات العملاء
  app.get("/api/clients", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      let query = 'SELECT * FROM clients WHERE user_id = $1';
      const params: any[] = [userId];
      
      if (branchId !== undefined) {
        query += ' AND branch_id = $2';
        params.push(branchId);
      }
      
      query += ' ORDER BY id DESC';
      
      const result = await pool.query(query, params);
      console.log(`📦 جلب ${result.rows.length} عميل${branchId ? ` للفرع ${branchId}` : ''} للمستخدم ${userId}`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // حفظ العميل في قاعدة البيانات PostgreSQL مع user_id و branch_id
      const result = await pool.query(
        `INSERT INTO clients (name, phone, email, address, balance, credit_limit, status, user_id, branch_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          req.body.name,
          req.body.phone || null,
          req.body.email || null,
          req.body.address || null,
          req.body.balance || 0,
          req.body.creditLimit || 0,
          'active',
          userId,
          req.body.branchId || null
        ]
      );
      
      const client = result.rows[0];
      
      // حفظ في الذاكرة أيضاً للتوافق
      storage.createClient({
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        balance: client.balance,
        creditLimit: client.credit_limit,
        branchId: client.branch_id
      });
      
      console.log('✅ تم حفظ العميل في قاعدة البيانات:', client);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const userId = req.session.userId;
      const clientId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // التحقق من أن العميل ينتمي للمستخدم
      const checkResult = await pool.query(
        'SELECT id FROM clients WHERE id = $1 AND user_id = $2',
        [clientId, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Client not found or unauthorized" });
      }
      
      // تحديث العميل
      const result = await pool.query(
        `UPDATE clients SET 
          name = $1, phone = $2, email = $3, address = $4, 
          balance = $5, credit_limit = $6
         WHERE id = $7 AND user_id = $8
         RETURNING *`,
        [
          req.body.name,
          req.body.phone || null,
          req.body.email || null,
          req.body.address || null,
          req.body.balance || 0,
          req.body.creditLimit || 0,
          clientId,
          userId
        ]
      );
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const userId = req.session.userId;
      const clientId = parseInt(req.params.id);
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // حذف العميل فقط إذا كان ينتمي للمستخدم
      const result = await pool.query(
        'DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING id',
        [clientId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Client not found or unauthorized" });
      }
      
      // حذف من الذاكرة أيضاً
      storage.deleteClient(clientId);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // مسارات الموردين
  app.get("/api/suppliers", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      let query = `SELECT 
        id, name, phone, email, address, 
        opening_balance as "openingBalance",
        balance, 
        tax_number as "taxNumber", 
        credit_limit as "creditLimit",
        branch_id as "branchId"
      FROM suppliers WHERE user_id = $1`;
      
      const params: any[] = [userId];
      
      // إذا تم تحديد branchId، قم بفلترة الموردين للفرع فقط
      if (branchId) {
        query += ` AND branch_id = $2`;
        params.push(branchId);
      }
      
      query += ` ORDER BY id DESC`;
      
      const result = await pool.query(query, params);
      console.log(`📦 جلب ${result.rows.length} مورد${branchId ? ` للفرع ${branchId}` : ' (جميع الفروع)'} للمستخدم ${userId}`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const supplierId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const result = await pool.query(
        'SELECT * FROM suppliers WHERE id = $1 AND user_id = $2',
        [supplierId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Supplier not found or unauthorized" });
      }
      
      const row = result.rows[0];
      const supplier = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        address: row.address,
        openingBalance: row.opening_balance,
        balance: row.balance,
        taxNumber: row.tax_number,
        creditLimit: row.credit_limit,
        branchId: row.branch_id
      };
      
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ error: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const branchId = req.body.branchId ? parseInt(req.body.branchId) : null;
      const openingBalance = req.body.openingBalance || 0;
      
      // حفظ المورد في PostgreSQL مع user_id
      const result = await pool.query(
        `INSERT INTO suppliers (name, phone, email, address, opening_balance, balance, tax_number, credit_limit, branch_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9)
         RETURNING id, name, phone, email, address, opening_balance as "openingBalance", balance, tax_number as "taxNumber", credit_limit as "creditLimit", branch_id as "branchId"`,
        [
          req.body.name,
          req.body.phone || null,
          req.body.email || null,
          req.body.address || null,
          openingBalance,
          req.body.taxNumber || null,
          req.body.creditLimit || '0',
          branchId,
          userId
        ]
      );
      
      const savedSupplier = result.rows[0];
      
      // حفظ في الذاكرة أيضاً للتوافق
      storage.createSupplier({
        id: savedSupplier.id,
        name: savedSupplier.name,
        phone: savedSupplier.phone,
        email: savedSupplier.email,
        address: savedSupplier.address,
        balance: savedSupplier.balance
      });
      
      console.log('✅ تم حفظ المورد في PostgreSQL:', savedSupplier);
      res.status(201).json(savedSupplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ error: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const supplierId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // التحقق من وجود المورد وأنه ينتمي للمستخدم
      const checkResult = await pool.query(
        'SELECT id FROM suppliers WHERE id = $1 AND user_id = $2',
        [supplierId, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Supplier not found or unauthorized" });
      }
      
      // تحديث بيانات المورد في PostgreSQL
      const result = await pool.query(
        `UPDATE suppliers 
         SET name = $1, phone = $2, email = $3, address = $4, 
             tax_number = $5, credit_limit = $6, branch_id = $7
         WHERE id = $8 AND user_id = $9
         RETURNING *`,
        [
          req.body.name,
          req.body.phone || null,
          req.body.email || null,
          req.body.address || null,
          req.body.taxNumber || null,
          req.body.creditLimit || '0',
          req.body.branchId || null,
          supplierId,
          userId
        ]
      );
      
      const row = result.rows[0];
      const supplier = {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        address: row.address,
        openingBalance: row.opening_balance,
        balance: row.balance,
        taxNumber: row.tax_number,
        creditLimit: row.credit_limit,
        branchId: row.branch_id
      };
      
      console.log('✅ تم تحديث المورد في PostgreSQL:', supplier);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const supplierId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // التحقق من وجود المورد وأنه ينتمي للمستخدم
      const checkResult = await pool.query(
        'SELECT id FROM suppliers WHERE id = $1 AND user_id = $2',
        [supplierId, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Supplier not found or unauthorized" });
      }
      
      // تحديث بيانات المورد في PostgreSQL
      const result = await pool.query(
        `UPDATE suppliers 
         SET name = $1, phone = $2, email = $3, address = $4
         WHERE id = $5 AND user_id = $6
         RETURNING *`,
        [
          req.body.name,
          req.body.phone,
          req.body.email || null,
          req.body.address || null,
          supplierId,
          userId
        ]
      );
      
      console.log('✅ تم تحديث المورد في PostgreSQL:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ error: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const supplierId = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // التحقق من وجود المورد وأنه ينتمي للمستخدم
      const checkResult = await pool.query(
        'SELECT id, name FROM suppliers WHERE id = $1 AND user_id = $2',
        [supplierId, userId]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "المورد غير موجود أو غير مصرح به" });
      }
      
      // التحقق من وجود مشتريات مرتبطة بالمورد
      const purchasesCheck = await pool.query(
        'SELECT COUNT(*) as count FROM purchases WHERE supplier_id = $1 AND user_id = $2',
        [supplierId, userId]
      );
      
      const purchasesCount = parseInt(purchasesCheck.rows[0].count);
      
      if (purchasesCount > 0) {
        return res.status(400).json({ 
          error: "لا يمكن حذف المورد",
          message: `هذا المورد له ${purchasesCount} فاتورة شراء مرتبطة. يجب حذف جميع الفواتير المرتبطة أولاً.`,
          hasPurchases: true,
          purchasesCount: purchasesCount
        });
      }
      
      // حذف المورد من PostgreSQL
      await pool.query('DELETE FROM suppliers WHERE id = $1 AND user_id = $2', [supplierId, userId]);
      
      console.log('✅ تم حذف المورد من PostgreSQL:', checkResult.rows[0].name);
      res.json({ success: true, message: 'تم حذف المورد بنجاح' });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ error: "فشل في حذف المورد" });
    }
  });

  // مسارات سندات الدفع للموردين - PostgreSQL
  app.get("/api/supplier-payment-vouchers", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      let query = `
        SELECT spv.*, s.name as supplier_name
        FROM supplier_payment_vouchers spv
        LEFT JOIN suppliers s ON spv.supplier_id = s.id
      `;
      
      const params: any[] = [];
      
      if (branchId !== undefined) {
        query += ' WHERE spv.branch_id = $1';
        params.push(branchId);
      }
      
      query += ' ORDER BY spv.payment_date DESC, spv.id DESC';
      
      const result = await pool.query(query, params);
      
      console.log(`✅ تم جلب ${result.rows.length} سندات صرف${branchId ? ` للفرع ${branchId}` : ''}`);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching supplier payment vouchers:", error);
      res.status(500).json({ error: "Failed to fetch supplier payment vouchers" });
    }
  });

  app.post("/api/supplier-payment-vouchers", async (req, res) => {
    try {
      const { pool } = await import("./db");
      console.log('بيانات سند الصرف المستلمة:', req.body);
      
      // التحقق من وجود المورد في PostgreSQL
      const supplierResult = await pool.query(
        'SELECT id, name, balance FROM suppliers WHERE id = $1',
        [req.body.supplierId]
      );
      
      if (supplierResult.rows.length === 0) {
        return res.status(404).json({ error: "المورد غير موجود" });
      }
      
      const supplier = supplierResult.rows[0];
      const voucherNumber = req.body.voucherNumber || `SPV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // إنشاء سند الصرف في PostgreSQL
      const insertResult = await pool.query(
        `INSERT INTO supplier_payment_vouchers 
         (supplier_id, voucher_number, amount, payment_method, payment_date, description, reference, status, notes, branch_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          req.body.supplierId,
          voucherNumber,
          req.body.amount,
          req.body.paymentMethod,
          req.body.paymentDate,
          req.body.description || null,
          req.body.reference || null,
          req.body.status || 'paid',
          req.body.notes || null,
          req.body.branchId || null
        ]
      );
      
      const newVoucher = insertResult.rows[0];
      
      // خصم المبلغ من رصيد المورد
      const newBalance = parseFloat(supplier.balance) - parseFloat(req.body.amount);
      await pool.query(
        'UPDATE suppliers SET balance = $1 WHERE id = $2',
        [newBalance, req.body.supplierId]
      );
      
      console.log(`✅ تم إنشاء سند صرف للمورد ${supplier.name} بمبلغ ${req.body.amount} وخصم المبلغ من الرصيد`);
      res.status(201).json(newVoucher);
    } catch (error) {
      console.error("Error creating supplier payment voucher:", error);
      res.status(500).json({ error: "Failed to create supplier payment voucher" });
    }
  });

  app.put("/api/supplier-payment-vouchers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const id = parseInt(req.params.id);
      
      // التحقق من وجود السند
      const checkResult = await pool.query(
        'SELECT * FROM supplier_payment_vouchers WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "سند الصرف غير موجود" });
      }
      
      const oldVoucher = checkResult.rows[0];
      
      // إرجاع المبلغ القديم للمورد
      await pool.query(
        'UPDATE suppliers SET balance = balance + $1 WHERE id = $2',
        [oldVoucher.amount, oldVoucher.supplier_id]
      );
      
      // تحديث السند
      const updateResult = await pool.query(
        `UPDATE supplier_payment_vouchers 
         SET amount = $1, payment_method = $2, payment_date = $3, 
             description = $4, reference = $5, status = $6, notes = $7
         WHERE id = $8
         RETURNING *`,
        [
          req.body.amount,
          req.body.paymentMethod,
          req.body.paymentDate,
          req.body.description,
          req.body.reference,
          req.body.status,
          req.body.notes,
          id
        ]
      );
      
      // خصم المبلغ الجديد من المورد
      await pool.query(
        'UPDATE suppliers SET balance = balance - $1 WHERE id = $2',
        [req.body.amount, oldVoucher.supplier_id]
      );
      
      console.log('✅ تم تحديث سند الصرف');
      res.json(updateResult.rows[0]);
    } catch (error) {
      console.error("Error updating supplier payment voucher:", error);
      res.status(500).json({ error: "Failed to update supplier payment voucher" });
    }
  });

  app.delete("/api/supplier-payment-vouchers/:id", async (req, res) => {
    try {
      const { pool } = await import("./db");
      const id = parseInt(req.params.id);
      
      // الحصول على بيانات السند قبل الحذف
      const voucherResult = await pool.query(
        'SELECT * FROM supplier_payment_vouchers WHERE id = $1',
        [id]
      );
      
      if (voucherResult.rows.length === 0) {
        return res.status(404).json({ error: "سند الصرف غير موجود" });
      }
      
      const voucher = voucherResult.rows[0];
      
      // إرجاع المبلغ للمورد
      await pool.query(
        'UPDATE suppliers SET balance = balance + $1 WHERE id = $2',
        [voucher.amount, voucher.supplier_id]
      );
      
      // حذف السند
      await pool.query('DELETE FROM supplier_payment_vouchers WHERE id = $1', [id]);
      
      console.log('✅ تم حذف سند الصرف وإرجاع المبلغ للمورد');
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting supplier payment voucher:", error);
      res.status(500).json({ error: "Failed to delete supplier payment voucher" });
    }
  });

  // مسارات الموظفين - النظام الرئيسي فقط (بدون branchId)
  app.get("/api/employees", (req, res) => {
    const allEmployees = storage.getAllEmployees();
    // فلترة الموظفين: فقط الموظفين بدون branchId (النظام الرئيسي)
    const mainSystemEmployees = allEmployees.filter((emp: any) => !emp.branchId);
    res.json(mainSystemEmployees);
  });

  app.post("/api/employees", async (req, res) => {
    try {
      // التأكد من عدم إضافة branchId للنظام الرئيسي
      const employeeData = { ...req.body };
      delete employeeData.branchId;
      
      const employee = storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      console.log('🔄 تحديث الموظف رقم:', employeeId);
      console.log('📝 البيانات الجديدة:', req.body);
      
      const employee = storage.updateEmployee(employeeId, req.body);
      if (!employee) {
        console.log('❌ الموظف غير موجود:', employeeId);
        return res.status(404).json({ error: "Employee not found" });
      }
      
      console.log('✅ تم تحديث الموظف بنجاح:', employee);
      res.json(employee);
    } catch (error) {
      console.error("❌ خطأ في تحديث الموظف:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const success = storage.deleteEmployee(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // مسارات الخصومات المتقدمة
  app.get("/api/deductions", (req, res) => {
    const deductions = storage.getAllDeductions();
    res.json(deductions);
  });

  // إضافة خصم متقدم جديد 
  app.post("/api/advanced-deductions", async (req, res) => {
    try {
      const { employeeId, amount, type, description, date } = req.body;
      const deductionAmount = parseFloat(amount);
      const empId = parseInt(employeeId);
      
      console.log(`🔥 خصم ${type}: ${deductionAmount} ريال للموظف ${empId}`);
      
      // التحقق من وجود الموظف
      const employee = storage.getEmployee(empId);
      if (!employee) {
        return res.status(404).json({ error: "الموظف غير موجود" });
      }
      
      const currentSalary = parseFloat(employee.salary) || 0;
      let message = "";
      
      if (type === 'salary') {
        // خصم من الراتب
        if (deductionAmount > currentSalary) {
          return res.status(400).json({ 
            error: `لا يمكن خصم ${deductionAmount} ريال - راتب الموظف ${currentSalary} ريال فقط` 
          });
        }
        
        const newSalary = currentSalary - deductionAmount;
        storage.updateEmployee(empId, { salary: newSalary.toString() });
        message = `تم خصم ${deductionAmount} ريال من راتب ${employee.name}. الراتب الجديد: ${newSalary} ريال`;
        
      } else if (type === 'debt') {
        // خصم من الدين  
        const allDebts = storage.getAllDebts();
        const employeeDebts = allDebts.filter((debt: any) => 
          debt.debtorId === empId && debt.debtorType === 'employee'
        );
        
        let totalDebt = 0;
        employeeDebts.forEach((debt: any) => {
          if (debt.debtItems && Array.isArray(debt.debtItems)) {
            debt.debtItems.forEach((item: any) => {
              totalDebt += parseFloat(item.amount) || 0;
            });
          }
        });
        
        if (totalDebt === 0) {
          return res.status(400).json({ error: "لا توجد ديون للموظف" });
        }
        
        if (deductionAmount > totalDebt) {
          return res.status(400).json({ 
            error: `لا يمكن خصم ${deductionAmount} ريال - مجموع الديون ${totalDebt} ريال فقط` 
          });
        }
        
        // خصم من أول دين متاح
        let remainingDeduction = deductionAmount;
        for (const debt of employeeDebts) {
          if (remainingDeduction <= 0) break;
          
          if (debt.debtItems && Array.isArray(debt.debtItems)) {
            for (const item of debt.debtItems) {
              if (remainingDeduction <= 0) break;
              
              const itemAmount = parseFloat(item.amount) || 0;
              if (itemAmount > 0) {
                const deductFromItem = Math.min(remainingDeduction, itemAmount);
                item.amount = (itemAmount - deductFromItem).toString();
                remainingDeduction -= deductFromItem;
              }
            }
            storage.updateDebt(debt.id, debt);
          }
        }
        
        message = `تم خصم ${deductionAmount} ريال من ديون ${employee.name}`;
        
      } else if (type === 'salary_to_debt') {
        // تحويل من الراتب للدين
        if (deductionAmount > currentSalary) {
          return res.status(400).json({ 
            error: `لا يمكن تحويل ${deductionAmount} ريال - راتب الموظف ${currentSalary} ريال فقط` 
          });
        }
        
        // خصم من الراتب
        const newSalary = currentSalary - deductionAmount;
        storage.updateEmployee(empId, { salary: newSalary.toString() });
        
        // إضافة دين جديد
        storage.createDebt({
          debtorId: empId,
          debtorType: 'employee',
          description: `تحويل من الراتب - ${description}`,
          debtItems: [{
            reason: description,
            amount: deductionAmount.toString(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }]
        });
        
        message = `تم تحويل ${deductionAmount} ريال من راتب ${employee.name} إلى دين. الراتب الجديد: ${newSalary} ريال`;
      }
      
      // إنشاء سجل الخصم
      const deduction = storage.createDeduction({
        employeeId: empId,
        amount: deductionAmount.toString(),
        type,
        description,
        date: date || new Date().toISOString()
      });
      
      console.log(`✅ ${message}`);
      
      res.status(201).json({
        success: true,
        deduction,
        message
      });
      
    } catch (error) {
      console.error("❌ خطأ في الخصم:", error);
      res.status(500).json({ error: "Failed to create deduction" });
    }
  });

  app.post("/api/deductions", async (req, res) => {
    try {
      console.log('🔥 بيانات الخصم المستلمة:', req.body);
      
      const { employeeId, amount, type, source, description, date } = req.body;
      const deductionAmount = parseFloat(amount);
      const empId = parseInt(employeeId);
      
      // 1. التحقق من وجود الموظف وحصل على راتبه
      const employee = storage.getEmployee(empId);
      if (!employee) {
        return res.status(404).json({ error: "الموظف غير موجود" });
      }
      
      const currentSalary = parseFloat(employee.salary);
      console.log(`💰 راتب الموظف الحالي: ${currentSalary} ريال`);
      
      // 2. التحقق من أن الخصم لا يتجاوز الراتب
      if (deductionAmount > currentSalary) {
        return res.status(400).json({ 
          error: `لا يمكن خصم ${deductionAmount} ريال - راتب الموظف ${currentSalary} ريال فقط` 
        });
      }
      
      // 3. إنشاء الخصم (يتم الخصم التلقائي من الراتب في createDeduction)
      const deduction = storage.createDeduction({
        employeeId: empId,
        amount: deductionAmount,
        type,
        description: description + ` (خصم من راتب ${currentSalary} ريال)`,
        date: date || new Date().toISOString()
      });
      
      console.log('✅ تم إنشاء الخصم:', deduction);
      
      let salaryUpdate = null;
      let debtUpdates: any[] = [];
      let message = "";
      
      if (source === "debt") {
        // خصم من الديون
        const employeeDebts = storage.getEmployeeDebts(empId);
        console.log(`🔍 ديون الموظف ${empId}:`, employeeDebts);
        
        const activeDebts = employeeDebts.filter(debt => parseFloat(debt.remainingAmount) > 0);
        console.log(`💰 الديون النشطة:`, activeDebts);
        
        if (activeDebts.length === 0) {
          console.log(`⚠️ لا توجد ديون نشطة للموظف ${empId}`);
          return res.status(400).json({ 
            success: false, 
            error: "لا توجد ديون نشطة للموظف للخصم منها" 
          });
        }
        
        let remainingAmount = deductionAmount;
        for (const debt of activeDebts) {
          if (remainingAmount <= 0) break;
          
          const debtBalance = parseFloat(debt.remainingAmount);
          const paymentAmount = Math.min(remainingAmount, debtBalance);
          const newBalance = debtBalance - paymentAmount;
          
          // تحديث الدين
          storage.updateEmployeeDebt(debt.id, {
            ...debt,
            remainingAmount: newBalance.toString(),
            status: newBalance === 0 ? "paid" : "active"
          });
          
          debtUpdates.push({
            debtId: debt.id,
            debtDescription: debt.description,
            originalAmount: parseFloat(debt.amount),
            paidAmount: paymentAmount,
            newBalance,
            status: newBalance === 0 ? "paid" : "active"
          });
          
          remainingAmount -= paymentAmount;
        }
        
        message = `تم خصم ${deductionAmount} ريال من ديون الموظف`;
        salaryUpdate = {
          employeeName: employee.name,
          previousSalary: currentSalary,
          deductedAmount: 0,
          newSalary: currentSalary
        };
        
      } else {
        // خصم من الراتب (السلوك الافتراضي)
        const updatedEmployee = storage.getEmployee(empId);
        const newSalary = parseFloat(updatedEmployee?.salary || "0");
        
        salaryUpdate = {
          employeeName: employee.name,
          previousSalary: currentSalary,
          deductedAmount: deductionAmount,
          newSalary
        };
        
        message = `تم خصم ${deductionAmount} ريال من الراتب`;
      }
      
      console.log(`💸 ${message}`);
      
      // 5. حفظ نتائج العملية للاطلاع عليها لاحقاً
      const operationResult = storage.saveOperationResult({
        operationType: source === "debt" ? "debt_payment" : "salary_deduction",
        operationId: deduction.id,
        employeeId: empId,
        employeeName: employee.name,
        summary: {
          salaryUpdate,
          debtUpdates,
          totalDeducted: deductionAmount,
          totalDebtsPaid: debtUpdates.reduce((sum, debt) => sum + debt.paidAmount, 0),
          debtsUpdated: debtUpdates.length,
          message,
          timestamp: new Date().toISOString()
        },
        totalAmount: deductionAmount.toString()
      });
      
      // 6. إرجاع النتائج الكاملة
      res.status(201).json({
        success: true,
        deduction,
        salaryUpdate,
        debtUpdates,
        operationResult, // إضافة معرف النتيجة المحفوظة
        summary: {
          totalDeducted: deductionAmount,
          totalDebtsPaid: debtUpdates.reduce((sum, debt) => sum + debt.paidAmount, 0),
          debtsUpdated: debtUpdates.length,
          message
        }
      });
      
    } catch (error) {
      console.error("❌ خطأ في إنشاء الخصم:", error);
      res.status(500).json({ error: "فشل في إنشاء الخصم", details: error.message });
    }
  });

  app.put("/api/deductions/:id", async (req, res) => {
    try {
      const deduction = storage.updateDeduction(parseInt(req.params.id), req.body);
      if (!deduction) {
        return res.status(404).json({ error: "Deduction not found" });
      }
      res.json(deduction);
    } catch (error) {
      console.error("Error updating deduction:", error);
      res.status(500).json({ error: "Failed to update deduction" });
    }
  });

  app.delete("/api/deductions/:id", async (req, res) => {
    try {
      const success = storage.deleteDeduction(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Deduction not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deduction:", error);
      res.status(500).json({ error: "Failed to delete deduction" });
    }
  });

  // API routes لنتائج العمليات
  app.get("/api/operation-results", (req, res) => {
    const results = storage.getOperationResults();
    res.json(results);
  });

  app.get("/api/operation-results/employee/:employeeId", (req, res) => {
    const employeeId = parseInt(req.params.employeeId);
    const results = storage.getOperationResultsByEmployee(employeeId);
    res.json(results);
  });

  app.get("/api/operation-results/:id", (req, res) => {
    const result = storage.getOperationResult(parseInt(req.params.id));
    if (!result) {
      return res.status(404).json({ error: "نتيجة العملية غير موجودة" });
    }
    res.json(result);
  });

  // مسارات البدلات
  app.get("/api/allowances", (req, res) => {
    const allowances = storage.getAllAllowances();
    res.json(allowances);
  });

  app.post("/api/allowances", async (req, res) => {
    try {
      const allowance = storage.createAllowance(req.body);
      res.status(201).json(allowance);
    } catch (error) {
      console.error("Error creating allowance:", error);
      res.status(500).json({ error: "Failed to create allowance" });
    }
  });

  app.put("/api/allowances/:id", async (req, res) => {
    try {
      const allowance = storage.updateAllowance(parseInt(req.params.id), req.body);
      if (!allowance) {
        return res.status(404).json({ error: "Allowance not found" });
      }
      res.json(allowance);
    } catch (error) {
      console.error("Error updating allowance:", error);
      res.status(500).json({ error: "Failed to update allowance" });
    }
  });

  app.delete("/api/allowances/:id", async (req, res) => {
    try {
      const success = storage.deleteAllowance(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Allowance not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting allowance:", error);
      res.status(500).json({ error: "Failed to delete allowance" });
    }
  });

  // مسارات الرواتب - النظام الرئيسي فقط (موظفين بدون branchId)
  app.get("/api/salaries", (req, res) => {
    const allSalaries = storage.getAllSalaries();
    const employees = storage.getAllEmployees();
    
    // فلترة الرواتب للموظفين في النظام الرئيسي فقط
    const mainSystemEmployees = employees.filter((emp: any) => !emp.branchId);
    const mainSystemEmployeeIds = mainSystemEmployees.map(emp => emp.id);
    
    const mainSystemSalaries = allSalaries.filter((salary: any) => 
      mainSystemEmployeeIds.includes(salary.employeeId)
    );
    
    res.json(mainSystemSalaries);
  });

  app.post("/api/salaries", async (req, res) => {
    try {
      console.log("بيانات الراتب المُرسلة:", req.body);
      const salary = storage.createSalary(req.body);
      console.log("الراتب المُنشأ:", salary);
      res.status(201).json(salary);
    } catch (error) {
      console.error("Error creating salary:", error);
      res.status(500).json({ error: "Failed to create salary" });
    }
  });

  app.put("/api/salaries/:id", async (req, res) => {
    try {
      const salary = storage.updateSalary(parseInt(req.params.id), req.body);
      if (!salary) {
        return res.status(404).json({ error: "Salary not found" });
      }
      res.json(salary);
    } catch (error) {
      console.error("Error updating salary:", error);
      res.status(500).json({ error: "Failed to update salary" });
    }
  });

  app.delete("/api/salaries/:id", async (req, res) => {
    try {
      const success = storage.deleteSalary(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Salary not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting salary:", error);
      res.status(500).json({ error: "Failed to delete salary" });
    }
  });

  // API routes للديون العامة
  app.get("/api/debts", (req, res) => {
    try {
      const debts = storage.getAllDebts();
      res.json(debts);
    } catch (error) {
      console.error("Error fetching debts:", error);
      res.status(500).json({ error: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts", async (req, res) => {
    try {
      console.log("Creating debt with data:", req.body);
      const { debtorId, debtorType, debtType, debtItems, notes, totalAmount } = req.body;
      
      // التحقق من وجود الموظف
      const employee = storage.getEmployee(debtorId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const debtData = {
        debtorType: debtorType || 'employee',
        debtorId: debtorId,
        debtorName: employee.name,
        debtType: debtType,
        debtItems: debtItems || [],
        notes: notes || '',
        status: 'active' as const,
        currency: 'SAR'
      };

      const debt = storage.createDebt(debtData);
      res.json(debt);
      
    } catch (error) {
      console.error("Error creating debt:", error);
      res.status(500).json({ error: "Failed to create debt" });
    }
  });

  app.delete("/api/debts/:id", async (req, res) => {
    try {
      const success = storage.deleteDebt(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Debt not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting debt:", error);
      res.status(500).json({ error: "Failed to delete debt" });
    }
  });

  // مسارات ديون الموظفين - النظام الرئيسي فقط (بدون branchId)
  app.get("/api/employee-debts", (req, res) => {
    try {
      const debts = storage.getAllDebts();
      const employees = storage.getAllEmployees();
      
      // فلترة الديون للموظفين فقط (النظام الرئيسي)
      const mainSystemEmployees = employees.filter((emp: any) => !emp.branchId);
      const mainSystemEmployeeIds = mainSystemEmployees.map(emp => emp.id);
      
      const employeeDebts = debts.filter(debt => 
        debt.debtorType === 'employee' && mainSystemEmployeeIds.includes(debt.debtorId)
      );
      
      // ربط بيانات الموظفين مع الديون
      const debtsWithEmployeeNames = employeeDebts.map(debt => {
        const employee = employees.find(emp => emp.id === debt.debtorId);
        return {
          ...debt,
          employeeName: employee ? employee.name : 'موظف غير معروف'
        };
      });
      
      console.log(`Found ${employeeDebts.length} employee debts out of ${debts.length} total debts`);
      res.json(debtsWithEmployeeNames);
    } catch (error) {
      console.error("Error fetching employee debts:", error);
      res.status(500).json({ error: "Failed to fetch employee debts" });
    }
  });

  app.post("/api/employee-debts", async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const { debtorId, employeeId, type, amount, debtItems, description, dueDate, notes, installments, monthlyDeduction, remainingAmount, status } = req.body;
      
      // استخدم debtorId أو employeeId أيهما متوفر
      const empId = debtorId || employeeId;
      console.log("Looking for employee with ID:", empId);
      const allEmployees = storage.getAllEmployees();
      console.log("All employees:", allEmployees.map(emp => ({ id: emp.id, name: emp.name })));
      
      const employee = storage.getEmployee(empId);
      console.log("Found employee:", employee);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const debtData = {
        debtorType: 'employee' as const,
        debtorId: empId,
        debtorName: employee.name,
        type: type || 'قرض',
        amount: amount,
        remainingAmount: remainingAmount || amount,
        debtItems: debtItems || [],
        description: description,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        status: status || 'active' as const,
        notes: notes || '',
        installments: installments || 1,
        monthlyDeduction: monthlyDeduction || '0',
        currency: 'SAR'
      };

      const debt = storage.createDebt(debtData);
      
      // إضافة اسم الموظف للاستجابة
      const debtWithEmployeeName = {
        ...debt,
        employeeName: employee.name
      };
      
      res.status(201).json(debtWithEmployeeName);
    } catch (error) {
      console.error("Error creating employee debt:", error);
      res.status(500).json({ error: "Failed to create employee debt" });
    }
  });

  app.put("/api/employee-debts/:id", async (req, res) => {
    try {
      const debtId = parseInt(req.params.id);
      const updateData = req.body;
      
      if (updateData.employeeId) {
        const employee = storage.getEmployee(updateData.employeeId);
        if (!employee) {
          return res.status(404).json({ error: "Employee not found" });
        }
        updateData.debtorId = updateData.employeeId;
        updateData.debtorName = employee.name;
      }

      const debt = storage.updateDebt(debtId, updateData);
      if (!debt) {
        return res.status(404).json({ error: "Debt not found" });
      }

      // إضافة اسم الموظف للاستجابة
      const employee = storage.getEmployee(debt.debtorId);
      const debtWithEmployeeName = {
        ...debt,
        employeeName: employee ? employee.name : 'موظف غير معروف'
      };
      
      res.json(debtWithEmployeeName);
    } catch (error) {
      console.error("Error updating employee debt:", error);
      res.status(500).json({ error: "Failed to update employee debt" });
    }
  });

  app.delete("/api/employee-debts/:id", async (req, res) => {
    try {
      const success = storage.deleteDebt(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Debt not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting employee debt:", error);
      res.status(500).json({ error: "Failed to delete employee debt" });
    }
  });

  // مسارات مدفوعات الديون
  app.get("/api/debt-payments", (req, res) => {
    try {
      const debtPayments = storage.getAllDebtPayments();
      res.json(debtPayments);
    } catch (error) {
      console.error("Error fetching debt payments:", error);
      res.status(500).json({ error: "Failed to fetch debt payments" });
    }
  });

  app.get("/api/debt-payments/:employeeId", (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const debtPayments = storage.getDebtPaymentsByEmployee(employeeId);
      res.json(debtPayments);
    } catch (error) {
      console.error("Error fetching debt payments:", error);
      res.status(500).json({ error: "Failed to fetch debt payments" });
    }
  });

  // Employee Deductions API Routes
  app.get("/api/employee-deductions", (req, res) => {
    try {
      const deductions = storage.getAllEmployeeDeductions();
      res.json(deductions);
    } catch (error) {
      console.error("Error fetching employee deductions:", error);
      res.status(500).json({ error: "Failed to fetch employee deductions" });
    }
  });

  app.get("/api/employee-deductions/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deduction = storage.getEmployeeDeduction(id);
      if (!deduction) {
        return res.status(404).json({ error: "Employee deduction not found" });
      }
      res.json(deduction);
    } catch (error) {
      console.error("Error fetching employee deduction:", error);
      res.status(500).json({ error: "Failed to fetch employee deduction" });
    }
  });

  app.post("/api/employee-deductions", (req, res) => {
    try {
      const deduction = storage.createEmployeeDeduction(req.body);
      res.status(201).json(deduction);
    } catch (error) {
      console.error("Error creating employee deduction:", error);
      res.status(500).json({ error: "Failed to create employee deduction" });
    }
  });

  app.put("/api/employee-deductions/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deduction = storage.updateEmployeeDeduction(id, req.body);
      if (!deduction) {
        return res.status(404).json({ error: "Employee deduction not found" });
      }
      res.json(deduction);
    } catch (error) {
      console.error("Error updating employee deduction:", error);
      res.status(500).json({ error: "Failed to update employee deduction" });
    }
  });

  app.delete("/api/employee-deductions/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = storage.deleteEmployeeDeduction(id);
      if (!success) {
        return res.status(404).json({ error: "Employee deduction not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting employee deduction:", error);
      res.status(500).json({ error: "Failed to delete employee deduction" });
    }
  });

  app.post("/api/debt-payments", async (req, res) => {
    try {
      const { employeeId, debtId, amount, paymentDate, notes } = req.body;
      
      const employee = storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const debtPayment = storage.createDebtPayment({
        employeeId,
        debtId,
        amount,
        paymentDate,
        notes
      });
      
      res.status(201).json(debtPayment);
    } catch (error) {
      console.error("Error creating debt payment:", error);
      res.status(500).json({ error: "Failed to create debt payment" });
    }
  });



  // مسارات الإجازات
  app.get("/api/holidays", (req, res) => {
    const holidays = storage.getAllHolidays();
    res.json(holidays);
  });

  app.post("/api/holidays", async (req, res) => {
    try {
      const holiday = storage.createHoliday(req.body);
      res.status(201).json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      res.status(500).json({ error: "Failed to create holiday" });
    }
  });

  app.put("/api/holidays/:id", async (req, res) => {
    try {
      const holiday = storage.updateHoliday(parseInt(req.params.id), req.body);
      if (!holiday) {
        return res.status(404).json({ error: "Holiday not found" });
      }
      res.json(holiday);
    } catch (error) {
      console.error("Error updating holiday:", error);
      res.status(500).json({ error: "Failed to update holiday" });
    }
  });

  app.delete("/api/holidays/:id", async (req, res) => {
    try {
      const success = storage.deleteHoliday(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Holiday not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ error: "Failed to delete holiday" });
    }
  });

  // إحصائيات لوحة التحكم
  app.get("/api/dashboard/stats", (req, res) => {
    try {
      const employees = storage.getAllEmployees();
      const deductions = storage.getAllDeductions();
      const allowances = storage.getAllAllowances();
      const salaries = storage.getAllSalaries();
      const products = storage.getAllProducts();
      const sales = storage.getAllSales();
      const purchases = storage.getAllPurchases();
      const clients = storage.getAllClients();
      const suppliers = storage.getAllSuppliers();
      const dailyExpenses = storage.getAllDailyExpenses();

      const totalSalesAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      const totalPurchasesAmount = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      const totalDeductions = deductions.reduce((sum, deduction) => sum + parseFloat(deduction.amount || '0'), 0);
      const totalAllowances = allowances.reduce((sum, allowance) => sum + parseFloat(allowance.amount || '0'), 0);
      const totalSalaries = salaries.reduce((sum, salary) => sum + parseFloat(salary.netSalary || '0'), 0);
      const totalDailyExpenses = dailyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);

      res.json({
        totalEmployees: employees.length,
        totalDeductions: deductions.length,
        totalAllowances: allowances.length,
        totalSalaries: salaries.length,
        totalProducts: products.length,
        totalSales: sales.length,
        totalPurchases: purchases.length,
        totalClients: clients.length,
        totalSuppliers: suppliers.length,
        totalDailyExpenses: dailyExpenses.length,
        totalSalesAmount,
        totalPurchasesAmount,
        totalDeductions: totalDeductions,
        totalAllowances: totalAllowances,
        totalSalariesAmount: totalSalaries,
        totalDailyExpensesAmount: totalDailyExpenses,
        recentTransactions: mockRecentTransactions
      });
    } catch (error) {
      console.error("Error in dashboard stats:", error);
      res.json({
        totalEmployees: 0,
        totalDeductions: 0,
        totalAllowances: 0,
        totalSalaries: 0,
        totalProducts: 0,
        totalSales: 0,
        totalPurchases: 0,
        totalClients: 0,
        totalSuppliers: 0,
        totalDailyExpenses: 0,
        totalSalesAmount: 0,
        totalPurchasesAmount: 0,
        totalDeductions: 0,
        totalAllowances: 0,
        totalSalariesAmount: 0,
        totalDailyExpensesAmount: 0,
        recentTransactions: []
      });
    }
  });

  // تقارير الفروع الشاملة
  app.get("/api/dashboard/branch-summary", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const dateFilter = req.query.dateFilter as string || 'month';
      
      // حساب نطاق التاريخ حسب الفلتر
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          break;
        case 'all':
        default:
          startDate = new Date(2000, 0, 1); // تاريخ بعيد جداً لجلب كل البيانات
          break;
      }
      
      // جلب فروع المستخدم فقط
      const allBranches = await pool.query('SELECT * FROM branches WHERE user_id = $1 ORDER BY id', [userId]);
      const branches = allBranches.rows;
      
      // حساب البيانات لكل فرع
      const branchSummaries = await Promise.all(branches.map(async (branch: any) => {
        // جلب المبيعات في النطاق الزمني
        const salesQuery = await pool.query(
          `SELECT SUM(CAST(total AS DECIMAL)) as total FROM sales 
           WHERE branch_id = $1 AND date >= $2`,
          [branch.id, startDate]
        );
        const totalSales = parseFloat(salesQuery.rows[0]?.total || '0');
        
        // جلب المشتريات في النطاق الزمني
        const purchasesQuery = await pool.query(
          `SELECT SUM(CAST(total AS DECIMAL)) as total FROM purchases 
           WHERE branch_id = $1 AND date >= $2`,
          [branch.id, startDate]
        );
        const totalPurchases = parseFloat(purchasesQuery.rows[0]?.total || '0');
        
        // جلب المصروفات اليومية في النطاق الزمني (إذا كان الجدول موجود)
        let totalExpenses = 0;
        try {
          const expensesQuery = await pool.query(
            `SELECT SUM(amount) as total FROM daily_expenses 
             WHERE branch_id = $1 AND date >= $2`,
            [branch.id, startDate]
          );
          totalExpenses = parseFloat(expensesQuery.rows[0]?.total || '0');
        } catch (err) {
          // جدول المصروفات غير موجود، نتجاهل الخطأ ونستخدم قيمة 0
          totalExpenses = 0;
        }
        
        // عدد المنتجات للفرع
        const productsQuery = await pool.query(
          'SELECT COUNT(*) as count FROM products WHERE branch_id = $1',
          [branch.id]
        );
        const productsCount = parseInt(productsQuery.rows[0]?.count || '0');
        
        // عدد العملاء (الجدول لا يحتوي على branch_id، نعيد 0 لتجنب التكرار)
        const clientsCount = 0;
        
        // عدد الموردين للفرع
        const suppliersQuery = await pool.query(
          'SELECT COUNT(*) as count FROM suppliers WHERE branch_id = $1',
          [branch.id]
        );
        const suppliersCount = parseInt(suppliersQuery.rows[0]?.count || '0');
        
        // حساب صافي الربح
        const netProfit = totalSales - totalPurchases - totalExpenses;
        const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
        
        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code || branch.id.toString().padStart(3, '0'),
          branchManager: branch.manager || 'غير محدد',
          totalSales,
          totalPurchases,
          totalExpenses,
          netProfit,
          profitMargin,
          productsCount,
          clientsCount,
          suppliersCount,
          inventoryValue: 0, // يمكن حسابها لاحقاً
          createdAt: branch.created_at || new Date()
        };
      }));
      
      // عرض جميع الفروع (بدون فلترة)
      const allBranchesData = branchSummaries;
      
      // حساب أفضل فرع من حيث الأرباح
      const bestBranch = allBranchesData.reduce((best: any, current: any) => {
        if (!best || current.netProfit > best.netProfit) {
          return current;
        }
        return best;
      }, null);
      
      // الفروع الأحدث (آخر 5 فروع مضافة)
      const recentBranches = [...allBranchesData]
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      
      // حساب إجمالي العملاء (مرة واحدة فقط)
      const totalClientsQuery = await pool.query('SELECT COUNT(*) as count FROM clients');
      const totalClients = parseInt(totalClientsQuery.rows[0]?.count || '0');
      
      // إجماليات عامة
      const totals = allBranchesData.reduce((acc: any, branch: any) => ({
        totalSales: acc.totalSales + branch.totalSales,
        totalPurchases: acc.totalPurchases + branch.totalPurchases,
        totalExpenses: acc.totalExpenses + branch.totalExpenses,
        totalInventoryValue: acc.totalInventoryValue + branch.inventoryValue,
        totalNetProfit: acc.totalNetProfit + branch.netProfit,
        totalBranches: acc.totalBranches + 1,
        totalProducts: acc.totalProducts + branch.productsCount,
        totalClients: totalClients, // نستخدم العدد الإجمالي مرة واحدة
        totalSuppliers: acc.totalSuppliers + branch.suppliersCount
      }), {
        totalSales: 0,
        totalPurchases: 0,
        totalExpenses: 0,
        totalInventoryValue: 0,
        totalNetProfit: 0,
        totalBranches: 0,
        totalProducts: 0,
        totalClients: totalClients,
        totalSuppliers: 0
      });
      
      res.json({
        branches: allBranchesData,
        bestBranch,
        recentBranches,
        totals
      });
    } catch (error) {
      console.error("خطأ في تقارير الفروع:", error);
      res.status(500).json({ 
        error: "فشل في جلب تقارير الفروع",
        branches: [],
        bestBranch: null,
        recentBranches: [],
        totals: {
          totalSales: 0,
          totalPurchases: 0,
          totalExpenses: 0,
          totalInventoryValue: 0,
          totalNetProfit: 0,
          totalBranches: 0,
          totalProducts: 0,
          totalClients: 0,
          totalSuppliers: 0
        }
      });
    }
  });

  // مسارات عروض الأسعار
  app.get("/api/quotes", (req, res) => {
    try {
      const quotes = storage.getAllQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ error: "Failed to fetch quotes" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      console.log('بيانات عرض السعر المستلمة:', req.body);
      
      // التحقق من البيانات المطلوبة
      if (!req.body.clientId || !req.body.items || req.body.items.length === 0) {
        return res.status(400).json({ error: 'يجب تحديد العميل وإضافة عناصر للعرض' });
      }

      // إنشاء عرض السعر
      const quote = storage.createQuote({
        ...req.body,
        quoteNumber: `QT-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'pending'
      });
      
      console.log('تم إنشاء عرض السعر:', quote);
      res.status(201).json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ error: "فشل في حفظ عرض السعر" });
    }
  });

  app.put("/api/quotes/:id", async (req, res) => {
    try {
      const quote = storage.updateQuote(parseInt(req.params.id), req.body);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ error: "Failed to update quote" });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const success = storage.deleteQuote(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ error: "Failed to delete quote" });
    }
  });

  // Branches API - REMOVED: تم نقل جميع الـ endpoints إلى PostgreSQL في نهاية الملف (السطر ~4370)

  // Comprehensive branch analytics API
  app.get('/api/branch-analytics', async (req, res) => {
    try {
      const branchId = req.query.branchId as string;
      
      // Use existing in-memory data
      const allProducts = storage.getAllProducts();
      const allSales = storage.getAllSales();
      const allClients = storage.getAllClients();
      const allEmployees = storage.getAllEmployees();
      
      // Mock branch data - In real implementation, filter by branchId
      const branchProducts = allProducts;
      const branchSales = allSales;
      const branchClients = allClients;
      const branchEmployees = allEmployees;
      
      // Calculate analytics
      const totalRevenue = branchSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const totalOrders = branchSales.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Product performance
      const productPerformance = branchProducts.map(product => {
        const productSales = branchSales.filter(sale => 
          sale.items?.some(item => item.productId === product.id)
        );
        const totalSold = productSales.reduce((sum, sale) => {
          const item = sale.items?.find(item => item.productId === product.id);
          return sum + (item?.quantity || 0);
        }, 0);
        const revenue = productSales.reduce((sum, sale) => {
          const item = sale.items?.find(item => item.productId === product.id);
          return sum + ((item?.quantity || 0) * (item?.price || 0));
        }, 0);
        
        return {
          id: product.id,
          name: product.name,
          category: product.category,
          totalSold,
          revenue,
          currentStock: product.stock || 0
        };
      });
      
      // Top performing products
      const topProducts = productPerformance
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Low stock alerts
      const lowStockProducts = branchProducts.filter(product => (product.stock || 0) < 10);
      
      // Monthly trends (mock data)
      const monthlyTrends = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(2024, i, 1).toLocaleDateString('ar-SA', { month: 'long' }),
        sales: Math.floor(Math.random() * 50000) + 10000,
        orders: Math.floor(Math.random() * 100) + 20,
        customers: Math.floor(Math.random() * 50) + 10
      }));
      
      res.json({
        branchId: branchId || 'all',
        overview: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          totalProducts: branchProducts.length,
          totalClients: branchClients.length,
          totalEmployees: branchEmployees.length
        },
        productPerformance,
        topProducts,
        lowStockProducts,
        monthlyTrends,
        recentActivity: branchSales.slice(-10).map(sale => ({
          id: sale.id,
          type: 'sale',
          amount: sale.totalAmount,
          client: branchClients.find(c => c.id === sale.clientId)?.name || 'عميل نقدي',
          date: sale.createdAt || new Date().toISOString()
        }))
      });
    } catch (error) {
      console.error('Error fetching branch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch branch analytics' });
    }
  });

  // Initialize mock data
  app.post('/api/branches/init-mock-data', async (req, res) => {
    try {
      // Initialize mock branches if none exist
      const existingBranches = storage.getAllBranches();
      if (existingBranches.length === 0) {
        mockBranches.forEach(b => {
          storage.createBranch({
            ...b,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      }
      
      res.json({ success: true, message: 'Mock data initialized' });
    } catch (error) {
      console.error('Error initializing mock data:', error);
      res.status(500).json({ error: 'Failed to initialize mock data' });
    }
  });

  // Client Receipt Vouchers API
  app.get('/api/client-receipt-vouchers', async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      if (branchId) {
        // Query PostgreSQL for branch-specific vouchers with client names
        const result = await pool.query(
          `SELECT 
            crv.*,
            c.name as client_name
          FROM client_receipt_vouchers crv
          LEFT JOIN clients c ON crv.client_id = c.id
          WHERE crv.branch_id = $1
          ORDER BY crv.created_at DESC`,
          [branchId]
        );
        return res.json(result.rows);
      }
      
      // Fallback to storage for vouchers without branch
      const vouchers = await storage.getAllClientReceiptVouchers();
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching client receipt vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch client receipt vouchers' });
    }
  });

  app.post('/api/client-receipt-vouchers', async (req, res) => {
    try {
      console.log("البيانات الواردة لسند القبض:", req.body);
      
      const { branchId, ...restData } = req.body;
      
      // تنظيف وتجهيز البيانات
      const voucherData = {
        ...restData,
        amount: String(req.body.amount || 0),
        receiptDate: req.body.receiptDate || new Date().toISOString().split('T')[0],
        paymentMethod: req.body.paymentMethod || 'نقدي',
        status: req.body.status || 'مؤكد'
      };
      
      console.log("البيانات بعد المعالجة:", voucherData);
      
      if (branchId) {
        // Save to PostgreSQL with branch_id
        const result = await pool.query(
          `INSERT INTO client_receipt_vouchers 
          (client_id, branch_id, voucher_number, amount, payment_method, receipt_date, payer, receiver, description, reference, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`,
          [
            voucherData.clientId || null,
            branchId,
            voucherData.voucherNumber,
            voucherData.amount,
            voucherData.paymentMethod,
            voucherData.receiptDate,
            voucherData.payer || null,
            voucherData.receiver || null,
            voucherData.description || null,
            voucherData.reference || null,
            voucherData.status,
            voucherData.notes || null
          ]
        );
        return res.status(201).json(result.rows[0]);
      }
      
      // Fallback to storage for vouchers without branch
      const voucher = await storage.createClientReceiptVoucher(voucherData);
      
      res.status(201).json(voucher);
    } catch (error) {
      console.error('خطأ في إنشاء سند القبض:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء سند القبض",
        message: error?.message
      });
    }
  });

  app.delete('/api/client-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check PostgreSQL first
      const checkResult = await pool.query(
        'SELECT * FROM client_receipt_vouchers WHERE id = $1',
        [id]
      );
      
      if (checkResult.rows.length > 0) {
        // Delete from PostgreSQL
        await pool.query('DELETE FROM client_receipt_vouchers WHERE id = $1', [id]);
        return res.json({ message: 'Client receipt voucher deleted successfully' });
      }
      
      // Fallback to storage
      const voucher = await storage.getClientReceiptVoucher(id);
      if (!voucher) {
        return res.status(404).json({ error: 'Client receipt voucher not found' });
      }
      
      const success = await storage.deleteClientReceiptVoucher(id);
      if (!success) {
        return res.status(404).json({ error: 'Client receipt voucher not found' });
      }
      
      res.json({ message: 'Client receipt voucher deleted successfully' });
    } catch (error) {
      console.error('Error deleting client receipt voucher:', error);
      res.status(500).json({ error: 'Failed to delete client receipt voucher' });
    }
  });

  // إعادة تعيين العملاء للقائمة الأصلية
  app.post('/api/clients/reset', async (req, res) => {
    try {
      storage.resetClientsToOriginal();
      console.log("تم إعادة تعيين قائمة العملاء للحالة الأصلية");
      res.json({ success: true, message: 'تم إعادة تعيين قائمة العملاء بنجاح' });
    } catch (error) {
      console.error('خطأ في إعادة تعيين العملاء:', error);
      res.status(500).json({ error: 'فشل في إعادة تعيين العملاء' });
    }
  });

  // Product Categories API
  app.get('/api/product-categories', async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const categories = storage.getAllProductCategories(branchId);
      res.json(categories);
    } catch (error) {
      console.error('Error fetching product categories:', error);
      res.status(500).json({ error: 'Failed to fetch product categories' });
    }
  });

  app.post('/api/product-categories', async (req, res) => {
    try {
      const category = await storage.createProductCategory({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating product category:', error);
      res.status(500).json({ error: 'Failed to create product category' });
    }
  });

  app.put('/api/product-categories/:id', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.updateProductCategory(categoryId, {
        ...req.body,
        updatedAt: new Date()
      });
      res.json(category);
    } catch (error) {
      console.error('Error updating product category:', error);
      res.status(500).json({ error: 'Failed to update product category' });
    }
  });

  app.delete('/api/product-categories/:id', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.deleteProductCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product category:', error);
      res.status(500).json({ error: 'Failed to delete product category' });
    }
  });



  // Goods Issue Vouchers API
  app.get('/api/goods-issue-vouchers', async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      const vouchers = storage.getAllGoodsIssueVouchers(branchId);
      res.json(vouchers);
    } catch (error) {
      console.error('Error fetching goods issue vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch goods issue vouchers' });
    }
  });

  app.post('/api/goods-issue-vouchers', async (req, res) => {
    try {
      console.log("بيانات سند إخراج البضاعة:", req.body);
      
      // إنشاء سند إخراج البضاعة
      const voucher = storage.createGoodsIssueVoucher(req.body);
      console.log("تم إنشاء سند إخراج البضاعة:", voucher);
      
      // معالجة الأصناف - خصم من المخزون
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const product = storage.getProduct(item.productId);
          if (product) {
            const currentQuantity = parseInt(product.quantity || '0') || 0;
            const issueQuantity = parseInt(item.quantity || '0') || 0;
            const newQuantity = Math.max(0, currentQuantity - issueQuantity);
            
            storage.updateProduct(item.productId, {
              quantity: newQuantity
            });
            
            console.log(`تم خصم ${issueQuantity} من المنتج ${product.name}. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }
      
      // إضافة المبلغ إلى رصيد العميل (زيادة الدين)
      if (req.body.clientId && req.body.total) {
        const client = storage.getClient(req.body.clientId);
        if (client) {
          const currentBalance = parseFloat(client.balance || '0') || 0;
          const voucherAmount = parseFloat(req.body.total || '0') || 0;
          const newBalance = (currentBalance + voucherAmount).toString();
          
          storage.updateClient(req.body.clientId, {
            balance: newBalance
          });
          
          console.log(`تم إضافة ${voucherAmount} إلى رصيد العميل ${client.name}. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      res.status(201).json(voucher);
    } catch (error) {
      console.error('خطأ في إنشاء سند إخراج البضاعة:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء سند إخراج البضاعة",
        message: error?.message
      });
    }
  });

  // DELETE goods issue voucher
  app.delete('/api/goods-issue-vouchers/:id', async (req, res) => {
    try {
      const voucherId = parseInt(req.params.id);
      
      // الحصول على السند قبل الحذف لاستعادة المخزون
      const voucher = storage.getGoodsIssueVoucher(voucherId);
      if (!voucher) {
        return res.status(404).json({ error: 'Goods issue voucher not found' });
      }
      
      // استعادة الكميات إلى المخزون
      if (voucher.items && Array.isArray(voucher.items)) {
        for (const item of voucher.items) {
          const product = storage.getProduct(item.productId);
          if (product) {
            const currentQuantity = parseInt(product.quantity || '0') || 0;
            const returnQuantity = parseInt(item.quantity || '0') || 0;
            const newQuantity = currentQuantity + returnQuantity;
            
            storage.updateProduct(item.productId, {
              quantity: newQuantity
            });
            
            console.log(`تم استعادة ${returnQuantity} من المنتج ${product.name}. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }
      
      // تقليل رصيد العميل (إذا كان مرتبط بعميل)
      if (voucher.clientId && voucher.total) {
        const client = storage.getClient(voucher.clientId);
        if (client) {
          const currentBalance = parseFloat(client.balance || '0') || 0;
          const voucherAmount = parseFloat(voucher.total || '0') || 0;
          const newBalance = Math.max(0, currentBalance - voucherAmount).toString();
          
          storage.updateClient(voucher.clientId, {
            balance: newBalance
          });
          
          console.log(`تم تقليل ${voucherAmount} من رصيد العميل ${client.name}. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      // حذف السند
      const deleted = storage.deleteGoodsIssueVoucher(voucherId);
      if (!deleted) {
        return res.status(404).json({ error: 'Failed to delete goods issue voucher' });
      }
      
      res.json({ message: 'Goods issue voucher deleted successfully' });
    } catch (error) {
      console.error('Error deleting goods issue voucher:', error);
      res.status(500).json({ error: 'Failed to delete goods issue voucher' });
    }
  });

  app.put('/api/goods-issue-vouchers/:id', async (req, res) => {
    try {
      const voucherId = parseInt(req.params.id);
      
      // الحصول على السند الأصلي
      const originalVoucher = storage.getGoodsIssueVoucher(voucherId);
      if (!originalVoucher) {
        return res.status(404).json({ error: 'Goods issue voucher not found' });
      }
      
      // استعادة الكميات من السند الأصلي إلى المخزون
      if (originalVoucher.items && Array.isArray(originalVoucher.items)) {
        for (const item of originalVoucher.items) {
          const product = storage.getProduct(item.productId);
          if (product) {
            const currentQuantity = parseInt(product.quantity || '0') || 0;
            const returnQuantity = parseInt(item.quantity || '0') || 0;
            const newQuantity = currentQuantity + returnQuantity;
            
            storage.updateProduct(item.productId, {
              quantity: newQuantity
            });
            
            console.log(`تم استعادة ${returnQuantity} من المنتج ${product.name} للتعديل. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }
      
      // إذا كان هناك عميل، تقليل رصيده بقيمة السند الأصلي
      if (originalVoucher.clientId && originalVoucher.totalAmount) {
        const client = storage.getClient(originalVoucher.clientId);
        if (client) {
          const currentBalance = parseFloat(client.balance || '0') || 0;
          const originalAmount = parseFloat(originalVoucher.totalAmount || '0') || 0;
          const newBalance = Math.max(0, currentBalance - originalAmount).toString();
          
          storage.updateClient(originalVoucher.clientId, {
            balance: newBalance
          });
          
          console.log(`تم تقليل ${originalAmount} من رصيد العميل ${client.name} للتعديل. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      // تحديث السند بالبيانات الجديدة
      const updatedVoucher = storage.updateGoodsIssueVoucher(voucherId, req.body);
      if (!updatedVoucher) {
        return res.status(404).json({ error: 'Failed to update goods issue voucher' });
      }
      
      // خصم الكميات الجديدة من المخزون
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          const product = storage.getProduct(item.productId);
          if (product) {
            const currentQuantity = parseInt(product.quantity || '0') || 0;
            const issueQuantity = parseInt(item.quantity || '0') || 0;
            const newQuantity = Math.max(0, currentQuantity - issueQuantity);
            
            storage.updateProduct(item.productId, {
              quantity: newQuantity
            });
            
            console.log(`تم خصم ${issueQuantity} من المنتج ${product.name} بعد التعديل. الكمية الجديدة: ${newQuantity}`);
          }
        }
      }
      
      // إضافة المبلغ الجديد إلى رصيد العميل
      if (req.body.clientId && req.body.totalAmount) {
        const client = storage.getClient(req.body.clientId);
        if (client) {
          const currentBalance = parseFloat(client.balance || '0') || 0;
          const voucherAmount = parseFloat(req.body.totalAmount || '0') || 0;
          const newBalance = (currentBalance + voucherAmount).toString();
          
          storage.updateClient(req.body.clientId, {
            balance: newBalance
          });
          
          console.log(`تم إضافة ${voucherAmount} إلى رصيد العميل ${client.name} بعد التعديل. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      res.json(updatedVoucher);
    } catch (error) {
      console.error('Error updating goods issue voucher:', error);
      res.status(500).json({ error: 'Failed to update goods issue voucher' });
    }
  });

  // Purchase Returns API
  app.get('/api/purchase-returns', async (req, res) => {
    try {
      const returns = storage.getAllPurchaseReturns();
      res.json(returns);
    } catch (error) {
      console.error('Error fetching purchase returns:', error);
      res.status(500).json({ error: 'Failed to fetch purchase returns' });
    }
  });

  app.post('/api/purchase-returns', async (req, res) => {
    try {
      console.log('بيانات مرتجع المشتريات:', req.body);
      
      // إنشاء مرتجع المشتريات في Memory (للتوافق مع الكود القديم)
      const purchaseReturn = storage.createPurchaseReturn(req.body);
      console.log('✅ تم إنشاء مرتجع المشتريات:', purchaseReturn);
      
      // 🔥 تحديث كميات المنتجات في PostgreSQL مباشرة (خصم الكميات المرتجعة للمورد)
      const { pool } = await import("./db");
      for (const item of req.body.items) {
        if (item.productId && item.quantity) {
          const productId = parseInt(item.productId);
          const quantity = parseFloat(item.quantity);
          
          // الحصول على الكمية الحالية
          const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
          if (productResult.rows.length > 0) {
            const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
            const newQuantity = currentQuantity - quantity;
            
            // تحديث الكمية (خصم لأن المنتج رجع للمورد)
            await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
            console.log(`✅ تم خصم ${quantity} من المنتج #${productId} (مرتجع مشتريات). الكمية الجديدة: ${newQuantity}`);
          }
        }
      }

      // 🔥 تحديث مبلغ الفاتورة الأصلية في PostgreSQL
      if (req.body.purchaseId) {
        const purchaseId = parseInt(req.body.purchaseId);
        const returnAmount = parseFloat(req.body.total || '0');
        
        // الحصول على مبلغ الفاتورة الحالي
        const purchaseResult = await pool.query('SELECT total FROM purchases WHERE id = $1', [purchaseId]);
        if (purchaseResult.rows.length > 0) {
          const currentTotal = parseFloat(purchaseResult.rows[0].total || '0');
          const newTotal = Math.max(0, currentTotal - returnAmount);
          
          // تحديث مبلغ الفاتورة
          await pool.query('UPDATE purchases SET total = $1 WHERE id = $2', [newTotal, purchaseId]);
          console.log(`✅ تم خصم ${returnAmount} من فاتورة المشتريات #${purchaseId}. المبلغ الجديد: ${newTotal}`);
        }
      }
      
      res.status(201).json(purchaseReturn);
    } catch (error) {
      console.error('خطأ في إنشاء مرتجع المشتريات:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء مرتجع المشتريات",
        message: error?.message
      });
    }
  });

  app.put('/api/purchase-returns/:id', async (req, res) => {
    try {
      const returnId = parseInt(req.params.id);
      console.log('تعديل مرتجع المشتريات:', returnId, req.body);
      
      const { pool } = await import("./db");
      
      // الحصول على بيانات المرتجع القديم
      const oldReturn = storage.getPurchaseReturn(returnId);
      if (!oldReturn) {
        return res.status(404).json({ error: 'Purchase return not found' });
      }
      
      // استعادة الكميات القديمة للمخزون (عكس الخصم القديم)
      const oldItems = typeof oldReturn.items === 'string' ? JSON.parse(oldReturn.items) : oldReturn.items;
      if (oldItems && Array.isArray(oldItems)) {
        for (const item of oldItems) {
          if (item.productId && item.quantity) {
            const productId = parseInt(item.productId);
            const quantity = parseFloat(item.quantity);
            
            const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length > 0) {
              const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
              const newQuantity = currentQuantity + quantity; // إضافة لأننا نعكس الخصم القديم
              
              await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
              console.log(`✅ تم استعادة ${quantity} للمنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
            }
          }
        }
      }
      
      // خصم الكميات الجديدة من المخزون
      const newItems = req.body.items;
      if (newItems && Array.isArray(newItems)) {
        for (const item of newItems) {
          if (item.productId && item.quantity) {
            const productId = parseInt(item.productId);
            const quantity = parseFloat(item.quantity);
            
            const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length > 0) {
              const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
              const newQuantity = currentQuantity - quantity; // خصم الكميات الجديدة
              
              await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
              console.log(`✅ تم خصم ${quantity} من المنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
            }
          }
        }
      }
      
      // استعادة مبلغ المرتجع القديم للفاتورة ثم خصم المبلغ الجديد
      const oldPurchaseId = typeof oldReturn.purchaseId === 'string' ? parseInt(oldReturn.purchaseId) : oldReturn.purchaseId;
      const newPurchaseId = req.body.purchaseId;
      
      if (oldPurchaseId || newPurchaseId) {
        const purchaseId = newPurchaseId || oldPurchaseId;
        const oldReturnAmount = parseFloat(oldReturn.total || '0');
        const newReturnAmount = parseFloat(req.body.total || '0');
        
        const purchaseResult = await pool.query('SELECT total FROM purchases WHERE id = $1', [purchaseId]);
        if (purchaseResult.rows.length > 0) {
          const currentTotal = parseFloat(purchaseResult.rows[0].total || '0');
          // استعادة المبلغ القديم ثم خصم المبلغ الجديد
          const newTotal = Math.max(0, currentTotal + oldReturnAmount - newReturnAmount);
          
          await pool.query('UPDATE purchases SET total = $1 WHERE id = $2', [newTotal, purchaseId]);
          console.log(`✅ تم تحديث مبلغ فاتورة المشتريات #${purchaseId}. المبلغ الجديد: ${newTotal} (القديم: ${currentTotal}, استعادة: +${oldReturnAmount}, خصم: -${newReturnAmount})`);
        }
      }
      
      // تحديث المرتجع في Memory Storage
      const updatedReturn = storage.updatePurchaseReturn(returnId, req.body);
      
      res.json(updatedReturn);
    } catch (error) {
      console.error('خطأ في تعديل مرتجع المشتريات:', error);
      res.status(500).json({ 
        error: "فشل في تعديل مرتجع المشتريات",
        message: error?.message
      });
    }
  });

  // Sales Returns API  
  app.get('/api/sales-returns', async (req, res) => {
    try {
      const returns = storage.getAllSalesReturns();
      res.json(returns);
    } catch (error) {
      console.error('Error fetching sales returns:', error);
      res.status(500).json({ error: 'Failed to fetch sales returns' });
    }
  });

  app.post('/api/sales-returns', async (req, res) => {
    try {
      console.log('بيانات مرتجع المبيعات:', req.body);
      
      // إنشاء مرتجع المبيعات في Memory (للتوافق مع الكود القديم)
      const salesReturn = storage.createSalesReturn(req.body);
      console.log('✅ تم إنشاء مرتجع المبيعات:', salesReturn);
      
      // 🔥 تحديث كميات المنتجات في PostgreSQL مباشرة (إضافة الكميات المرتجعة للمخزون)
      const { pool } = await import("./db");
      for (const item of req.body.items) {
        if (item.productId && item.quantity) {
          const productId = parseInt(item.productId);
          const quantity = parseFloat(item.quantity);
          
          // الحصول على الكمية الحالية
          const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
          if (productResult.rows.length > 0) {
            const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
            const newQuantity = currentQuantity + quantity;
            
            // تحديث الكمية (إضافة لأن المنتج رجع للمخزون)
            await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
            console.log(`✅ تم إضافة ${quantity} للمنتج #${productId} (مرتجع مبيعات). الكمية الجديدة: ${newQuantity}`);
          }
        }
      }
      
      res.status(201).json(salesReturn);
    } catch (error) {
      console.error('خطأ في إنشاء مرتجع المبيعات:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء مرتجع المبيعات",
        message: error?.message
      });
    }
  });

  // Update sales return
  app.put('/api/sales-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedReturn = storage.updateSalesReturn(id, req.body);
      
      if (!updatedReturn) {
        return res.status(404).json({ error: 'Sales return not found' });
      }
      
      res.json(updatedReturn);
    } catch (error) {
      console.error('Error updating sales return:', error);
      res.status(500).json({ error: 'Failed to update sales return' });
    }
  });

  // Delete sales return
  app.delete('/api/sales-returns/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = storage.deleteSalesReturn(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Sales return not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting sales return:', error);
      res.status(500).json({ error: 'Failed to delete sales return' });
    }
  });

  // Goods Receipt Vouchers API
  app.get('/api/goods-receipt-vouchers', async (req, res) => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string) : undefined;
      
      console.log('Fetching goods receipt vouchers, branchId:', branchId);
      
      // جلب السندات من قاعدة البيانات PostgreSQL مع الفلترة حسب branchId
      const { pool } = await import("./db");
      
      let query = 'SELECT * FROM goods_receipt_vouchers';
      const params: any[] = [];
      
      if (branchId !== undefined) {
        query += ' WHERE branch_id = $1';
        params.push(branchId);
      }
      
      query += ' ORDER BY received_date DESC';
      
      const result = await pool.query(query, params);
      const dbVouchers = result.rows;
      
      // تحويل أسماء الأعمدة من snake_case إلى camelCase للتوافق مع Frontend
      const formattedVouchers = dbVouchers.map((voucher: any) => ({
        ...voucher,
        voucherNumber: voucher.voucher_number,
        purchaseOrderId: voucher.purchase_order_id,
        supplierId: voucher.supplier_id,
        supplierName: voucher.supplier_name,
        branchId: voucher.branch_id,
        receivedBy: voucher.received_by,
        receivedDate: voucher.received_date,
        totalItems: voucher.total_items,
        totalValue: voucher.total_value,
        createdAt: voucher.created_at,
        updatedAt: voucher.updated_at
      }));
      
      console.log(`Goods receipt vouchers fetched: ${formattedVouchers.length}${branchId ? ` for branch ${branchId}` : ''}`);
      res.json(formattedVouchers);
    } catch (error) {
      console.error('Error fetching goods receipt vouchers:', error);
      res.status(500).json({ error: 'Failed to fetch goods receipt vouchers' });
    }
  });

  app.post('/api/goods-receipt-vouchers', async (req, res) => {
    try {
      console.log('بيانات سند إدخال البضاعة:', req.body);
      
      // إنشاء سند إدخال البضاعة في Memory (للتوافق)
      const voucher = storage.createGoodsReceiptVoucher(req.body);
      console.log('تم إنشاء سند إدخال البضاعة:', voucher);
      
      // حفظ السند في قاعدة البيانات PostgreSQL
      const { pool } = await import("./db");
      const receivedDate = req.body.receivedDate ? new Date(req.body.receivedDate) : new Date();
      
      const result = await pool.query(
        `INSERT INTO goods_receipt_vouchers 
         (voucher_number, purchase_order_id, supplier_id, supplier_name, branch_id, 
          received_by, received_date, status, total_items, total_value, notes, items) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
         RETURNING *`,
        [
          voucher.voucherNumber,
          voucher.purchaseOrderId || null,
          voucher.supplierId || null,
          voucher.supplierName || null,
          req.body.branchId || null,
          voucher.receivedBy,
          receivedDate,
          voucher.status || 'completed',
          voucher.totalItems || 0,
          voucher.totalValue || 0,
          voucher.notes || null,
          JSON.stringify(voucher.items || [])
        ]
      );
      
      const dbVoucher = result.rows[0];
      console.log('✅ تم حفظ السند في قاعدة البيانات:', dbVoucher);
      
      // معالجة الأصناف - إضافة للمخزون في PostgreSQL
      if (req.body.items && Array.isArray(req.body.items)) {
        for (const item of req.body.items) {
          if (item.productId && item.receivedQuantity) {
            const productId = parseInt(item.productId);
            const receivedQuantity = parseFloat(item.receivedQuantity);
            
            // الحصول على الكمية الحالية
            const productResult = await pool.query('SELECT quantity FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length > 0) {
              const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
              const newQuantity = currentQuantity + receivedQuantity;
              
              // تحديث الكمية
              await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
              console.log(`✅ تم إضافة ${receivedQuantity} للمنتج #${productId}. الكمية الجديدة: ${newQuantity}`);
            }
          }
        }
      }
      
      // تحديث رصيد المورد في PostgreSQL (إذا كان موجود)
      if (req.body.supplierId && req.body.totalValue) {
        const supplierId = parseInt(req.body.supplierId);
        const voucherAmount = parseFloat(req.body.totalValue);
        
        const supplierResult = await pool.query('SELECT balance FROM suppliers WHERE id = $1', [supplierId]);
        if (supplierResult.rows.length > 0) {
          const currentBalance = parseFloat(supplierResult.rows[0].balance || '0');
          const newBalance = currentBalance + voucherAmount;
          
          await pool.query('UPDATE suppliers SET balance = $1 WHERE id = $2', [newBalance, supplierId]);
          console.log(`✅ تم إضافة ${voucherAmount} لرصيد المورد #${supplierId}. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      res.status(201).json({
        ...voucher,
        branchId: dbVoucher.branch_id
      });
    } catch (error) {
      console.error('خطأ في إنشاء سند إدخال البضاعة:', error);
      res.status(500).json({ 
        error: "فشل في إنشاء سند إدخال البضاعة",
        message: error?.message
      });
    }
  });

  app.put('/api/goods-receipt-vouchers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      
      // Validate that voucher exists
      const existingVoucher = storage.getGoodsReceiptVoucher(id);
      if (!existingVoucher) {
        return res.status(404).json({ error: 'سند إدخال البضاعة غير موجود' });
      }

      // Update the voucher
      const updatedVoucher = storage.updateGoodsReceiptVoucher(id, updateData);
      
      if (!updatedVoucher) {
        return res.status(404).json({ error: 'فشل في تحديث السند' });
      }

      res.json(updatedVoucher);
    } catch (error) {
      console.error('Error updating goods receipt voucher:', error);
      res.status(500).json({ 
        error: 'فشل في تحديث سند إدخال البضاعة',
        message: error?.message
      });
    }
  });

  app.delete('/api/goods-receipt-vouchers/:id', async (req, res) => {
    try {
      const voucherId = parseInt(req.params.id);
      const { pool } = await import("./db");
      
      // الحصول على السند من قاعدة البيانات قبل الحذف
      const voucherResult = await pool.query(
        'SELECT * FROM goods_receipt_vouchers WHERE id = $1',
        [voucherId]
      );
      
      if (voucherResult.rows.length === 0) {
        return res.status(404).json({ error: 'Voucher not found' });
      }
      
      const voucher = voucherResult.rows[0];
      console.log("بيانات سند إدخال البضاعة المراد حذفه:", voucher);
      
      // تحليل الأصناف من JSON
      const items = typeof voucher.items === 'string' 
        ? JSON.parse(voucher.items) 
        : voucher.items;
      
      // خصم الكميات من المخزون في PostgreSQL (عكس الإضافة)
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.receivedQuantity) {
            const productId = parseInt(item.productId);
            const returnQuantity = parseFloat(item.receivedQuantity);
            
            // الحصول على الكمية الحالية
            const productResult = await pool.query('SELECT quantity, name FROM products WHERE id = $1', [productId]);
            if (productResult.rows.length > 0) {
              const currentQuantity = parseFloat(productResult.rows[0].quantity || '0');
              const newQuantity = Math.max(0, currentQuantity - returnQuantity);
              
              // تحديث الكمية
              await pool.query('UPDATE products SET quantity = $1 WHERE id = $2', [newQuantity, productId]);
              console.log(`✅ تم خصم ${returnQuantity} من المنتج ${productResult.rows[0].name}. الكمية الجديدة: ${newQuantity}`);
            }
          }
        }
      }
      
      // تقليل رصيد المورد في PostgreSQL (خصم مبلغ السند)
      if (voucher.supplier_id && voucher.total_value) {
        const supplierId = parseInt(voucher.supplier_id);
        const voucherAmount = parseFloat(voucher.total_value);
        
        const supplierResult = await pool.query('SELECT balance, name FROM suppliers WHERE id = $1', [supplierId]);
        if (supplierResult.rows.length > 0) {
          const currentBalance = parseFloat(supplierResult.rows[0].balance || '0');
          const newBalance = Math.max(0, currentBalance - voucherAmount);
          
          await pool.query('UPDATE suppliers SET balance = $1 WHERE id = $2', [newBalance, supplierId]);
          console.log(`✅ تم تقليل ${voucherAmount} من رصيد المورد ${supplierResult.rows[0].name}. الرصيد الجديد: ${newBalance}`);
        }
      }
      
      // حذف السند من PostgreSQL
      await pool.query('DELETE FROM goods_receipt_vouchers WHERE id = $1', [voucherId]);
      console.log(`✅ تم حذف سند إدخال البضاعة #${voucherId}`);
      
      // حذف من Memory Storage أيضاً (للتوافق)
      storage.deleteGoodsReceiptVoucher(voucherId);
      
      res.json({ success: true, message: "تم حذف سند إدخال البضاعة وعكس العمليات بنجاح" });
    } catch (error) {
      console.error('Error deleting goods receipt voucher:', error);
      res.status(500).json({ error: 'Failed to delete voucher', message: error?.message });
    }
  });

  // Additional endpoints can be added here

  // Settings API routes
  app.post('/api/settings', async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { section, data } = req.body;
      
      // حفظ إعدادات الشركة في PostgreSQL مع user_id
      if (section === 'company') {
        const { pool } = await import("./db");
        
        // التحقق من وجود سجل للمستخدم
        const existing = await pool.query('SELECT id FROM company_info WHERE user_id = $1', [userId]);
        
        if (existing.rows.length > 0) {
          // تحديث
          await pool.query(`
            UPDATE company_info 
            SET name = $1, arabic_name = $2, tax_number = $3, commercial_register = $4,
                address = $5, city = $6, country = $7, phone = $8, email = $9,
                website = $10, bank_account = $11, bank_name = $12, iban = $13,
                swift_code = $14, updated_at = NOW()
            WHERE user_id = $15
          `, [
            data.name, data.arabicName, data.taxNumber, data.commercialRegister,
            data.address, data.city, data.country, data.phone, data.email,
            data.website, data.bankAccount, data.bankName, data.iban,
            data.swiftCode, userId
          ]);
        } else {
          // إنشاء سجل جديد
          await pool.query(`
            INSERT INTO company_info (name, arabic_name, tax_number, commercial_register,
              address, city, country, phone, email, website, bank_account, bank_name,
              iban, swift_code, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            data.name, data.arabicName, data.taxNumber, data.commercialRegister,
            data.address, data.city, data.country, data.phone, data.email,
            data.website, data.bankAccount, data.bankName, data.iban,
            data.swiftCode, userId
          ]);
        }
        
        console.log(`✅ تم حفظ إعدادات الشركة للمستخدم ${userId}`);
      }
      
      res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  app.get('/api/settings', async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const { pool } = await import("./db");
      
      // جلب إعدادات الشركة الخاصة بالمستخدم
      const result = await pool.query('SELECT * FROM company_info WHERE user_id = $1', [userId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        const settings = {
          company: {
            name: row.name,
            arabicName: row.arabic_name,
            taxNumber: row.tax_number,
            commercialRegister: row.commercial_register,
            address: row.address,
            city: row.city,
            country: row.country,
            phone: row.phone,
            email: row.email,
            website: row.website,
            bankAccount: row.bank_account,
            bankName: row.bank_name,
            iban: row.iban,
            swiftCode: row.swift_code
          }
        };
        res.json(settings);
      } else {
        // إرجاع إعدادات فارغة
        res.json({ company: {} });
      }
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });

  // Backup API routes
  app.post('/api/backup/create', async (req, res) => {
    try {
      const backupId = await storage.createBackup();
      res.json({ success: true, backupId, message: 'Backup created successfully' });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  });

  app.get('/api/backup/download', async (req, res) => {
    try {
      const backupData = await storage.getLatestBackup();
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().split('T')[0]}.sql`);
      res.send(backupData);
    } catch (error) {
      console.error('Error downloading backup:', error);
      res.status(500).json({ error: 'Failed to download backup' });
    }
  });

  app.post('/api/backup/restore', async (req, res) => {
    try {
      // Handle backup restore logic here
      res.json({ success: true, message: 'Backup restored successfully' });
    } catch (error) {
      console.error('Error restoring backup:', error);
      res.status(500).json({ error: 'Failed to restore backup' });
    }
  });

  // Branches routes
  app.get("/api/branches", async (req: any, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }
      
      console.log(`🔥 جلب الفروع من PostgreSQL للمستخدم ${userId}`);
      // جلب الفروع من قاعدة البيانات PostgreSQL مباشرة حسب المستخدم
      const result = await pool.query('SELECT * FROM branches WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC', [userId]);
      console.log(`✅ تم جلب ${result.rows.length} فرع من قاعدة البيانات للمستخدم ${userId}`);
      const branches = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        address: row.address,
        phone: row.phone,
        isActive: row.is_active ?? true,
        managerName: row.manager_name,
        openingDate: row.opening_date,
        created_at: row.created_at,
        userId: row.user_id
      }));
      res.json(branches);
    } catch (error: any) {
      console.error("❌ خطأ في جلب الفروع:", error);
      res.status(500).json({ message: "Failed to fetch branches", error: error.message });
    }
  });

  app.get("/api/branches/:id", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.id);
      const result = await pool.query('SELECT * FROM branches WHERE id = $1', [branchId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Branch not found" });
      }

      const row = result.rows[0];
      const branch = {
        id: row.id,
        name: row.name,
        code: row.code,
        address: row.address,
        phone: row.phone,
        isActive: row.is_active ?? true,
        managerName: row.manager_name,
        openingDate: row.opening_date,
        createdAt: row.created_at
      };
      
      res.json(branch);
    } catch (error: any) {
      console.error("Error fetching branch:", error);
      res.status(500).json({ message: "Failed to fetch branch", error: error.message });
    }
  });

  app.post("/api/branches", async (req: any, res: Response) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل دخول" });
      }
      
      const { name, code, address, phone, isActive, managerName, openingDate } = req.body;
      
      // توليد رمز فريد للفرع بناءً على عدد فروع المستخدم
      const countResult = await pool.query('SELECT COUNT(*) FROM branches WHERE user_id = $1', [userId]);
      const branchCount = parseInt(countResult.rows[0].count) + 1;
      const uniqueCode = `${userId}-${branchCount}`;
      
      const result = await pool.query(
        `INSERT INTO branches (name, code, address, phone, is_active, manager_name, opening_date, user_id, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) 
         RETURNING *`,
        [name, uniqueCode, address || null, phone || null, isActive ?? true, managerName || null, openingDate || null, userId]
      );
      
      const branch = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        code: result.rows[0].code,
        address: result.rows[0].address,
        phone: result.rows[0].phone,
        isActive: result.rows[0].is_active,
        managerName: result.rows[0].manager_name,
        openingDate: result.rows[0].opening_date,
        created_at: result.rows[0].created_at
      };
      
      res.status(201).json(branch);
    } catch (error: any) {
      console.error("Error creating branch:", error);
      res.status(500).json({ message: "Failed to create branch", error: error.message });
    }
  });

  app.put("/api/branches/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, code, address, phone, isActive, managerName, openingDate } = req.body;
      
      const result = await pool.query(
        `UPDATE branches 
         SET name = $1, code = $2, address = $3, phone = $4, is_active = $5, manager_name = $6, opening_date = $7
         WHERE id = $8
         RETURNING *`,
        [name, code, address || null, phone || null, isActive ?? true, managerName || null, openingDate || null, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      const branch = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        code: result.rows[0].code,
        address: result.rows[0].address,
        phone: result.rows[0].phone,
        isActive: result.rows[0].is_active,
        managerName: result.rows[0].manager_name,
        openingDate: result.rows[0].opening_date,
        created_at: result.rows[0].created_at
      };
      
      res.json(branch);
    } catch (error: any) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch", error: error.message });
    }
  });

  app.patch("/api/branches/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name, code, address, phone, isActive, managerName, openingDate } = req.body;
      
      const result = await pool.query(
        `UPDATE branches 
         SET name = $1, code = $2, address = $3, phone = $4, is_active = $5, manager_name = $6, opening_date = $7
         WHERE id = $8
         RETURNING *`,
        [name, code, address || null, phone || null, isActive ?? true, managerName || null, openingDate || null, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      const branch = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        code: result.rows[0].code,
        address: result.rows[0].address,
        phone: result.rows[0].phone,
        isActive: result.rows[0].is_active,
        managerName: result.rows[0].manager_name,
        openingDate: result.rows[0].opening_date,
        created_at: result.rows[0].created_at
      };
      
      res.json(branch);
    } catch (error: any) {
      console.error("Error updating branch:", error);
      res.status(500).json({ message: "Failed to update branch", error: error.message });
    }
  });

  app.delete("/api/branches/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // التحقق من أن الفرع ينتمي للمستخدم
      const branchCheck = await pool.query('SELECT id FROM branches WHERE id = $1 AND user_id = $2', [id, userId]);
      if (branchCheck.rows.length === 0) {
        return res.status(404).json({ message: "Branch not found or unauthorized" });
      }
      
      // حذف جميع البيانات المرتبطة بالفرع أولاً
      console.log(`🗑️ حذف الفرع ${id} مع جميع البيانات المرتبطة...`);
      
      // 1. حذف تحويلات المخزون المرتبطة بالفرع (المرسلة والمستقبلة)
      const transfers = await pool.query('DELETE FROM branch_transfers WHERE from_branch_id = $1 OR to_branch_id = $1', [id]);
      console.log(`✅ تم حذف ${transfers.rowCount} تحويل مخزون للفرع ${id}`);
      
      // 2. حذف عناصر فواتير المبيعات الفرعية
      const branchSaleItems = await pool.query(`
        DELETE FROM branch_sale_items 
        WHERE sale_id IN (SELECT id FROM branch_sales WHERE branch_id = $1)
      `, [id]);
      console.log(`✅ تم حذف ${branchSaleItems.rowCount} عنصر فاتورة مبيعات فرعية للفرع ${id}`);
      
      // 2b. حذف فواتير المبيعات من جدول branch_sales
      const branchSales = await pool.query('DELETE FROM branch_sales WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${branchSales.rowCount} فاتورة مبيعات فرعية للفرع ${id}`);
      
      // 2b. حذف فواتير المبيعات من جدول sales
      const sales = await pool.query('DELETE FROM sales WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${sales.rowCount} فاتورة مبيعات رئيسية للفرع ${id}`);
      
      // 3. حذف سندات صرف الموردين المرتبطة
      const supplierPayments = await pool.query('DELETE FROM supplier_payment_vouchers WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${supplierPayments.rowCount} سند صرف مورد للفرع ${id}`);
      
      // 4. حذف أوامر الشراء
      const purchaseOrders = await pool.query(`
        DELETE FROM purchase_orders 
        WHERE supplier_id IN (SELECT id FROM suppliers WHERE branch_id = $1)
      `, [id]);
      console.log(`✅ تم حذف ${purchaseOrders.rowCount} أمر شراء للفرع ${id}`);
      
      // 5. حذف سندات استلام البضائع (بناءً على supplier_id و branch_id)
      const goodsReceipts1 = await pool.query(`
        DELETE FROM goods_receipt_vouchers 
        WHERE supplier_id IN (SELECT id FROM suppliers WHERE branch_id = $1)
      `, [id]);
      console.log(`✅ تم حذف ${goodsReceipts1.rowCount} سند استلام (supplier) للفرع ${id}`);
      
      const goodsReceipts2 = await pool.query('DELETE FROM goods_receipt_vouchers WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${goodsReceipts2.rowCount} سند استلام (branch) للفرع ${id}`);
      
      // 6. حذف فواتير المشتريات المرتبطة بالفرع مباشرة
      const purchases1 = await pool.query('DELETE FROM purchases WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${purchases1.rowCount} فاتورة مشتريات مباشرة للفرع ${id}`);
      
      // 6b. حذف فواتير المشتريات المرتبطة بموردي الفرع
      const purchases2 = await pool.query(`
        DELETE FROM purchases 
        WHERE supplier_id IN (SELECT id FROM suppliers WHERE branch_id = $1)
      `, [id]);
      console.log(`✅ تم حذف ${purchases2.rowCount} فاتورة مشتريات لموردي الفرع ${id}`);
      
      // 7. حذف منتجات الفروع المرتبطة بالفرع مباشرة
      const branchProducts = await pool.query('DELETE FROM branch_products WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${branchProducts.rowCount} منتج فرعي للفرع ${id}`);
      
      // 8. حذف فئات المنتجات المرتبطة بالفرع
      const productCategories = await pool.query('DELETE FROM branch_product_categories WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${productCategories.rowCount} فئة منتج للفرع ${id}`);
      
      // 9. حذف المنتجات المرتبطة
      const products = await pool.query('DELETE FROM products WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${products.rowCount} منتج للفرع ${id}`);
      
      // 10. حذف سندات القبض للعملاء المرتبطة بالفرع
      const receiptVouchers = await pool.query('DELETE FROM client_receipt_vouchers WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${receiptVouchers.rowCount} سند قبض للفرع ${id}`);
      
      // 11. حذف العملاء المرتبطين
      const clients = await pool.query('DELETE FROM branch_clients WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${clients.rowCount} عميل للفرع ${id}`);
      
      // 12. حذف الموردين من جدول suppliers الرئيسي
      const mainSuppliers = await pool.query('DELETE FROM suppliers WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${mainSuppliers.rowCount} مورد رئيسي للفرع ${id}`);
      
      // 13. حذف الموردين من جدول branch_suppliers
      const branchSuppliers = await pool.query('DELETE FROM branch_suppliers WHERE branch_id = $1', [id]);
      console.log(`✅ تم حذف ${branchSuppliers.rowCount} مورد فرعي للفرع ${id}`);
      
      // 14. حذف الفرع نفسه
      const result = await pool.query('DELETE FROM branches WHERE id = $1 AND user_id = $2 RETURNING id, name', [id, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Branch not found" });
      }
      
      console.log(`✅ تم حذف الفرع ${result.rows[0].name} بنجاح مع جميع بياناته`);
      res.json({ 
        message: "تم حذف الفرع وجميع البيانات المرتبطة بنجاح",
        deleted: {
          transfers: transfers.rowCount,
          branchSaleItems: branchSaleItems.rowCount,
          branchSales: branchSales.rowCount,
          sales: sales.rowCount,
          supplierPayments: supplierPayments.rowCount,
          purchaseOrders: purchaseOrders.rowCount,
          goodsReceipts: goodsReceipts1.rowCount + goodsReceipts2.rowCount,
          purchases: purchases1.rowCount + purchases2.rowCount,
          branchProducts: branchProducts.rowCount,
          productCategories: productCategories.rowCount,
          products: products.rowCount,
          receiptVouchers: receiptVouchers.rowCount,
          clients: clients.rowCount,
          suppliers: mainSuppliers.rowCount + branchSuppliers.rowCount
        }
      });
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      res.status(500).json({ message: "فشل حذف الفرع", error: error.message });
    }
  });

  // Branch Permissions endpoints - صلاحيات الفروع
  app.get("/api/branches/:branchId/permissions", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      
      const result = await pool.query(
        'SELECT * FROM branch_permissions WHERE branch_id = $1 ORDER BY section_name',
        [branchId]
      );
      
      // If no permissions exist, create default ones
      if (result.rows.length === 0) {
        const sections = ['products', 'sales', 'purchases', 'inventory', 'clients', 'suppliers', 'employees', 'expenses'];
        
        for (const section of sections) {
          await pool.query(
            'INSERT INTO branch_permissions (branch_id, section_name, is_enabled) VALUES ($1, $2, $3)',
            [branchId, section, true]
          );
        }
        
        const newResult = await pool.query(
          'SELECT * FROM branch_permissions WHERE branch_id = $1 ORDER BY section_name',
          [branchId]
        );
        
        res.json(newResult.rows);
      } else {
        res.json(result.rows);
      }
    } catch (error: any) {
      console.error("Error fetching branch permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions", error: error.message });
    }
  });
  
  app.put("/api/branches/:branchId/permissions/:section", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const section = req.params.section;
      const { is_enabled } = req.body;
      
      const result = await pool.query(
        `UPDATE branch_permissions 
         SET is_enabled = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE branch_id = $2 AND section_name = $3 
         RETURNING *`,
        [is_enabled, branchId, section]
      );
      
      if (result.rows.length === 0) {
        // Create if doesn't exist
        const insertResult = await pool.query(
          'INSERT INTO branch_permissions (branch_id, section_name, is_enabled) VALUES ($1, $2, $3) RETURNING *',
          [branchId, section, is_enabled]
        );
        return res.json(insertResult.rows[0]);
      }
      
      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Error updating branch permission:", error);
      res.status(500).json({ message: "Failed to update permission", error: error.message });
    }
  });

  // Branch Employees endpoints - موظفي الفرع فقط
  app.get("/api/branches/:branchId/employees", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const allEmployees = await storage.getAllEmployees();
      // فلترة: فقط الموظفين الذين لديهم branchId يطابق الفرع
      const branchEmployees = allEmployees.filter((emp: any) => 
        emp.branchId === branchId
      );
      res.json(branchEmployees);
    } catch (error: any) {
      console.error("Error fetching branch employees:", error);
      res.status(500).json({ message: "Failed to fetch employees", error: error.message });
    }
  });

  app.post("/api/branches/:branchId/employees", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      // إضافة branchId تلقائياً للموظف
      const employeeData = { ...req.body, branchId };
      
      const employee = storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error: any) {
      console.error("Error creating branch employee:", error);
      res.status(500).json({ message: "Failed to create employee", error: error.message });
    }
  });

  app.put("/api/branches/:branchId/employees/:employeeId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const employeeId = parseInt(req.params.employeeId);
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }
      
      // تحديث الموظف مع الاحتفاظ بـ branchId
      const updatedEmployee = storage.updateEmployee(employeeId, { ...req.body, branchId });
      res.json(updatedEmployee);
    } catch (error: any) {
      console.error("Error updating branch employee:", error);
      res.status(500).json({ message: "Failed to update employee", error: error.message });
    }
  });

  app.delete("/api/branches/:branchId/employees/:employeeId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const employeeId = parseInt(req.params.employeeId);
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }
      
      const success = storage.deleteEmployee(employeeId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete employee" });
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting branch employee:", error);
      res.status(500).json({ message: "Failed to delete employee", error: error.message });
    }
  });

  // ربط موظف بالفرع (تحديث branchId)
  app.post("/api/branches/:branchId/link-employee", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { employeeId } = req.body;
      
      // التحقق من وجود الموظف
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "الموظف غير موجود" });
      }
      
      // التحقق من وجود الفرع
      const branch = await storage.getBranch(branchId);
      if (!branch) {
        return res.status(404).json({ message: "الفرع غير موجود" });
      }
      
      // ربط الموظف بالفرع
      const updatedEmployee = storage.updateEmployee(employeeId, { branchId });
      console.log(`✅ تم ربط الموظف ${employee.name} (ID: ${employeeId}) بالفرع ${branch.name} (ID: ${branchId})`);
      
      res.json({ 
        success: true, 
        message: `تم ربط الموظف ${employee.name} بالفرع ${branch.name}`,
        employee: updatedEmployee 
      });
    } catch (error: any) {
      console.error("Error linking employee to branch:", error);
      res.status(500).json({ message: "Failed to link employee", error: error.message });
    }
  });

  // فك ربط موظف من الفرع (جعل branchId = null)
  app.post("/api/branches/:branchId/unlink-employee", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { employeeId } = req.body;
      
      // التحقق من وجود الموظف
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "الموظف غير موجود" });
      }
      
      // التحقق من أن الموظف ينتمي لهذا الفرع
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "الموظف لا ينتمي لهذا الفرع" });
      }
      
      // فك ربط الموظف من الفرع
      const updatedEmployee = storage.updateEmployee(employeeId, { branchId: null });
      console.log(`✅ تم فك ربط الموظف ${employee.name} (ID: ${employeeId}) من الفرع`);
      
      res.json({ 
        success: true, 
        message: `تم فك ربط الموظف ${employee.name} من الفرع`,
        employee: updatedEmployee 
      });
    } catch (error: any) {
      console.error("Error unlinking employee from branch:", error);
      res.status(500).json({ message: "Failed to unlink employee", error: error.message });
    }
  });

  app.get("/api/branches/:branchId/employees/:employeeId", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error: any) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee", error: error.message });
    }
  });

  app.get("/api/branches/:branchId/employees/:employeeId/salaries", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const allSalaries = await storage.getAllSalaries();
      const employeeSalaries = allSalaries.filter((s: any) => s.employeeId === employeeId);
      res.json(employeeSalaries);
    } catch (error: any) {
      console.error("Error fetching employee salaries:", error);
      res.status(500).json({ message: "Failed to fetch salaries", error: error.message });
    }
  });

  app.get("/api/branches/:branchId/employees/:employeeId/allowances", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      // For now, return empty array as allowances system needs to be implemented
      res.json([]);
    } catch (error: any) {
      console.error("Error fetching employee allowances:", error);
      res.status(500).json({ message: "Failed to fetch allowances", error: error.message });
    }
  });

  app.get("/api/branches/:branchId/employees/:employeeId/deductions", async (req: Request, res: Response) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const allDeductions = await storage.getAllDeductions();
      const employeeDeductions = allDeductions.filter((d: any) => d.employeeId === employeeId);
      res.json(employeeDeductions);
    } catch (error: any) {
      console.error("Error fetching employee deductions:", error);
      res.status(500).json({ message: "Failed to fetch deductions", error: error.message });
    }
  });

  // Branch Employee Debts endpoints - ديون موظفي الفرع فقط
  app.get("/api/branches/:branchId/employee-debts", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const debts = await storage.getAllDebts();
      const employees = await storage.getAllEmployees();
      
      // فلترة الموظفين حسب الفرع
      const branchEmployees = employees.filter((emp: any) => emp.branchId === branchId);
      const branchEmployeeIds = branchEmployees.map(emp => emp.id);
      
      // فلترة الديون للموظفين في هذا الفرع
      const employeeDebts = debts.filter(debt => 
        debt.debtorType === 'employee' && branchEmployeeIds.includes(debt.debtorId)
      );
      
      // ربط بيانات الموظفين مع الديون
      const debtsWithEmployeeNames = employeeDebts.map(debt => {
        const employee = employees.find(emp => emp.id === debt.debtorId);
        return {
          ...debt,
          employeeName: employee ? employee.name : 'موظف غير معروف'
        };
      });
      
      res.json(debtsWithEmployeeNames);
    } catch (error: any) {
      console.error("Error fetching branch employee debts:", error);
      res.status(500).json({ message: "Failed to fetch employee debts", error: error.message });
    }
  });

  app.post("/api/branches/:branchId/employee-debts", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { debtorId, employeeId, type, amount, debtItems, description, dueDate, notes, installments, monthlyDeduction, remainingAmount, status } = req.body;
      
      const empId = debtorId || employeeId;
      const employee = await storage.getEmployee(empId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      // التحقق من أن الموظف ينتمي للفرع
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }

      const debtData = {
        debtorType: 'employee' as const,
        debtorId: empId,
        debtorName: employee.name,
        type: type || 'قرض',
        amount: amount,
        remainingAmount: remainingAmount || amount,
        debtItems: debtItems || [],
        description: description,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        status: status || 'active' as const,
        notes: notes || '',
        installments: installments || 1,
        monthlyDeduction: monthlyDeduction || '0',
        currency: 'SAR'
      };

      const debt = storage.createDebt(debtData);
      
      const debtWithEmployeeName = {
        ...debt,
        employeeName: employee.name
      };
      
      res.status(201).json(debtWithEmployeeName);
    } catch (error: any) {
      console.error("Error creating branch employee debt:", error);
      res.status(500).json({ message: "Failed to create employee debt", error: error.message });
    }
  });

  app.put("/api/branches/:branchId/employee-debts/:debtId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const debtId = parseInt(req.params.debtId);
      const updateData = req.body;
      
      // الحصول على الدين الحالي
      const currentDebt = storage.getAllDebts().find(d => d.id === debtId);
      if (!currentDebt) {
        return res.status(404).json({ message: "Debt not found" });
      }
      
      // التحقق من أن الدين ينتمي لموظف في هذا الفرع
      const employee = await storage.getEmployee(currentDebt.debtorId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Debt does not belong to this branch" });
      }

      const debt = storage.updateDebt(debtId, updateData);
      if (!debt) {
        return res.status(404).json({ message: "Debt not found" });
      }

      const debtWithEmployeeName = {
        ...debt,
        employeeName: employee.name
      };
      
      res.json(debtWithEmployeeName);
    } catch (error: any) {
      console.error("Error updating branch employee debt:", error);
      res.status(500).json({ message: "Failed to update employee debt", error: error.message });
    }
  });

  app.delete("/api/branches/:branchId/employee-debts/:debtId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const debtId = parseInt(req.params.debtId);
      
      // الحصول على الدين الحالي
      const currentDebt = storage.getAllDebts().find(d => d.id === debtId);
      if (!currentDebt) {
        return res.status(404).json({ message: "Debt not found" });
      }
      
      // التحقق من أن الدين ينتمي لموظف في هذا الفرع
      const employee = await storage.getEmployee(currentDebt.debtorId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Debt does not belong to this branch" });
      }
      
      const success = storage.deleteDebt(debtId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete debt" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting branch employee debt:", error);
      res.status(500).json({ message: "Failed to delete employee debt", error: error.message });
    }
  });

  // Branch Salaries endpoints - رواتب موظفي الفرع فقط
  app.get("/api/branches/:branchId/salaries", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const allSalaries = await storage.getAllSalaries();
      const employees = await storage.getAllEmployees();
      
      // فلترة الموظفين حسب الفرع
      const branchEmployees = employees.filter((emp: any) => emp.branchId === branchId);
      const branchEmployeeIds = branchEmployees.map(emp => emp.id);
      
      // فلترة الرواتب للموظفين في هذا الفرع
      const branchSalaries = allSalaries.filter((salary: any) => 
        branchEmployeeIds.includes(salary.employeeId)
      );
      
      res.json(branchSalaries);
    } catch (error: any) {
      console.error("Error fetching branch salaries:", error);
      res.status(500).json({ message: "Failed to fetch salaries", error: error.message });
    }
  });

  app.post("/api/branches/:branchId/salaries", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { employeeId } = req.body;
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      if (employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }
      
      const salary = storage.createSalary(req.body);
      res.status(201).json(salary);
    } catch (error: any) {
      console.error("Error creating branch salary:", error);
      res.status(500).json({ message: "Failed to create salary", error: error.message });
    }
  });

  app.put("/api/branches/:branchId/salaries/:salaryId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const salaryId = parseInt(req.params.salaryId);
      
      // الحصول على الراتب الحالي
      const currentSalary = storage.getAllSalaries().find(s => s.id === salaryId);
      if (!currentSalary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(currentSalary.employeeId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Salary does not belong to this branch" });
      }
      
      const salary = storage.updateSalary(salaryId, req.body);
      if (!salary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      res.json(salary);
    } catch (error: any) {
      console.error("Error updating branch salary:", error);
      res.status(500).json({ message: "Failed to update salary", error: error.message });
    }
  });

  app.delete("/api/branches/:branchId/salaries/:salaryId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const salaryId = parseInt(req.params.salaryId);
      
      // الحصول على الراتب الحالي
      const currentSalary = storage.getAllSalaries().find(s => s.id === salaryId);
      if (!currentSalary) {
        return res.status(404).json({ message: "Salary not found" });
      }
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(currentSalary.employeeId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Salary does not belong to this branch" });
      }
      
      const success = storage.deleteSalary(salaryId);
      if (!success) {
        return res.status(404).json({ message: "Failed to delete salary" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting branch salary:", error);
      res.status(500).json({ message: "Failed to delete salary", error: error.message });
    }
  });

  // Branch Deductions endpoints - خصومات موظفي الفرع فقط
  app.get("/api/branches/:branchId/deductions", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const allDeductions = await storage.getAllDeductions();
      const employees = await storage.getAllEmployees();
      
      // فلترة الموظفين حسب الفرع
      const branchEmployees = employees.filter((emp: any) => emp.branchId === branchId);
      const branchEmployeeIds = branchEmployees.map(emp => emp.id);
      
      // فلترة الخصومات للموظفين في هذا الفرع
      const branchDeductions = allDeductions.filter((deduction: any) => 
        branchEmployeeIds.includes(deduction.employeeId)
      );
      
      res.json(branchDeductions);
    } catch (error: any) {
      console.error("Error fetching branch deductions:", error);
      res.status(500).json({ message: "Failed to fetch deductions", error: error.message });
    }
  });

  app.post("/api/branches/:branchId/deductions", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { employeeId, deductionType, amount, targetDebtId, description, deductionDate, notes, status } = req.body;
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(employeeId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }
      
      const deductionAmount = parseFloat(amount);
      let deductionDetails: any = {};
      
      // إذا كان النوع "تحويل من الراتب إلى دين"، قم بإنشاء دين جديد
      if (deductionType === 'salary_to_debt') {
        const newDebt = storage.createDebt({
          debtorId: employeeId,
          debtorType: 'employee',
          debtType: 'قرض',
          description: `تحويل من الراتب - ${description}`,
          amount: deductionAmount.toString(),
          remainingAmount: deductionAmount.toString(),
          status: 'active',
          debtItems: [{
            reason: description || 'تحويل من الراتب',
            amount: deductionAmount.toString(),
            dueDate: deductionDate || new Date().toISOString()
          }],
          notes: notes || '',
        });
        console.log(`✅ تم إنشاء دين جديد من تحويل الراتب:`, newDebt);
      }
      
      // إذا كان النوع "خصم من الدين"، قم بتحديث الدين
      if (deductionType === 'debt_deduction' && targetDebtId) {
        const debt = storage.getDebt(targetDebtId);
        if (debt) {
          const currentRemaining = parseFloat(debt.remainingAmount || debt.amount || '0');
          const newRemaining = Math.max(0, currentRemaining - deductionAmount);
          storage.updateDebt(targetDebtId, {
            remainingAmount: newRemaining.toString(),
            status: newRemaining === 0 ? 'paid' : 'active'
          });
          console.log(`✅ تم خصم ${deductionAmount} من الدين ${targetDebtId}`);
        }
      }
      
      // إذا كان النوع "خصم ذكي"، خصم من الدين أولاً ثم من الراتب
      if (deductionType === 'smart_deduction') {
        const allDebts = storage.getAllDebts();
        const employeeDebts = allDebts.filter((debt: any) => 
          debt.debtorId === employeeId && 
          debt.debtorType === 'employee' && 
          debt.status === 'active' &&
          parseFloat(debt.remainingAmount || debt.amount || '0') > 0
        );
        
        let remainingDeduction = deductionAmount;
        let deductedFromDebt = 0;
        let deductedFromSalary = 0;
        const affectedDebts: any[] = [];
        
        // خصم من الديون أولاً
        for (const debt of employeeDebts) {
          if (remainingDeduction <= 0) break;
          
          const debtRemaining = parseFloat(debt.remainingAmount || debt.amount || '0');
          const deductFromThisDebt = Math.min(remainingDeduction, debtRemaining);
          const newDebtRemaining = debtRemaining - deductFromThisDebt;
          
          storage.updateDebt(debt.id, {
            remainingAmount: newDebtRemaining.toString(),
            status: newDebtRemaining === 0 ? 'paid' : 'active'
          });
          
          affectedDebts.push({
            debtId: debt.id,
            debtDescription: debt.description || 'دين',
            deductedAmount: deductFromThisDebt,
            remainingAfter: newDebtRemaining
          });
          
          deductedFromDebt += deductFromThisDebt;
          remainingDeduction -= deductFromThisDebt;
          
          console.log(`✅ خصم ${deductFromThisDebt} من الدين ${debt.id}, متبقي في الدين: ${newDebtRemaining}`);
        }
        
        // إذا تبقى مبلغ، يُخصم من الراتب
        if (remainingDeduction > 0) {
          deductedFromSalary = remainingDeduction;
          console.log(`✅ خصم ${deductedFromSalary} من الراتب`);
        }
        
        deductionDetails = {
          smartDeduction: true,
          totalAmount: deductionAmount,
          deductedFromDebt,
          deductedFromSalary,
          affectedDebts
        };
        
        console.log(`✅ خصم ذكي: إجمالي ${deductionAmount} - من الديون: ${deductedFromDebt} - من الراتب: ${deductedFromSalary}`);
      }
      
      // إنشاء الخصم
      const deduction = storage.createDeduction({
        employeeId,
        deductionType,
        amount,
        targetDebtId,
        description,
        deductionDate,
        notes,
        status: status || 'active', // ✅ تمرير status مع default 'active'
        ...deductionDetails
      });
      
      res.status(201).json(deduction);
    } catch (error: any) {
      console.error("Error creating branch deduction:", error);
      res.status(500).json({ message: "Failed to create deduction", error: error.message });
    }
  });

  app.delete("/api/branches/:branchId/deductions/:deductionId", async (req: Request, res: Response) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const deductionId = parseInt(req.params.deductionId);
      
      // جلب الخصم للتحقق من وجوده والحصول على تفاصيله
      const deduction = storage.getDeduction(deductionId);
      
      if (!deduction) {
        return res.status(404).json({ message: "Deduction not found" });
      }
      
      // التحقق من أن الموظف ينتمي للفرع
      const employee = await storage.getEmployee(deduction.employeeId);
      if (!employee || employee.branchId !== branchId) {
        return res.status(403).json({ message: "Employee does not belong to this branch" });
      }
      
      // حذف الخصم
      const success = storage.deleteDeduction(deductionId);
      
      if (!success) {
        return res.status(404).json({ message: "Failed to delete deduction" });
      }
      
      res.json({ success: true, message: "Deduction deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting branch deduction:", error);
      res.status(500).json({ message: "Failed to delete deduction", error: error.message });
    }
  });

  // Employee Debts for Deductions
  app.get("/api/employee-debts-for-deductions", async (req: Request, res: Response) => {
    try {
      const allDebts = await storage.getAllEmployeeDebts();
      // Filter only active debts with remaining amounts > 0
      const activeDebts = allDebts.filter(debt => 
        debt.status === 'active' && 
        parseFloat(debt.remainingAmount || '0') > 0
      );
      res.json(activeDebts);
    } catch (error: any) {
      console.error("Error fetching employee debts for deductions:", error);
      res.status(500).json({ message: "Failed to fetch employee debts", error: error.message });
    }
  });

  // مسارات منفصلة لديون الموظفين
  app.get("/api/employee-debts", (req, res) => {
    const employeeDebts = storage.getAllEmployeeDebts();
    res.json(employeeDebts);
  });

  // مسارات منفصلة لخصومات الموظفين  
  app.get("/api/employee-deductions", (req, res) => {
    const deductions = storage.getAllDeductions();
    res.json(deductions);
  });

  // مسار للحصول على راتب موظف محدد
  app.get("/api/employees/:id/salary", (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const salaries = storage.getAllSalaries();
      const employeeSalary = salaries.find(salary => salary.employeeId === employeeId);
      
      if (!employeeSalary) {
        return res.status(404).json({ error: "راتب الموظف غير موجود" });
      }
      
      res.json(employeeSalary);
    } catch (error) {
      console.error("Error fetching employee salary:", error);
      res.status(500).json({ error: "Failed to fetch employee salary" });
    }
  });

  // Daily Expenses Routes
  app.get('/api/daily-expenses', async (req, res) => {
    try {
      const expenses = storage.getAllDailyExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'فشل في جلب المصروفات اليومية' });
    }
  });

  app.get('/api/daily-expenses/branch/:branchId', async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const expenses = storage.getAllDailyExpenses().filter(expense => expense.branchId === branchId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: 'فشل في جلب المصروفات اليومية للفرع' });
    }
  });

  app.post('/api/daily-expenses', async (req, res) => {
    try {
      const expense = storage.createDailyExpense(req.body);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: 'فشل في إنشاء المصروف اليومي' });
    }
  });

  app.patch('/api/daily-expenses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = storage.updateDailyExpense(id, req.body);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: 'فشل في تحديث المصروف اليومي' });
    }
  });

  app.delete('/api/daily-expenses/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      storage.deleteDailyExpense(id);
      res.json({ message: 'تم حذف المصروف اليومي بنجاح' });
    } catch (error) {
      res.status(400).json({ error: 'فشل في حذف المصروف اليومي' });
    }
  });

  // Financial Reports API
  app.get('/api/financial-reports', async (req, res) => {
    try {
      const sales = storage.getAllSales();
      const purchases = storage.getAllPurchases();
      const dailyExpenses = storage.getAllDailyExpenses();
      const clients = storage.getAllClients();
      const suppliers = storage.getAllSuppliers();

      const totalSalesAmount = sales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      const totalPurchasesAmount = purchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      const totalExpensesAmount = dailyExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
      
      const netProfit = totalSalesAmount - totalPurchasesAmount - totalExpensesAmount;
      const profitMargin = totalSalesAmount > 0 ? ((netProfit / totalSalesAmount) * 100) : 0;

      // Monthly breakdown
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthSales = sales.filter(sale => new Date(sale.date).getMonth() === i);
        const monthPurchases = purchases.filter(purchase => new Date(purchase.date).getMonth() === i);
        const monthExpenses = dailyExpenses.filter(expense => new Date(expense.date).getMonth() === i);
        
        return {
          month: new Date(2024, i).toLocaleDateString('ar-SA', { month: 'long' }),
          sales: monthSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0),
          purchases: monthPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0),
          expenses: monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0)
        };
      });

      // Expenses by category
      const expensesByCategory = dailyExpenses.reduce((acc, expense) => {
        const category = expense.category || 'غير محدد';
        acc[category] = (acc[category] || 0) + parseFloat(expense.amount || '0');
        return acc;
      }, {});

      res.json({
        summary: {
          totalSales: totalSalesAmount,
          totalPurchases: totalPurchasesAmount,
          totalExpenses: totalExpensesAmount,
          netProfit,
          profitMargin,
          totalClients: clients.length,
          totalSuppliers: suppliers.length
        },
        monthlyData,
        expensesByCategory,
        recentExpenses: dailyExpenses.slice(-10).reverse()
      });
    } catch (error) {
      console.error('Error generating financial reports:', error);
      res.status(500).json({ error: 'فشل في إنشاء التقارير المالية' });
    }
  });

  // Branch Statistics Endpoint - يدعم الدخول المباشر بدون تسجيل
  app.get('/api/branches/:branchId/stats', async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const userId = req.session?.userId;
      
      // جلب معلومات الفرع أولاً للحصول على user_id الخاص به
      const branchResult = await pool.query('SELECT * FROM branches WHERE id = $1', [branchId]);
      if (branchResult.rows.length === 0) {
        return res.status(404).json({ error: 'الفرع غير موجود' });
      }
      
      const branchOwnerId = branchResult.rows[0].user_id;
      // استخدام userId من الجلسة إذا موجود، أو من الفرع للدخول المباشر
      const effectiveUserId = userId || branchOwnerId;
      
      if (!effectiveUserId) {
        return res.status(401).json({ error: 'غير مصرح' });
      }
      
      // Get all data from PostgreSQL - filtered by user_id for multi-tenant isolation
      const salesResult = await pool.query(
        'SELECT * FROM sales WHERE user_id = $1 AND (branch_id = $2 OR branch_id IS NULL)', 
        [effectiveUserId, branchId]
      );
      const purchasesResult = await pool.query(
        'SELECT * FROM purchases WHERE user_id = $1 AND (branch_id = $2 OR branch_id IS NULL)', 
        [effectiveUserId, branchId]
      );
      const productsResult = await pool.query(
        'SELECT * FROM products WHERE user_id = $1 AND (branch_id = $2 OR branch_id IS NULL)', 
        [effectiveUserId, branchId]
      );
      // Filter clients by user_id AND branch_id for proper branch isolation
      const clientsResult = await pool.query(
        'SELECT * FROM clients WHERE user_id = $1 AND branch_id = $2', 
        [effectiveUserId, branchId]
      );
      const suppliersResult = await pool.query(
        'SELECT * FROM suppliers WHERE user_id = $1 AND branch_id = $2', 
        [effectiveUserId, branchId]
      );
      // Filter employees by branch_id
      const employeesResult = await pool.query('SELECT * FROM employees WHERE branch_id = $1', [branchId]);
      const salesReturnsResult = await pool.query(
        'SELECT * FROM sales_returns WHERE user_id = $1', 
        [effectiveUserId]
      );
      const purchaseReturnsResult = await pool.query(
        'SELECT * FROM purchase_returns WHERE user_id = $1', 
        [effectiveUserId]
      );
      const dailyExpensesResult = { rows: [] };
      const employeeDebtsResult = { rows: [] };
      
      // Data is already filtered in SQL queries above
      const branchSales = salesResult.rows;
      const branchPurchases = purchasesResult.rows;
      const branchProducts = productsResult.rows;
      const clients = clientsResult.rows;
      const suppliers = suppliersResult.rows;
      const branchEmployees = employeesResult.rows;
      const branchSalesReturns = salesReturnsResult.rows;
      const branchPurchaseReturns = purchaseReturnsResult.rows;
      const branchExpenses = dailyExpensesResult.rows;
      const branchEmployeeDebts = employeeDebtsResult.rows;
      
      // Calculate date ranges
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Calculate totals
      const todaySales = branchSales.filter(s => {
        const saleDate = new Date(s.date);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      });
      
      const weekSales = branchSales.filter(s => new Date(s.date) >= startOfWeek);
      const monthSales = branchSales.filter(s => new Date(s.date) >= startOfMonth);
      
      const todayPurchases = branchPurchases.filter(p => {
        const purchaseDate = new Date(p.date);
        purchaseDate.setHours(0, 0, 0, 0);
        return purchaseDate.getTime() === today.getTime();
      });
      
      const weekPurchases = branchPurchases.filter(p => new Date(p.date) >= startOfWeek);
      const monthPurchases = branchPurchases.filter(p => new Date(p.date) >= startOfMonth);
      
      // Calculate totals
      const totalSalesToday = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      const totalSalesWeek = weekSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      const totalSalesMonth = monthSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      const totalSalesAll = branchSales.reduce((sum, sale) => sum + parseFloat(sale.total || '0'), 0);
      
      const totalPurchasesToday = todayPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      const totalPurchasesWeek = weekPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      const totalPurchasesMonth = monthPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      const totalPurchasesAll = branchPurchases.reduce((sum, purchase) => sum + parseFloat(purchase.total || '0'), 0);
      
      const totalSalesReturns = branchSalesReturns.reduce((sum, sr) => sum + parseFloat(sr.totalAmount || '0'), 0);
      const totalPurchaseReturns = branchPurchaseReturns.reduce((sum, pr) => sum + parseFloat(pr.totalAmount || '0'), 0);
      
      const totalExpenses = branchExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
      
      // Inventory stats
      const lowStockProducts = branchProducts.filter(p => parseFloat(p.quantity || '0') < 10);
      const outOfStockProducts = branchProducts.filter(p => parseFloat(p.quantity || '0') <= 0);
      const totalInventoryValue = branchProducts.reduce((sum, p) => 
        sum + (parseFloat(p.quantity || '0') * parseFloat(p.salePrice || '0')), 0
      );
      
      // Employee debts
      const totalActiveDebts = branchEmployeeDebts
        .filter(debt => debt.status === 'active')
        .reduce((sum, debt) => sum + parseFloat(debt.remainingAmount || '0'), 0);
      
      // Net profit
      const netProfit = totalSalesAll - totalPurchasesAll - totalExpenses;
      const profitMargin = totalSalesAll > 0 ? ((netProfit / totalSalesAll) * 100).toFixed(2) : '0';
      
      // Top selling products (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const recentSales = branchSales.filter(s => new Date(s.date) >= last30Days);
      
      const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
      recentSales.forEach(sale => {
        if (sale.items && Array.isArray(sale.items)) {
          sale.items.forEach((item: any) => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                name: item.productName || 'غير معروف',
                quantity: 0,
                revenue: 0
              };
            }
            productSales[item.productId].quantity += parseFloat(item.quantity || '0');
            productSales[item.productId].revenue += parseFloat(item.total || '0');
          });
        }
      });
      
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      res.json({
        // Overview stats
        totalClients: clients.length,
        totalSuppliers: suppliers.length,
        totalProducts: branchProducts.length,
        totalEmployees: branchEmployees.length,
        
        // Sales stats
        totalSalesToday,
        totalSalesWeek,
        totalSalesMonth,
        totalSalesAll,
        salesCount: branchSales.length,
        todaySalesCount: todaySales.length,
        
        // Purchase stats
        totalPurchasesToday,
        totalPurchasesWeek,
        totalPurchasesMonth,
        totalPurchasesAll,
        purchasesCount: branchPurchases.length,
        
        // Returns
        totalSalesReturns,
        totalPurchaseReturns,
        salesReturnsCount: branchSalesReturns.length,
        purchaseReturnsCount: branchPurchaseReturns.length,
        
        // Inventory
        lowStockProducts: lowStockProducts.length,
        outOfStockProducts: outOfStockProducts.length,
        totalInventoryValue,
        
        // Financial
        totalExpenses,
        netProfit,
        profitMargin,
        
        // Employee debts
        totalActiveDebts,
        activeDebtsCount: branchEmployeeDebts.filter(d => d.status === 'active').length,
        
        // Top products
        topProducts,
        
        // Growth metrics (comparing this month to last month)
        salesGrowth: calculateGrowth(monthSales, branchSales, 30),
        purchasesGrowth: calculateGrowth(monthPurchases, branchPurchases, 30)
      });
    } catch (error) {
      console.error('Error fetching branch stats:', error);
      res.status(500).json({ error: 'فشل في جلب إحصائيات الفرع' });
    }
  });
  
  // Helper function to calculate growth
  function calculateGrowth(currentPeriod: any[], allData: any[], days: number) {
    const now = new Date();
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - days);
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(periodStart.getDate() - days);
    
    const currentTotal = currentPeriod.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
    const previousPeriod = allData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= previousPeriodStart && itemDate < periodStart;
    });
    const previousTotal = previousPeriod.reduce((sum, item) => sum + parseFloat(item.total || '0'), 0);
    
    if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
    return (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1);
  }

  // Branch Receipt Vouchers - سندات القبض
  app.get('/api/branches/:branchId/receipt-vouchers', (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const vouchers = storage.getAllBranchReceiptVouchers(branchId);
      res.json(vouchers);
    } catch (error) {
      res.status(500).json({ error: 'فشل في جلب سندات القبض' });
    }
  });

  app.get('/api/branches/:branchId/receipt-vouchers/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const voucher = storage.getBranchReceiptVoucher(id);
      if (voucher) {
        res.json(voucher);
      } else {
        res.status(404).json({ error: 'سند القبض غير موجود' });
      }
    } catch (error) {
      res.status(500).json({ error: 'فشل في جلب سند القبض' });
    }
  });

  app.post('/api/branches/:branchId/receipt-vouchers', (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const voucherData = { ...req.body, branchId };
      const newVoucher = storage.createBranchReceiptVoucher(voucherData);
      res.status(201).json(newVoucher);
    } catch (error) {
      res.status(500).json({ error: 'فشل في إنشاء سند القبض' });
    }
  });

  app.patch('/api/branches/:branchId/receipt-vouchers/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = storage.updateBranchReceiptVoucher(id, req.body);
      if (updated) {
        res.json(updated);
      } else {
        res.status(404).json({ error: 'سند القبض غير موجود' });
      }
    } catch (error) {
      res.status(500).json({ error: 'فشل في تحديث سند القبض' });
    }
  });

  app.delete('/api/branches/:branchId/receipt-vouchers/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = storage.deleteBranchReceiptVoucher(id);
      if (deleted) {
        res.json({ message: 'تم حذف سند القبض بنجاح' });
      } else {
        res.status(404).json({ error: 'سند القبض غير موجود' });
      }
    } catch (error) {
      res.status(500).json({ error: 'فشل في حذف سند القبض' });
    }
  });

  // Branch Permissions Endpoints
  app.get('/api/branches/:branchId/permissions', async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const result = await pool.query(
        'SELECT * FROM branch_permissions WHERE branch_id = $1',
        [branchId]
      );
      res.json(result.rows.map(row => ({
        sectionId: row.section_id,
        subsectionId: row.subsection_id,
        isEnabled: row.is_enabled,
        canView: row.can_view,
        canAdd: row.can_add,
        canEdit: row.can_edit,
        canDelete: row.can_delete,
      })));
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'فشل في جلب الصلاحيات' });
    }
  });

  app.post('/api/branches/:branchId/permissions', async (req, res) => {
    try {
      const branchId = parseInt(req.params.branchId);
      const { permissions } = req.body;

      // حذف الصلاحيات الحالية
      await pool.query('DELETE FROM branch_permissions WHERE branch_id = $1', [branchId]);

      // إدخال الصلاحيات الجديدة
      for (const perm of permissions) {
        await pool.query(
          `INSERT INTO branch_permissions 
           (branch_id, section_id, subsection_id, is_enabled, can_view, can_add, can_edit, can_delete, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            branchId,
            perm.sectionId,
            perm.subsectionId,
            perm.isEnabled,
            perm.canView,
            perm.canAdd,
            perm.canEdit,
            perm.canDelete,
          ]
        );
      }

      res.json({ message: 'تم حفظ الصلاحيات بنجاح' });
    } catch (error) {
      console.error('Error saving permissions:', error);
      res.status(500).json({ error: 'فشل في حفظ الصلاحيات' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}