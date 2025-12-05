import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';
import { getDb } from './db';
import { sql } from 'drizzle-orm';

describe('Evidence Details Tests', () => {
  let testUserId: number;
  let testSubTemplateId: number;

  beforeAll(async () => {
    // Create a test user
    const database = await getDb();
    if (!database) throw new Error('Database not available');
    
    // Insert test user (use INSERT IGNORE to avoid duplicate error)
    await database.execute(
      sql`INSERT IGNORE INTO users (openId, name, role) VALUES ('test-evidence-details', 'Test User', 'user')`
    );
    
    const userResult = await database.execute<any>(
      sql`SELECT id FROM users WHERE openId = 'test-evidence-details' LIMIT 1`
    );
    const users = userResult as any[];
    testUserId = users[0].id;
    
    // Get an existing sub-template ID (we know we have 156 sub-evidence items)
    const subTemplateResult = await database.execute<any>(
      sql`SELECT id FROM evidenceSubTemplates LIMIT 1`
    );
    const subTemplates = subTemplateResult as any[];
    testSubTemplateId = subTemplates[0].id;
  });

  it('should get sub-template by ID', async () => {
    const subTemplate = await db.getSubTemplateById(testSubTemplateId);
    
    expect(subTemplate).toBeDefined();
    expect(subTemplate).not.toBeNull();
    expect(subTemplate.id).toBe(testSubTemplateId);
    expect(subTemplate.title).toBeDefined();
  });

  it('should return null for non-existent sub-template', async () => {
    const subTemplate = await db.getSubTemplateById(999999);
    
    expect(subTemplate).toBeNull();
  });

  it('should create evidence detail', async () => {
    const evidenceData = {
      userId: testUserId,
      subTemplateId: testSubTemplateId,
      templateId: 30002, // Default template ID
      dynamicFields: JSON.stringify({
        executor: 'المعلم الأول',
        contributors: 'المعلم الثاني',
        beneficiaries: 'طلاب الصف الثالث',
        teacherName: 'أحمد محمد',
        date: new Date().toISOString(),
        standardName: 'المعيار 2',
        evidenceName: 'شاهد تجريبي',
      }),
      section1: 'هذه مقدمة تجريبية',
      section2: 'هذه أهداف تجريبية',
      section3: 'هذه إجراءات تجريبية',
      section4: 'هذه نتائج تجريبية',
      section5: 'هذا تحليل تجريبي',
      section6: 'هذه توصيات تجريبية',
      section7: 'هذه خاتمة تجريبية',
      image1: null,
      image2: null,
      theme: 'default',
    };

    await expect(db.createEvidenceDetail(evidenceData)).resolves.not.toThrow();
    
    // Verify the evidence was created
    const database = await getDb();
    if (!database) throw new Error('Database not available');
    
    const result = await database.execute<any>(
      sql`SELECT * FROM evidenceDetails WHERE userId = ${testUserId} AND subTemplateId = ${testSubTemplateId} LIMIT 1`
    );
    const rows = result as any[];
    
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].section1Content).toBe('هذه مقدمة تجريبية');
    expect(rows[0].section2Content).toBe('هذه أهداف تجريبية');
    expect(rows[0].selectedTheme).toBe('default');
  });

  it('should retrieve created evidence detail', async () => {
    const database = await getDb();
    if (!database) throw new Error('Database not available');
    
    const result = await database.execute<any>(
      sql`SELECT * FROM evidenceDetails WHERE userId = ${testUserId} ORDER BY createdAt DESC LIMIT 1`
    );
    const rows = result as any[];
    
    expect(rows.length).toBeGreaterThan(0);
    
    const evidence = rows[0];
    expect(evidence.userId).toBe(testUserId);
    expect(evidence.subTemplateId).toBe(testSubTemplateId);
    expect(evidence.customFields).toBeDefined();
    
    const dynamicFields = JSON.parse(evidence.customFields);
    expect(dynamicFields.executor).toBe('المعلم الأول');
    expect(dynamicFields.beneficiaries).toBe('طلاب الصف الثالث');
  });
});
