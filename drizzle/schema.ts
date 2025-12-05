import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }).unique(), // رقم الجوال (للتفعيل)
  gender: mysqlEnum("gender", ["male", "female"]), // الجنس
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Subscription fields
  activationCode: varchar("activationCode", { length: 50 }).unique(), // رمز التفعيل من سلة
  subscriptionStart: date("subscriptionStart"), // تاريخ بداية الاشتراك
  subscriptionEnd: date("subscriptionEnd"), // تاريخ نهاية الاشتراك (10 محرم 1448هـ)
  isActive: boolean("isActive").default(true).notNull(), // حالة الاشتراك
  
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
  stage: varchar("stage", { length: 100 }), // المرحلة (ابتدائي، متوسط، ثانوي) - JSON array
  subjects: text("subjects"), // المواد التدريسية (JSON array)
  selectedTheme: varchar("selectedTheme", { length: 100 }).default("theme1"), // الثيم المختار للطباعة
  
  // حقول اختيارية
  email: varchar("email", { length: 255 }), // البريد الإلكتروني
  phoneNumber: varchar("phoneNumber", { length: 20 }), // رقم الجوال
  professionalLicenseNumber: varchar("professionalLicenseNumber", { length: 100 }), // رقم الرخصة المهنية
  licenseStartDate: date("licenseStartDate"), // تاريخ بداية الرخصة
  licenseEndDate: date("licenseEndDate"), // تاريخ نهاية الرخصة
  employeeNumber: varchar("employeeNumber", { length: 100 }), // الرقم الوظيفي
  jobTitle: varchar("jobTitle", { length: 255 }), // المسمى الوظيفي
  
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
 * Evidence templates - pre-filled by owner (80+ templates)
 * المالك يُجهز المحتوى كاملاً، المعلم يملأ 4-5 حقول فقط
 */
export const evidenceTemplates = mysqlTable("evidenceTemplates", {
  id: int("id").autoincrement().primaryKey(),
  standardId: int("standardId").notNull(), // المعيار (1-11)
  standardCode: varchar("standardCode", { length: 50 }).notNull(), // رقم المعيار (مثل: 1.1.1)
  standardName: varchar("standardName", { length: 255 }).notNull(), // اسم المعيار
  evidenceName: varchar("evidenceName", { length: 255 }).notNull(), // اسم الشاهد
  subEvidenceName: varchar("subEvidenceName", { length: 255 }), // الشاهد الفرعي (اختياري)
  description: text("description").notNull(), // الوصف (الصفحة الأولى)
  
  // Default image
  defaultImageUrl: text("defaultImageUrl"), // الصورة الافتراضية
  
  // Page 2 boxes (JSON array of {title, content})
  // مثال: [{"title": "الأهداف", "content": "• هدف 1\n• هدف 2"}, ...]
  page2Boxes: text("page2Boxes").notNull(), // JSON
  
  // User fields (JSON array of {name, type, required, options})
  // مثال: [{"name": "التاريخ", "type": "date", "required": true}, ...]
  userFields: text("userFields").notNull(), // JSON
  
  // Filtering criteria
  subject: varchar("subject", { length: 100 }), // المادة (رياضيات، علوم، عام)
  stage: mysqlEnum("stage", ["primary", "middle", "high", "all"]).default("all").notNull(), // المرحلة
  
  isActive: boolean("isActive").default(true).notNull(),
  usageCount: int("usageCount").default(0).notNull(), // عدد مرات الاستخدام
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvidenceTemplate = typeof evidenceTemplates.$inferSelect;
export type InsertEvidenceTemplate = typeof evidenceTemplates.$inferInsert;

/**
 * User evidences - teacher's completed evidence
 * المعلم يملأ البيانات البسيطة فقط (4-5 حقول)
 */
export const userEvidences = mysqlTable("userEvidences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId").notNull(), // ربط مع evidenceTemplates
  
  // User data (JSON object - البيانات التي ملأها المعلم)
  // مثال: {"التاريخ": "2025-12-05", "الفصل الدراسي": "الثاني", "عدد الأيام": "180"}
  userData: text("userData").notNull(), // JSON
  
  // Custom image (if teacher uploaded one)
  customImageUrl: text("customImageUrl"), // صورة مخصصة (اختياري)
  
  // Theme selection
  themeId: int("themeId"), // الثيم المختار
  coverThemeId: int("coverThemeId"), // ثيم الغلاف
  
  // Generated PDF
  pdfUrl: text("pdfUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserEvidence = typeof userEvidences.$inferSelect;
export type InsertUserEvidence = typeof userEvidences.$inferInsert;

/**
 * Themes for PDF generation
 */
export const themes = mysqlTable("themes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // اسم الثيم
  type: mysqlEnum("type", ["full", "cover"]).notNull(), // نوع الثيم (كامل أو غلاف فقط)
  previewImageUrl: text("previewImageUrl"), // صورة المعاينة
  templateFileUrl: text("templateFileUrl"), // ملف القالب
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = typeof themes.$inferInsert;

/**
 * Activation codes from Salla
 */
export const activationCodes = mysqlTable("activationCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).unique().notNull(), // رمز التفعيل
  sallaOrderId: varchar("sallaOrderId", { length: 100 }), // رقم الطلب من سلة
  isUsed: boolean("isUsed").default(false).notNull(), // هل تم استخدامه
  usedByUserId: int("usedByUserId"), // من استخدمه
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  usedAt: timestamp("usedAt"), // تاريخ الاستخدام
});

export type ActivationCode = typeof activationCodes.$inferSelect;
export type InsertActivationCode = typeof activationCodes.$inferInsert;
