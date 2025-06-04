import { 
  users, suppliers, clients, products, sales, purchases, employees, deductions, salaries, productCategories, quotes, salesReturns, purchaseReturns,
  type User, type InsertUser,
  type Supplier, type InsertSupplier,
  type Client, type InsertClient,
  type Product, type InsertProduct,
  type Sale, type InsertSale,
  type Purchase, type InsertPurchase,
  type Employee, type InsertEmployee,
  type Deduction, type InsertDeduction,
  type Salary, type InsertSalary,
  type ProductCategory, type InsertProductCategory,
  type Quote, type InsertQuote,
  type SalesReturn, type InsertSalesReturn,
  type PurchaseReturn, type InsertPurchaseReturn
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Suppliers
  getSupplier(id: number): Promise<Supplier | undefined>;
  getAllSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Sales
  getSale(id: number): Promise<Sale | undefined>;
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;

  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
  getAllPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;

  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;

  // Deductions
  getDeduction(id: number): Promise<Deduction | undefined>;
  getAllDeductions(): Promise<Deduction[]>;
  createDeduction(deduction: InsertDeduction): Promise<Deduction>;
  updateDeduction(id: number, deduction: Partial<InsertDeduction>): Promise<Deduction | undefined>;
  deleteDeduction(id: number): Promise<boolean>;

  // Salaries
  getSalary(id: number): Promise<Salary | undefined>;
  getAllSalaries(): Promise<Salary[]>;
  createSalary(salary: InsertSalary): Promise<Salary>;
  updateSalary(id: number, salary: Partial<InsertSalary>): Promise<Salary | undefined>;
  deleteSalary(id: number): Promise<boolean>;

  // Product Categories
  getProductCategory(id: number): Promise<ProductCategory | undefined>;
  getAllProductCategories(): Promise<ProductCategory[]>;
  createProductCategory(category: InsertProductCategory): Promise<ProductCategory>;
  updateProductCategory(id: number, category: Partial<InsertProductCategory>): Promise<ProductCategory | undefined>;
  deleteProductCategory(id: number): Promise<boolean>;

  // Quotes
  getQuote(id: number): Promise<Quote | undefined>;
  getAllQuotes(): Promise<Quote[]>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;

  // Sales Returns
  getSalesReturn(id: number): Promise<SalesReturn | undefined>;
  getAllSalesReturns(): Promise<SalesReturn[]>;
  createSalesReturn(salesReturn: InsertSalesReturn): Promise<SalesReturn>;
  updateSalesReturn(id: number, salesReturn: Partial<InsertSalesReturn>): Promise<SalesReturn | undefined>;
  deleteSalesReturn(id: number): Promise<boolean>;

  // Purchase Returns
  getPurchaseReturn(id: number): Promise<PurchaseReturn | undefined>;
  getAllPurchaseReturns(): Promise<PurchaseReturn[]>;
  createPurchaseReturn(purchaseReturn: InsertPurchaseReturn): Promise<PurchaseReturn>;
  updatePurchaseReturn(id: number, purchaseReturn: Partial<InsertPurchaseReturn>): Promise<PurchaseReturn | undefined>;
  deletePurchaseReturn(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Suppliers
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const [supplier] = await db
      .insert(suppliers)
      .values(insertSupplier)
      .returning();
    return supplier;
  }

  async updateSupplier(id: number, updateData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [supplier] = await db
      .update(suppliers)
      .set(updateData)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier || undefined;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Sales
  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale || undefined;
  }

  async getAllSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const [sale] = await db
      .insert(sales)
      .values(insertSale)
      .returning();
    return sale;
  }

  // Purchases
  async getPurchase(id: number): Promise<Purchase | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    return purchase || undefined;
  }

  async getAllPurchases(): Promise<Purchase[]> {
    return await db.select().from(purchases);
  }

  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();
    return employee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Deductions
  async getDeduction(id: number): Promise<Deduction | undefined> {
    const [deduction] = await db.select().from(deductions).where(eq(deductions.id, id));
    return deduction || undefined;
  }

  async getAllDeductions(): Promise<Deduction[]> {
    return await db.select().from(deductions);
  }

  async createDeduction(insertDeduction: InsertDeduction): Promise<Deduction> {
    const [deduction] = await db
      .insert(deductions)
      .values(insertDeduction)
      .returning();
    return deduction;
  }

  async updateDeduction(id: number, updateData: Partial<InsertDeduction>): Promise<Deduction | undefined> {
    const [deduction] = await db
      .update(deductions)
      .set(updateData)
      .where(eq(deductions.id, id))
      .returning();
    return deduction || undefined;
  }

  async deleteDeduction(id: number): Promise<boolean> {
    const result = await db.delete(deductions).where(eq(deductions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Salaries
  async getSalary(id: number): Promise<Salary | undefined> {
    const [salary] = await db.select().from(salaries).where(eq(salaries.id, id));
    return salary || undefined;
  }

  async getAllSalaries(): Promise<Salary[]> {
    return await db.select().from(salaries);
  }

  async createSalary(insertSalary: InsertSalary): Promise<Salary> {
    const [salary] = await db
      .insert(salaries)
      .values(insertSalary)
      .returning();
    return salary;
  }

  async updateSalary(id: number, updateData: Partial<InsertSalary>): Promise<Salary | undefined> {
    const [salary] = await db
      .update(salaries)
      .set(updateData)
      .where(eq(salaries.id, id))
      .returning();
    return salary || undefined;
  }

  async deleteSalary(id: number): Promise<boolean> {
    const result = await db.delete(salaries).where(eq(salaries.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product Categories
  async getProductCategory(id: number): Promise<ProductCategory | undefined> {
    const [category] = await db.select().from(productCategories).where(eq(productCategories.id, id));
    return category || undefined;
  }

  async getAllProductCategories(): Promise<ProductCategory[]> {
    return await db.select().from(productCategories);
  }

  async createProductCategory(insertCategory: InsertProductCategory): Promise<ProductCategory> {
    const [category] = await db
      .insert(productCategories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateProductCategory(id: number, updateData: Partial<InsertProductCategory>): Promise<ProductCategory | undefined> {
    const [category] = await db
      .update(productCategories)
      .set(updateData)
      .where(eq(productCategories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteProductCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(productCategories)
      .where(eq(productCategories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getDashboardStats(): Promise<{
    totalClients: number;
    totalSales: string;
    totalPurchases: string;
    inventoryValue: string;
  }> {
    const [clientsCount] = await db.select({ count: sql<number>`count(*)` }).from(clients);
    const [salesSum] = await db.select({ sum: sql<string>`coalesce(sum(${sales.total}), '0')` }).from(sales);
    const [purchasesSum] = await db.select({ sum: sql<string>`coalesce(sum(${purchases.total}), '0')` }).from(purchases);
    const [inventoryValue] = await db.select({ 
      value: sql<string>`coalesce(sum(${products.quantity} * ${products.purchasePrice}::numeric), '0')` 
    }).from(products);

    return {
      totalClients: clientsCount.count || 0,
      totalSales: salesSum.sum || "0.00",
      totalPurchases: purchasesSum.sum || "0.00",
      inventoryValue: inventoryValue.value || "0.00"
    };
  }

  // Quotes methods
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(quotes.createdAt);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const [quote] = await db
      .insert(quotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

  async updateQuote(id: number, updateData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [quote] = await db
      .update(quotes)
      .set(updateData)
      .where(eq(quotes.id, id))
      .returning();
    return quote || undefined;
  }

  async deleteQuote(id: number): Promise<boolean> {
    const result = await db
      .delete(quotes)
      .where(eq(quotes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Sales Returns methods
  async getSalesReturn(id: number): Promise<SalesReturn | undefined> {
    const [salesReturn] = await db.select().from(salesReturns).where(eq(salesReturns.id, id));
    return salesReturn || undefined;
  }

  async getAllSalesReturns(): Promise<SalesReturn[]> {
    return await db.select().from(salesReturns).orderBy(salesReturns.createdAt);
  }

  async createSalesReturn(insertSalesReturn: InsertSalesReturn): Promise<SalesReturn> {
    const [salesReturn] = await db
      .insert(salesReturns)
      .values(insertSalesReturn)
      .returning();
    return salesReturn;
  }

  async updateSalesReturn(id: number, updateData: Partial<InsertSalesReturn>): Promise<SalesReturn | undefined> {
    const [salesReturn] = await db
      .update(salesReturns)
      .set(updateData)
      .where(eq(salesReturns.id, id))
      .returning();
    return salesReturn || undefined;
  }

  async deleteSalesReturn(id: number): Promise<boolean> {
    const result = await db
      .delete(salesReturns)
      .where(eq(salesReturns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Purchase Returns methods
  async getPurchaseReturn(id: number): Promise<PurchaseReturn | undefined> {
    const [purchaseReturn] = await db.select().from(purchaseReturns).where(eq(purchaseReturns.id, id));
    return purchaseReturn || undefined;
  }

  async getAllPurchaseReturns(): Promise<PurchaseReturn[]> {
    return await db.select().from(purchaseReturns).orderBy(desc(purchaseReturns.createdAt));
  }

  async createPurchaseReturn(insertPurchaseReturn: InsertPurchaseReturn): Promise<PurchaseReturn> {
    const [purchaseReturn] = await db
      .insert(purchaseReturns)
      .values(insertPurchaseReturn)
      .returning();
    return purchaseReturn;
  }

  async updatePurchaseReturn(id: number, updateData: Partial<InsertPurchaseReturn>): Promise<PurchaseReturn | undefined> {
    const [purchaseReturn] = await db
      .update(purchaseReturns)
      .set(updateData)
      .where(eq(purchaseReturns.id, id))
      .returning();
    return purchaseReturn || undefined;
  }

  async deletePurchaseReturn(id: number): Promise<boolean> {
    const result = await db
      .delete(purchaseReturns)
      .where(eq(purchaseReturns.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

// Initialize database with sample data
async function initializeDatabaseWithSampleData() {
  try {
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    
    if (existingAdmin.length === 0) {
      // Create admin user
      await db.insert(users).values({
        username: "admin",
        email: "admin@system.com",
        password: "admin123",
        role: "admin"
      });

      // Add sample products with barcodes
      await db.insert(products).values([
        {
          name: "لابتوب ديل XPS 13",
          code: "LAP001",
          barcode: "1234567890123",
          category: "إلكترونيات",
          description: "لابتوب محمول عالي الأداء",
          purchasePrice: "3500.00",
          salePrice: "4200.00",
          quantity: 15,
          minQuantity: 5
        },
        {
          name: "ماوس لاسلكي لوجيتك",
          code: "MOU001", 
          barcode: "9876543210987",
          category: "ملحقات",
          description: "ماوس لاسلكي بتقنية البلوتوث",
          purchasePrice: "75.00",
          salePrice: "120.00",
          quantity: 50,
          minQuantity: 10
        },
        {
          name: "كيبورد ميكانيكي",
          code: "KEY001",
          barcode: "5555666677778",
          category: "ملحقات",
          description: "كيبورد ميكانيكي للألعاب",
          purchasePrice: "250.00",
          salePrice: "380.00",
          quantity: 25,
          minQuantity: 5
        },
        {
          name: "شاشة سامسونج 27 بوصة",
          code: "MON001",
          barcode: "4444333322221",
          category: "إلكترونيات",
          description: "شاشة LED عالية الدقة",
          purchasePrice: "800.00",
          salePrice: "1150.00",
          quantity: 8,
          minQuantity: 3
        },
        {
          name: "سماعات بلوتوث",
          code: "AUD001",
          barcode: "7777888899990",
          category: "صوتيات",
          description: "سماعات لاسلكية عالية الجودة",
          purchasePrice: "150.00",
          salePrice: "220.00",
          quantity: 30,
          minQuantity: 8
        }
      ]);
      
      console.log("Database initialized with sample data");
    }
  } catch (error) {
    console.log("Database initialization skipped (data may already exist)");
  }
}

// Initialize the database when the module loads
initializeDatabaseWithSampleData();

export const storage = new DatabaseStorage();