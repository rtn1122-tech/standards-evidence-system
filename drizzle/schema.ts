import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Teacher profile - basic information entered once
 */
export const teacherProfiles = mysqlTable("teacherProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  educationDepartment: varchar("educationDepartment", { length: 255 }), // إدارة التعليم
  schoolName: varchar("schoolName", { length: 255 }), // اسم المدرسة
  teacherName: varchar("teacherName", { length: 255 }), // اسم المعلم
  principalName: varchar("principalName", { length: 255 }), // اسم المدير
  gender: mysqlEnum("gender", ["male", "female"]).notNull(), // معلم/معلمة
  stage: varchar("stage", { length: 100 }), // المرحلة (ابتدائي، متوسط، ثانوي)
  subjects: text("subjects"), // المواد التدريسية (JSON array)
  selectedBackground: varchar("selectedBackground", { length: 100 }).default("default"), // الخلفية المختارة
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type InsertTeacherProfile = typeof teacherProfiles.$inferInsert;

/**
 * Standards table - 11 performance standards
 */
export const standards = mysqlTable("standards", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").notNull(), // 1-11
  weight: int("weight").notNull(), // الوزن النسبي (5% أو 10%)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Standard = typeof standards.$inferSelect;
export type InsertStandard = typeof standards.$inferInsert;

/**
 * Evidence templates - linked to standards
 */
export const evidenceTemplates = mysqlTable("evidenceTemplates", {
  id: int("id").autoincrement().primaryKey(),
  standardId: int("standardId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  evidenceType: mysqlEnum("evidenceType", ["general", "subject", "stage"]).default("general").notNull(),
  applicableSubjects: text("applicableSubjects"), // JSON array - null means all
  applicableStages: text("applicableStages"), // JSON array - null means all
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvidenceTemplate = typeof evidenceTemplates.$inferSelect;
export type InsertEvidenceTemplate = typeof evidenceTemplates.$inferInsert;

/**
 * User evidence - teacher's completed evidence with 2 pages
 */
export const userEvidence = mysqlTable("userEvidence", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  evidenceTemplateId: int("evidenceTemplateId").notNull(),
  standardId: int("standardId").notNull(),
  
  // Page 1 content
  page1Title: varchar("page1Title", { length: 255 }),
  page1Content: text("page1Content"),
  page1Images: text("page1Images"), // JSON array of image URLs
  
  // Page 2 content
  page2Title: varchar("page2Title", { length: 255 }),
  page2Content: text("page2Content"),
  page2Images: text("page2Images"), // JSON array of image URLs
  
  // Additional fields (dynamic based on evidence type)
  eventDate: timestamp("eventDate"), // التاريخ
  lessonName: varchar("lessonName", { length: 255 }), // اسم الدرس
  celebrationName: varchar("celebrationName", { length: 255 }), // اسم الاحتفال
  initiativeName: varchar("initiativeName", { length: 255 }), // اسم المبادرة
  additionalData: text("additionalData"), // JSON for any other custom fields
  
  isCompleted: boolean("isCompleted").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserEvidence = typeof userEvidence.$inferSelect;
export type InsertUserEvidence = typeof userEvidence.$inferInsert;

/**
 * Backgrounds for printing
 */
export const backgrounds = mysqlTable("backgrounds", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Background = typeof backgrounds.$inferSelect;
export type InsertBackground = typeof backgrounds.$inferInsert;
