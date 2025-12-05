import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, and, or, sql } from "drizzle-orm";
import * as schema from "../drizzle/schema";

let db: any;
let dbPromise: Promise<any> | null = null;

export async function initDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const connection = await mysql.createConnection(process.env.DATABASE_URL!);
      db = drizzle(connection, { schema, mode: "default" });
      return db;
    })();
  }
  return dbPromise;
}

// Initialize immediately
initDb().catch(console.error);

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

export async function upsertTeacherProfile(data: schema.InsertTeacherProfile) {
  const existing = await getTeacherProfile(data.userId);
  
  if (existing) {
    await db
      .update(schema.teacherProfiles)
      .set(data)
      .where(eq(schema.teacherProfiles.userId, data.userId));
    return { ...existing, ...data };
  } else {
    const result = await db.insert(schema.teacherProfiles).values(data);
    return { id: Number(result[0].insertId), ...data };
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
  let query = 'SELECT * FROM evidenceTemplates WHERE isActive = TRUE';
  
  if (filters?.standardId) {
    query += ` AND standardId = ${filters.standardId}`;
  }
  
  if (filters?.subject) {
    query += ` AND (subject = '${filters.subject}' OR subject = 'عام' OR subject IS NULL)`;
  }
  
  if (filters?.stage) {
    query += ` AND (stage = '${filters.stage}' OR stage = 'all')`;
  }
  
  query += ' ORDER BY id';
  
  const result: any = await db.execute(sql.raw(query));
  return result[0] || [];
}

export async function getEvidenceTemplate(id: number) {
  const result = await db
    .select()
    .from(schema.evidenceTemplates)
    .where(eq(schema.evidenceTemplates.id, id))
    .limit(1);
  return result[0] || null;
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
