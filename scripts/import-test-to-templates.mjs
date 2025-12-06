import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../server/db.ts';
import * as schema from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('📥 استيراد الشاهد التجريبي إلى evidenceTemplates...\n');
  
  const db = await initDb();

  const testFilePath = path.join(__dirname, '..', 'data', 'test-evidence.json');
  const evidence = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  // تحضير page2Boxes (الخانات الـ 6)
  const page2Boxes = [
    { title: evidence.section1Title, content: evidence.section1Content },
    { title: evidence.section2Title, content: evidence.section2Content },
    { title: evidence.section3Title, content: evidence.section3Content },
    { title: evidence.section4Title, content: evidence.section4Content },
    { title: evidence.section5Title, content: evidence.section5Content },
    { title: evidence.section6Title, content: evidence.section6Content }
  ];

  // تحضير userFields (المربعات المفعّلة)
  // activeFields: [1, 6, 17, 20]
  // 1: اسم العنصر، 6: المدة الزمنية، 17: الجهة المنظمة، 20: الزمن
  const fieldMapping = {
    1: { name: "اسم العنصر", type: "text", required: true },
    2: { name: "التاريخ", type: "date", required: false },
    3: { name: "عنوان الدرس", type: "text", required: false },
    4: { name: "عدد الطلاب", type: "number", required: false },
    5: { name: "مكان التنفيذ", type: "text", required: false },
    6: { name: "المدة الزمنية", type: "text", required: false },
    7: { name: "المستفيدون", type: "text", required: false },
    8: { name: "الصف", type: "text", required: false },
    9: { name: "المنفذ", type: "text", required: false },
    10: { name: "المادة الدراسية", type: "text", required: false },
    11: { name: "الفصل الدراسي", type: "select", required: false, options: ["الأول", "الثاني", "الثالث"] },
    12: { name: "الفترة", type: "select", required: false, options: ["الأولى", "الثانية", "الثالثة", "الرابعة"] },
    13: { name: "الوحدة الدراسية", type: "text", required: false },
    14: { name: "الهدف من النشاط", type: "textarea", required: false },
    15: { name: "الأدوات المستخدمة", type: "textarea", required: false },
    16: { name: "المشاركون", type: "text", required: false },
    17: { name: "الجهة المنظمة", type: "text", required: false },
    18: { name: "نوع النشاط", type: "text", required: false },
    19: { name: "المكان", type: "text", required: false },
    20: { name: "الزمن", type: "text", required: false },
    21: { name: "المعلم المزار", type: "text", required: false },
    22: { name: "طريقة التواصل", type: "select", required: false, options: ["منصة مدرستي", "رسائل نصية", "اتصال هاتفي", "لقاء مباشر"] }
  };

  const userFields = evidence.activeFields.map(fieldId => fieldMapping[fieldId]);

  // حذف القالب التجريبي السابق إن وجد
  await db.delete(schema.evidenceTemplates).where(eq(schema.evidenceTemplates.evidenceName, evidence.title));

  // إدراج القالب التجريبي
  const [inserted] = await db.insert(schema.evidenceTemplates).values({
    standardId: evidence.standardId,
    standardCode: "1.1.1", // رمز افتراضي
    standardName: "أداء الواجبات الوظيفية",
    evidenceName: evidence.title,
    subEvidenceName: null,
    description: evidence.description,
    defaultImageUrl: evidence.defaultImage1Url,
    page2Boxes: JSON.stringify(page2Boxes),
    userFields: JSON.stringify(userFields),
    subject: null,
    stage: "all",
    isActive: true,
    usageCount: 0
  }).$returningId();

  console.log(`✅ تم استيراد القالب التجريبي بنجاح!`);
  console.log(`📋 ID: ${inserted.id}`);
  console.log(`📝 العنوان: ${evidence.title}`);
  
  console.log(`\n🔗 رابط القالب في النظام:`);
  console.log(`   https://3000-ivqgowbiloeiu42a7mfpv-2cb4dd44.manus-asia.computer/templates/${inserted.id}`);
  
  return inserted.id;
}

main()
  .then((id) => {
    console.log(`\n✅ القالب جاهز للمعاينة!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
