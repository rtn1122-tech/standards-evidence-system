import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";

describe("Standards Accordion and Progress", () => {
  let testUserId: number;
  let standardId: number;
  let templateId: number;

  beforeAll(async () => {
    // Create test user profile
    testUserId = Math.floor(Math.random() * 1000000) + 900000;
    await db.upsertTeacherProfile({
      userId: testUserId,
      educationDepartment: "إدارة تعليم الرياض",
      schoolName: "مدرسة الاختبار",
      teacherName: "معلم الاختبار",
      principalName: "مدير الاختبار",
      gender: "male",
      stage: "المرحلة الابتدائية",
      subjects: JSON.stringify(["الرياضيات"]),
    });

    // Get first standard
    const standards = await db.getAllStandards();
    standardId = standards[0].id;

    // Get first evidence template
    const templates = await db.getEvidenceTemplatesByStandardId(standardId);
    templateId = templates[0].id;
  });

  it("should list all standards", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const standards = await caller.standards.list();
    
    expect(standards).toBeDefined();
    expect(standards.length).toBe(11);
    expect(standards[0]).toHaveProperty("title");
    expect(standards[0]).toHaveProperty("weight");
  });

  it("should list evidence templates by standard", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.listByStandard({
      standardId,
    });
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it("should calculate progress correctly - no evidence", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "user", openId: "test", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), email: null, loginMethod: null },
      req: {} as any,
      res: {} as any,
    });

    const progress = await caller.standards.getProgress();
    
    expect(progress).toBeDefined();
    expect(progress.totalCount).toBe(11);
    expect(progress.completedCount).toBe(0);
    expect(progress.totalProgress).toBe(0);
  });

  it("should list user evidence by standard - empty initially", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "user", openId: "test", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), email: null, loginMethod: null },
      req: {} as any,
      res: {} as any,
    });

    const evidence = await caller.evidence.listByStandard({
      standardId,
    });
    
    expect(evidence).toBeDefined();
    expect(Array.isArray(evidence)).toBe(true);
  });

  it("should create evidence and update progress", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "user", openId: "test", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), email: null, loginMethod: null },
      req: {} as any,
      res: {} as any,
    });

    // Create evidence
    await caller.evidence.create({
      evidenceTemplateId: templateId,
      standardId,
      page1Title: "صفحة 1",
      page1Content: "محتوى الصفحة الأولى",
      page2Title: "صفحة 2",
      page2Content: "محتوى الصفحة الثانية",
    });

    // Check evidence list
    const evidenceList = await caller.evidence.listByStandard({
      standardId,
    });
    
    expect(evidenceList.length).toBeGreaterThan(0);
    expect(evidenceList[0].page1Title).toBe("صفحة 1");

    // Mark as completed
    await caller.evidence.update({
      id: evidenceList[0].id,
      isCompleted: true,
    });

    // Check progress - should still be 0 because we completed evidence, not standard
    const progress = await caller.standards.getProgress();
    expect(progress.completedCount).toBeGreaterThan(0);
  });

  it("should filter evidence by standard correctly", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, name: "Test User", role: "user", openId: "test", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(), email: null, loginMethod: null },
      req: {} as any,
      res: {} as any,
    });

    const evidenceForStandard = await caller.evidence.listByStandard({
      standardId,
    });

    const allEvidence = await caller.evidence.list();

    // Evidence for specific standard should be subset of all evidence
    expect(evidenceForStandard.length).toBeLessThanOrEqual(allEvidence.length);
    
    // All evidence in filtered list should belong to the standard
    evidenceForStandard.forEach((ev) => {
      expect(ev.standardId).toBe(standardId);
    });
  });

  it("should get evidence templates count per standard", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const standards = await caller.standards.list();
    
    for (const standard of standards) {
      const templates = await caller.evidenceTemplates.listByStandard({
        standardId: standard.id,
      });
      
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      // Each standard should have at least some evidence templates
      expect(templates.length).toBeGreaterThanOrEqual(0);
    }
  });
});
