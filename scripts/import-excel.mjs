import ExcelJS from 'exceljs';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// الاتصال بقاعدة البيانات
const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('📊 بدء استيراد الشواهد من Excel...\n');

// قراءة ملف Excel
const workbook = new ExcelJS.Workbook();
const excelPath = process.argv[2] || join(__dirname, '..', 'evidence_templates.xlsx');
await workbook.xlsx.readFile(excelPath);

console.log(`📁 الملف: ${excelPath}\n`);

// قراءة ورقة "أمثلة" (أو "للملء" إذا كانت معبأة)
const sheet = workbook.getWorksheet('أمثلة') || workbook.getWorksheet('للملء');

if (!sheet) {
  console.error('❌ لم يتم العثور على ورقة "أمثلة" أو "للملء"');
  process.exit(1);
}

let imported = 0;
let skipped = 0;
let errors = 0;

// تخطي الصف الأول (رأس الجدول)
const rows = [];
sheet.eachRow((row, rowNumber) => {
  if (rowNumber > 1) {
    rows.push({ rowNumber, row });
  }
});

console.log(`📋 عدد الصفوف: ${rows.length}\n`);

for (const { rowNumber, row } of rows) {
  try {
    // قراءة الأعمدة الأساسية
    const standardCode = row.getCell(1).value?.toString().trim();
    const standardName = row.getCell(2).value?.toString().trim();
    const evidenceName = row.getCell(3).value?.toString().trim();
    const subEvidenceName = row.getCell(4).value?.toString().trim() || null;
    const description = row.getCell(5).value?.toString().trim();
    const subject = row.getCell(6).value?.toString().trim() || null;
    const stage = row.getCell(7).value?.toString().trim() || 'all';
    const defaultImage = row.getCell(8).value?.toString().trim() || null;

    // تخطي الصفوف الفارغة
    if (!standardCode || !standardName || !evidenceName || !description) {
      skipped++;
      continue;
    }

    // استخراج standardId من standardCode (مثل: 1.1.1 → 1)
    const standardId = parseInt(standardCode.split('.')[0]);

    // قراءة حقول المعلم (20 حقل)
    const userFields = [];
    for (let i = 0; i < 20; i++) {
      const baseCol = 9 + i * 4; // 9, 13, 17, ...
      const fieldName = row.getCell(baseCol).value?.toString().trim();
      const fieldType = row.getCell(baseCol + 1).value?.toString().trim();
      const fieldRequired = row.getCell(baseCol + 2).value?.toString().trim();
      const fieldOptions = row.getCell(baseCol + 3).value?.toString().trim();

      // تخطي الحقول الفارغة
      if (!fieldName || !fieldType) continue;

      userFields.push({
        name: fieldName,
        type: fieldType,
        required: fieldRequired === 'نعم' || fieldRequired === 'yes',
        options: fieldOptions ? fieldOptions.split(',').map(o => o.trim()) : null
      });
    }

    // قراءة مربعات الصفحة الثانية (10 مربعات)
    const page2Boxes = [];
    const boxStartCol = 89; // بعد 8 أعمدة أساسية + 80 عمود للحقول
    for (let i = 0; i < 10; i++) {
      const titleCol = boxStartCol + i * 2;
      const contentCol = boxStartCol + i * 2 + 1;
      
      const boxTitle = row.getCell(titleCol).value?.toString().trim();
      const boxContent = row.getCell(contentCol).value?.toString().trim();

      // تخطي المربعات الفارغة
      if (!boxTitle || !boxContent) continue;

      page2Boxes.push({
        title: boxTitle,
        content: boxContent
      });
    }

    // تحويل إلى JSON
    const userFieldsJson = JSON.stringify(userFields);
    const page2BoxesJson = JSON.stringify(page2Boxes);

    // إدراج في قاعدة البيانات
    await connection.execute(`
      INSERT INTO evidenceTemplates (
        standardId, standardCode, standardName, evidenceName, subEvidenceName,
        description, defaultImageUrl, page2Boxes, userFields, subject, stage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      standardId, standardCode, standardName, evidenceName, subEvidenceName,
      description, defaultImage, page2BoxesJson, userFieldsJson, subject, stage
    ]);

    imported++;
    console.log(`✅ [${rowNumber}] ${evidenceName} (${userFields.length} حقول، ${page2Boxes.length} مربعات)`);

  } catch (error) {
    errors++;
    console.error(`❌ [${rowNumber}] خطأ: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log(`📊 النتائج:`);
console.log(`   ✅ تم الاستيراد: ${imported} شاهد`);
console.log(`   ⏭️  تم التخطي: ${skipped} صف فارغ`);
console.log(`   ❌ أخطاء: ${errors}`);
console.log('='.repeat(60));

await connection.end();

if (errors > 0) {
  process.exit(1);
}
