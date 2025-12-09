import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { evidences } from './drizzle/schema.ts';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// قراءة ملف CSV
const csvContent = fs.readFileSync('./plc-batch-1-complete.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

console.log(`📊 عدد الشواهد في الملف: ${records.length}`);

// حذف الشواهد القديمة (11-100)
console.log('🗑️  حذف الشواهد القديمة...');
await db.delete(evidences).where(sql`id >= 11 AND id <= 100`);

// استيراد الشواهد الجديدة
console.log('📥 استيراد الشواهد الجديدة...');

let imported = 0;
for (const record of records) {
  try {
    await db.insert(evidences).values({
      id: parseInt(record.id),
      title: record.title,
      description: record.description,
      stage: record.stage,
      box1Title: record.box1Title,
      box1Content: record.box1Content,
      box2Title: record.box2Title,
      box2Content: record.box2Content,
      box3Title: record.box3Title,
      box3Content: record.box3Content,
      box4Title: record.box4Title,
      box4Content: record.box4Content,
      box5Title: record.box5Title,
      box5Content: record.box5Content,
      box6Title: record.box6Title,
      box6Content: record.box6Content,
      field1Label: record.field1Label,
      field1Value: record.field1Value,
      field2Label: record.field2Label,
      field2Value: record.field2Value,
      field3Label: record.field3Label,
      field3Value: record.field3Value,
      field4Label: record.field4Label,
      field4Value: record.field4Value,
      field5Label: record.field5Label,
      field5Value: record.field5Value,
      field6Label: record.field6Label,
      field6Value: record.field6Value
    });
    imported++;
    if (imported % 10 === 0) {
      console.log(`✅ تم استيراد ${imported} شاهداً...`);
    }
  } catch (error) {
    console.error(`❌ خطأ في استيراد الشاهد ${record.id}:`, error.message);
  }
}

console.log(`\n🎉 تم الاستيراد بنجاح!`);
console.log(`📊 عدد الشواهد المستوردة: ${imported}`);

await connection.end();
