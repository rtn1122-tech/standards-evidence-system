import mysql from 'mysql2/promise';
import fs from 'fs';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  // قراءة ملف CSV
  const csvContent = fs.readFileSync('new-evidences-clean.csv', 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  console.log(`📄 عدد الأسطر في الملف: ${lines.length}`);
  
  let imported = 0;
  let skipped = 0;
  
  // معالجة كل سطر
  for (let i = 1; i < lines.length; i++) { // تخطي الهيدر
    const line = lines[i];
    const parts = line.split(',');
    
    if (parts.length < 3) {
      console.log(`⚠️ السطر ${i + 1}: تنسيق غير صحيح`);
      skipped++;
      continue;
    }
    
    const standardName = parts[0].trim();
    const evidenceName = parts[1].trim();
    const description = parts[2].trim();
    
    // باقي الأجزاء هي المربعات الستة
    const boxes = [];
    for (let j = 3; j < parts.length && j < 15; j += 2) {
      if (parts[j] && parts[j+1]) {
        boxes.push({
          title: parts[j].trim(),
          content: parts[j+1].trim()
        });
      }
    }
    
    // الحصول على standardId من اسم المعيار
    const [standardRows] = await connection.execute(
      'SELECT id FROM standards WHERE title = ? LIMIT 1',
      [standardName]
    );
    
    if (standardRows.length === 0) {
      console.log(`❌ السطر ${i + 1}: المعيار "${standardName}" غير موجود`);
      skipped++;
      continue;
    }
    
    const standardId = standardRows[0].id;
    
    // إدراج الشاهد
    const [result] = await connection.execute(`
      INSERT INTO evidenceTemplates 
      (standardId, standardCode, standardName, evidenceName, subEvidenceName, description, page2Boxes, userFields, defaultImageUrl, usageCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NULL, ?, ?, '[]', NULL, 0, NOW(), NOW())
    `, [
      standardId,
      `${standardId}.1.1`, // كود افتراضي
      standardName,
      evidenceName,
      description,
      JSON.stringify(boxes)
    ]);
    
    imported++;
    console.log(`✅ تم استيراد: ${evidenceName} (المعيار: ${standardName})`);
  }
  
  console.log(`\n📊 النتائج:`);
  console.log(`✅ تم الاستيراد: ${imported} شاهد`);
  console.log(`⚠️ تم التخطي: ${skipped} سطر`);
  
} catch (error) {
  console.error('❌ خطأ:', error);
} finally {
  await connection.end();
}
