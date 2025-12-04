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

/**
 * Generate ONLY the evidence pages (Page 8 + Page 9) without cover or empty pages
 * Used for generateAllPDF to avoid repeating cover/empty pages
 */
export async function generateEvidencePages(data: EvidenceData): Promise<Buffer> {
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
    
    /* Theme colors */
    .theme-color {
      color: #00A896;
    }
    
    .theme-bg {
      background: #00A896;
    }
    
    /* Page 8: Basic Information */
    .info-page {
      padding: 30mm 20mm;
    }
    
    .info-header {
      background: linear-gradient(90deg, #00A896 0%, #00C9B1 100%);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      margin-bottom: 20px;
    }
    
    .info-header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .info-header p {
      font-size: 16px;
      opacity: 0.95;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      border: 2px solid #00A896;
      padding: 15px;
      border-radius: 8px;
      background: #f9fffe;
    }
    
    .info-label {
      font-weight: bold;
      color: #00A896;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 16px;
      color: #333;
    }
    
    .description-box {
      border: 2px solid #00A896;
      padding: 20px;
      border-radius: 8px;
      background: #f9fffe;
      min-height: 200px;
    }
    
    .description-box h3 {
      color: #00A896;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .description-box p {
      line-height: 1.8;
      text-align: justify;
      color: #333;
    }
    
    /* Page 9: Evidence Details */
    .evidence-page {
      padding: 20mm;
    }
    
    .evidence-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 3px solid #00A896;
    }
    
    .evidence-header-text h2 {
      color: #00A896;
      font-size: 22px;
      margin-bottom: 5px;
    }
    
    .evidence-header-text p {
      color: #666;
      font-size: 14px;
    }
    
    .qr-code {
      width: 100px;
      height: 100px;
      border: 2px solid #00A896;
      padding: 5px;
      background: white;
    }
    
    .qr-code img {
      width: 100%;
      height: 100%;
    }
    
    .sections-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .section-box {
      border: 2px solid #00A896;
      padding: 15px;
      border-radius: 20px;
      background: #f9fffe;
      min-height: 150px;
    }
    
    .section-title {
      font-weight: bold;
      color: #00A896;
      font-size: 14px;
      margin-bottom: 8px;
      padding-bottom: 5px;
      border-bottom: 1px solid #00A896;
    }
    
    .section-content {
      font-size: 13px;
      line-height: 1.6;
      text-align: justify;
      color: #333;
    }
    
    .images-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .image-box {
      border: 2px solid #00A896;
      padding: 10px;
      border-radius: 8px;
      background: #f9fffe;
      text-align: center;
    }
    
    .image-box img {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 5px;
      margin-bottom: 8px;
    }
    
    .image-label {
      font-size: 12px;
      color: #00A896;
      font-weight: bold;
    }
    
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    
    .signature-box {
      border: 2px solid #00A896;
      padding: 15px;
      text-align: center;
      border-radius: 8px;
      background: #f9fffe;
    }
    
    .signature-label {
      font-weight: bold;
      color: #00A896;
      font-size: 14px;
    }
    
    @media print {
      .page {
        page-break-after: always;
      }
    }
  </style>
</head>
<body>
  <!-- Page 8: Basic Information -->
  <div class="page info-page">
    <div class="info-header">
      <h1>${data.title}</h1>
      <p>${data.standardName}</p>
    </div>
    
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">اسم المعلم</div>
        <div class="info-value">${data.teacherName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المدرسة</div>
        <div class="info-value">${data.schoolName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">الصف</div>
        <div class="info-value">${data.grade || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">التاريخ</div>
        <div class="info-value">${data.date || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المستفيدون</div>
        <div class="info-value">${data.beneficiaries || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المدة</div>
        <div class="info-value">${data.duration || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">مكان التنفيذ</div>
        <div class="info-value">${data.executionLocation || '-'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">عدد الطلاب</div>
        <div class="info-value">${data.studentsCount || '-'}</div>
      </div>
    </div>
    
    <div class="description-box">
      <h3>الوصف</h3>
      <p>${data.description || 'لا يوجد وصف'}</p>
    </div>
  </div>
  
  <!-- Page 9: Evidence Details -->
  <div class="page evidence-page">
    <div class="evidence-header">
      <div class="evidence-header-text">
        <h2>${data.title}</h2>
        <p>المعيار: ${data.standardName}</p>
      </div>
      <div class="qr-code">
        <img src="${qrCodeDataUrl}" alt="QR Code" />
      </div>
    </div>
    
    <div class="sections-grid">
      <div class="section-box">
        <div class="section-title">المقدمة</div>
        <div class="section-content">${data.section1}</div>
      </div>
      <div class="section-box">
        <div class="section-title">الأهداف</div>
        <div class="section-content">${data.section2}</div>
      </div>
      <div class="section-box">
        <div class="section-title">المقترحات</div>
        <div class="section-content">${data.section3}</div>
      </div>
      <div class="section-box">
        <div class="section-title">آلية التنفيذ</div>
        <div class="section-content">${data.section4}</div>
      </div>
      <div class="section-box">
        <div class="section-title">التوصيات</div>
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
    
    <div class="signatures">
      <div class="signature-box">
        <div class="signature-label">اسم المعلم</div>
        <div class="info-value">${data.teacherName}</div>
      </div>
      <div class="signature-box">
        <div class="signature-label">مدير المدرسة</div>
        <div class="info-value">${data.principalName || ''}</div>
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
