import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Teacher Profile - حفظ البيانات', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  
  beforeAll(() => {
    const mockContext: Context = {
      user: {
        id: '999999',
        name: 'اختبار المعلم',
        email: 'test@example.com',
        role: 'user',
      },
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(mockContext);
  });

  it('يجب أن يحفظ البيانات الأساسية بنجاح', async () => {
    const result = await caller.teacherProfile.upsert({
      teacherName: 'أحمد محمد العلي',
      email: 'ahmed@example.com',
      phone: '0501234567',
      gender: 'male',
      educationDepartment: 'إدارة التعليم بالرياض',
      schoolName: 'مدرسة الملك عبدالعزيز',
      principalName: 'محمد بن سعد',
      stage: JSON.stringify(['الصف الأول', 'الصف الثاني']),
      subjects: JSON.stringify(['الرياضيات', 'العلوم']),
      preferredTheme: 'white',
      preferredCoverTheme: 'theme1',
    });

    expect(result).toBeDefined();
    expect(result.teacherName).toBe('أحمد محمد العلي');
  });

  it('يجب أن يحفظ البيانات بدون حقول الرخصة (اختيارية)', async () => {
    const result = await caller.teacherProfile.upsert({
      teacherName: 'فاطمة أحمد',
      email: 'fatima@example.com',
      phone: '0509876543',
      gender: 'female',
      educationDepartment: 'إدارة التعليم بجدة',
      schoolName: 'مدرسة الأمل',
      principalName: 'سارة بنت علي',
      stage: JSON.stringify(['الصف الثالث']),
      subjects: JSON.stringify(['اللغة العربية']),
      preferredTheme: 'theme1',
      preferredCoverTheme: 'theme2',
      // بدون حقول الرخصة
    });

    expect(result).toBeDefined();
    expect(result.teacherName).toBe('فاطمة أحمد');
  });

  it('يجب أن يحفظ الرتبة بشكل صحيح', async () => {
    const levels = ['practitioner', 'advanced', 'expert'] as const;
    
    for (const level of levels) {
      const result = await caller.teacherProfile.upsert({
        teacherName: `معلم ${level}`,
        email: `${level}@example.com`,
        phone: '0501111111',
        gender: 'male',
        educationDepartment: 'إدارة التعليم',
        schoolName: 'مدرسة الاختبار',
        principalName: 'المدير',
        stage: JSON.stringify(['الصف الأول']),
        subjects: JSON.stringify(['الرياضيات']),
        teacherLevel: level,
        preferredTheme: 'white',
        preferredCoverTheme: 'theme1',
      });

      expect(result).toBeDefined();
      expect(result.jobTitle).toBe(level);
    }
  });

  it('يجب أن يحفظ جميع الثيمات المتاحة', async () => {
    const evidenceThemes = ['white', 'theme1', 'theme2'];
    const coverThemes = ['theme1', 'theme2', 'theme3'];
    
    for (const evidenceTheme of evidenceThemes) {
      for (const coverTheme of coverThemes) {
        const result = await caller.teacherProfile.upsert({
          teacherName: 'معلم الثيمات',
          email: 'themes@example.com',
          phone: '0501111111',
          gender: 'male',
          educationDepartment: 'إدارة التعليم',
          schoolName: 'مدرسة الاختبار',
          principalName: 'المدير',
          stage: JSON.stringify(['الصف الأول']),
          subjects: JSON.stringify(['الرياضيات']),
          preferredTheme: evidenceTheme,
          preferredCoverTheme: coverTheme,
        });

        expect(result).toBeDefined();
        expect(result.preferredTheme).toBe(evidenceTheme);
        expect(result.preferredCoverTheme).toBe(coverTheme);
      }
    }
  });
});
