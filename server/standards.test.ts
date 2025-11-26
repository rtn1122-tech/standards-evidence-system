import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("standards router", () => {
  it("allows public access to list standards", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.standards.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("allows public access to get standard by id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.standards.getById({ id: 1 });

    expect(result).toBeDefined();
    if (result) {
      expect(result.id).toBe(1);
      expect(result.title).toBeDefined();
    }
  });

  it("prevents non-admin users from creating standards", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.standards.create({
        title: "Test Standard",
        description: "Test Description",
        orderIndex: 99,
      })
    ).rejects.toThrow();
  });

  it("allows admin users to create standards", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.standards.create({
      title: "Test Standard",
      description: "Test Description",
      orderIndex: 99,
    });

    expect(result.success).toBe(true);
  });
});

describe("evidence router", () => {
  it("allows public access to list evidence", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evidence.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("allows public access to get evidence by standard id", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evidence.getByStandardId({ standardId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("allows authenticated users to create evidence", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.evidence.create({
      standardId: 1,
      title: "Test Evidence",
      description: "Test Description",
    });

    expect(result.success).toBe(true);
  });

  it("prevents unauthenticated users from creating evidence", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.evidence.create({
        standardId: 1,
        title: "Test Evidence",
        description: "Test Description",
      })
    ).rejects.toThrow();
  });
});
