import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from '../server/db.ts';
import * as schema from '../drizzle/schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Field mapping
const FIELD_NAMES = {
  1: "اسم العنصر",
  2: "التاريخ",
  3: "عنوان الدرس",
  4: "عدد الطلاب",
  5: "مكان التنفيذ",
  6: "المدة الزمنية",
  7: "المستفيدون",
  8: "الصف",
  9: "المنفذ",
  10: "المادة الدراسية",
  11: "الفصل الدراسي",
  12: "الفترة",
  13: "الوحدة الدراسية",
  14: "الهدف من النشاط",
  15: "الأدوات المستخدمة",
  16: "المشاركون",
  17: "الجهة المنظمة",
  18: "نوع النشاط",
  19: "المكان",
  20: "الزمن",
  21: "المعلم المزار",
  22: "طريقة التواصل"
};

async function importEvidences() {
  console.log('📥 استيراد 33 شاهد إلى قاعدة البيانات...\n');

  // Initialize database
  const db = await initDb();

  const dataPath = path.join(__dirname, '..', 'data', 'generated-33-evidences.json');
  const evidences = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < evidences.length; i++) {
    const evidence = evidences[i];
    console.log(`⏳ [${i + 1}/33] استيراد: ${evidence.title}...`);

    try {
      // Build dynamic fields
      const dynamicFields = {};
      evidence.activeFields.forEach(fieldId => {
        const fieldName = FIELD_NAMES[fieldId];
        if (fieldName) {
          dynamicFields[fieldName] = "";
        }
      });

      // Prepare data for insertion
      const templateData = {
        standardId: evidence.standardId,
        standardName: evidence.standardName,
        title: evidence.title,
        subTitle: evidence.subTitle || null,
        description: evidence.description,
        dynamicFields: JSON.stringify(dynamicFields),
        section1Title: evidence.section1Title,
        section1Content: evidence.section1Content,
        section2Title: evidence.section2Title,
        section2Content: evidence.section2Content,
        section3Title: evidence.section3Title,
        section3Content: evidence.section3Content,
        section4Title: evidence.section4Title,
        section4Content: evidence.section4Content,
        section5Title: evidence.section5Title,
        section5Content: evidence.section5Content,
        section6Title: evidence.section6Title,
        section6Content: evidence.section6Content,
        defaultImage1Url: evidence.defaultImage1Url,
        defaultImage2Url: evidence.defaultImage2Url,
        applicableStages: JSON.stringify(evidence.applicableStages),
        applicableSubjects: JSON.stringify(evidence.applicableSubjects),
        applicableGrades: JSON.stringify(evidence.applicableGrades),
        isActive: true
      };

      await db.insert(schema.evidenceTemplates).values(templateData);
      
      successCount++;
      console.log(`✅ [${i + 1}/33] تم بنجاح!`);
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/33] خطأ:`, error.message);
    }
  }

  console.log(`\n📊 النتائج:`);
  console.log(`✅ نجح: ${successCount}`);
  console.log(`❌ فشل: ${errorCount}`);
  console.log(`📁 المجموع: ${evidences.length}`);
}

importEvidences()
  .then(() => {
    console.log('\n✅ اكتمل الاستيراد!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
