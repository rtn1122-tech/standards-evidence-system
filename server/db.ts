import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  standards, 
  InsertStandard,
  teacherProfiles,
  InsertTeacherProfile,
  evidenceTemplates,
  InsertEvidenceTemplate,
  userEvidence,
  InsertUserEvidence,
  backgrounds,
  InsertBackground
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== Standards Functions ==========

export async function getAllStandards() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(standards).orderBy(standards.orderIndex);
}

export async function getStandardById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(standards).where(eq(standards.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createStandard(data: InsertStandard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(standards).values(data);
  return result;
}

export async function updateStandard(id: number, data: Partial<InsertStandard>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(standards).set(data).where(eq(standards.id, id));
}

export async function deleteStandard(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(standards).where(eq(standards.id, id));
}

// ========== Teacher Profile Functions ==========

export async function getTeacherProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertTeacherProfile(data: InsertTeacherProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(teacherProfiles).values(data).onDuplicateKeyUpdate({
    set: data,
  });
}

// ========== Evidence Template Functions ==========

export async function getEvidenceTemplatesByStandardId(standardId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(evidenceTemplates).where(eq(evidenceTemplates.standardId, standardId)).orderBy(evidenceTemplates.orderIndex);
}

export async function getAllEvidenceTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(evidenceTemplates).orderBy(evidenceTemplates.standardId, evidenceTemplates.orderIndex);
}

export async function createEvidenceTemplate(data: InsertEvidenceTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(evidenceTemplates).values(data);
  return result;
}

// ========== User Evidence Functions ==========

export async function getUserEvidenceByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(userEvidence).where(eq(userEvidence.userId, userId)).orderBy(desc(userEvidence.updatedAt));
}

export async function getUserEvidenceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userEvidence).where(eq(userEvidence.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserEvidence(data: InsertUserEvidence) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(userEvidence).values(data);
  return result;
}

export async function updateUserEvidence(id: number, data: Partial<InsertUserEvidence>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(userEvidence).set(data).where(eq(userEvidence.id, id));
}

export async function deleteUserEvidence(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(userEvidence).where(eq(userEvidence.id, id));
}

// ========== Background Functions ==========

export async function getAllBackgrounds() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(backgrounds).where(eq(backgrounds.isActive, true)).orderBy(backgrounds.orderIndex);
}

export async function createBackground(data: InsertBackground) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(backgrounds).values(data);
  return result;
}

// ========== Evidence Sub-Templates Functions ==========

export async function getSubEvidenceByTemplateId(templateId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute<any>(
    sql`SELECT * FROM evidenceSubTemplates WHERE evidenceTemplateId = ${templateId} ORDER BY orderIndex`
  );
  return result as any[];
}

export async function getFilteredSubEvidence(templateId: number, userStages: string[], userSubjects: string[]) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.execute<any>(
    sql`SELECT * FROM evidenceSubTemplates WHERE evidenceTemplateId = ${templateId} ORDER BY orderIndex`
  );
  const allSubEvidence = result as any[];
  
  // Filter based on user profile
  return allSubEvidence.filter((item) => {
    // Parse JSON fields
    const applicableStages = item.applicableStages ? JSON.parse(item.applicableStages) : null;
    const applicableSubjects = item.applicableSubjects ? JSON.parse(item.applicableSubjects) : null;
    
    // If no restrictions, show to everyone
    if (!applicableStages && !applicableSubjects) return true;
    
    // Check stage match
    const stageMatch = !applicableStages || applicableStages.some((stage: string) => userStages.includes(stage));
    
    // Check subject match
    const subjectMatch = !applicableSubjects || applicableSubjects.some((subject: string) => userSubjects.includes(subject));
    
    return stageMatch && subjectMatch;
  });
}
