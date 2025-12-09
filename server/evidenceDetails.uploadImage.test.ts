import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as storage from "./storage";

// Mock storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
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
    res: {} as TrpcContext["res"],
  };
}

describe("evidenceDetails.uploadImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload image and return URL", async () => {
    // Mock storage response
    const mockUrl = "https://storage.example.com/evidence-images/1/123456-abc123.jpg";
    vi.mocked(storage.storagePut).mockResolvedValue({
      key: "evidence-images/1/123456-abc123.jpg",
      url: mockUrl,
    });

    // Create caller with mock context
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Create a simple base64 image (1x1 red pixel PNG)
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    // Call the mutation
    const result = await caller.evidenceDetails.uploadImage({
      file: base64Image,
      fileName: "test-image.png",
    });

    // Verify the result
    expect(result).toEqual({ url: mockUrl });

    // Verify storagePut was called with correct parameters
    expect(storage.storagePut).toHaveBeenCalledOnce();
    const [fileKey, buffer, contentType] = vi.mocked(storage.storagePut).mock.calls[0];
    
    expect(fileKey).toMatch(/^evidence-images\/1\/\d+-[a-z0-9]+\.png$/);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(contentType).toBe("image/png");
  });

  it("should handle JPEG images", async () => {
    const mockUrl = "https://storage.example.com/evidence-images/2/789012-def456.jpg";
    vi.mocked(storage.storagePut).mockResolvedValue({
      key: "evidence-images/2/789012-def456.jpg",
      url: mockUrl,
    });

    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

    const result = await caller.evidenceDetails.uploadImage({
      file: base64Image,
      fileName: "photo.jpg",
    });

    expect(result).toEqual({ url: mockUrl });
    
    const [fileKey, buffer, contentType] = vi.mocked(storage.storagePut).mock.calls[0];
    expect(fileKey).toMatch(/^evidence-images\/2\/\d+-[a-z0-9]+\.jpg$/);
    expect(contentType).toBe("image/jpg");
  });

  it("should require authentication", async () => {
    // Create caller without user context
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);

    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";

    // Should throw UNAUTHORIZED error
    await expect(
      caller.evidenceDetails.uploadImage({
        file: base64Image,
        fileName: "test.png",
      })
    ).rejects.toThrow();
  });
});
