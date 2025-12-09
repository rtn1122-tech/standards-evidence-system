import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate standard page HTML
function generateStandardPage(data) {
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

async function testStandardPage() {
  console.log('🧪 اختبار صفحة المعيار...\n');

  const testData = {
    standardNumber: 1,
    standardName: 'أداء الواجبات الوظيفية',
    standardDescription: 'يهدف هذا المعيار إلى قياس مدى التزام المعلم بأداء واجباته الوظيفية بدقة واحترافية عالية. يشمل ذلك الالتزام بمواعيد الحضور والانصراف، والمشاركة الفاعلة في الاجتماعات والأنشطة المدرسية، والتعاون مع الزملاء والإدارة. كما يقيس المعيار مدى احترام المعلم للأنظمة واللوائح التعليمية، والمحافظة على السلوك المهني الراقي الذي يعكس قيم المهنة. يُعد هذا المعيار الأساس الذي يبنى عليه الأداء المهني المتميز، حيث يعكس مدى جدية المعلم ومسؤوليته تجاه رسالته التربوية.'
  };

  const html = generateStandardPage(testData);

  console.log('⏳ توليد PDF...\n');

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

  const outputPath = path.join(__dirname, '..', 'data', 'test-standard-page.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);

  console.log(`✅ تم توليد صفحة المعيار بنجاح!`);
  console.log(`📁 المسار: ${outputPath}`);
  console.log(`📊 الحجم: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
}

testStandardPage()
  .then(() => {
    console.log('\n✅ اكتمل الاختبار!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
