import mysql from 'mysql2/promise';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const DATABASE_URL = process.env.DATABASE_URL;

// خريطة المعايير
const STANDARDS_MAP = {
  'أداء الواجبات الوظيفية': 1,
  'التفاعل مع المجتمع المهني': 2,
  'التفاعل مع أولياء الأمور': 3,
  'التنوع في استراتيجيات التدريس': 4,
  'تحسين نتائج المتعلمين': 5,
  'إعداد وتنفيذ خطة التعلم': 6,
  'توظيف تقنيات ووسائل التعلم': 7,
  'تهيئة بيئة تعليمية': 8,
  'الإدارة الصفية': 9,
  'تحليل نتائج المتعلمين': 10,
  'تنوع أساليب التقويم': 11
};

async function main() {
  console.log('🚀 بدء استيراد الشواهد من evidences-clean-final.csv...\n');

  // قراءة ملف CSV
  const csvContent = fs.readFileSync('evidences-clean-final.csv', 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    bom: true
  });

  console.log(`📊 عدد الشواهد في الملف: ${records.length}\n`);

  // الاتصال بقاعدة البيانات
  const connection = await mysql.createConnection(DATABASE_URL);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of records) {
    try {
      const standardName = record['المعيار'];
      const evidenceName = record['اسم الشاهد'];
      const description = record['الوصف'];

      if (!evidenceName || !evidenceName.trim()) {
        skipped++;
        continue;
      }

      const standardId = STANDARDS_MAP[standardName];
      if (!standardId) {
        console.log(`⚠️  معيار غير معروف: ${standardName}`);
        errors++;
        continue;
      }

      // التحقق من عدم التكرار
      const [existing] = await connection.execute(
        'SELECT id FROM evidenceTemplates WHERE evidenceName = ? AND standardId = ?',
        [evidenceName, standardId]
      );

      if (existing.length > 0) {
        console.log(`⏭️  تم تخطي (موجود مسبقاً): ${evidenceName}`);
        skipped++;
        continue;
      }

      // بناء page2Boxes
      const page2Boxes = [];
      for (let i = 1; i <= 6; i++) {
        const title = record[`عنوان المربع ${i}`];
        const content = record[`محتوى المربع ${i}`];
        if (title && content) {
          page2Boxes.push({ title, content });
        }
      }

      // بناء userFields (8 حقول افتراضية)
      const userFields = [
        { label: 'التاريخ', type: 'text', value: '' },
        { label: 'عنوان الدرس', type: 'text', value: '' },
        { label: 'عدد الطلاب', type: 'text', value: '' },
        { label: 'مكان التنفيذ', type: 'text', value: '' },
        { label: 'المدة الزمنية', type: 'text', value: '' },
        { label: 'المستفيدون', type: 'text', value: '' },
        { label: 'الصف', type: 'text', value: '' },
        { label: 'المنفذ', type: 'text', value: '' }
      ];

      // الصور الافتراضية (5 صور مشتركة)
      const defaultImages = [
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6'
      ];
      
      const randomImage1 = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      const randomImage2 = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      // إدراج الشاهد
      await connection.execute(
        `INSERT INTO evidenceTemplates (
          standardId, evidenceName, description, 
          page2Boxes, userFields, 
          defaultImage1Url, defaultImage2Url,
          stage, subject
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          standardId,
          evidenceName,
          description || '',
          JSON.stringify(page2Boxes),
          JSON.stringify(userFields),
          randomImage1,
          randomImage2,
          'all',
          'all'
        ]
      );

      console.log(`✅ تم استيراد: [${standardName}] ${evidenceName}`);
      imported++;

    } catch (error) {
      console.error(`❌ خطأ في استيراد: ${record['اسم الشاهد']}`);
      console.error(`   السبب: ${error.message}`);
      errors++;
    }
  }

  await connection.end();

  console.log('\n📊 ملخص الاستيراد:');
  console.log(`   ✅ تم الاستيراد: ${imported}`);
  console.log(`   ⏭️  تم التخطي: ${skipped}`);
  console.log(`   ❌ أخطاء: ${errors}`);
  console.log(`   📝 الإجمالي: ${records.length}`);
}

main().catch(console.error);
