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

// Stage mapping
const STAGE_MAP = {
  "ابتدائي": "primary",
  "متوسط": "middle",
  "ثانوي": "high"
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
      // Build userFields (dynamic fields for teacher to fill)
      const userFields = evidence.activeFields.map(fieldId => {
        const fieldName = FIELD_NAMES[fieldId];
        return {
          name: fieldName,
          type: fieldId === 2 ? "date" : "text",
          required: false
        };
      });

      // Build page2Boxes (6 sections)
      const page2Boxes = [
        { title: evidence.section1Title, content: evidence.section1Content },
        { title: evidence.section2Title, content: evidence.section2Content },
        { title: evidence.section3Title, content: evidence.section3Content },
        { title: evidence.section4Title, content: evidence.section4Content },
        { title: evidence.section5Title, content: evidence.section5Content },
        { title: evidence.section6Title, content: evidence.section6Content }
      ];

      // Determine stage
      let stage = "all";
      if (evidence.applicableStages.length === 1) {
        stage = STAGE_MAP[evidence.applicableStages[0]] || "all";
      }

      // Determine subject
      let subject = null;
      if (evidence.applicableSubjects.length > 0) {
        subject = evidence.applicableSubjects.join(", ");
      }

      // Prepare data for insertion
      const templateData = {
        standardId: evidence.standardId,
        standardCode: `${evidence.standardId}.1.1`, // Default code
        standardName: evidence.standardName,
        evidenceName: evidence.title,
        subEvidenceName: evidence.subTitle || null,
        description: evidence.description,
        defaultImageUrl: evidence.defaultImage1Url,
        page2Boxes: JSON.stringify(page2Boxes),
        userFields: JSON.stringify(userFields),
        subject: subject,
        stage: stage,
        isActive: true,
        usageCount: 0
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
