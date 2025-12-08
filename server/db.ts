import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, or, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";

// Create connection pool with automatic reconnection
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Initialize Drizzle with the pool
const db = drizzle(pool, { schema, mode: "default" });

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log('[DB] Connection pool initialized successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('[DB] Failed to initialize connection pool:', err);
  });

export async function initDb() {
  return db;
}

export { db };

// ========================================
// Teacher Profile
// ========================================

export async function getTeacherProfile(userId: number) {
  const result = await db
    .select()
    .from(schema.teacherProfiles)
    .where(eq(schema.teacherProfiles.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function upsertTeacherProfile(data: any) {
  const existing = await getTeacherProfile(data.userId);
  
  // تحويل الحقول إلى أسماء الأعمدة الصحيحة
  const profileData: any = {
    userId: data.userId,
    educationDepartment: data.educationDepartment,
    schoolName: data.schoolName,
    teacherName: data.teacherName,
    principalName: data.principalName,
    gender: data.gender,
    stage: data.stage, // JSON string للصفوف الدراسية
    subjects: data.subjects, // JSON string
    email: data.email,
    phoneNumber: data.phone, // phone -> phoneNumber
    professionalLicenseNumber: data.licenseNumber, // licenseNumber -> professionalLicenseNumber
    licenseStartDate: data.licenseIssueDate, // licenseIssueDate -> licenseStartDate
    licenseEndDate: data.licenseExpiryDate, // licenseExpiryDate -> licenseEndDate
    selectedTheme: data.preferredTheme, // preferredTheme -> selectedTheme
  };
  
  // حذف الحقول undefined
  Object.keys(profileData).forEach(key => {
    if (profileData[key] === undefined) {
      delete profileData[key];
    }
  });
  
  if (existing) {
    // Update existing profile
    await db
      .update(schema.teacherProfiles)
      .set(profileData)
      .where(eq(schema.teacherProfiles.userId, data.userId));
    
    return { ...existing, ...profileData };
  } else {
    // Insert new profile
    await db.insert(schema.teacherProfiles).values(profileData);
    return profileData;
  }
}

// ========================================
// Standards
// ========================================

export async function listStandards() {
  return await db
    .select()
    .from(schema.standards)
    .orderBy(schema.standards.orderIndex);
}

export async function getStandard(id: number) {
  const result = await db
    .select()
    .from(schema.standards)
    .where(eq(schema.standards.id, id))
    .limit(1);
  return result[0] || null;
}

// ========================================
// Evidence Templates
// ========================================

export async function listEvidenceTemplates(filters?: {
  standardId?: number;
  subject?: string;
  stage?: string;
}) {
  // قراءة من جدول evidences (الشواهد الجاهزة)
  let query = 'SELECT * FROM evidences WHERE 1=1';
  
  if (filters?.standardId) {
    query += ` AND standardId = ${filters.standardId}`;
  }
  
  if (filters?.stage) {
    query += ` AND (stage = '${filters.stage}' OR stage = 'all')`;
  }
  
  query += ' ORDER BY id';
  
  const result: any = await db.execute(sql.raw(query));
  return result[0] || [];
}

export async function getEvidenceTemplate(id: number) {
  // قراءة من جدول evidences (الشواهد الجاهزة) باستخدام raw SQL
  const result: any = await db.execute(sql.raw(`SELECT * FROM evidences WHERE id = ${id} LIMIT 1`));
  const evidence = result[0]?.[0];
  if (!evidence) return null;
  
  // تحويل box1-box6 إلى page2Boxes JSON array
  const page2Boxes = [
    { title: evidence.box1Title || 'المربع الأول', content: evidence.box1Content || '' },
    { title: evidence.box2Title || 'المربع الثاني', content: evidence.box2Content || '' },
    { title: evidence.box3Title || 'المربع الثالث', content: evidence.box3Content || '' },
    { title: evidence.box4Title || 'المربع الرابع', content: evidence.box4Content || '' },
    { title: evidence.box5Title || 'المربع الخامس', content: evidence.box5Content || '' },
    { title: evidence.box6Title || 'المربع السادس', content: evidence.box6Content || '' },
  ];
  
  // تحويل field1-field6 إلى userFields JSON array
  const userFields = [];
  if (evidence.field1Label) {
    userFields.push({ name: evidence.field1Label, value: evidence.field1Value || '', type: 'text' });
  }
  if (evidence.field2Label) {
    userFields.push({ name: evidence.field2Label, value: evidence.field2Value || '', type: 'text' });
  }
  if (evidence.field3Label) {
    userFields.push({ name: evidence.field3Label, value: evidence.field3Value || '', type: 'text' });
  }
  if (evidence.field4Label) {
    userFields.push({ name: evidence.field4Label, value: evidence.field4Value || '', type: 'text' });
  }
  if (evidence.field5Label) {
    userFields.push({ name: evidence.field5Label, value: evidence.field5Value || '', type: 'text' });
  }
  if (evidence.field6Label) {
    userFields.push({ name: evidence.field6Label, value: evidence.field6Value || '', type: 'text' });
  }
  
  return {
    ...evidence,
    evidenceName: evidence.title,
    page2Boxes: JSON.stringify(page2Boxes),
    userFields: JSON.stringify(userFields),
  };
}

export async function createEvidenceTemplate(data: schema.InsertEvidenceTemplate) {
  const result = await db.insert(schema.evidenceTemplates).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateEvidenceTemplate(id: number, data: Partial<schema.InsertEvidenceTemplate>) {
  await db
    .update(schema.evidenceTemplates)
    .set(data)
    .where(eq(schema.evidenceTemplates.id, id));
}

export async function deleteEvidenceTemplate(id: number) {
  await db
    .delete(schema.evidenceTemplates)
    .where(eq(schema.evidenceTemplates.id, id));
}

export async function incrementTemplateUsage(templateId: number) {
  await db.execute(
    sql`UPDATE evidenceTemplates SET usageCount = usageCount + 1 WHERE id = ${templateId}`
  );
}

// ========================================
// User Evidences
// ========================================

export async function listUserEvidences(userId: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM userEvidences WHERE userId = ${userId} ORDER BY createdAt DESC`
  );
  return result[0] || [];
}

export async function getUserEvidence(id: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM userEvidences WHERE id = ${id} LIMIT 1`
  );
  return result[0]?.[0] || null;
}

export async function createUserEvidence(data: any) {
  const result: any = await db.execute(
    sql`INSERT INTO userEvidences (userId, templateId, userData, customImageUrl, themeId, coverThemeId) VALUES (${data.userId}, ${data.templateId}, ${data.userData}, ${data.customImageUrl || null}, ${data.themeId || null}, ${data.coverThemeId || null})`
  );
  return { id: Number(result[0].insertId), ...data };
}

export async function updateUserEvidence(id: number, data: any) {
  const fields = [];
  if (data.userData !== undefined) fields.push(`userData = ${sql.raw(`'${data.userData}'`)}`);
  if (data.customImageUrl !== undefined) fields.push(`customImageUrl = ${sql.raw(`'${data.customImageUrl}'`)}`);
  if (data.themeId !== undefined) fields.push(`themeId = ${data.themeId}`);
  if (data.coverThemeId !== undefined) fields.push(`coverThemeId = ${data.coverThemeId}`);
  if (data.pdfUrl !== undefined) fields.push(`pdfUrl = ${sql.raw(`'${data.pdfUrl}'`)}`);
  
  if (fields.length > 0) {
    await db.execute(sql.raw(`UPDATE userEvidences SET ${fields.join(', ')} WHERE id = ${id}`));
  }
}

export async function deleteUserEvidence(id: number) {
  await db.execute(sql`DELETE FROM userEvidences WHERE id = ${id}`);
}

// ========================================
// Themes
// ========================================

export async function listThemes(type?: 'full' | 'cover') {
  let query = 'SELECT * FROM themes WHERE isActive = TRUE';
  if (type) {
    query += ` AND type = '${type}'`;
  }
  query += ' ORDER BY id';
  
  const result: any = await db.execute(sql.raw(query));
  return result[0] || [];
}

export async function getTheme(id: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM themes WHERE id = ${id} LIMIT 1`
  );
  return result[0]?.[0] || null;
}

// ========================================
// Activation Codes
// ========================================

export async function getActivationCode(code: string) {
  const result: any = await db.execute(
    sql`SELECT * FROM activationCodes WHERE code = ${code} LIMIT 1`
  );
  return result[0]?.[0] || null;
}

export async function useActivationCode(code: string, userId: number) {
  await db.execute(
    sql`UPDATE activationCodes SET isUsed = TRUE, usedByUserId = ${userId}, usedAt = NOW() WHERE code = ${code}`
  );
}

// ========================================
// Users
// ========================================

export async function updateUserSubscription(userId: number, data: {
  activationCode: string;
  subscriptionStart: Date;
  subscriptionEnd: Date;
  isActive: boolean;
}) {
  await db.execute(
    sql`UPDATE users SET activationCode = ${data.activationCode}, subscriptionStart = ${data.subscriptionStart}, subscriptionEnd = ${data.subscriptionEnd}, isActive = ${data.isActive} WHERE id = ${userId}`
  );
}

// ========================================
// Users (Auth)
// ========================================

export async function getUserByOpenId(openId: string) {
  const result: any = await db.execute(
    sql`SELECT * FROM users WHERE openId = ${openId} LIMIT 1`
  );
  return result[0]?.[0] || null;
}

export async function upsertUser(data: any) {
  const existing = await getUserByOpenId(data.openId);
  
  if (existing) {
    await db.execute(
      sql`UPDATE users SET lastSignedIn = ${data.lastSignedIn || new Date()} WHERE openId = ${data.openId}`
    );
    return existing;
  } else {
    const result: any = await db.execute(
      sql`INSERT INTO users (openId, name, email, loginMethod, lastSignedIn) VALUES (${data.openId}, ${data.name || null}, ${data.email || null}, ${data.loginMethod || null}, ${data.lastSignedIn || new Date()})`
    );
    return { id: Number(result[0].insertId), ...data };
  }
}


// ========================================
// Custom Service
// ========================================

export async function createCustomServiceRequest(data: {
  userId: number;
  templateIds: number[];
  imageUrls: string[];
  notes?: string;
}) {
  // Create the request
  const requestResult: any = await db.execute(
    sql`INSERT INTO customServiceRequests (userId, requestedTemplateIds, notes, status)
        VALUES (${data.userId}, ${JSON.stringify(data.templateIds)}, ${data.notes || null}, 'pending')`
  );
  
  const requestId = Number(requestResult[0].insertId);
  
  // Insert images
  for (const imageUrl of data.imageUrls) {
    await db.execute(
      sql`INSERT INTO customServiceImages (requestId, imageUrl, originalFilename)
          VALUES (${requestId}, ${imageUrl}, ${imageUrl.split('/').pop() || 'image'})`
    );
  }
  
  return { id: requestId, status: "pending" };
}

export async function listCustomServiceRequests(userId: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM customServiceRequests WHERE userId = ${userId} ORDER BY createdAt DESC`
  );
  
  return result[0] || [];
}

export async function getCustomServiceRequest(requestId: number, userId: number) {
  const requestResult: any = await db.execute(
    sql`SELECT * FROM customServiceRequests WHERE id = ${requestId} AND userId = ${userId} LIMIT 1`
  );
  
  const request = requestResult[0]?.[0];
  if (!request) {
    return null;
  }
  
  // Get images
  const imagesResult: any = await db.execute(
    sql`SELECT * FROM customServiceImages WHERE requestId = ${requestId}`
  );
  
  return {
    ...request,
    images: imagesResult[0] || [],
  };
}


// ========================================
// Print Orders
// ========================================

export async function createPrintOrder(data: {
  userId: number;
  evidenceIds: number[];
  paperType: string;
  bindingType: string;
  copies: number;
  price: number;
  shippingAddress: string;
  notes?: string;
}) {
  const result: any = await db.execute(
    sql`INSERT INTO printOrders (userId, evidenceIds, paperType, bindingType, copies, price, shippingAddress, notes, status)
        VALUES (${data.userId}, ${JSON.stringify(data.evidenceIds)}, ${data.paperType}, ${data.bindingType}, ${data.copies}, ${data.price}, ${data.shippingAddress}, ${data.notes || null}, 'pending')`
  );
  
  return { id: Number(result[0].insertId) };
}

export async function listPrintOrders(userId: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM printOrders WHERE userId = ${userId} ORDER BY createdAt DESC`
  );
  
  return result[0] || [];
}

export async function getPrintOrder(orderId: number, userId: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM printOrders WHERE id = ${orderId} AND userId = ${userId} LIMIT 1`
  );
  
  return result[0]?.[0] || null;
}

// ========================================
// Custom Evidences
// ========================================

export async function createCustomEvidence(data: {
  userId: number;
  standardId: number;
  evidenceName: string;
  description: string;
  grades: string[]; // Array of grade names
  subject?: string;
  customFields?: any[];
}) {
  const result: any = await db.execute(
    sql`INSERT INTO customEvidences (userId, standardId, evidenceName, description, grades, subject, customFields, status)
        VALUES (${data.userId}, ${data.standardId}, ${data.evidenceName}, ${data.description}, ${JSON.stringify(data.grades)}, ${data.subject || null}, ${JSON.stringify(data.customFields || [])}, 'pending')`
  );
  
  return { id: Number(result[0].insertId), status: "pending" };
}

export async function listCustomEvidences(userId: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM customEvidences WHERE userId = ${userId} ORDER BY createdAt DESC`
  );
  
  return result[0] || [];
}

export async function listAllCustomEvidences() {
  const result: any = await db.execute(
    sql`SELECT ce.*, u.name as userName, u.email as userEmail 
        FROM customEvidences ce 
        LEFT JOIN users u ON ce.userId = u.id 
        ORDER BY ce.createdAt DESC`
  );
  
  return result[0] || [];
}

export async function listPublicCustomEvidences() {
  const result: any = await db.execute(
    sql`SELECT * FROM customEvidences WHERE isPublic = TRUE ORDER BY createdAt DESC`
  );
  
  return result[0] || [];
}

export async function makeCustomEvidencePublic(id: number, ownerNotes?: string) {
  await db.execute(
    sql`UPDATE customEvidences 
        SET isPublic = TRUE, ownerNotes = ${ownerNotes || null}, reviewedAt = NOW() 
        WHERE id = ${id}`
  );
}



export async function getCustomEvidence(id: number) {
  const result: any = await db.execute(
    sql`SELECT * FROM customEvidences WHERE id = ${id} LIMIT 1`
  );
  
  return result[0]?.[0] || null;
}


// ========================================
// Admin Functions
// ========================================

export async function getAllUsers() {
  const result: any = await db.execute(
    sql`SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.role,
          u.createdAt,
          tp.teacherName,
          tp.schoolName,
          tp.educationDepartment,
          tp.licenseNumber
        FROM users u
        LEFT JOIN teacherProfiles tp ON u.id = tp.userId
        ORDER BY u.createdAt DESC`
  );
  
  return result[0] || [];
}

export async function getUserStatistics(userId: number) {
  // عدد الشواهد العادية
  const evidencesResult: any = await db.execute(
    sql`SELECT COUNT(*) as count FROM userEvidences WHERE userId = ${userId}`
  );
  const evidencesCount = evidencesResult[0]?.[0]?.count || 0;

  // عدد الشواهد الخاصة
  const customEvidencesResult: any = await db.execute(
    sql`SELECT COUNT(*) as count FROM customEvidences WHERE userId = ${userId}`
  );
  const customEvidencesCount = customEvidencesResult[0]?.[0]?.count || 0;

  // التقدم حسب المعيار
  const progressResult: any = await db.execute(
    sql`SELECT 
          s.id as standardId,
          s.title as standardTitle,
          COUNT(DISTINCT ue.templateId) as completedCount,
          (SELECT COUNT(*) FROM evidenceTemplates WHERE standardId = s.id) as totalCount
        FROM standards s
        LEFT JOIN evidenceTemplates et ON s.id = et.standardId
        LEFT JOIN userEvidences ue ON et.id = ue.templateId AND ue.userId = ${userId}
        GROUP BY s.id, s.title
        ORDER BY s.orderIndex`
  );

  return {
    userId,
    evidencesCount,
    customEvidencesCount,
    totalCount: evidencesCount + customEvidencesCount,
    progressByStandard: progressResult[0] || [],
  };
}
