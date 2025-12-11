import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db.ts';
import { subEvidences } from '../drizzle/schema.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('📥 استيراد الشاهد التجريبي إلى قاعدة البيانات...\n');

  const testFilePath = path.join(__dirname, '..', 'data', 'test-evidence.json');
  const evidence = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  // حذف الشواهد التجريبية السابقة
  await db.delete(subEvidences).where({ title: evidence.title });

  // إدراج الشاهد التجريبي
  const [inserted] = await db.insert(subEvidences).values({
    standardId: evidence.standardId,
    title: evidence.title,
    description: evidence.description,
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
    applicableStages: evidence.applicableStages,
    applicableSubjects: evidence.applicableSubjects,
    applicableGrades: evidence.applicableGrades,
    priority: evidence.priority,
    defaultImage1Url: evidence.defaultImage1Url,
    defaultImage2Url: evidence.defaultImage2Url
  }).$returningId();

  console.log(`✅ تم استيراد الشاهد بنجاح!`);
  console.log(`📋 ID: ${inserted.id}`);
  console.log(`📝 العنوان: ${evidence.title}`);
  
  console.log(`\n🔗 رابط الشاهد في النظام:`);
  console.log(`   https://3000-ivqgowbiloeiu42a7mfpv-2cb4dd44.manus-asia.computer/sub-evidence/${inserted.id}`);
  
  return inserted.id;
}

main()
  .then((id) => {
    console.log(`\n✅ الشاهد جاهز للمراجعة!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
