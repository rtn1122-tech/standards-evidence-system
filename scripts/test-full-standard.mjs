import { initDb } from '../server/db.ts';
import * as schema from '../drizzle/schema.ts';
import { eq } from 'drizzle-orm';
import { generateEvidencePDF } from '../server/generatePDF.ts';
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate standard page HTML
function generateStandardPageHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          height: 297mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 40mm;
        }
        
        .standard-number {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .standard-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 15px;
          line-height: 1.4;
        }
        
        .divider {
          width: 100px;
          height: 3px;
          background: #f59e0b;
          margin: 0 auto 30px;
        }
        
        .standard-description {
          font-size: 16px;
          color: #374151;
          text-align: center;
          line-height: 1.9;
          max-width: 600px;
          direction: rtl;
        }
      </style>
    </head>
    <body>
      <div class="standard-number">المعيار ${data.standardNumber}</div>
      <div class="standard-title">${data.standardName}</div>
      <div class="divider"></div>
      <div class="standard-description">${data.standardDescription}</div>
    </body>
    </html>
  `;
}

async function generateStandardPagePDF(data) {
  const html = generateStandardPageHTML(data);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}

async function testFullStandard() {
  console.log('🧪 اختبار PDF كامل للمعيار الأول...\n');

  const db = await initDb();

  // Get first standard
  const standards = await db.select().from(schema.standards).where(eq(schema.standards.orderIndex, 1));
  
  if (standards.length === 0) {
    console.error('❌ لم يتم العثور على المعيار الأول!');
    process.exit(1);
  }

  const standard = standards[0];
  console.log(`✅ المعيار: ${standard.title}\n`);

  // Get all evidence templates for this standard
  const evidences = await db.select().from(schema.evidenceTemplates)
    .where(eq(schema.evidenceTemplates.standardName, standard.title));

  console.log(`✅ عدد الشواهد: ${evidences.length}\n`);

  if (evidences.length === 0) {
    console.log('⚠️ لا توجد شواهد لهذا المعيار!');
    process.exit(0);
  }

  // Generate standard page PDF
  console.log('⏳ توليد صفحة المعيار...');
  const standardPagePDF = await generateStandardPagePDF({
    standardNumber: standard.orderIndex,
    standardName: standard.title,
    standardDescription: standard.description || 'لا يوجد وصف'
  });
  console.log('✅ تم توليد صفحة المعيار\n');

  // Merge all PDFs
  const mergedPdf = await PDFDocument.create();
  
  // Add standard page
  const standardPdfDoc = await PDFDocument.load(standardPagePDF);
  const standardPages = await mergedPdf.copyPages(standardPdfDoc, standardPdfDoc.getPageIndices());
  standardPages.forEach(page => mergedPdf.addPage(page));

  // Generate and add evidence PDFs
  for (let i = 0; i < evidences.length; i++) {
    const evidence = evidences[i];
    console.log(`⏳ توليد الشاهد ${i + 1}/${evidences.length}: ${evidence.evidenceName}...`);

    try {
      // Parse JSON fields
      const userFields = typeof evidence.userFields === 'string' 
        ? JSON.parse(evidence.userFields) 
        : evidence.userFields;
      const page2Boxes = typeof evidence.page2Boxes === 'string' 
        ? JSON.parse(evidence.page2Boxes) 
        : evidence.page2Boxes;

      // Create mock user data
      const userData = {};
      userFields.forEach((field, index) => {
        if (field.type === 'date') {
          userData[field.name] = '2025-12-07';
        } else {
          userData[field.name] = `قيمة تجريبية ${index + 1}`;
        }
      });

      const pdfData = {
        standardName: evidence.standardName,
        evidenceName: evidence.evidenceName,
        description: evidence.description,
        userFields: userFields,
        page2Boxes: page2Boxes,
        userData: userData,
        image1Url: evidence.defaultImageUrl,
        image2Url: evidence.defaultImageUrl,
        teacherName: 'أ. محمد أحمد',
        schoolName: 'مدرسة الأمل الابتدائية',
        principalName: 'أ. خالد سعيد',
        educationDepartment: 'إدارة تعليم الرياض'
      };

      const evidencePdfBuffer = await generateEvidencePDF(pdfData);
      
      // Add to merged PDF
      const evidencePdfDoc = await PDFDocument.load(evidencePdfBuffer);
      const evidencePages = await mergedPdf.copyPages(evidencePdfDoc, evidencePdfDoc.getPageIndices());
      evidencePages.forEach(page => mergedPdf.addPage(page));

      console.log(`✅ تم توليد الشاهد ${i + 1}\n`);
    } catch (error) {
      console.error(`❌ خطأ في توليد الشاهد ${i + 1}:`, error.message);
    }
  }

  // Save merged PDF
  const mergedPdfBytes = await mergedPdf.save();
  const outputPath = path.join(__dirname, '..', 'data', 'standard-1-complete.pdf');
  fs.writeFileSync(outputPath, mergedPdfBytes);

  console.log(`\n✅ تم توليد PDF كامل للمعيار الأول!`);
  console.log(`📁 المسار: ${outputPath}`);
  console.log(`📊 الحجم: ${(mergedPdfBytes.length / 1024).toFixed(2)} KB`);
  console.log(`📄 عدد الصفحات: ${mergedPdf.getPageCount()}`);
}

testFullStandard()
  .then(() => {
    console.log('\n✅ اكتمل الاختبار!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
