import puppeteer from "puppeteer";
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
    return '';
  }
}

// Load theme background image
function getThemeBackgroundBase64(): string {
  const themePath = path.join(__dirname, 'theme-background.png');
  const imageBuffer = fs.readFileSync(themePath);
  const base64 = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

interface UserField {
  name: string;
  type: string;
  required: boolean;
}

interface Page2Box {
  title: string;
  content: string;
}

interface EvidenceData {
  // Template info
  standardName: string;
  evidenceName: string;
  description: string;
  
  // Dynamic fields (from template)
  userFields: UserField[];
  page2Boxes: Page2Box[];
  
  // User data (filled by teacher)
  userData: Record<string, string>;
  
  // Images
  image1Url: string | null;
  image2Url: string | null;
  
  // Teacher info
  teacherName: string;
  schoolName: string;
  principalName: string;
  educationDepartment: string;
}

// Generate standard page (placeholder - white page with text)
export async function generateStandardPage(data: {
  standardName: string;
  standardDescription: string;
  standardNumber: number;
}): Promise<string> {
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

export async function generateEvidencePDF(data: EvidenceData): Promise<Buffer> {
  // Convert images to base64
  const image1Base64 = data.image1Url ? await imageUrlToBase64(data.image1Url) : '';
  const image2Base64 = data.image2Url ? await imageUrlToBase64(data.image2Url) : '';

  // Load theme background
  const themeBackgroundBase64 = getThemeBackgroundBase64();

  // Build dynamic fields HTML
  const fieldsHTML = data.userFields
    .filter(field => data.userData[field.name] && data.userData[field.name].trim())
    .map(field => `
      <div class="field-item">
        <div class="field-label">${field.name}</div>
        <div class="field-value">${data.userData[field.name]}</div>
      </div>
    `).join('');

  // Build page 2 boxes HTML
  const page2BoxesHTML = data.page2Boxes.map(box => `
    <div class="section-box">
      <div class="section-title">${box.title}</div>
      <div class="section-content">${box.content}</div>
    </div>
  `).join('');

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
    
    /* Education department and school name */
    .header-info {
      position: absolute;
      top: 8mm;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      z-index: 10;
    }
    
    .header-info-text {
      font-family: 'Traditional Arabic', 'Arial', 'Tahoma', sans-serif;
      font-size: 14px;
      color: #000;
      margin: 1px 0;
      font-weight: bold;
    }
    
    /* Content area */
    .content-area {
      position: absolute;
      top: 40mm;
      left: 15mm;
      right: 15mm;
      bottom: 60mm;
      padding: 10mm;
    }
    
    /* Standard box */
    .standard-box {
      border: 2px solid #000;
      padding: 8px;
      text-align: center;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
    }
    
    .standard-box h2 {
      font-size: 15px;
      font-weight: bold;
    }
    
    /* Evidence title box */
    .evidence-title-box {
      border: 2px solid #00A896;
      padding: 10px;
      text-align: center;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
    }
    
    .evidence-title-box h3 {
      font-size: 16px;
      font-weight: bold;
      color: #00A896;
      margin: 0;
    }
    
    /* Fields grid */
    .fields-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    
    .field-item {
      border: 1px solid #000;
      padding: 8px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
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
      padding: 15px;
      min-height: 120px;
      text-align: right;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
    }
    
    .description-label {
      font-weight: bold;
      font-size: 12px;
      margin-bottom: 6px;
      color: #00A896;
    }
    
    .description-text {
      font-size: 11px;
      line-height: 2;
      color: #333;
      white-space: pre-wrap;
      word-wrap: break-word;
      text-align: justify;
      direction: rtl;
    }
    
    /* Content area for page 2 */
    .content-area-page2 {
      position: absolute;
      top: 40mm;
      left: 15mm;
      right: 15mm;
      bottom: 67mm;
      padding: 10mm;
      overflow: hidden;
    }
    
    /* Sections grid for page 2 */
    .sections-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .section-box {
      border: 1px solid #000;
      padding: 10px;
      min-height: 80px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
    }
    
    .section-title {
      font-weight: bold;
      font-size: 10px;
      margin-bottom: 4px;
      color: #00A896;
      text-align: right;
    }
    
    .section-content {
      font-size: 9px;
      line-height: 1.5;
      color: #333;
      text-align: justify;
      white-space: pre-wrap;
      word-wrap: break-word;
      direction: rtl;
    }
    
    /* Images row - fixed at bottom */
    .images-row {
      position: absolute;
      bottom: 45mm;
      left: 15mm;
      right: 15mm;
      height: 40mm;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      z-index: 10;
    }
    
    .image-box {
      border: 1px solid #000;
      padding: 5px;
      text-align: center;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .image-box img {
      width: 100%;
      height: 100%;
      max-height: 38mm;
      object-fit: cover;
      border-radius: 10px;
    }
    
    .image-label {
      font-size: 10px;
      color: #666;
      margin-top: 5px;
    }
    
    /* Signature boxes */
    .signature-row {
      position: absolute;
      bottom: 7mm;
      left: 20mm;
      right: 20mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      z-index: 10;
    }
    
    .signature-box {
      background: transparent;
      border: none;
      padding: 6px 10px;
      text-align: center;
      min-height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    
    .signature-label {
      font-size: 11px;
      font-weight: normal;
      color: #333;
    }
    
    .signature-name {
      font-size: 12px;
      font-weight: bold;
      color: #333;
    }
  </style>
</head>
<body>
  <!-- Page 1: Basic Information -->
  <div class="page">
    <!-- Header Info -->
    <div class="header-info">
      <div class="header-info-text">المملكة العربية السعودية</div>
      <div class="header-info-text">وزارة التعليم</div>
      <div class="header-info-text">${data.educationDepartment || ''}</div>
      <div class="header-info-text">${data.schoolName || ''}</div>
    </div>
    
    <!-- Content Area -->
    <div class="content-area">
      <div class="standard-box">
        <h2>معيار: ${data.standardName}</h2>
      </div>
      
      <div class="evidence-title-box">
        <h3>${data.evidenceName}</h3>
      </div>
      
      ${fieldsHTML ? `<div class="fields-grid">${fieldsHTML}</div>` : ''}
      
      <div class="description-box">
        <div class="description-label">الوصف</div>
        <div class="description-text">${data.description}</div>
      </div>
    </div>
  </div>
  
  <!-- Page 2: Evidence Details -->
  <div class="page">
    <!-- Header Info -->
    <div class="header-info">
      <div class="header-info-text">المملكة العربية السعودية</div>
      <div class="header-info-text">وزارة التعليم</div>
      <div class="header-info-text">${data.educationDepartment || ''}</div>
      <div class="header-info-text">${data.schoolName || ''}</div>
    </div>
    
    <!-- Content Area for Page 2 -->
    <div class="content-area-page2">
      <div class="standard-box">
        <h2>معيار: ${data.standardName}</h2>
      </div>
      
      <div class="evidence-title-box">
        <h3>${data.evidenceName}</h3>
      </div>
      
      <div class="sections-grid">
        ${page2BoxesHTML}
      </div>
    </div>
    
    <!-- Images row - fixed at bottom -->
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
    
    <!-- Signature boxes -->
    <div class="signature-row">
      <div class="signature-box">
        <span class="signature-label">اسم المعلم:</span>
        <span class="signature-name">${data.teacherName || ''}</span>
      </div>
      <div class="signature-box">
        <span class="signature-label">مدير المدرسة:</span>
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
