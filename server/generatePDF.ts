import puppeteer from "puppeteer";
import QRCode from "qrcode";
import axios from "axios";

// Helper function to convert image URL to base64
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return ''; // Return empty string if image fails to load
  }
}

interface EvidenceData {
  id: number;
  title: string;
  standardName: string;
  description: string;
  // Page 1 fields
  elementTitle: string;
  grade: string;
  beneficiaries: string;
  duration: string;
  executionLocation: string;
  studentsCount: string;
  lessonTitle: string;
  date: string;
  // Page 2 sections
  section1: string;
  section2: string;
  section3: string;
  section4: string;
  section5: string;
  section6: string;
  // Images
  image1Url: string | null;
  image2Url: string | null;
  // Teacher info
  teacherName: string;
  schoolName: string;
  principalName: string;
}

export async function generateEvidencePDF(data: EvidenceData): Promise<Buffer> {
  // Generate QR Code
  const qrCodeUrl = `https://standards-evidence-system.manus.space/verify/${data.id}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
    width: 150,
    margin: 1,
  });

  // Convert images to base64
  const image1Base64 = data.image1Url ? await imageUrlToBase64(data.image1Url) : '';
  const image2Base64 = data.image2Url ? await imageUrlToBase64(data.image2Url) : '';

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
    
    /* Theme colors - Teal/Turquoise */
    .theme-color {
      color: #00A896;
    }
    
    .theme-bg {
      background: #00A896;
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
    
    /* Content Pages */
    .content-page {
      padding: 20mm;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #00A896;
    }
    
    .header-text {
      text-align: center;
      flex: 1;
    }
    
    .logo-text {
      font-size: 14px;
      font-weight: bold;
      color: #00A896;
    }
    
    .sub-text {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }
    
    .title-box {
      border: 3px solid #00A896;
      padding: 15px;
      text-align: center;
      margin: 15px 0;
      background: linear-gradient(135deg, rgba(0,168,150,0.05) 0%, rgba(0,168,150,0.1) 100%);
    }
    
    .title-box h1 {
      font-size: 22px;
      color: #00A896;
      margin-bottom: 8px;
    }
    
    .title-box p {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }
    
    .standard-box {
      border: 2px solid #000;
      padding: 10px;
      text-align: center;
      margin: 12px 0;
      background: white;
    }
    
    .standard-box h2 {
      font-size: 16px;
      font-weight: bold;
    }
    
    .element-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin: 12px 0;
    }
    
    .element-label {
      border: 1px solid #000;
      padding: 10px;
      text-align: right;
      font-weight: bold;
      font-size: 13px;
    }
    
    .element-value {
      border: 1px solid #000;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      font-size: 13px;
      background: #f9f9f9;
    }
    
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin: 12px 0;
    }
    
    .field-box {
      border: 1px solid #000;
      padding: 8px;
    }
    
    .field-label {
      font-size: 10px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .field-value {
      font-size: 12px;
      font-weight: 500;
    }
    
    .description-box {
      border: 2px solid #00A896;
      padding: 12px;
      margin: 15px 0;
      background: rgba(0,168,150,0.03);
      min-height: 100px;
    }
    
    .description-label {
      font-size: 11px;
      color: #00A896;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .description-text {
      font-size: 11px;
      line-height: 1.6;
      text-align: justify;
    }
    
    .qr-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }
    
    .school-info {
      text-align: right;
    }
    
    .qr-code {
      width: 70px;
      height: 70px;
      border: 2px solid #000;
    }
    
    .qr-code img {
      width: 100%;
      height: 100%;
    }
    
    .sections-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 15px 0;
    }
    
    .section-box {
      border: 2px dashed #00A896;
      padding: 12px;
      background: rgba(0,168,150,0.02);
      min-height: 100px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: bold;
      color: #00A896;
      margin-bottom: 8px;
      padding: 4px 8px;
      background: rgba(0,168,150,0.1);
      border-radius: 3px;
      text-align: center;
    }
    
    .section-content {
      font-size: 10px;
      line-height: 1.5;
      text-align: justify;
    }
    
    .images-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 15px 0;
    }
    
    .image-box {
      border: 2px solid #00A896;
      padding: 8px;
      text-align: center;
    }
    
    .image-box img {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: 3px;
    }
    
    .image-label {
      font-size: 10px;
      color: #666;
      margin-top: 6px;
    }
    
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 20px;
    }
    
    .signature-box {
      border: 1px solid #000;
      padding: 12px;
      text-align: center;
      min-height: 50px;
    }
    
    @media print {
      .page {
        margin: 0;
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
  
  <!-- Page 8: Basic Information -->
  <div class="page content-page">
    <div class="header">
      <div class="header-text">
        <div class="logo-text">المملكة العربية السعودية</div>
        <div class="sub-text">وزارة التعليم</div>
      </div>
    </div>
    
    <div class="title-box">
      <h1>${data.title}</h1>
      <p>${data.description}</p>
    </div>
    
    <div class="standard-box">
      <h2>معيار: ${data.standardName}</h2>
    </div>
    
    <div class="element-row">
      <div class="element-value">${data.elementTitle}</div>
      <div class="element-label">اسم العنصر</div>
    </div>
    
    <div class="fields-grid">
      <div class="field-box">
        <div class="field-label">مدة البرنامج</div>
        <div class="field-value">${data.duration}</div>
      </div>
      <div class="field-box">
        <div class="field-label">المستفيدون</div>
        <div class="field-value">${data.beneficiaries}</div>
      </div>
      <div class="field-box">
        <div class="field-label">الصف</div>
        <div class="field-value">${data.grade}</div>
      </div>
      <div class="field-box">
        <div class="field-label">العنوان</div>
        <div class="field-value">${data.elementTitle}</div>
      </div>
    </div>
    
    <div class="fields-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="field-box">
        <div class="field-label">عدد الطلاب</div>
        <div class="field-value">${data.studentsCount}</div>
      </div>
      <div class="field-box">
        <div class="field-label">مكان التنفيذ</div>
        <div class="field-value">${data.executionLocation}</div>
      </div>
      <div class="field-box">
        <div class="field-label">عنوان الدرس</div>
        <div class="field-value">${data.lessonTitle}</div>
      </div>
    </div>
    
    <div class="description-box">
      <div class="description-label">الوصف</div>
      <div class="description-text">${data.description}</div>
    </div>
  </div>
  
  <!-- Page 9: Evidence Details -->
  <div class="page content-page">
    <div class="qr-section">
      <div class="school-info">
        <div class="logo-text">وزارة التعليم</div>
        <div class="sub-text">${data.schoolName}</div>
      </div>
      <div class="qr-code">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
      </div>
    </div>
    
    <div class="standard-box">
      <h2>معيار: ${data.standardName}</h2>
    </div>
    
    <div class="element-row">
      <div class="element-value">${data.elementTitle}</div>
      <div class="element-label">اسم العنصر</div>
    </div>
    
    <div class="sections-grid">
      <div class="section-box">
        <div class="section-title">أهداف</div>
        <div class="section-content">${data.section1}</div>
      </div>
      <div class="section-box">
        <div class="section-title">الوسائل المستخدمة</div>
        <div class="section-content">${data.section2}</div>
      </div>
      <div class="section-box">
        <div class="section-title">مقترحات</div>
        <div class="section-content">${data.section3}</div>
      </div>
      <div class="section-box">
        <div class="section-title">آلية التنفيذ</div>
        <div class="section-content">${data.section4}</div>
      </div>
      <div class="section-box">
        <div class="section-title">توصيات</div>
        <div class="section-content">${data.section5}</div>
      </div>
      <div class="section-box">
        <div class="section-title">الوسائل المستخدمة</div>
        <div class="section-content">${data.section6}</div>
      </div>
    </div>
    
    ${image1Base64 || image2Base64 ? `
    <div class="images-row">
      ${image1Base64 ? `
      <div class="image-box">
        <img src="${image1Base64}" alt="صورة 1" />
        <div class="image-label">صورة توضيحية 1</div>
      </div>
      ` : ''}
      ${image2Base64 ? `
      <div class="image-box">
        <img src="${image2Base64}" alt="صورة 2" />
        <div class="image-label">صورة توضيحية 2</div>
      </div>
      ` : ''}
    </div>
    ` : ''}
    
    <div class="signature-row">
      <div class="signature-box">
        <div class="field-label">مدير المدرسة</div>
        <div class="field-value">${data.principalName || ''}</div>
      </div>
      <div class="signature-box">
        <div class="field-label">اسم المعلم: ${data.teacherName}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
