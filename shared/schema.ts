import { pgTable, text, serial, integer, boolean, decimal, timestamp, date, json, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companyInfo = pgTable("company_info", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  arabicName: text("arabic_name"),
  taxNumber: text("tax_number"),
  commercialRegister: text("commercial_register"),
  address: text("address"),
  city: text("city"),
  country: text("country").default("المملكة العربية السعودية"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logo: text("logo"),
  bankAccount: text("bank_account"),
  bankName: text("bank_name"),
  iban: text("iban"),
  swiftCode: text("swift_code"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  profession: text("profession"),
  phone: text("phone"),
  address: text("address"),
  bio: text("bio"),
  avatar: text("avatar"), // مسار الصورة الشخصية
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxNumber: text("tax_number"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0"), // الرصيد الافتتاحي
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"), // الرصيد الحالي
  branchId: integer("branch_id").references(() => branches.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  group: text("group"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0.00"),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).default("0.00"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0.00"),
  accountType: text("account_type", { enum: ['cash', 'credit', 'mixed'] }).default('cash'),
  status: text("status", { enum: ['active', 'inactive', 'blocked'] }).default('active'),
  branchId: integer("branch_id").references(() => branches.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  managerName: text("manager_name"),
  managerPhone: text("manager_phone"),
  isActive: boolean("is_active").default(true),
  openingDate: date("opening_date"),
  notes: text("notes"),
  userId: integer("user_id").references(() => users.id),
  // Health metrics
  healthScore: decimal("health_score", { precision: 5, scale: 2 }).default("0"),
  salesPerformance: decimal("sales_performance", { precision: 5, scale: 2 }).default("0"),
  inventoryHealth: decimal("inventory_health", { precision: 5, scale: 2 }).default("0"),
  customerSatisfaction: decimal("customer_satisfaction", { precision: 5, scale: 2 }).default("0"),
  lastHealthUpdate: timestamp("last_health_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  barcode: text("barcode").default(''),
  description: text("description").default(''),
  category: text("category").default(''),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull().default("0"),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull().default("0"),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").notNull().default(0),
  branchId: integer("branch_id").references(() => branches.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Composite unique constraints لضمان فرادة الكود/الباركود داخل كل فرع
  branchCodeUnique: unique("products_branch_code_unique").on(table.branchId, table.code),
  branchBarcodeUnique: unique("products_branch_barcode_unique").on(table.branchId, table.barcode),
}));

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  branchId: integer("branch_id").references(() => branches.id),
  userId: integer("user_id").references(() => users.id),
  invoiceNumber: text("invoice_number"),
  sentToClientAccount: boolean("sent_to_client_account").default(false),
  sentToClientAccountAt: timestamp("sent_to_client_account_at"),
  items: json("items").$type<Array<{
    id: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>(),
});

// شجرة المحاسبة
export const accountingTree = pgTable("accounting_tree", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // رمز الحساب مثل 1001
  name: text("name").notNull(), // اسم الحساب
  nameEn: text("name_en"), // الاسم بالإنجليزية
  parentId: integer("parent_id").references(() => accountingTree.id), // المستوى الأعلى
  level: integer("level").notNull().default(1), // مستوى الحساب
  accountType: text("account_type").notNull(), // assets, liabilities, equity, revenue, expenses
  isActive: boolean("is_active").default(true),
  isMain: boolean("is_main").default(false), // حساب رئيسي أم فرعي
  debitBalance: decimal("debit_balance", { precision: 15, scale: 2 }).default("0"),
  creditBalance: decimal("credit_balance", { precision: 15, scale: 2 }).default("0"),
  branchId: integer("branch_id").references(() => branches.id), // null للحسابات المركزية
  consolidationAccountId: integer("consolidation_account_id").references(() => accountingTree.id), // ربط بالحساب التجميعي
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نقاط البيع
export const posTerminals = pgTable("pos_terminals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // اسم نقطة البيع
  code: text("code").notNull().unique(), // رمز الجهاز
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  isActive: boolean("is_active").default(true),
  cashDrawerAmount: decimal("cash_drawer_amount", { precision: 10, scale: 2 }).default("0"),
  openedBy: integer("opened_by").references(() => users.id),
  openedAt: timestamp("opened_at"),
  closedBy: integer("closed_by").references(() => users.id),
  closedAt: timestamp("closed_at"),
  dayStartAmount: decimal("day_start_amount", { precision: 10, scale: 2 }).default("0"),
  dayEndAmount: decimal("day_end_amount", { precision: 10, scale: 2 }).default("0"),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  totalTransactions: integer("total_transactions").default(0),
  settings: json("settings").$type<{
    receiptPrinter?: boolean;
    barcodeScanner?: boolean;
    cashDrawer?: boolean;
    customerDisplay?: boolean;
    autoCalculateChange?: boolean;
    requireCustomerInfo?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// مبيعات نقاط البيع
export const posSales = pgTable("pos_sales", {
  id: serial("id").primaryKey(),
  posTerminalId: integer("pos_terminal_id").references(() => posTerminals.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  clientId: integer("client_id").references(() => clients.id),
  cashierId: integer("cashier_id").references(() => users.id).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, card, mixed
  status: text("status").notNull().default("completed"), // pending, completed, cancelled, refunded
  notes: text("notes"),
  items: json("items").$type<Array<{
    id: string;
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// قوالب الفروع
export const branchTemplates = pgTable("branch_templates", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  templateId: integer("template_id").notNull(), // مرجع للقالب من النظام الرئيسي
  templateType: text("template_type").notNull(), // invoice, receipt, report
  isActive: boolean("is_active").default(true),
  customSettings: json("custom_settings").$type<{
    colors?: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts?: {
      header: string;
      body: string;
      size: number;
    };
    layout?: {
      orientation: string;
      pageSize: string;
      margins: {
        top: number;
        bottom: number;
        left: number;
        right: number;
      };
    };
    header?: {
      showLogo: boolean;
      showBranchInfo: boolean;
      showDate: boolean;
      customText?: string;
    };
    footer?: {
      showSignature: boolean;
      showTerms: boolean;
      customText?: string;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// قيود المحاسبة
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: text("entry_number").notNull().unique(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  reference: text("reference"), // مرجع العملية (فاتورة، سند، إلخ)
  referenceType: text("reference_type"), // sale, purchase, payment, receipt
  referenceId: integer("reference_id"),
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, posted
  createdBy: integer("created_by").references(() => users.id).notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// تفاصيل قيود المحاسبة
export const journalEntryDetails = pgTable("journal_entry_details", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accountingTree.id).notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// موردين الفروع
export const branchSuppliers = pgTable("branch_suppliers", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxNumber: text("tax_number"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0"),
  totalPurchases: decimal("total_purchases", { precision: 10, scale: 2 }).default("0"),
  lastPurchaseDate: date("last_purchase_date"),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(0),
  paymentTerms: text("payment_terms").default("30 يوم"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// عملاء الفروع
export const branchClients = pgTable("branch_clients", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  group: text("group").default("عام"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  openingBalance: decimal("opening_balance", { precision: 10, scale: 2 }).default("0"),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  lastSaleDate: date("last_sale_date"),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(0),
  paymentTerms: text("payment_terms").default("فوري"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// فئات الأصناف للفروع
export const branchProductCategories = pgTable("branch_product_categories", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// أصناف الفروع
export const branchProducts = pgTable("branch_products", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  code: text("code").notNull(),
  barcode: text("barcode"),
  categoryId: integer("category_id").references(() => branchProductCategories.id),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).default("0"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).default("0"),
  wholesalePrice: decimal("wholesale_price", { precision: 10, scale: 2 }).default("0"),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(0),
  maxStock: integer("max_stock").default(0),
  totalSold: integer("total_sold").default(0),
  unit: text("unit").default("قطعة"),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: text("dimensions"),
  brand: text("brand"),
  supplier: text("supplier"),
  location: text("location"),
  image: text("image"),
  isActive: boolean("is_active").default(true),
  isService: boolean("is_service").default(false),
  hasTax: boolean("has_tax").default(true),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15"),
  tags: text("tags"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مبيعات الفروع
export const branchSales = pgTable("branch_sales", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  clientId: integer("client_id").references(() => branchClients.id),
  saleNumber: text("sale_number").unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  finalTotal: decimal("final_total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, card
  status: text("status").default("completed"), // pending, completed, cancelled
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// تفاصيل مبيعات الفروع
export const branchSaleItems = pgTable("branch_sale_items", {
  id: serial("id").primaryKey(),
  sale_id: integer("sale_id").references(() => branchSales.id).notNull(),
  product_id: integer("product_id").references(() => branchProducts.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const withdrawalVouchers = pgTable("withdrawal_vouchers", {
  id: serial("id").primaryKey(),
  voucherNumber: text("voucher_number").notNull().unique(),
  clientId: integer("client_id").references(() => clients.id),
  branchId: integer("branch_id").references(() => branches.id),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by").references(() => users.id),
  items: json("items").$type<Array<{
    id: string;
    productId: number;
    productName: string;
    productCode: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  branchId: integer("branch_id").references(() => branches.id), // ربط الفاتورة بالفرع
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }), // نقدي / آجل / تحويل بنكي / شبكة
  sentToSupplierAccount: boolean("sent_to_supplier_account").default(false),
  sentToSupplierAccountAt: timestamp("sent_to_supplier_account_at"),
  notes: text("notes"),
  items: json("items"), // Array of purchase items
});

// Purchase Returns
export const purchaseReturns = pgTable('purchase_returns', {
  id: serial('id').primaryKey(),
  userId: integer("user_id").references(() => users.id),
  purchaseId: integer('purchase_id').references(() => purchases.id),
  returnNumber: varchar('return_number', { length: 50 }).notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  reason: text('reason').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  notes: text('notes'),
  items: json('items'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Purchase Orders
export const purchaseOrders = pgTable('purchase_orders', {
  id: serial('id').primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }),
  total: decimal('total', { precision: 10, scale: 2 }).default('0.00').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  requestedBy: varchar('requested_by', { length: 255 }),
  notes: text('notes'),
  items: json('items'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goods Receipt Vouchers
export const goodsReceiptVouchers = pgTable('goods_receipt_vouchers', {
  id: serial('id').primaryKey(),
  voucherNumber: varchar('voucher_number', { length: 50 }).notNull().unique(),
  purchaseOrderId: integer('purchase_order_id').references(() => purchaseOrders.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  supplierName: varchar('supplier_name', { length: 255 }),
  branchId: integer('branch_id').references(() => branches.id),
  receivedBy: varchar('received_by', { length: 255 }).notNull(),
  receivedDate: timestamp('received_date').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  totalItems: integer('total_items').default(0),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }).default('0.00'),
  notes: text('notes'),
  items: json('items'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goods Issue Vouchers
export const goodsIssueVouchers = pgTable('goods_issue_vouchers', {
  id: serial('id').primaryKey(),
  voucherNumber: varchar('voucher_number', { length: 50 }).notNull().unique(),
  saleId: integer('sale_id').references(() => sales.id),
  clientId: integer('client_id').references(() => clients.id),
  branchId: integer('branch_id').references(() => branches.id),
  issuedBy: varchar('issued_by', { length: 255 }).notNull(),
  issueDate: timestamp('issue_date').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  totalItems: integer('total_items').default(0),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }).default('0.00'),
  notes: text('notes'),
  items: json('items'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id),
  name: text("name").notNull(),
  employeeId: text("employee_id").unique(),
  position: text("position"),
  department: text("department"),
  hireDate: timestamp("hire_date").notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  status: text("status").notNull().default("active"), // active, inactive, terminated
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  type: text("type").notNull(), // annual, sick, emergency, personal, maternity, paternity
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const deductions = pgTable("deductions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  type: text("type").notNull(), // insurance, tax, loan, advance, other
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  recurring: boolean("recurring").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaries = pgTable("salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0"),
  totalDeductions: decimal("total_deductions", { precision: 10, scale: 2 }).default("0"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  paidDate: timestamp("paid_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").unique(),
  description: text("description"),
  branchId: integer("branch_id").references(() => branches.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily Expenses
export const dailyExpenses = pgTable('daily_expenses', {
  id: serial('id').primaryKey(),
  branchId: integer('branch_id').references(() => branches.id),
  date: text('date').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method', { 
    enum: ['نقداً', 'بنك', 'شيك', 'فيزا'] 
  }).notNull(),
  receipt: text('receipt'),
  approvedBy: text('approved_by').notNull(),
  status: text('status', { 
    enum: ['معتمد', 'معلق', 'مرفوض'] 
  }).default('معتمد'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});



export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  quoteNumber: text("quote_number").notNull().unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  date: timestamp("date").defaultNow().notNull(),
  validUntil: timestamp("valid_until").notNull(),
  notes: text("notes"),
  items: json("items"), // Array of quote items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesReturns = pgTable("sales_returns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  saleId: integer("sale_id").references(() => sales.id),
  returnNumber: text("return_number").notNull().unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, completed
  notes: text("notes"),
  branchId: integer("branch_id").references(() => branches.id),
  items: json("items"), // Array of returned items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



export const supplierPaymentVouchers = pgTable("supplier_payment_vouchers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  voucherNumber: text("voucher_number").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, bank_transfer, check, credit_card
  paymentDate: date("payment_date").notNull(),
  description: text("description"),
  reference: text("reference"), // رقم الشيك أو المرجع البنكي
  status: text("status").notNull().default("pending"), // pending, approved, paid, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Debts management
export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  debtorType: text("debtor_type").notNull(), // client, supplier, employee, other
  debtorId: integer("debtor_id"), // ID of the debtor (client, supplier, employee)
  debtorName: text("debtor_name").notNull(), // Name of the debtor
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  remainingAmount: decimal("remaining_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("SAR").notNull(),
  type: text("type").notNull(), // receivable (مدين لنا), payable (دائن علينا)
  description: text("description").notNull(),
  debtItems: json("debt_items").$type<Array<{
    id: string;
    amount: string;
    reason: string;
  }>>(),
  dueDate: date("due_date"),
  status: text("status").notNull().default("active"), // active, paid, overdue, cancelled
  priority: text("priority").default("medium"), // high, medium, low
  paymentTerms: text("payment_terms"),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).default("0"),
  collateral: text("collateral"), // ضمانات
  guarantor: text("guarantor"), // الضامن
  contractNumber: text("contract_number"),
  sourceDocument: text("source_document"), // sales_invoice, purchase_invoice, loan, etc.
  sourceDocumentId: integer("source_document_id"),
  notes: text("notes"),
  attachments: json("attachments").$type<Array<{
    name: string;
    url: string;
    type: string;
  }>>(),
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Debt payments
export const debtPayments = pgTable("debt_payments", {
  id: serial("id").primaryKey(),
  debtId: integer("debt_id").references(() => debts.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, bank_transfer, check, credit_card
  paymentDate: date("payment_date").notNull(),
  reference: text("reference"), // رقم الشيك أو المرجع البنكي
  description: text("description"),
  receiptNumber: text("receipt_number"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }).default("1"),
  status: text("status").notNull().default("completed"), // pending, completed, cancelled
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
}).extend({
  creditLimit: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  balance: z.union([z.string(), z.number()]).transform(val => String(val)).optional()
}).partial();

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
}).extend({
  openingBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  currentBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  creditLimit: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  balance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, 'اسم الصنف مطلوب'),
  code: z.string().min(1, 'كود الصنف مطلوب'),
  barcode: z.string().default(''),
  description: z.string().default(''),
  category: z.string().default(''),
  purchasePrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  salePrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  quantity: z.number().int().default(0),
  minQuantity: z.number().int().default(0),
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
}).extend({
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  date: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  clientId: z.number().optional(),
  branchId: z.number().optional(),
  items: z.any().optional(),
  notes: z.string().optional(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  date: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
}).extend({
  salary: z.union([z.string(), z.number()]).transform(val => String(val)),
  hireDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  employeeId: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.string().optional().default("active")
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeductionSchema = createInsertSchema(deductions).omit({
  id: true,
  createdAt: true,
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
}).extend({
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  month: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
  year: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
  baseSalary: z.union([z.string(), z.number()]).transform(val => String(val)),
  overtime: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  bonuses: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  totalDeductions: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  netSalary: z.union([z.string(), z.number()]).transform(val => String(val)),
  status: z.string().default('pending'),
  paidDate: z.union([z.string(), z.date(), z.null(), z.undefined()]).transform(val => {
    if (!val || val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  notes: z.string().optional(),
});

export const insertProductCategorySchema = createInsertSchema(productCategories).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
}).extend({
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  tax: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  discount: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  clientId: z.number().optional(),
  items: z.any().optional(),
  notes: z.string().optional(),
  validUntil: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const insertSalesReturnSchema = createInsertSchema(salesReturns).omit({
  id: true,
  createdAt: true,
}).extend({
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  saleId: z.number().optional(),
  items: z.any().optional(),
  notes: z.string().optional(),
});

export const insertPurchaseReturnSchema = createInsertSchema(purchaseReturns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  total: z.union([z.string(), z.number()]).transform(val => String(val)),
  purchaseId: z.number().optional(),
  items: z.any().optional(),
  notes: z.string().optional(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const insertGoodsReceiptVoucherSchema = createInsertSchema(goodsReceiptVouchers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoodsReceiptVoucher = z.infer<typeof insertGoodsReceiptVoucherSchema>;
export type GoodsReceiptVoucher = typeof goodsReceiptVouchers.$inferSelect;

export const insertGoodsIssueVoucherSchema = createInsertSchema(goodsIssueVouchers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  issueDate: z.union([z.string(), z.date()]).transform(val => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

export type InsertGoodsIssueVoucher = z.infer<typeof insertGoodsIssueVoucherSchema>;
export type GoodsIssueVoucher = typeof goodsIssueVouchers.$inferSelect;

export const insertSupplierPaymentVoucherSchema = createInsertSchema(supplierPaymentVouchers).omit({
  id: true,
  createdAt: true,
});

export const insertAccountingTreeSchema = createInsertSchema(accountingTree).omit({
  id: true,
  createdAt: true,
});

export const insertPosTerminalSchema = createInsertSchema(posTerminals).omit({
  id: true,
  createdAt: true,
});

export const insertPosSaleSchema = createInsertSchema(posSales).omit({
  id: true,
  createdAt: true,
});

export const insertBranchTemplateSchema = createInsertSchema(branchTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntryDetailSchema = createInsertSchema(journalEntryDetails).omit({
  id: true,
  createdAt: true,
});

export const insertDailyExpenseSchema = createInsertSchema(dailyExpenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertDailyExpense = z.infer<typeof insertDailyExpenseSchema>;
export type DailyExpense = typeof dailyExpenses.$inferSelect;

export const clientReceiptVouchers = pgTable("client_receipt_vouchers", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  branchId: integer("branch_id").references(() => branches.id),
  voucherNumber: text("voucher_number").unique().notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, bank_transfer, check, etc.
  receiptDate: date("receipt_date").notNull(),
  payer: text("payer"), // الدافع - الشخص الذي يعطي المال
  receiver: text("receiver"), // المستلم - الشخص الذي يستلم المال
  description: text("description"),
  reference: text("reference"), // مرجع الاستلام (رقم الشيك، رقم التحويل، إلخ)
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  notes: text("notes"),
  deductFrom: text("deduct_from").notNull().default("balance"), // balance, creditLimit
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientReceiptVoucherSchema = createInsertSchema(clientReceiptVouchers).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  receiptDate: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  movementType: text("movement_type").notNull(), // in, out, transfer, adjustment
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  referenceType: text("reference_type"), // sale, purchase, adjustment, transfer, return
  referenceId: integer("reference_id"), // ID of the related document
  referenceNumber: text("reference_number"), // Document number (invoice, order, etc.)
  notes: text("notes"),
  branchId: integer("branch_id").references(() => branches.id),
  createdBy: integer("created_by").references(() => users.id),
  movementDate: timestamp("movement_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.union([z.string(), z.number()]).transform(val => String(val)),
  productId: z.number(),
  movementType: z.enum(['in', 'out', 'transfer', 'adjustment']),
  referenceType: z.string().optional(),
  referenceId: z.number().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.number().optional(),
  createdBy: z.number().optional(),
  movementDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
});

export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

// جدول الأرصدة الافتتاحية للعملاء
export const clientOpeningBalances = pgTable("client_opening_balances", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  clientName: text("client_name").notNull(),
  debitAmount: decimal("debit_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  creditAmount: decimal("credit_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientOpeningBalanceSchema = createInsertSchema(clientOpeningBalances).omit({
  id: true,
  createdAt: true,
}).extend({
  debitAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  creditAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  balance: z.union([z.string(), z.number()]).transform(val => String(val)),
  date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
});

export type InsertClientOpeningBalance = z.infer<typeof insertClientOpeningBalanceSchema>;
export type ClientOpeningBalance = typeof clientOpeningBalances.$inferSelect;

export const inventoryOpeningBalances = pgTable("inventory_opening_balances", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  openingQuantity: decimal("opening_quantity", { precision: 10, scale: 3 }).notNull().default("0"),
  openingValue: decimal("opening_value", { precision: 10, scale: 2 }).notNull().default("0"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  location: text("location"), // موقع المخزن
  notes: text("notes"),
  dateRecorded: date("date_recorded").notNull().default(new Date().toISOString().split('T')[0]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryOpeningBalanceSchema = createInsertSchema(inventoryOpeningBalances).omit({
  id: true,
  createdAt: true,
});

// موظفي الفروع
export const branchEmployees = pgTable("branch_employees", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  employeeCode: text("employee_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  position: text("position").notNull(),
  department: text("department"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  nationalId: text("national_id"),
  hireDate: date("hire_date").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  contractType: text("contract_type").notNull(), // دوام كامل، جزئي، مؤقت
  status: text("status").default("active"), // active, inactive, terminated
  bankAccount: text("bank_account"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// رواتب الموظفين
export const branchSalaries = pgTable("branch_salaries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => branchEmployees.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  allowances: decimal("allowances", { precision: 10, scale: 2 }).default("0"),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0"),
  totalSalary: decimal("total_salary", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending"), // pending, paid, cancelled
  payDate: date("pay_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// علاوات الموظفين
export const branchAllowances = pgTable("branch_allowances", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => branchEmployees.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  allowanceType: text("allowance_type").notNull(), // بدل سكن، بدل مواصلات، حافز أداء، إلخ
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isRecurring: boolean("is_recurring").default(false),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// خصومات الموظفين
export const branchDeductions = pgTable("branch_deductions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => branchEmployees.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  deductionType: text("deduction_type").notNull(), // تأمينات، ضرائب، قرض، غياب، إلخ
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isRecurring: boolean("is_recurring").default(false),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// نظام الخصومات الموحد
export const employeeDeductions = pgTable("employee_deductions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  deductionType: text("deduction_type").notNull(), // salary_deduction, debt_deduction, salary_to_debt
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  targetDebtId: integer("target_debt_id").references(() => debts.id), // للخصم من الدين أو التحويل للدين
  description: text("description").notNull(),
  deductionDate: date("deduction_date").notNull(),
  status: text("status").default("active"), // active, cancelled, completed
  processedBy: integer("processed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// حضور وغياب الموظفين
export const branchEmployeeAttendance = pgTable("branch_employee_attendance", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => branchEmployees.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  attendanceDate: date("attendance_date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  workingHours: decimal("working_hours", { precision: 4, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0"),
  status: text("status").default("present"), // present, absent, late, half_day
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// إدراج البيانات للموظفين
export const insertBranchEmployeeSchema = createInsertSchema(branchEmployees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema للخصومات الموحدة
export const insertEmployeeDeductionSchema = createInsertSchema(employeeDeductions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  deductionDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  employeeId: z.number().min(1, 'يجب اختيار موظف'),
  deductionType: z.enum(['salary_deduction', 'debt_deduction', 'salary_to_debt']),
  description: z.string().min(1, 'وصف الخصم مطلوب'),
  targetDebtId: z.number().optional(),
  processedBy: z.number().optional(),
  notes: z.string().optional(),
  status: z.string().default('active'),
});

export type InsertEmployeeDeduction = z.infer<typeof insertEmployeeDeductionSchema>;
export type EmployeeDeduction = typeof employeeDeductions.$inferSelect;

export const insertBranchSalarySchema = createInsertSchema(branchSalaries).omit({
  id: true,
  createdAt: true,
});

export const insertBranchAllowanceSchema = createInsertSchema(branchAllowances).omit({
  id: true,
  createdAt: true,
});

export const insertBranchDeductionSchema = createInsertSchema(branchDeductions).omit({
  id: true,
  createdAt: true,
});

export const insertBranchEmployeeAttendanceSchema = createInsertSchema(branchEmployeeAttendance).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSaleSchema = createInsertSchema(branchSales).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSaleItemSchema = createInsertSchema(branchSaleItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Holiday = typeof holidays.$inferSelect;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;

export type Deduction = typeof deductions.$inferSelect;
export type InsertDeduction = z.infer<typeof insertDeductionSchema>;

export type Salary = typeof salaries.$inferSelect;
export type InsertSalary = z.infer<typeof insertSalarySchema>;

export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export type SalesReturn = typeof salesReturns.$inferSelect;
export type InsertSalesReturn = z.infer<typeof insertSalesReturnSchema>;

export type PurchaseReturn = typeof purchaseReturns.$inferSelect;
export type InsertPurchaseReturn = z.infer<typeof insertPurchaseReturnSchema>;

export type SupplierPaymentVoucher = typeof supplierPaymentVouchers.$inferSelect;
export type InsertSupplierPaymentVoucher = z.infer<typeof insertSupplierPaymentVoucherSchema>;

export type ClientReceiptVoucher = typeof clientReceiptVouchers.$inferSelect;
export type InsertClientReceiptVoucher = z.infer<typeof insertClientReceiptVoucherSchema>;

export type InventoryOpeningBalance = typeof inventoryOpeningBalances.$inferSelect;
export type InsertInventoryOpeningBalance = z.infer<typeof insertInventoryOpeningBalanceSchema>;

// Debt schemas
export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  remainingAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  debtItems: z.array(z.object({
    id: z.string(),
    amount: z.string(),
    reason: z.string(),
  })).optional(),
  dueDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional(),
  interestRate: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertDebtPaymentSchema = createInsertSchema(debtPayments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  paymentDate: z.union([z.string(), z.date()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ),
  exchangeRate: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type DebtPayment = typeof debtPayments.$inferSelect;
export type InsertDebtPayment = z.infer<typeof insertDebtPaymentSchema>;

// Withdrawal voucher schema
export const insertWithdrawalVoucherSchema = createInsertSchema(withdrawalVouchers).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export type WithdrawalVoucher = typeof withdrawalVouchers.$inferSelect;
export type InsertWithdrawalVoucher = z.infer<typeof insertWithdrawalVoucherSchema>;

// Branch schemas
export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// New table types
export type AccountingTree = typeof accountingTree.$inferSelect;
export type InsertAccountingTree = z.infer<typeof insertAccountingTreeSchema>;

export type PosTerminal = typeof posTerminals.$inferSelect;
export type InsertPosTerminal = z.infer<typeof insertPosTerminalSchema>;

export type PosSale = typeof posSales.$inferSelect;
export type InsertPosSale = z.infer<typeof insertPosSaleSchema>;

export type BranchTemplate = typeof branchTemplates.$inferSelect;
export type InsertBranchTemplate = z.infer<typeof insertBranchTemplateSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type JournalEntryDetail = typeof journalEntryDetails.$inferSelect;
export type InsertJournalEntryDetail = z.infer<typeof insertJournalEntryDetailSchema>;

// Branch suppliers and clients schemas
export const insertBranchSupplierSchema = createInsertSchema(branchSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  creditLimit: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  balance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  openingBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  totalPurchases: z.union([z.string(), z.number()]).transform(val => String(val)).optional()
});

export const insertBranchClientSchema = createInsertSchema(branchClients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  balance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  openingBalance: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  totalSales: z.union([z.string(), z.number()]).transform(val => String(val)).optional()
});

// Branch product categories schemas
export const insertBranchProductCategorySchema = createInsertSchema(branchProductCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Branch products schemas
export const insertBranchProductSchema = createInsertSchema(branchProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  costPrice: z.string().optional(),
  sellingPrice: z.string().optional(),
  wholesalePrice: z.string().optional(),
  weight: z.string().optional(),
  taxRate: z.string().optional()
});

export type BranchSupplier = typeof branchSuppliers.$inferSelect;
export type InsertBranchSupplier = z.infer<typeof insertBranchSupplierSchema>;

export type BranchClient = typeof branchClients.$inferSelect;
export type InsertBranchClient = z.infer<typeof insertBranchClientSchema>;

export type BranchProductCategory = typeof branchProductCategories.$inferSelect;
export type InsertBranchProductCategory = z.infer<typeof insertBranchProductCategorySchema>;

export type BranchProduct = typeof branchProducts.$inferSelect;
export type InsertBranchProduct = z.infer<typeof insertBranchProductSchema>;

export type BranchSale = typeof branchSales.$inferSelect;
export type InsertBranchSale = z.infer<typeof insertBranchSaleSchema>;

export const insertCompanyInfoSchema = createInsertSchema(companyInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CompanyInfo = typeof companyInfo.$inferSelect;
export type InsertCompanyInfo = z.infer<typeof insertCompanyInfoSchema>;

export type BranchSaleItem = typeof branchSaleItems.$inferSelect;
export type InsertBranchSaleItem = z.infer<typeof insertBranchSaleItemSchema>;

// جداول صلاحيات الفروع
export const branchUsers = pgTable("branch_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  role: text("role").notNull().default("user"), // admin, manager, user, cashier, accountant
  permissions: json("permissions").$type<{
    canViewReports?: boolean;
    canCreateSales?: boolean;
    canCreatePurchases?: boolean;
    canManageInventory?: boolean;
    canManageAccounting?: boolean;
    canViewConsolidated?: boolean;
    canManageUsers?: boolean;
  }>().default({}),
  isActive: boolean("is_active").default(true),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: integer("assigned_by").references(() => users.id),
});

// التقارير التجميعية
export const consolidationReports = pgTable("consolidation_reports", {
  id: serial("id").primaryKey(),
  reportType: text("report_type").notNull(), // income_statement, balance_sheet, cash_flow
  period: text("period").notNull(), // monthly, quarterly, yearly
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  branchIds: json("branch_ids").$type<number[]>().notNull(), // الفروع المدرجة في التقرير
  reportData: json("report_data").$type<{
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    branchBreakdown: Array<{
      branchId: number;
      branchName: string;
      revenue: number;
      expenses: number;
      netIncome: number;
    }>;
    accountSummary: Array<{
      accountCode: string;
      accountName: string;
      totalDebit: number;
      totalCredit: number;
      balance: number;
    }>;
  }>(),
  generatedBy: integer("generated_by").references(() => users.id).notNull(),
  status: text("status").notNull().default("draft"), // draft, final, archived
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// قيود التحويل بين الفروع
export const interBranchTransactions = pgTable("inter_branch_transactions", {
  id: serial("id").primaryKey(),
  fromBranchId: integer("from_branch_id").references(() => branches.id).notNull(),
  toBranchId: integer("to_branch_id").references(() => branches.id).notNull(),
  transactionType: text("transaction_type").notNull(), // cash_transfer, inventory_transfer, allocation
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  referenceNumber: text("reference_number").unique().notNull(),
  fromAccountId: integer("from_account_id").references(() => accountingTree.id).notNull(),
  toAccountId: integer("to_account_id").references(() => accountingTree.id).notNull(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id),
  status: text("status").notNull().default("pending"), // pending, approved, completed, cancelled
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// إعدادات الفروع المحاسبية
export const branchAccountingSettings = pgTable("branch_accounting_settings", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull().unique(),
  fiscalYearStart: date("fiscal_year_start").notNull(),
  fiscalYearEnd: date("fiscal_year_end").notNull(),
  currency: text("currency").notNull().default("SAR"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("15.00"),
  autoGenerateJournalEntries: boolean("auto_generate_journal_entries").default(true),
  requireApprovalForJournalEntries: boolean("require_approval_for_journal_entries").default(false),
  consolidationMethod: text("consolidation_method").default("full"), // full, proportional, equity
  eliminateInterBranchTransactions: boolean("eliminate_inter_branch_transactions").default(true),
  defaultCashAccountId: integer("default_cash_account_id").references(() => accountingTree.id),
  defaultSalesAccountId: integer("default_sales_account_id").references(() => accountingTree.id),
  defaultPurchaseAccountId: integer("default_purchase_account_id").references(() => accountingTree.id),
  defaultInventoryAccountId: integer("default_inventory_account_id").references(() => accountingTree.id),
  settings: json("settings").$type<{
    allowNegativeInventory?: boolean;
    autoCalculateCostOfGoodsSold?: boolean;
    enableBranchBudgeting?: boolean;
    requireCustomerForSales?: boolean;
    enableMultiCurrency?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// الموازنات الفرعية
export const branchBudgets = pgTable("branch_budgets", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  budgetYear: integer("budget_year").notNull(),
  budgetType: text("budget_type").notNull(), // revenue, expense, capital
  accountId: integer("account_id").references(() => accountingTree.id).notNull(),
  budgetedAmount: decimal("budgeted_amount", { precision: 15, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 15, scale: 2 }).default("0"),
  variance: decimal("variance", { precision: 15, scale: 2 }).default("0"),
  variancePercentage: decimal("variance_percentage", { precision: 5, scale: 2 }).default("0"),
  period: text("period").notNull(), // monthly, quarterly, yearly
  monthNumber: integer("month_number"), // 1-12 للموازنات الشهرية
  quarterNumber: integer("quarter_number"), // 1-4 للموازنات الربعية
  status: text("status").notNull().default("active"), // active, inactive, closed
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  approvedBy: integer("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// مؤشرات الأداء المالي للفروع
export const branchKpis = pgTable("branch_kpis", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  reportDate: date("report_date").notNull(),
  totalRevenue: decimal("total_revenue", { precision: 15, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 15, scale: 2 }).default("0"),
  grossProfit: decimal("gross_profit", { precision: 15, scale: 2 }).default("0"),
  netProfit: decimal("net_profit", { precision: 15, scale: 2 }).default("0"),
  profitMargin: decimal("profit_margin", { precision: 5, scale: 2 }).default("0"),
  returnOnAssets: decimal("return_on_assets", { precision: 5, scale: 2 }).default("0"),
  currentRatio: decimal("current_ratio", { precision: 5, scale: 2 }).default("0"),
  inventoryTurnover: decimal("inventory_turnover", { precision: 5, scale: 2 }).default("0"),
  receivablesTurnover: decimal("receivables_turnover", { precision: 5, scale: 2 }).default("0"),
  cashFlowFromOperations: decimal("cash_flow_from_operations", { precision: 15, scale: 2 }).default("0"),
  budgetVariance: decimal("budget_variance", { precision: 5, scale: 2 }).default("0"),
  customerSatisfactionScore: decimal("customer_satisfaction_score", { precision: 3, scale: 1 }).default("0"),
  employeeProductivityIndex: decimal("employee_productivity_index", { precision: 5, scale: 2 }).default("0"),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  calculatedBy: integer("calculated_by").references(() => users.id),
});

// Inventory Transfers - إرسال واستقبال المخزون بين الفروع
export const inventoryTransfers = pgTable("inventory_transfers", {
  id: serial("id").primaryKey(),
  transferNumber: text("transfer_number").notNull().unique(), // رقم عملية النقل
  fromBranchId: integer("from_branch_id").references(() => branches.id), // الفرع المرسل
  toBranchId: integer("to_branch_id").references(() => branches.id).notNull(), // الفرع المستقبل
  productId: integer("product_id").references(() => products.id).notNull(), // المنتج الأصلي (في الفرع المرسل)
  receivedProductId: integer("received_product_id").references(() => products.id), // المنتج في الفرع المستقبل
  quantity: integer("quantity").notNull(), // الكمية المنقولة
  status: text("status", { enum: ['pending', 'sent', 'received', 'rejected'] }).notNull().default('pending'), // حالة النقل
  notes: text("notes"), // ملاحظات
  sentBy: integer("sent_by").references(() => users.id), // المرسل
  receivedBy: integer("received_by").references(() => users.id), // المستلم
  sentAt: timestamp("sent_at"), // تاريخ الإرسال
  receivedAt: timestamp("received_at"), // تاريخ الاستلام
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// سندات القبض للفروع - Branch Receipt Vouchers
export const branchReceiptVouchers = pgTable("branch_receipt_vouchers", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  receiptNumber: text("receipt_number").notNull().unique(),
  payerName: text("payer_name").notNull(),
  receiverName: text("receiver_name").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", { enum: ['cash', 'check', 'transfer'] }).notNull().default('cash'),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// نظام تحويل المخزون الجديد بين الفروع - New Branch Transfers System
export const branchTransfers = pgTable("branch_transfers", {
  id: serial("id").primaryKey(),
  transferNumber: text("transfer_number").notNull().unique(), // رقم التحويل
  fromBranchId: integer("from_branch_id").references(() => branches.id).notNull(), // الفرع المرسل
  toBranchId: integer("to_branch_id").references(() => branches.id).notNull(), // الفرع المستقبل
  productId: integer("product_id").references(() => products.id), // المنتج المرسل (للتوافق مع البيانات القديمة)
  productName: text("product_name"), // اسم المنتج (للتوافق مع البيانات القديمة)
  productCode: text("product_code"), // كود المنتج (للتوافق مع البيانات القديمة)
  productBarcode: text("product_barcode"), // باركود المنتج (للتوافق مع البيانات القديمة)
  quantity: integer("quantity"), // الكمية (للتوافق مع البيانات القديمة)
  status: text("status", { enum: ['sent', 'received', 'cancelled'] }).notNull().default('sent'), // الحالة
  notes: text("notes"), // ملاحظات
  sentBy: integer("sent_by"), // المرسل (ID المستخدم - بدون قيد foreign key)
  receivedBy: integer("received_by"), // المستلم (ID المستخدم - بدون قيد foreign key)
  receivedProductId: integer("received_product_id").references(() => products.id), // المنتج في الفرع المستقبل بعد الاستلام
  sentAt: timestamp("sent_at").defaultNow().notNull(), // تاريخ الإرسال
  receivedAt: timestamp("received_at"), // تاريخ الاستلام
  createdAt: timestamp("created_at").defaultNow().notNull(),
  totalItems: integer("total_items").default(0), // عدد المنتجات في الإرسالية
});

// منتجات التحويل بين الفروع - Branch Transfer Items
export const branchTransferItems = pgTable("branch_transfer_items", {
  id: serial("id").primaryKey(),
  transferId: integer("transfer_id").references(() => branchTransfers.id, { onDelete: 'cascade' }).notNull(), // رقم التحويل
  productId: integer("product_id").references(() => products.id).notNull(), // المنتج
  productName: text("product_name").notNull(), // اسم المنتج
  productCode: text("product_code"), // كود المنتج
  productBarcode: text("product_barcode"), // باركود المنتج
  quantity: integer("quantity").notNull(), // الكمية
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas للجداول الجديدة
export const insertBranchUserSchema = createInsertSchema(branchUsers).omit({
  id: true,
  assignedAt: true,
});

export const insertConsolidationReportSchema = createInsertSchema(consolidationReports).omit({
  id: true,
  createdAt: true,
});

export const insertInterBranchTransactionSchema = createInsertSchema(interBranchTransactions).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export const insertBranchAccountingSettingsSchema = createInsertSchema(branchAccountingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBranchBudgetSchema = createInsertSchema(branchBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
});

export const insertBranchKpiSchema = createInsertSchema(branchKpis).omit({
  id: true,
  calculatedAt: true,
});

export const insertInventoryTransferSchema = createInsertSchema(inventoryTransfers).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  receivedAt: true,
});

export const insertBranchReceiptVoucherSchema = createInsertSchema(branchReceiptVouchers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.string().or(z.number()).transform(val => String(val)),
  date: z.string().or(z.date()).optional(),
});

export const insertBranchTransferSchema = createInsertSchema(branchTransfers).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  receivedAt: true,
});

// Types للجداول الجديدة
export type BranchUser = typeof branchUsers.$inferSelect;
export type InsertBranchUser = z.infer<typeof insertBranchUserSchema>;



export type ConsolidationReport = typeof consolidationReports.$inferSelect;
export type InsertConsolidationReport = z.infer<typeof insertConsolidationReportSchema>;

export type InterBranchTransaction = typeof interBranchTransactions.$inferSelect;
export type InsertInterBranchTransaction = z.infer<typeof insertInterBranchTransactionSchema>;

export type BranchAccountingSettings = typeof branchAccountingSettings.$inferSelect;
export type InsertBranchAccountingSettings = z.infer<typeof insertBranchAccountingSettingsSchema>;

export type BranchBudget = typeof branchBudgets.$inferSelect;
export type InsertBranchBudget = z.infer<typeof insertBranchBudgetSchema>;

export type BranchKpi = typeof branchKpis.$inferSelect;
export type InsertBranchKpi = z.infer<typeof insertBranchKpiSchema>;

export type InventoryTransfer = typeof inventoryTransfers.$inferSelect;
export type InsertInventoryTransfer = z.infer<typeof insertInventoryTransferSchema>;

export type BranchReceiptVoucher = typeof branchReceiptVouchers.$inferSelect;
export type InsertBranchReceiptVoucher = z.infer<typeof insertBranchReceiptVoucherSchema>;

export type BranchTransfer = typeof branchTransfers.$inferSelect;
export type InsertBranchTransfer = z.infer<typeof insertBranchTransferSchema>;

// Employee management types
export type BranchEmployee = typeof branchEmployees.$inferSelect;
export type InsertBranchEmployee = z.infer<typeof insertBranchEmployeeSchema>;

export type BranchSalary = typeof branchSalaries.$inferSelect;
export type InsertBranchSalary = z.infer<typeof insertBranchSalarySchema>;

export type BranchAllowance = typeof branchAllowances.$inferSelect;
export type InsertBranchAllowance = z.infer<typeof insertBranchAllowanceSchema>;

export type BranchDeduction = typeof branchDeductions.$inferSelect;
export type InsertBranchDeduction = z.infer<typeof insertBranchDeductionSchema>;

export type BranchEmployeeAttendance = typeof branchEmployeeAttendance.$inferSelect;
export type InsertBranchEmployeeAttendance = z.infer<typeof insertBranchEmployeeAttendanceSchema>;

// Note: Debt schemas are already defined above in the file

// Additional Types for Routes Compatibility
export type Allowance = typeof deductions.$inferSelect;
export type InsertAllowance = z.infer<typeof insertDeductionSchema>;

export type InventoryMovement = {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  movementType: 'in' | 'out' | 'adjustment';
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  referenceNumber?: string;
  notes?: string;
  branchId?: number;
  createdBy?: number;
  movementDate: string;
  createdAt: string;
};

// Login schema
export const loginUserSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة")
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Branch Permissions Schema
export const branchPermissions = pgTable("branch_permissions", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").notNull().references(() => branches.id),
  sectionId: text("section_id").notNull(), // e.g., 'suppliers', 'clients', 'products'
  subsectionId: text("subsection_id"), // e.g., 'suppliers-management', 'suppliers-statement'
  isEnabled: boolean("is_enabled").default(true).notNull(),
  canView: boolean("can_view").default(true).notNull(),
  canAdd: boolean("can_add").default(true).notNull(),
  canEdit: boolean("can_edit").default(true).notNull(),
  canDelete: boolean("can_delete").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one permission record per branch+section+subsection
  branchSectionUnique: unique("branch_permissions_unique").on(
    table.branchId, 
    table.sectionId, 
    table.subsectionId
  ),
}));

export const insertBranchPermissionSchema = createInsertSchema(branchPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BranchPermission = typeof branchPermissions.$inferSelect;
export type InsertBranchPermission = z.infer<typeof insertBranchPermissionSchema>;
