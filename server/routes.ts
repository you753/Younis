import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
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
  insertProductCategorySchema
} from "@shared/schema";
import { uploadMiddleware, transcribeAudio } from "./voice";
import { handleAIChat } from "./ai-chat";
import multer from 'multer';
import path from 'path';

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

      // البحث عن المستخدم
      const user = await storage.getUserByUsername(username.trim());
      console.log(`المستخدم الموجود:`, user);
      
      if (!user) {
        console.log(`المستخدم غير موجود: ${username}`);
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // التحقق من كلمة المرور (مبسط للتطوير)
      console.log(`مقارنة كلمة المرور: "${user.password}" === "${password}"`);
      if (user.password !== password) {
        console.log(`كلمة المرور غير صحيحة`);
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // حفظ المستخدم في الجلسة
      const authReq = req as AuthenticatedRequest;
      authReq.session.userId = user.id;
      console.log(`تم حفظ المستخدم في الجلسة: ${user.id}`);

      // إزالة كلمة المرور من الاستجابة
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
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

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "مستخدم غير موجود" });
      }

      // إزالة كلمة المرور من الاستجابة
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
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
      // جلب المستخدم من قاعدة البيانات
      const currentUser = await storage.getUser(1); // ID المستخدم الحالي
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // إزالة كلمة المرور من الاستجابة
      const { password, ...safeUser } = currentUser;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
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

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      const { password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (deleted) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
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
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Invalid client data" });
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
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
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
      const validatedData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(validatedData);
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ message: "Invalid sale data" });
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
      const purchase = await storage.createPurchase(validatedData);
      res.status(201).json(purchase);
    } catch (error) {
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
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
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
      const validatedData = insertDeductionSchema.parse(req.body);
      const deduction = await storage.createDeduction(validatedData);
      res.status(201).json(deduction);
    } catch (error) {
      res.status(400).json({ message: "Invalid deduction data" });
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
      const validatedData = insertSalarySchema.parse(req.body);
      const salary = await storage.createSalary(validatedData);
      res.status(201).json(salary);
    } catch (error) {
      res.status(400).json({ message: "Invalid salary data" });
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
      const salesReturn = await storage.createSalesReturn(validatedData);
      
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
      const purchaseReturn = await storage.createPurchaseReturn(validatedData);
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
      
      const purchaseReturn = await storage.updatePurchaseReturn(id, updateData);
      
      if (!purchaseReturn) {
        return res.status(404).json({ error: 'Purchase return not found' });
      }
      
      res.json(purchaseReturn);
    } catch (error) {
      console.error('Error updating purchase return:', error);
      res.status(500).json({ error: 'Failed to update purchase return' });
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

  // Voice Assistant - Audio transcription and analysis
  app.post("/api/voice/transcribe", uploadMiddleware, transcribeAudio);

  // AI Chat
  app.post("/api/ai/chat", handleAIChat);

  const httpServer = createServer(app);
  return httpServer;
}
