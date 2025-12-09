import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// 11 شاهد فرعي - واحد لكل معيار
const subTemplates = [
  { standardId: 1, title: 'الحضور والانصراف', description: 'الالتزام بمواعيد الحضور والانصراف المدرسي' },
  { standardId: 2, title: 'حضور ورش العمل', description: 'المشاركة الفعالة في ورش العمل والاجتماعات المهنية' },
  { standardId: 3, title: 'لقاء أولياء الأمور', description: 'عقد لقاءات دورية مع أولياء الأمور لمتابعة تقدم الطلاب' },
  { standardId: 4, title: 'تنظيم الصف', description: 'ترتيب وتنظيم بيئة الصف الدراسي' },
  { standardId: 5, title: 'إعداد الخطط الدراسية', description: 'تحضير وإعداد الخطط الدراسية اليومية والأسبوعية' },
  { standardId: 6, title: 'تطبيق استراتيجيات التدريس', description: 'استخدام استراتيجيات تدريسية متنوعة وفعالة' },
  { standardId: 7, title: 'تقويم الطلاب', description: 'إجراء تقويمات دورية لقياس تحصيل الطلاب' },
  { standardId: 8, title: 'حضور دورات تدريبية', description: 'المشاركة في دورات تدريبية لتطوير المهارات المهنية' },
  { standardId: 9, title: 'الالتزام بالقيم المهنية', description: 'التمسك بأخلاقيات المهنة والقيم التربوية' },
  { standardId: 10, title: 'استخدام التقنية في التدريس', description: 'توظيف التقنية الحديثة في العملية التعليمية' },
  { standardId: 11, title: 'المشاركة في الأنشطة المدرسية', description: 'المساهمة في تنظيم وتنفيذ الأنشطة المدرسية' },
];

// إضافة الشواهد الفرعية
for (const [index, template] of subTemplates.entries()) {
  await connection.execute(
    `INSERT INTO evidenceSubTemplates (
      evidenceTemplateId, standardId, title, description,
      section1Title, section1Content,
      section2Title, section2Content,
      section3Title, section3Content,
      section4Title, section4Content,
      section5Title, section5Content,
      section6Title, section6Content,
      defaultImage1Url, defaultImage2Url,
      orderIndex
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      template.standardId, // evidenceTemplateId (نفس standardId)
      template.standardId,
      template.title,
      template.description,
      'الهدف من الشاهد', 'يهدف هذا الشاهد إلى توثيق الممارسات المهنية المتميزة للمعلم في مجال ' + template.title,
      'وصف النشاط', 'تم تنفيذ النشاط بطريقة منظمة ومخططة مسبقاً، مع مراعاة احتياجات جميع الطلاب والتأكد من تحقيق الأهداف التعليمية المرجوة.',
      'الفئة المستهدفة', 'جميع طلاب الصف مع التركيز على الطلاب ذوي الاحتياجات الخاصة والموهوبين.',
      'الأدوات والمصادر', 'تم استخدام مجموعة متنوعة من الأدوات والمصادر التعليمية الحديثة لضمان فعالية النشاط.',
      'النتائج والمخرجات', 'حقق النشاط نتائج إيجابية ملموسة في تحسين أداء الطلاب وزيادة دافعيتهم للتعلم.',
      'التأمل والتطوير', 'بعد تنفيذ النشاط، تم التأمل في الممارسات وتحديد نقاط القوة ومجالات التحسين للأنشطة المستقبلية.',
      'https://storage.manus.space/manus-webdev/0a02d5f7-b1a4-4d86-9c76-e6c3b8d6e5f3/evidence-images/standard1_attendance_1.png',
      'https://storage.manus.space/manus-webdev/0a02d5f7-b1a4-4d86-9c76-e6c3b8d6e5f3/evidence-images/standard1_attendance_2.png',
      index + 1
    ]
  );
}

console.log('✅ تم إضافة 11 شاهد فرعي بنجاح!');
await connection.end();
