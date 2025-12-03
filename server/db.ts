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
  InsertBackground,
  evidenceSubTemplates,
  evidenceDetails
} from "../drizzle/schema";
import * as schema from "../drizzle/schema";
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
    sql`SELECT * FROM evidenceSubTemplates WHERE evidenceTemplateId = ${templateId}`
  );
  const allSubEvidence = result as any[];
  
  // If user has no profile data (empty arrays), show all sub-evidence
  if (userStages.length === 0 && userSubjects.length === 0) {
    return allSubEvidence;
  }
  
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

export async function getSubTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(evidenceSubTemplates).where(eq(evidenceSubTemplates.id, id)).limit(1);
  return result[0] || null;
}

export async function createEvidenceDetail(data: {
  userId: number;
  subTemplateId: number;
  templateId: number;
  dynamicFields: string;
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  section5: string;
  section6: string;
  image1: string | null;
  image2: string | null;
  theme: string;
}) {
  const db = await getDb();
  if (!db) return;
  
  // Get standardId from evidenceSubTemplate
  const subTemplate = await db
    .select({ standardId: evidenceSubTemplates.standardId })
    .from(evidenceSubTemplates)
    .where(eq(evidenceSubTemplates.id, data.subTemplateId))
    .limit(1);
  
  if (subTemplate.length === 0) {
    throw new Error(`Evidence sub-template ${data.subTemplateId} not found`);
  }
  
  const standardId = subTemplate[0].standardId;
  
  // Create a temporary userEvidence entry first (required by schema)
  const userEvidenceResult = await db.insert(userEvidence).values({
    userId: data.userId,
    evidenceTemplateId: data.templateId,
    standardId,
    isCompleted: false,
  });
  
  const userEvidenceId = Number(userEvidenceResult[0].insertId);
  
  const evidenceDetailResult = await db.insert(evidenceDetails).values({
    userId: data.userId,
    userEvidenceId,
    evidenceTemplateId: data.templateId,
    evidenceSubTemplateId: data.subTemplateId,
    customFields: data.dynamicFields,
    section1Content: data.section1,
    section2Content: data.section2,
    section3Content: data.section3,
    section4Content: data.section4,
    section5Content: data.section5,
    section6Content: data.section6,
    image1Url: data.image1,
    image2Url: data.image2,
    selectedTheme: data.theme,
  });
  
  return Number(evidenceDetailResult[0].insertId);
}

/**
 * Get evidence detail by ID with all related data
 */
export async function getEvidenceDetailById(id: number) {
  const db = await getDb();
  
  const result = await db
    .select()
    .from(evidenceDetails)
    .where(eq(evidenceDetails.id, id))
    .limit(1);
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0];
}

/**
 * Get all evidence details for a user with related data
 */
export async function getUserEvidenceDetails(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const result = await db
    .select({
      id: evidenceDetails.id,
      userId: evidenceDetails.userId,
      evidenceSubTemplateId: evidenceDetails.evidenceSubTemplateId,
      customFields: evidenceDetails.customFields,
      section1Content: evidenceDetails.section1Content,
      section2Content: evidenceDetails.section2Content,
      section3Content: evidenceDetails.section3Content,
      section4Content: evidenceDetails.section4Content,
      section5Content: evidenceDetails.section5Content,
      section6Content: evidenceDetails.section6Content,
      image1Url: evidenceDetails.image1Url,
      image2Url: evidenceDetails.image2Url,
      createdAt: evidenceDetails.createdAt,
      updatedAt: evidenceDetails.updatedAt,
      // Sub-template data
      subTemplateTitle: evidenceSubTemplates.title,
      subTemplateDescription: evidenceSubTemplates.description,
      // Standard data
      standardId: evidenceSubTemplates.standardId,
    })
    .from(evidenceDetails)
    .leftJoin(
      evidenceSubTemplates,
      eq(evidenceDetails.evidenceSubTemplateId, evidenceSubTemplates.id)
    )
    .where(eq(evidenceDetails.userId, userId))
    .orderBy(desc(evidenceDetails.createdAt));
  
  return result;
}

/**
 * Delete evidence detail by ID (with user ownership check)
 */
export async function deleteEvidenceDetail(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  // First check if the evidence belongs to the user
  const existing = await db
    .select()
    .from(evidenceDetails)
    .where(eq(evidenceDetails.id, id))
    .limit(1);
  
  if (existing.length === 0 || existing[0].userId !== userId) {
    return false;
  }
  
  // Delete the evidence
  await db!
    .delete(evidenceDetails)
    .where(eq(evidenceDetails.id, id));
  
  return true;
}

/**
 * Get evidence sub-templates by standard ID
 */
export async function getEvidenceSubTemplatesByStandard(standardId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');
  
  const result = await db
    .select()
    .from(evidenceSubTemplates)
    .where(eq(evidenceSubTemplates.standardId, standardId))
    .orderBy(evidenceSubTemplates.orderIndex);
  
  return result;
}
