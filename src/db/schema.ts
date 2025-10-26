import { pgTable, varchar, timestamp, pgEnum, uuid, date, integer, boolean, } from "drizzle-orm/pg-core";



export const roleEnum = pgEnum("role", ["superadmin", "customer", "vendor"]);

export const bank = pgEnum("bank", ["bca", "bni", "bri", "mandiri"]);

export const paymentMethod = pgEnum("payment_method", ["cash", "transfer"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").default("customer").notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const vendor = pgTable("vendor", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name", { length: 100 }).notNull(),
  companyAddress: varchar("company_address", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const vendorBranch = pgTable("vendor_branch", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  vendorId: uuid("vendor_id").references(() => vendor.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const goodsCategory = pgTable("goods_category", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  title: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull(),
  description: varchar("description", { length: 255 }),
})

export const goods = pgTable("goods", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  vendorBranchId: uuid("vendor_branch_id").references(() => vendorBranch.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => goodsCategory.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  dateIn: date("date_in").notNull(),
  dateOut: date("date_out").notNull(),
  dayTotal: integer("day_total").notNull(),
  paymentMethod: paymentMethod("payment_method").notNull(),
  bank: bank("bank"),
  status: boolean("status").default(true).notNull(),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

