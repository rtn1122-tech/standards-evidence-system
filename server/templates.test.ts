import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Evidence Templates System", () => {
  beforeAll(async () => {
    // Wait for db initialization
    await db.initDb();
  });

  it("should list all evidence templates", async () => {
    const templates = await db.listEvidenceTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThanOrEqual(0);
  });

  it("should filter templates by standardId", async () => {
    const templates = await db.listEvidenceTemplates({ standardId: 1 });
    expect(Array.isArray(templates)).toBe(true);
    if (templates.length > 0) {
      expect(templates[0].standardId).toBe(1);
    }
  });

  it("should list all standards", async () => {
    const standards = await db.listStandards();
    expect(Array.isArray(standards)).toBe(true);
    expect(standards.length).toBe(11); // يجب أن يكون هناك 11 معيار
  });

  it("should get a specific standard", async () => {
    const standard = await db.getStandard(1);
    expect(standard).toBeTruthy();
    if (standard) {
      expect(standard.id).toBe(1);
      expect(standard.name).toBeTruthy();
    }
  });

  it("should list themes", async () => {
    const themes = await db.listThemes();
    expect(Array.isArray(themes)).toBe(true);
  });

  it("should list themes by type", async () => {
    const fullThemes = await db.listThemes('full');
    expect(Array.isArray(fullThemes)).toBe(true);
    
    const coverThemes = await db.listThemes('cover');
    expect(Array.isArray(coverThemes)).toBe(true);
  });
});

describe("User Evidences System", () => {
  beforeAll(async () => {
    await db.initDb();
  });

  it("should list user evidences (empty for non-existent user)", async () => {
    const evidences = await db.listUserEvidences(999999);
    expect(Array.isArray(evidences)).toBe(true);
    expect(evidences.length).toBe(0);
  });

  it("should create and retrieve user evidence", async () => {
    const newEvidence = await db.createUserEvidence({
      userId: 1,
      templateId: 1,
      userData: JSON.stringify({ field1: "test" }),
      customImageUrl: null,
      themeId: null,
      coverThemeId: null,
    });

    expect(newEvidence).toBeTruthy();
    expect(newEvidence.id).toBeTruthy();

    const retrieved = await db.getUserEvidence(newEvidence.id);
    expect(retrieved).toBeTruthy();
    if (retrieved) {
      expect(retrieved.userId).toBe(1);
      expect(retrieved.templateId).toBe(1);
    }

    // Cleanup
    await db.deleteUserEvidence(newEvidence.id);
  });

  it("should update user evidence", async () => {
    const newEvidence = await db.createUserEvidence({
      userId: 1,
      templateId: 1,
      userData: JSON.stringify({ field1: "test" }),
      customImageUrl: null,
      themeId: null,
      coverThemeId: null,
    });

    await db.updateUserEvidence(newEvidence.id, {
      userData: JSON.stringify({ field1: "updated" }),
    });

    const updated = await db.getUserEvidence(newEvidence.id);
    expect(updated).toBeTruthy();
    if (updated) {
      const data = JSON.parse(updated.userData);
      expect(data.field1).toBe("updated");
    }

    // Cleanup
    await db.deleteUserEvidence(newEvidence.id);
  });
});

describe("Teacher Profile System", () => {
  beforeAll(async () => {
    await db.initDb();
  });

  it("should get teacher profile (null for non-existent user)", async () => {
    const profile = await db.getTeacherProfile(999999);
    expect(profile).toBeNull();
  });

  it("should create and retrieve teacher profile", async () => {
    const profileData = {
      userId: 999999,
      educationDepartment: "Test Department",
      schoolName: "Test School",
      teacherName: "Test Teacher",
      principalName: "Test Principal",
      gender: "male" as const,
      stage: null,
      subjects: null,
      email: null,
      phoneNumber: null,
      professionalLicenseNumber: null,
      licenseStartDate: null,
      licenseEndDate: null,
      employeeNumber: null,
      jobTitle: null,
    };

    const created = await db.upsertTeacherProfile(profileData);
    expect(created).toBeTruthy();
    expect(created.userId).toBe(999999);

    const retrieved = await db.getTeacherProfile(999999);
    expect(retrieved).toBeTruthy();
    if (retrieved) {
      expect(retrieved.educationDepartment).toBe("Test Department");
      expect(retrieved.schoolName).toBe("Test School");
    }
  });

  it("should update existing teacher profile", async () => {
    const updated = await db.upsertTeacherProfile({
      userId: 999999,
      educationDepartment: "Updated Department",
      schoolName: "Updated School",
      teacherName: "Updated Teacher",
      principalName: "Updated Principal",
      gender: "female" as const,
      stage: null,
      subjects: null,
      email: null,
      phoneNumber: null,
      professionalLicenseNumber: null,
      licenseStartDate: null,
      licenseEndDate: null,
      employeeNumber: null,
      jobTitle: null,
    });

    expect(updated).toBeTruthy();
    expect(updated.educationDepartment).toBe("Updated Department");
    expect(updated.gender).toBe("female");
  });
});
