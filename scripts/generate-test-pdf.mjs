import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTestPDF() {
  console.log('📄 توليد PDF للشاهد التجريبي...\n');

  const testFilePath = path.join(__dirname, '..', 'data', 'test-evidence.json');
  const evidence = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));

  // HTML بسيط للصفحة الأولى
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Tajawal', sans-serif;
      direction: rtl;
      padding: 40px;
      background: white;
    }
    
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 30px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    h1 {
      font-size: 24px;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .standard-name {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .field {
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .field-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }
    
    .field-value {
      font-size: 14px;
      color: #1e293b;
      font-weight: 500;
    }
    
    .description-section {
      margin-top: 30px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #dbeafe;
    }
    
    .description-text {
      font-size: 14px;
      line-height: 2;
      color: #334155;
      text-align: justify;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>${evidence.title}</h1>
      <div class="standard-name">المعيار: أداء الواجبات الوظيفية</div>
    </div>
    
    <div class="fields-grid">
      <div class="field">
        <div class="field-label">اسم العنصر</div>
        <div class="field-value">${evidence.title}</div>
      </div>
      <div class="field">
        <div class="field-label">المدة الزمنية</div>
        <div class="field-value">الفصل الدراسي الأول 1446هـ</div>
      </div>
      <div class="field">
        <div class="field-label">الجهة المنظمة</div>
        <div class="field-value">إدارة المدرسة</div>
      </div>
      <div class="field">
        <div class="field-label">الزمن</div>
        <div class="field-value">يومياً طوال الفصل</div>
      </div>
    </div>
    
    <div class="description-section">
      <div class="section-title">وصف الشاهد</div>
      <div class="description-text">
        ${evidence.description}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
  });

  await browser.close();

  const outputPath = path.join(__dirname, '..', 'data', 'test-evidence.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log('✅ تم توليد PDF بنجاح!');
  console.log(`📁 الملف: ${outputPath}`);
  
  return outputPath;
}

generateTestPDF()
  .then((pdfPath) => {
    console.log('\n✅ PDF جاهز للمراجعة!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
