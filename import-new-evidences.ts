import { db } from './server/db';
import { evidenceTemplates, standards } from './drizzle/schema';
import fs from 'fs';
import csv from 'csv-parser';
import { eq } from 'drizzle-orm';

interface CSVRow {
  'المعيار': string;
  'اسم الشاهد': string;
  'الوصف': string;
  'عنوان المربع 1': string;
  'محتوى المربع 1': string;
  'عنوان المربع 2': string;
  'محتوى المربع 2': string;
  'عنوان المربع 3': string;
  'محتوى المربع 3': string;
  'عنوان المربع 4': string;
  'محتوى المربع 4': string;
  'عنوان المربع 5': string;
  'محتوى المربع 5': string;
  'عنوان المربع 6': string;
  'محتوى المربع 6': string;
}

async function main() {
  console.log('🔄 بدء استيراد الشواهد من CSV...\n');

  // جلب جميع المعايير
  const allStandards = await db.select().from(standards);
  const standardsMap = new Map(allStandards.map(s => [s.title, s.id]));

  const rows: CSVRow[] = [];
  
  // قراءة ملف CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream('evidences-clean-final.csv')
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📄 تم قراءة ${rows.length} شاهد من CSV\n`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const standardId = standardsMap.get(row['المعيار']);
    
    if (!standardId) {
      console.log(`⚠️  تخطي: المعيار "${row['المعيار']}" غير موجود`);
      skipped++;
      continue;
    }

    // بناء page2Boxes
    const page2Boxes = [
      { title: row['عنوان المربع 1'], content: row['محتوى المربع 1'] },
      { title: row['عنوان المربع 2'], content: row['محتوى المربع 2'] },
      { title: row['عنوان المربع 3'], content: row['محتوى المربع 3'] },
      { title: row['عنوان المربع 4'], content: row['محتوى المربع 4'] },
      { title: row['عنوان المربع 5'], content: row['محتوى المربع 5'] },
      { title: row['عنوان المربع 6'], content: row['محتوى المربع 6'] }
    ];

    try {
      await db.insert(evidenceTemplates).values({
        standardId: standardId,
        standardCode: `${standardId}.1.1`, // رقم افتراضي
        standardName: row['المعيار'], // اسم المعيار
        evidenceName: row['اسم الشاهد'],
        description: row['الوصف'],
        page2Boxes: JSON.stringify(page2Boxes),
        userFields: JSON.stringify([]), // فارغ افتراضياً
        isActive: true
      });

      imported++;
      console.log(`✅ ${imported}. ${row['اسم الشاهد']}`);
    } catch (error: any) {
      console.error(`❌ فشل استيراد "${row['اسم الشاهد']}": ${error.message}`);
      skipped++;
    }
  }

  console.log(`\n📊 النتيجة النهائية:`);
  console.log(`✅ تم الاستيراد: ${imported}`);
  console.log(`⚠️  تم التخطي: ${skipped}`);
  console.log(`📝 الإجمالي: ${rows.length}`);
}

main()
  .then(() => {
    console.log('\n✅ اكتمل الاستيراد بنجاح!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ خطأ في الاستيراد:', error);
    process.exit(1);
  });
