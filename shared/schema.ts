import { pgTable, text, serial, integer, boolean, decimal, timestamp, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name"),
  code: text("code").unique(),
  barcode: text("barcode").unique(),
  description: text("description"),
  category: text("category"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  quantity: integer("quantity").default(0),
  minQuantity: integer("min_quantity").default(0),
  branchId: integer("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  branchId: integer("branch_id").references(() => branches.id),
  items: json("items").$type<Array<{
    id: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  notes: text("notes"),
  items: json("items").$type<Array<{
    id: string;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
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
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  quoteNumber: text("quote_number").notNull().unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, expired
  validUntil: timestamp("valid_until").notNull(),
  notes: text("notes"),
  items: json("items"), // Array of quote items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesReturns = pgTable("sales_returns", {
  id: serial("id").primaryKey(),
  saleId: integer("sale_id").references(() => sales.id),
  returnNumber: text("return_number").notNull().unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, completed
  notes: text("notes"),
  items: json("items"), // Array of returned items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseReturns = pgTable("purchase_returns", {
  id: serial("id").primaryKey(),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  returnNumber: text("return_number").notNull().unique(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, completed
  notes: text("notes"),
  items: json("items"), // Array of returned items
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplierPaymentVouchers = pgTable("supplier_payment_vouchers", {
  id: serial("id").primaryKey(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  date: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertDeductionSchema = createInsertSchema(deductions).omit({
  id: true,
  createdAt: true,
});

export const insertSalarySchema = createInsertSchema(salaries).omit({
  id: true,
  createdAt: true,
});

export const insertProductCategorySchema = createInsertSchema(productCategories).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
});

export const insertSalesReturnSchema = createInsertSchema(salesReturns).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseReturnSchema = createInsertSchema(purchaseReturns).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierPaymentVoucherSchema = createInsertSchema(supplierPaymentVouchers).omit({
  id: true,
  createdAt: true,
});

export const clientReceiptVouchers = pgTable("client_receipt_vouchers", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  voucherNumber: text("voucher_number").unique().notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, bank_transfer, check, etc.
  receiptDate: date("receipt_date").notNull(),
  description: text("description"),
  reference: text("reference"), // مرجع الاستلام (رقم الشيك، رقم التحويل، إلخ)
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientReceiptVoucherSchema = createInsertSchema(clientReceiptVouchers).omit({
  id: true,
  createdAt: true,
});

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

// Accounting Tree System
export const accountCategories = pgTable("account_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // assets, liabilities, equity, revenue, expenses
  parentId: integer("parent_id"),
  level: integer("level").notNull().default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  code: text("code").notNull().unique(),
  categoryId: integer("category_id").references(() => accountCategories.id).notNull(),
  type: text("type").notNull(), // debit, credit
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  entryNumber: text("entry_number").notNull().unique(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  referenceType: text("reference_type"), // sale, purchase, payment, receipt, adjustment
  referenceId: integer("reference_id"), // ID of the related transaction
  totalDebit: decimal("total_debit", { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal("total_credit", { precision: 15, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, posted, cancelled
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntryLines = pgTable("journal_entry_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id).notNull(),
  accountId: integer("account_id").references(() => accounts.id).notNull(),
  description: text("description"),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Templates System
export const invoiceTemplates = pgTable("invoice_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'invoice', 'receipt', 'quotation', 'purchase_order'
  htmlContent: text("html_content").notNull(),
  cssStyles: text("css_styles").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  settings: json("settings").$type<{
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    showCompanyInfo?: boolean;
    showTaxInfo?: boolean;
    showBankInfo?: boolean;
    paperSize?: string;
    orientation?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'sales', 'inventory', 'financial', 'clients', 'suppliers', 'employees'
  htmlContent: text("html_content").notNull(),
  cssStyles: text("css_styles").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  settings: json("settings").$type<{
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    fontSize?: string;
    showCharts?: boolean;
    showSummary?: boolean;
    groupBy?: string;
    sortBy?: string;
    paperSize?: string;
    orientation?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  companyNameEn: text("company_name_en"),
  logoUrl: text("logo_url"),
  address: text("address"),
  addressEn: text("address_en"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  taxNumber: text("tax_number"),
  commercialRecord: text("commercial_record"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  iban: text("iban"),
  swiftCode: text("swift_code"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#1E40AF"),
  currency: text("currency").default("SAR"),
  currencySymbol: text("currency_symbol").default("ر.س"),
  timezone: text("timezone").default("Asia/Riyadh"),
  dateFormat: text("date_format").default("dd/MM/yyyy"),
  language: text("language").default("ar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAccountCategorySchema = createInsertSchema(accountCategories).omit({
  id: true,
  createdAt: true,
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertJournalEntryLineSchema = createInsertSchema(journalEntryLines).omit({
  id: true,
  createdAt: true,
});

// Types
export type AccountCategory = typeof accountCategories.$inferSelect;
export type InsertAccountCategory = z.infer<typeof insertAccountCategorySchema>;

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type JournalEntryLine = typeof journalEntryLines.$inferSelect;
export type InsertJournalEntryLine = z.infer<typeof insertJournalEntryLineSchema>;
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

// Branch schemas
export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// Template Types
export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type CompanySettings = typeof companySettings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
