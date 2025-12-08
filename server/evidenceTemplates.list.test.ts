import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import { initDb } from './db';

describe('evidenceTemplates.list', () => {
  beforeAll(async () => {
    await initDb();
  });

  it('يجب أن يرجع جميع الشواهد عند عدم تحديد فلتر', async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.list();
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
  });

  it('يجب أن يرجع شواهد المعيار 11 (14 شاهد)', async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.list({ standardId: 11 });
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(14);
    
    // التحقق من أن جميع الشواهد تنتمي للمعيار 11
    templates.forEach((template: any) => {
      expect(template.standardId).toBe(11);
    });
  });

  it('يجب أن يرجع شواهد المعيار 7 (16 شاهد)', async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.list({ standardId: 7 });
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(16);
    
    // التحقق من أن جميع الشواهد تنتمي للمعيار 7
    templates.forEach((template: any) => {
      expect(template.standardId).toBe(7);
    });
  });

  it('يجب أن يرجع شواهد المعيار 1 (6 شواهد)', async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.list({ standardId: 1 });
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(6);
    
    // التحقق من أن جميع الشواهد تنتمي للمعيار 1
    templates.forEach((template: any) => {
      expect(template.standardId).toBe(1);
    });
  });

  it('يجب أن يرجع مصفوفة فارغة لمعيار غير موجود', async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    const templates = await caller.evidenceTemplates.list({ standardId: 999 });
    
    expect(templates).toBeDefined();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBe(0);
  });
});
