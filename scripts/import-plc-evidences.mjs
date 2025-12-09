import mysql from 'mysql2/promise';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  console.log('🚀 بدء استيراد شواهد مجتمعات التعلم المهني...\n');

  // قراءة ملف CSV
  const csvContent = fs.readFileSync('plc-batch-1-complete.csv', 'utf-8');
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
      const title = record['title'];
      const description = record['description'];
      const stage = record['stage'];

      if (!title || !title.trim()) {
        skipped++;
        continue;
      }

      // اسم الشاهد: مجتمعات التعلم المهني - [المشكلة]
      const evidenceName = `مجتمعات التعلم المهني - ${title}`;

      // التحقق من عدم التكرار
      const [existing] = await connection.execute(
        'SELECT id FROM evidenceTemplates WHERE evidenceName = ?',
        [evidenceName]
      );

      if (existing.length > 0) {
        console.log(`⏭️  تم تخطي (موجود مسبقاً): ${evidenceName}`);
        skipped++;
        continue;
      }

      // بناء page2Boxes
      const page2Boxes = [];
      for (let i = 1; i <= 6; i++) {
        const boxTitle = record[`box${i}Title`];
        const boxContent = record[`box${i}Content`];
        if (boxTitle && boxContent) {
          page2Boxes.push({ 
            title: boxTitle, 
            content: boxContent 
          });
        }
      }

      // بناء userFields من الملف
      const userFields = [];
      for (let i = 1; i <= 7; i++) {
        const fieldLabel = record[`field${i}Label`];
        const fieldValue = record[`field${i}Value`] || '';
        if (fieldLabel) {
          userFields.push({ 
            label: fieldLabel, 
            type: 'text', 
            value: fieldValue 
          });
        }
      }

      // إذا لم توجد حقول، نضيف حقول افتراضية
      if (userFields.length === 0) {
        userFields.push(
          { label: 'التاريخ', type: 'text', value: '' },
          { label: 'المشكلة', type: 'text', value: title },
          { label: 'المرحلة', type: 'text', value: stage },
          { label: 'المنفذ', type: 'text', value: '' }
        );
      }

      // الصورة الافتراضية
      const defaultImages = [
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7',
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6'
      ];
      
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

      // تحديد المرحلة (تحويل kindergarten و elementary إلى primary)
      let stageValue = 'all';
      if (stage === 'kindergarten' || stage === 'elementary' || stage === 'primary') {
        stageValue = 'primary';
      } else if (stage === 'middle') {
        stageValue = 'middle';
      } else if (stage === 'secondary' || stage === 'high') {
        stageValue = 'high';
      }

      // إدراج الشاهد تحت المعيار 2 (التفاعل مع المجتمع المهني)
      await connection.execute(
        `INSERT INTO evidenceTemplates (
          standardId, evidenceName, description, 
          page2Boxes, userFields, 
          defaultImageUrl,
          stage, subject
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          2, // المعيار الثاني
          evidenceName,
          description || '',
          JSON.stringify(page2Boxes),
          JSON.stringify(userFields),
          randomImage,
          stageValue,
          'all'
        ]
      );

      console.log(`✅ تم استيراد: ${evidenceName} [${stageValue}]`);
      imported++;

    } catch (error) {
      console.error(`❌ خطأ في استيراد: ${record['title']}`);
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
  
  console.log('\n🎉 تم الانتهاء من استيراد شواهد مجتمعات التعلم المهني!');
}

main().catch(console.error);
