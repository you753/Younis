import type { Express } from "express";
import { createServer, type Server } from "http";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
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

  // Voice Assistant - Audio transcription and analysis
  app.post("/api/voice/transcribe", uploadMiddleware, transcribeAudio);

  // AI Chat
  app.post("/api/ai/chat", handleAIChat);

  const httpServer = createServer(app);
  return httpServer;
}
