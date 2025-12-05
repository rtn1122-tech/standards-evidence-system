import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(user?: AuthenticatedUser): TrpcContext {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminUser(): AuthenticatedUser {
  return {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

function createRegularUser(): AuthenticatedUser {
  return {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

describe("standards router", () => {
  it("should list all standards", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const standards = await caller.standards.list();

    expect(Array.isArray(standards)).toBe(true);
    expect(standards.length).toBeGreaterThan(0);
    expect(standards[0]).toHaveProperty("title");
    expect(standards[0]).toHaveProperty("orderIndex");
    expect(standards[0]).toHaveProperty("weight");
  });

  it("should get standard by id", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const standards = await caller.standards.list();
    const firstStandard = standards[0];

    if (firstStandard) {
      const standard = await caller.standards.getById({ id: firstStandard.id });
      expect(standard).toBeDefined();
      expect(standard?.id).toBe(firstStandard.id);
    }
  });
});

describe("teacherProfile router", () => {
  it("should require authentication to get profile", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.teacherProfile.get()).rejects.toThrow();
  });

  it("should allow authenticated user to upsert profile", async () => {
    const user = createRegularUser();
    const ctx = createTestContext(user);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.teacherProfile.upsert({
      gender: "male",
      educationDepartment: "إدارة التعليم بالرياض",
      schoolName: "مدرسة الأمل",
      teacherName: "محمد أحمد",
      principalName: "عبدالله سعيد",
      stage: "ابتدائي",
      subjects: JSON.stringify(["رياضيات", "علوم"]),
    });

    expect(result).toEqual({ success: true });
  });
});

describe("userEvidence router", () => {
  it("should require authentication to list evidence", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.userEvidence.list()).rejects.toThrow();
  });

  it("should allow authenticated user to list their evidence", async () => {
    const user = createRegularUser();
    const ctx = createTestContext(user);
    const caller = appRouter.createCaller(ctx);

    const evidenceList = await caller.userEvidence.list();

    expect(Array.isArray(evidenceList)).toBe(true);
  });
});

describe("backgrounds router", () => {
  it("should list all backgrounds", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const backgrounds = await caller.backgrounds.list();

    expect(Array.isArray(backgrounds)).toBe(true);
  });
});
