import puppeteer from "puppeteer";
import QRCode from "qrcode";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Load theme background image
function getThemeBackgroundBase64(): string {
  const themePath = path.join(__dirname, 'theme-background.png');
  const imageBuffer = fs.readFileSync(themePath);
  const base64 = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

interface EvidenceData {
  id: number;
  subTemplateId?: number;
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
  educationDepartment: string;
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

  // Load theme background
  const themeBackgroundBase64 = getThemeBackgroundBase64();

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
      position: relative;
      page-break-after: always;
      overflow: hidden;
      background-image: url('${themeBackgroundBase64}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }
    
    /* QR Code positioning - between text and vision logo */
    .qr-code {
      position: absolute;
      top: 15mm;
      left: 65mm;
      width: 20mm;
      height: 20mm;
      z-index: 10;
    }
    
    /* Education department and school name - below ministry name */
    .header-info {
      position: absolute;
      top: 25mm;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 10;
    }
    
    .header-info-text {
      font-family: 'Traditional Arabic', 'Arial', 'Tahoma', sans-serif;
      font-size: 16px;
      color: #000;
      margin: 2px 0;
      font-weight: bold;
    }
    
    .qr-code img {
      width: 100%;
      height: 100%;
    }
    
    /* Content area - white space in the middle */
    .content-area {
      position: absolute;
      top: 60mm;
      left: 15mm;
      right: 15mm;
      bottom: 60mm;
      padding: 10mm;
    }
    
    /* Title box */
    .title-box {
      border: 2px solid #00A896;
      padding: 10px;
      text-align: center;
      margin-bottom: 15px;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .title-box h1 {
      font-size: 20px;
      color: #00A896;
      margin-bottom: 8px;
    }
    
    .title-box p {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }
    
    /* Standard box */
    .standard-box {
      border: 2px solid #000;
      padding: 8px;
      text-align: center;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .standard-box h2 {
      font-size: 15px;
      font-weight: bold;
    }
    
    /* Element row */
    .element-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .element-label {
      border: 1px solid #000;
      padding: 8px;
      text-align: right;
      font-weight: bold;
      font-size: 12px;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .element-value {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      background: rgba(249, 249, 249, 0.95);
    }
    
    /* Fields grid */
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .field-item {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .field-label {
      font-size: 10px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .field-value {
      font-size: 11px;
      font-weight: bold;
      color: #000;
    }
    
    /* Description box */
    .description-box {
      border: 1px solid #000;
      padding: 10px;
      min-height: 80px;
      text-align: right;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .description-label {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 6px;
      color: #00A896;
    }
    
    .description-text {
      font-size: 11px;
      line-height: 1.8;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
      text-align: right;
      direction: rtl;
    }
    
    /* Sections grid for page 2 */
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .section-box {
      border: 1px solid #000;
      padding: 10px;
      min-height: 100px;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .section-title {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 6px;
      color: #00A896;
      text-align: right;
    }
    
    .section-content {
      font-size: 11px;
      line-height: 1.8;
      color: #333;
      text-align: right;
      white-space: pre-wrap;
      word-wrap: break-word;
      direction: rtl;
    }
    
    /* Images row */
    .images-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .image-box {
      border: 1px solid #000;
      padding: 5px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
    }
    
    .image-box img {
      width: 100%;
      height: auto;
      max-height: 150px;
      object-fit: contain;
    }
    
    .image-label {
      font-size: 10px;
      color: #666;
      margin-top: 5px;
    }
    
    /* Signature boxes - positioned at bottom to match theme */
    .signature-row {
      position: absolute;
      bottom: 8mm;
      left: 15mm;
      right: 15mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      z-index: 10;
    }
    
    .signature-box {
      background: transparent;
      border: none;
      padding: 8px 12px;
      text-align: right;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .signature-name {
      font-size: 13px;
      font-weight: bold;
      color: #333;
      flex: 1;
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Page 1: Basic Information -->
  <div class="page">
    <!-- QR Code -->
    <div class="qr-code">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
    </div>
    
    <!-- Header Info -->
    <div class="header-info">
      <div class="header-info-text">${data.educationDepartment || ''}</div>
      <div class="header-info-text">${data.schoolName || ''}</div>
    </div>
    
    <!-- Content Area -->
    <div class="content-area">
      <div class="standard-box">
        <h2>معيار: ${data.standardName}</h2>
      </div>
      
      <div class="element-row">
        <div class="element-value">${data.elementTitle}</div>
        <div class="element-label">اسم العنصر</div>
      </div>
      
      <div class="fields-grid">
        ${data.subTemplateId === 102 ? `
          <!-- 4 حقول فقط للشاهد 102 -->
          <div class="field-item">
            <div class="field-label">التاريخ</div>
            <div class="field-value">${data.date}</div>
          </div>
          <div class="field-item">
            <div class="field-label">مدة البرنامج</div>
            <div class="field-value">${data.duration}</div>
          </div>
          <div class="field-item">
            <div class="field-label">الوسائل المستخدمة</div>
            <div class="field-value">${data.executionLocation}</div>
          </div>
          <div class="field-item">
            <div class="field-label">المستفيدون</div>
            <div class="field-value">${data.beneficiaries}</div>
          </div>
        ` : `
          <!-- 8 حقول للشواهد الأخرى -->
          <div class="field-item">
            <div class="field-label">التاريخ</div>
            <div class="field-value">${data.date}</div>
          </div>
          <div class="field-item">
            <div class="field-label">عنوان الدرس</div>
            <div class="field-value">${data.lessonTitle}</div>
          </div>
          <div class="field-item">
            <div class="field-label">عدد الطلاب</div>
            <div class="field-value">${data.studentsCount}</div>
          </div>
          <div class="field-item">
            <div class="field-label">مكان التنفيذ</div>
            <div class="field-value">${data.executionLocation}</div>
          </div>
          <div class="field-item">
            <div class="field-label">المدة الزمنية</div>
            <div class="field-value">${data.duration}</div>
          </div>
          <div class="field-item">
            <div class="field-label">المستفيدون</div>
            <div class="field-value">${data.beneficiaries}</div>
          </div>
          <div class="field-item">
            <div class="field-label">الصف</div>
            <div class="field-value">${data.grade}</div>
          </div>
          <div class="field-item">
            <div class="field-label">المنفذ</div>
            <div class="field-value">${data.teacherName}</div>
          </div>
        `}
      </div>
      
      <div class="description-box">
        <div class="description-label">الوصف</div>
        <div class="description-text">${data.description}</div>
      </div>
    </div>
  </div>
  
  <!-- Page 2: Evidence Details -->
  <div class="page">
    <!-- QR Code -->
    <div class="qr-code">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
    </div>
    
    <!-- Header Info -->
    <div class="header-info">
      <div class="header-info-text">${data.educationDepartment || ''}</div>
      <div class="header-info-text">${data.schoolName || ''}</div>
    </div>
    
    <!-- Content Area -->
    <div class="content-area">
      <div class="standard-box">
        <h2>معيار: ${data.standardName}</h2>
      </div>
      
      <div class="element-row">
        <div class="element-value">${data.elementTitle}</div>
        <div class="element-label">اسم العنصر</div>
      </div>
      
      <div class="sections-grid">
        <div class="section-box">
          <div class="section-title">الهدف من الشاهد</div>
          <div class="section-content">${data.section1}</div>
        </div>
        <div class="section-box">
          <div class="section-title">الإجراءات</div>
          <div class="section-content">${data.section2}</div>
        </div>
        <div class="section-box">
          <div class="section-title">النتائج</div>
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
    </div>
    
    <!-- Signature boxes -->
    <div class="signature-row">
      <div class="signature-box">
        <span class="signature-name">${data.teacherName || ''}</span>
      </div>
      <div class="signature-box">
        <span class="signature-name">${data.principalName || ''}</span>
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
