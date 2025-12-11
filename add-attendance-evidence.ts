import Database from "better-sqlite3";

const db = new Database(process.env.DATABASE_URL!.replace("file:", ""));

// البحث عن template "الحضور والانصراف"
const template = db.prepare(`
  SELECT id, title FROM evidenceTemplates 
  WHERE title LIKE '%الحضور%' OR title LIKE '%الانصراف%'
  LIMIT 1
`).get() as { id: number; title: string } | undefined;

if (!template) {
  console.error("❌ لم يتم العثور على template للحضور والانصراف");
  process.exit(1);
}

console.log(`✅ وجدت template: ${template.title} (ID: ${template.id})`);

// البيانات
const description = `يُعدّ الالتزام بالدوام المدرسي حضورًا وانصرافًا أحد أهم ركائز أداء الواجبات الوظيفية للمعلم، فهو يعكس مستوى الانضباط المهني والمسؤولية تجاه المدرسة والطلاب وزملاء العمل. ويسهم الانتظام في الحضور في تعزيز جودة العملية التعليمية من خلال توفير بيئة مستقرة تساعد على تحقيق الأهداف التربوية المخططة. كما يُعدّ الالتزام بمواعيد الانصراف دلالة على إتمام المهام اليومية والأعمال المنوطة بالمعلم وفق التنظيمات المعتمدة. ويُمكّن الانضباط المدرسي الإدارة من تنظيم العمل وتوزيع المهام بكفاءة، ويضمن سير الجدول الدراسي دون تعطّل أو إرباك. كما يؤثر الالتزام إيجابًا في بناء صورة مهنية موثوقة للمعلم، ويعكس احترامه للأنظمة والتعاميم. ويمثل الحضور والانصراف المنتظم أحد مؤشرات الأداء الأساسية التي تُبنى عليها تقويمات المعلمين وبرامج التحسين وتحديد الاحتياجات المهنية. ومن هنا تتضح أهمية توثيق هذا الجانب ضمن شواهد ملف الأداء المهني باعتباره عنصرًا محوريًا في رفع مستوى الكفاءة المهنية للمعلم.`;

const section1Title = "الالتزام بالأنظمة والتعليمات";
const section1Content = `الالتزام بمواعيد الحضور والانصراف الرسمية وفق أنظمة وزارة التعليم.

متابعة التحديثات والتعاميم الخاصة بالدوام المدرسي والعمل بها فورًا.

تطبيق آليات إثبات الحضور عبر المنصات أو الأنظمة المعتمدة دون تأخير.`;

const section2Title = "أثر الانضباط على جودة التعليم";
const section2Content = `انتظام الحضور يسهم في استقرار الجدول الدراسي وعدم فقد الحصص.

تعزيز تواصل المعلم مع طلابه واستكمال الخطط الدراسية دون تعثر.

توفير بيئة تعليمية محفزة تعكس المهنية والانضباط.`;

const section3Title = "تنظيم العمل وتوزيع المهام";
const section3Content = `تسهيل مهام الإدارة في إعداد الجداول ومعالجة الغياب الطارئ.

ضمان تنفيذ الإشراف اليومي والحصص البديلة بانسيابية.

الإسهام في استقرار أعمال المدرسة وبرامجها.`;

const section4Title = "تعزيز الانضباط والمسؤولية المهنية";
const section4Content = `الحضور المبكر يعكس استعداد المعلم لليوم الدراسي.

الانصراف في الوقت المحدد يؤكد التزامه بإتمام مهامه اليومية.

تحسين الصورة المهنية للمعلم أمام الطلاب والزملاء والمجتمع.`;

const section5Title = "توثيق الحضور والانصراف كأحد الشواهد";
const section5Content = `حفظ سجلات الدوام اليومية أو الأسبوعية ضمن ملف الأداء المهني.

إرفاق تقارير أو كشوف من النظام المعتمد كدليل على الالتزام.

استخدام هذه السجلات في دعم المعايير الخاصة بالأداء الوظيفي.`;

const section6Title = "الانعكاسات الإيجابية على بيئة العمل";
const section6Content = `تقليل حالات العجز الطارئ وزيادة الاستقرار المدرسي.

تعزيز ثقافة الالتزام والانضباط بين جميع العاملين.

تحسين رضا أولياء الأمور والمجتمع عن مستوى التنظيم داخل المدرسة.`;

// إضافة evidenceSubTemplate
try {
  const result = db.prepare(`
    INSERT INTO evidenceSubTemplates (
      templateId, title, description,
      section1Title, section1Content,
      section2Title, section2Content,
      section3Title, section3Content,
      section4Title, section4Content,
      section5Title, section5Content,
      section6Title, section6Content,
      applicableStages, applicableSubjects
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    template.id,
    "الحضور والانصراف",
    description,
    section1Title, section1Content,
    section2Title, section2Content,
    section3Title, section3Content,
    section4Title, section4Content,
    section5Title, section5Content,
    section6Title, section6Content,
    null, // applicableStages (null = جميع المراحل)
    null  // applicableSubjects (null = جميع المواد)
  );

  console.log(`✅ تم إضافة evidenceSubTemplate بنجاح (ID: ${result.lastInsertRowid})`);
} catch (error) {
  console.error("❌ خطأ في إضافة evidenceSubTemplate:", error);
  process.exit(1);
}

db.close();
console.log("✅ تم الانتهاء بنجاح!");
