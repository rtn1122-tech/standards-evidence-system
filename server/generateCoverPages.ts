import puppeteer from "puppeteer";

interface CoverData {
  teacherName: string;
  schoolName: string;
}

/**
 * Generate cover page + 6 empty pages (Pages 1-7)
 * Used once at the beginning of generateAllPDF
 */
export async function generateCoverAndEmptyPages(data: CoverData): Promise<Buffer> {
  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Tahoma', sans-serif;
      direction: rtl;
      background: white;
    }
    
    .page {
      width: 210mm;
      height: 297mm;
      padding: 0;
      margin: 0 auto;
      background: white;
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }
    
    /* Cover Page */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #ffffff 0%, #f0f9f8 100%);
    }
    
    .cover-decorative-top {
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle at top right, rgba(0,168,150,0.15) 0%, transparent 70%);
      border-radius: 0 0 0 100%;
    }
    
    .cover-decorative-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 250px;
      height: 250px;
      background: radial-gradient(circle at bottom left, rgba(0,168,150,0.1) 0%, transparent 70%);
      border-radius: 0 100% 0 0;
    }
    
    .cover-content {
      z-index: 1;
    }
    
    .cover-title {
      font-size: 48px;
      font-weight: bold;
      color: #00A896;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    
    .cover-year {
      font-size: 24px;
      color: #555;
      margin-bottom: 50px;
    }
    
    .cover-teacher-name {
      font-size: 32px;
      color: #333;
      font-weight: 600;
      padding: 20px 40px;
      border: 3px solid #00A896;
      border-radius: 10px;
      background: white;
      box-shadow: 0 4px 6px rgba(0,168,150,0.2);
    }
    
    .cover-logo-section {
      position: absolute;
      top: 30px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 40px;
    }
    
    .cover-logo-text {
      font-size: 16px;
      font-weight: bold;
      color: #00A896;
    }
    
    /* Empty Pages */
    .empty-page {
      background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    }
    
    .empty-page-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(0,168,150,0.05);
      font-weight: bold;
      white-space: nowrap;
    }
    
    @media print {
      .page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Page 1: Cover -->
  <div class="page cover-page">
    <div class="cover-decorative-top"></div>
    <div class="cover-decorative-bottom"></div>
    
    <div class="cover-logo-section">
      <div class="cover-logo-text">وزارة التعليم<br/>Ministry of Education</div>
      <div class="cover-logo-text">رؤية 2030<br/>VISION 2030</div>
    </div>
    
    <div class="cover-content">
      <div class="cover-title">ملف الأداء المهني</div>
      <div class="cover-year">للعام الدراسي 1447هـ</div>
      <div class="cover-teacher-name">${data.teacherName}</div>
    </div>
  </div>
  
  <!-- Pages 2-7: Empty Pages -->
  ${Array.from({ length: 6 }, (_, i) => `
  <div class="page empty-page">
    <div class="empty-page-watermark">ملف الأداء المهني</div>
  </div>
  `).join('')}
</body>
</html>
  `;

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
