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
  
  // Themes
  preferredTheme: varchar("preferredTheme", { length: 100 }).default("white"), // ثيم الشواهد
  preferredCoverTheme: varchar("preferredCoverTheme", { length: 100 }).default("theme1"), // ثيم الغلاف
  profileImage: text("profileImage"), // صورة المعلم (base64)
  
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
 * Evidences table - pre-filled evidence templates (100+ evidences)
 * الشواهد الجاهزة - محتوى كامل جاهز للاستخدام
 */
export const evidences = mysqlTable("evidences", {
  id: int("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  stage: mysqlEnum("stage", ["kindergarten", "elementary", "middle", "high", "all"]).notNull(),
  standardId: int("standardId").notNull(), // المعيار (1-11)
  
  // Page 2 boxes (6 boxes)
  box1Title: varchar("box1Title", { length: 200 }),
  box1Content: text("box1Content"),
  box2Title: varchar("box2Title", { length: 200 }),
  box2Content: text("box2Content"),
  box3Title: varchar("box3Title", { length: 200 }),
  box3Content: text("box3Content"),
  box4Title: varchar("box4Title", { length: 200 }),
  box4Content: text("box4Content"),
  box5Title: varchar("box5Title", { length: 200 }),
  box5Content: text("box5Content"),
  box6Title: varchar("box6Title", { length: 200 }),
  box6Content: text("box6Content"),
  
  // Dynamic fields (6 fields on page 1)
  field1Label: varchar("field1Label", { length: 200 }),
  field1Value: varchar("field1Value", { length: 500 }),
  field2Label: varchar("field2Label", { length: 200 }),
  field2Value: varchar("field2Value", { length: 500 }),
  field3Label: varchar("field3Label", { length: 200 }),
  field3Value: varchar("field3Value", { length: 500 }),
  field4Label: varchar("field4Label", { length: 200 }),
  field4Value: varchar("field4Value", { length: 500 }),
  field5Label: varchar("field5Label", { length: 200 }),
  field5Value: varchar("field5Value", { length: 500 }),
  field6Label: varchar("field6Label", { length: 200 }),
  field6Value: varchar("field6Value", { length: 500 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type Evidence = typeof evidences.$inferSelect;
export type InsertEvidence = typeof evidences.$inferInsert;

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

/**
 * Custom service requests - teacher requests custom filling service
 * طلبات الخدمة المخصصة - المعلم يطلب تعبئة شواهد بصور مخصصة
 */
export const customServiceRequests = mysqlTable("customServiceRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // المعلم الطالب
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  
  // Requested evidence templates (JSON array of template IDs)
  // مثال: [1, 5, 12, 18, 23]
  requestedTemplateIds: text("requestedTemplateIds").notNull(), // JSON array
  
  // Teacher notes
  notes: text("notes"), // ملاحظات المعلم (اختياري)
  
  // Owner notes (internal)
  ownerNotes: text("ownerNotes"), // ملاحظات المالك (داخلية)
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"), // تاريخ الإكمال
});

export type CustomServiceRequest = typeof customServiceRequests.$inferSelect;
export type InsertCustomServiceRequest = typeof customServiceRequests.$inferInsert;

/**
 * Custom service images - images uploaded by teacher for custom service
 * الصور المرفوعة من المعلم للخدمة المخصصة
 */
export const customServiceImages = mysqlTable("customServiceImages", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(), // ربط مع customServiceRequests
  imageUrl: text("imageUrl").notNull(), // رابط الصورة في S3
  originalFilename: varchar("originalFilename", { length: 255 }), // اسم الملف الأصلي
  fileSize: int("fileSize"), // حجم الملف (bytes)
  mimeType: varchar("mimeType", { length: 100 }), // نوع الملف
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type CustomServiceImage = typeof customServiceImages.$inferSelect;
export type InsertCustomServiceImage = typeof customServiceImages.$inferInsert;

/**
 * Custom service assignments - owner assigns images to evidence templates
 * ربط الصور بالشواهد - المالك يختار الصور المناسبة لكل شاهد
 */
export const customServiceAssignments = mysqlTable("customServiceAssignments", {
  id: int("id").autoincrement().primaryKey(),
  requestId: int("requestId").notNull(), // ربط مع customServiceRequests
  templateId: int("templateId").notNull(), // القالب المطلوب
  imageId: int("imageId").notNull(), // الصورة المختارة
  position: int("position").notNull(), // موقع الصورة (1 أو 2)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomServiceAssignment = typeof customServiceAssignments.$inferSelect;
export type InsertCustomServiceAssignment = typeof customServiceAssignments.$inferInsert;

/**
 * Print orders - professional printing service
 * طلبات الطباعة - خدمة الطباعة الاحترافية
 */
export const printOrders = mysqlTable("printOrders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "printing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  paperType: mysqlEnum("paperType", ["standard", "premium", "vip"]).default("standard").notNull(),
  bindingType: mysqlEnum("bindingType", ["spiral", "thermal", "luxury"]).default("spiral").notNull(),
  copies: int("copies").default(1).notNull(),
  price: int("price").notNull(), // السعر بالريال (محفوظ كـ integer بدلاً من decimal)
  evidenceIds: text("evidenceIds").notNull(), // JSON array of evidence IDs
  shippingAddress: text("shippingAddress"),
  trackingNumber: varchar("trackingNumber", { length: 255 }),
  notes: text("notes"),
  sallaOrderId: varchar("sallaOrderId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
});

export type PrintOrder = typeof printOrders.$inferSelect;
export type InsertPrintOrder = typeof printOrders.$inferInsert;

/**
 * Custom evidences - teacher-created custom evidence requests
 * الشواهد الخاصة - شواهد مخصصة ينشئها المعلم
 */
export const customEvidences = mysqlTable("customEvidences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // المعلم الذي أنشأ الشاهد
  standardId: int("standardId").notNull(), // المعيار (1-11)
  
  // معلومات الشاهد
  evidenceName: varchar("evidenceName", { length: 255 }).notNull(), // اسم الشاهد
  description: text("description").notNull(), // الوصف
  grades: text("grades").notNull(), // الصفوف المناسبة (JSON array)
  subject: varchar("subject", { length: 255 }), // المادة
  
  // حقول إضافية يريدها المعلم
  customFields: text("customFields"), // JSON array of {name, type, required}
  
  // هل الشاهد عام أم خاص
  isPublic: boolean("isPublic").default(false).notNull(), // false = خاص بالمعلم, true = عام للجميع
  
  // حالة المراجعة (دائماً approved للاستخدام الفوري)
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("approved").notNull(),
  ownerNotes: text("ownerNotes"), // ملاحظات المالك
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  reviewedAt: timestamp("reviewedAt"), // تاريخ المراجعة
});

export type CustomEvidence = typeof customEvidences.$inferSelect;
export type InsertCustomEvidence = typeof customEvidences.$inferInsert;
