import mysql from 'mysql2/promise';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// قراءة ملف CSV
const csvContent = fs.readFileSync('./plc-batch-1-complete.csv', 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

console.log(`📊 عدد الشواهد في الملف: ${records.length}`);

// حذف الشواهد القديمة (11-100)
console.log('🗑️  حذف الشواهد القديمة...');
await connection.execute('DELETE FROM evidences WHERE id >= 11 AND id <= 100');

// استيراد الشواهد الجديدة
console.log('📥 استيراد الشواهد الجديدة...');

let imported = 0;
for (const record of records) {
  try {
    await connection.execute(
      `INSERT INTO evidences (
        id, title, description, stage,
        box1Title, box1Content, box2Title, box2Content,
        box3Title, box3Content, box4Title, box4Content,
        box5Title, box5Content, box6Title, box6Content,
        field1Label, field1Value, field2Label, field2Value,
        field3Label, field3Value, field4Label, field4Value,
        field5Label, field5Value, field6Label, field6Value
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(record.id), record.title, record.description, record.stage,
        record.box1Title, record.box1Content, record.box2Title, record.box2Content,
        record.box3Title, record.box3Content, record.box4Title, record.box4Content,
        record.box5Title, record.box5Content, record.box6Title, record.box6Content,
        record.field1Label, record.field1Value, record.field2Label, record.field2Value,
        record.field3Label, record.field3Value, record.field4Label, record.field4Value,
        record.field5Label, record.field5Value, record.field6Label, record.field6Value
      ]
    );
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
