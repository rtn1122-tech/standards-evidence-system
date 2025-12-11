import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// URLs الصور المرفوعة
const images = [
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663229092848/YjsvLRWcBNgBAjjH.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663229092848/OeUWlRyIrrlBOCGP.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663229092848/qqKeCwSxYSGdiaef.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663229092848/VtFzFaPlYhezFYNg.png',
  'https://files.manuscdn.com/user_upload_by_module/session_file/310519663229092848/XFJhPdQArZNOqTeP.png',
];

// المحتوى النصي الافتراضي (من الشاهد 120002)
const defaultContent = {
  section1Content: 'الالتزام بمواعيد الحضور والانصراف الرسمية وفق أنظمة وزارة التعليم.; متابعة التحديثات والتعاميم الخاصة بالدوام المدرسي والعمل بها فورًا.; تطبيق آليات إثبات الحضور عبر المنصات أو الأنظمة المعتمدة دون تأخير.',
  section2Content: 'انتظام الحضور يسهم في استقرار الجدول الدراسي وعدم فقد الحصص.; تعزيز تواصل المعلم مع طلابه واستكمال الخطط الدراسية دون تعثر.; توفير بيئة تعليمية محفزة تعكس المهنية والانضباط.',
  section3Content: 'تسهيل مهام الإدارة في إعداد الجداول ومعالجة الغياب الطارئ.; ضمان تنفيذ الإشراف اليومي والحصص البديلة بانسيابية.; الإسهام في استقرار أعمال المدرسة وبرامجها.',
  section4Content: 'الحضور المبكر يعكس استعداد المعلم لليوم الدراسي.; الانصراف في الوقت المحدد يؤكد التزامه بإتمام مهامه اليومية.; تحسين الصورة المهنية للمعلم أمام الطلاب والزملاء والمجتمع.',
  section5Content: 'حفظ سجلات الدوام اليومية أو الأسبوعية ضمن ملف الأداء المهني.; إرفاق تقارير أو كشوف من النظام المعتمد كدليل على الالتزام.; استخدام هذه السجلات في دعم المعايير الخاصة بالأداء الوظيفي.',
  section6Content: 'تقليل حالات العجز الطارئ وزيادة الاستقرار المدرسي.; تعزيز ثقافة الالتزام والانضباط بين جميع العاملين.; تحسين رضا أولياء الأمور والمجتمع عن مستوى التنظيم داخل المدرسة.',
};

// جلب المعايير والشواهد الفرعية
const [standards] = await connection.execute(`
  SELECT 
    s.id as standard_id,
    s.title as standard_title,
    s.orderIndex as standard_order,
    (SELECT id FROM evidenceSubTemplates WHERE standardId = s.id ORDER BY id LIMIT 1) as sub_template_id,
    (SELECT title FROM evidenceSubTemplates WHERE standardId = s.id ORDER BY id LIMIT 1) as sub_template_title
  FROM standards s
  ORDER BY s.orderIndex
  LIMIT 11
`);

console.log(`Found ${standards.length} standards`);

// إضافة شاهد واحد لكل معيار
for (let i = 0; i < standards.length; i++) {
  const standard = standards[i];
  const imageIndex = i % images.length;
  
  const basicInfo = JSON.stringify({
    title: '',
    grade: '',
    beneficiaries: '',
    duration: '',
    location: '',
    studentsCount: '',
    lessonTitle: '',
    teacherName: 'معلم تجريبي',
    date: new Date().toISOString(),
    standardName: standard.standard_title,
    evidenceName: standard.sub_template_title,
  });

  await connection.execute(`
    INSERT INTO evidenceDetails (
      userId, userEvidenceId, evidenceTemplateId, evidenceSubTemplateId,
      customFields,
      section1Content, section2Content, section3Content,
      section4Content, section5Content, section6Content,
      image1Url, image2Url,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, [
    1, // userId (افتراضي)
    360002 + i, // userEvidenceId (فريد لكل شاهد)
    30002, // evidenceTemplateId (افتراضي)
    standard.sub_template_id,
    basicInfo,
    defaultContent.section1Content,
    defaultContent.section2Content,
    defaultContent.section3Content,
    defaultContent.section4Content,
    defaultContent.section5Content,
    defaultContent.section6Content,
    images[imageIndex],
    images[(imageIndex + 1) % images.length],
  ]);

  console.log(`✓ Added evidence for standard ${standard.standard_order}: ${standard.standard_title}`);
}

console.log('\n✅ Successfully added 11 evidence records!');
await connection.end();
