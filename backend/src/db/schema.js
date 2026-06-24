import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const monitors = pgTable("monitors", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const monitorChecks = pgTable("monitor_checks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  monitorId: text("monitor_id").notNull().references(() => monitors.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  responseTime: text("response_time").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
})


