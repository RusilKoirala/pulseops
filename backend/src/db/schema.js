import { pgTable, text, timestamp, integer, boolean } from "drizzle-orm/pg-core"

import { sql } from "drizzle-orm"


export const monitors = pgTable("monitors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  interval: integer("interval").notNull().default(600),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
})

export const monitorChecks = pgTable("monitor_checks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  responseTime: text("response_time").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
})

export const user = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationTokenExpiry: timestamp("verification_token_expiry")
})
