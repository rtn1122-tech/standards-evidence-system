import { initDb } from '../server/db.ts';
import * as schema from '../drizzle/schema.ts';
import { generateEvidencePDF } from '../server/generatePDF.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPDFGeneration() {
  console.log('🧪 اختبار توليد PDF...\n');

  // Initialize database
  const db = await initDb();

  // Get first evidence template
  const templates = await db.select().from(schema.evidenceTemplates).limit(1);
  
  if (templates.length === 0) {
    console.error('❌ لا توجد قوالب في قاعدة البيانات!');
    process.exit(1);
  }

  const template = templates[0];
  console.log(`✅ تم العثور على القالب: ${template.evidenceName}\n`);

  // Parse JSON fields
  let userFields, page2Boxes;
  try {
    userFields = typeof template.userFields === 'string' ? JSON.parse(template.userFields) : template.userFields;
    page2Boxes = typeof template.page2Boxes === 'string' ? JSON.parse(template.page2Boxes) : template.page2Boxes;
  } catch (error) {
    console.error('❌ خطأ في تحليل JSON:', error.message);
    console.log('userFields:', template.userFields);
    console.log('page2Boxes:', template.page2Boxes);
    process.exit(1);
  }

  // Create mock user data
  const userData = {};
  userFields.forEach((field, index) => {
    if (field.type === 'date') {
      userData[field.name] = '2025-12-07';
    } else {
      userData[field.name] = `قيمة تجريبية ${index + 1}`;
    }
  });

  // Prepare data for PDF generation
  const pdfData = {
    standardName: template.standardName,
    evidenceName: template.evidenceName,
    description: template.description,
    userFields: userFields,
    page2Boxes: page2Boxes,
    userData: userData,
    image1Url: template.defaultImageUrl,
    image2Url: template.defaultImageUrl,
    teacherName: 'أ. محمد أحمد',
    schoolName: 'مدرسة الأمل الابتدائية',
    principalName: 'أ. خالد سعيد',
    educationDepartment: 'إدارة تعليم الرياض'
  };

  console.log('⏳ توليد PDF...\n');

  try {
    const pdfBuffer = await generateEvidencePDF(pdfData);
    
    const outputPath = path.join(__dirname, '..', 'data', 'test-pdf-output.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`✅ تم توليد PDF بنجاح!`);
    console.log(`📁 المسار: ${outputPath}`);
    console.log(`📊 الحجم: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ خطأ في توليد PDF:', error);
    process.exit(1);
  }
}

testPDFGeneration()
  .then(() => {
    console.log('\n✅ اكتمل الاختبار!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
