import { pgTable, varchar, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["superadmin", "customer", "vendor"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: roleEnum("role").default("customer").notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
