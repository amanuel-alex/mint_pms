import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  varchar,
  uuid,
  boolean,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("Active").notNull(),
  budget: varchar("budget", { length: 100 }).notNull(),
  description: text("description"),
  fileName: varchar("file_name", { length: 255 }),
  fileUrl: text("file_url"),
  projectManagerId: uuid("project_manager_id").references(() => users.id),
  holder: varchar("holder", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("project_manager").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectsRelations = relations(projects, ({ one }) => ({
  projectManager: one(users, {
    fields: [projects.projectManagerId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
})); 