import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

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
  selectedTheme: varchar("selectedTheme", { length: 100 }).default("theme1"), // الثيم المختار للطباعة
  // حقول جديدة (اختيارية)
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
  hasSubEvidence: boolean("hasSubEvidence").default(false).notNull(), // Whether this template has sub-evidence
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvidenceTemplate = typeof evidenceTemplates.$inferSelect;
export type InsertEvidenceTemplate = typeof evidenceTemplates.$inferInsert;

/**
 * Evidence sub-templates - detailed sub-evidence linked to main evidence templates
 */
export const evidenceSubTemplates = mysqlTable("evidenceSubTemplates", {
  id: int("id").autoincrement().primaryKey(),
  evidenceTemplateId: int("evidenceTemplateId").notNull(), // الشاهد الرئيسي
  standardId: int("standardId").notNull(), // المعيار
  title: varchar("title", { length: 500 }).notNull(), // عنوان الشاهد الفرعي
  description: text("description"), // وصف تفصيلي
  
  // Content sections (6 sections for page 2)
  section1Title: varchar("section1Title", { length: 255 }),
  section1Content: text("section1Content"),
  section2Title: varchar("section2Title", { length: 255 }),
  section2Content: text("section2Content"),
  section3Title: varchar("section3Title", { length: 255 }),
  section3Content: text("section3Content"),
  section4Title: varchar("section4Title", { length: 255 }),
  section4Content: text("section4Content"),
  section5Title: varchar("section5Title", { length: 255 }),
  section5Content: text("section5Content"),
  section6Title: varchar("section6Title", { length: 255 }),
  section6Content: text("section6Content"),
  
  // Default images (2 images)
  defaultImage1Url: text("defaultImage1Url"),
  defaultImage2Url: text("defaultImage2Url"),
  
  // Filtering criteria
  applicableSubjects: text("applicableSubjects"), // JSON array - المواد المناسبة
  applicableGrades: text("applicableGrades"), // JSON array - الصفوف المناسبة
  applicableStages: text("applicableStages"), // JSON array - المراحل المناسبة
  applicableSemesters: text("applicableSemesters"), // JSON array - الفصول الدراسية
  applicableTracks: text("applicableTracks"), // JSON array - المسارات (عام، علمي، أدبي، إلخ)
  
  orderIndex: int("orderIndex").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvidenceSubTemplate = typeof evidenceSubTemplates.$inferSelect;
export type InsertEvidenceSubTemplate = typeof evidenceSubTemplates.$inferInsert;

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

/**
 * Evidence details with custom fields and PDF generation
 */
export const evidenceDetails = mysqlTable("evidenceDetails", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEvidenceId: int("userEvidenceId").notNull(), // ربط مع userEvidence
  evidenceTemplateId: int("evidenceTemplateId").notNull(),
  evidenceSubTemplateId: int("evidenceSubTemplateId"), // null if main evidence
  
  // Page 1: Dynamic fields (JSON)
  customFields: text("customFields"), // {"المنفذ": "أحمد", "ساهم في التنفيذ": "محمد، سعيد", ...}
  
  // Page 2: Content sections (editable by teacher)
  section1Title: varchar("section1Title", { length: 100 }), // e.g., "المقدمة"
  section1Content: text("section1Content"),
  
  section2Title: varchar("section2Title", { length: 100 }), // e.g., "الأهداف"
  section2Content: text("section2Content"),
  
  section3Title: varchar("section3Title", { length: 100 }), // e.g., "الإجراءات"
  section3Content: text("section3Content"),
  
  section4Title: varchar("section4Title", { length: 100 }), // e.g., "النتائج"
  section4Content: text("section4Content"),
  
  section5Title: varchar("section5Title", { length: 100 }), // e.g., "التحليل والمناقشة"
  section5Content: text("section5Content"),
  
  section6Title: varchar("section6Title", { length: 100 }), // e.g., "التوصيات"
  section6Content: text("section6Content"),
  
  section7Title: varchar("section7Title", { length: 100 }), // e.g., "الخاتمة" (optional)
  section7Content: text("section7Content"),
  
  // Images (2-3 images)
  image1Url: text("image1Url"),
  image2Url: text("image2Url"),
  image3Url: text("image3Url"),
  
  // Theme selection
  selectedTheme: varchar("selectedTheme", { length: 50 }).default("moe").notNull(), // "moe" = Ministry of Education theme
  
  // Generated PDF
  pdfUrl: text("pdfUrl"),
  qrCodeData: text("qrCodeData"), // URL or data for QR code
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvidenceDetail = typeof evidenceDetails.$inferSelect;
export type InsertEvidenceDetail = typeof evidenceDetails.$inferInsert;
