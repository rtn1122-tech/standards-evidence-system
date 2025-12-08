import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Box {
  title: string;
  content: string;
}

interface PDFData {
  evidenceName: string;
  subEvidenceName?: string;
  description: string;
  userFieldsData: Record<string, unknown>;
  page2BoxesData: Box[];
  image1Url?: string | null;
  image2Url?: string | null;
  selectedTheme: string; // e.g., "white", "theme2"
}

// Convert text with bullet points to HTML
function formatTextWithBullets(text: string): string {
  if (!text) return '';
  
  // Split text into lines
  const lines = text.split('\n');
  let html = '';
  let inBulletList = false;
  let inNumberedList = false;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line starts with numbered list (1. 2. 3. etc.)
    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
    
    // Check if line starts with bullet point markers
    const isBullet = trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*');
    
    if (numberedMatch) {
      // Numbered list item
      const content = numberedMatch[2];
      
      // Close bullet list if switching from bullets to numbers
      if (inBulletList) {
        html += '</ul>';
        inBulletList = false;
      }
      
      if (!inNumberedList) {
        html += '<ol>';
        inNumberedList = true;
      }
      
      html += `<li>${content}</li>`;
    } else if (isBullet) {
      // Bullet list item
      const content = trimmedLine.substring(1).trim();
      
      // Close numbered list if switching from numbers to bullets
      if (inNumberedList) {
        html += '</ol>';
        inNumberedList = false;
      }
      
      if (!inBulletList) {
        html += '<ul>';
        inBulletList = true;
      }
      
      html += `<li>${content}</li>`;
    } else if (trimmedLine === '') {
      // Empty line - close any open list
      if (inBulletList) {
        html += '</ul>';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>';
        inNumberedList = false;
      }
      html += '<br/>';
    } else {
      // Regular text - close any open list
      if (inBulletList) {
        html += '</ul>';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>';
        inNumberedList = false;
      }
      html += `<p>${trimmedLine}</p>`;
    }
  }
  
  // Close any open list at end
  if (inBulletList) {
    html += '</ul>';
  }
  if (inNumberedList) {
    html += '</ol>';
  }
  
  return html;
}

// Load theme background image as base64
function getThemeBackgroundBase64(themeName: string): string {
  // If white theme, return empty string (no background)
  if (themeName === 'white') {
    return '';
  }
  
  const themePath = path.join(__dirname, '..', 'public', 'themes', 'evidences', `evidence-${themeName}.png`);
  
  // Check if theme file exists
  if (!fs.existsSync(themePath)) {
    console.warn(`Theme file not found: ${themePath}`);
    return '';
  }
  
  const imageBuffer = fs.readFileSync(themePath);
  const base64 = imageBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

function generateHTML(data: PDFData): string {
  const backgroundImage = getThemeBackgroundBase64(data.selectedTheme);
  const hasBackground = backgroundImage !== '';

  return `
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
      font-family: 'Arial', sans-serif;
      direction: rtl;
      background: white;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm;
      background: white;
      page-break-after: always;
      position: relative;
      ${hasBackground ? `
      background-image: url('${backgroundImage}');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      ` : ''}
    }
    .header {
      text-align: center;
      padding: 30px;
      border-radius: 10px;
      ${hasBackground ? 'background: rgba(255, 255, 255, 0.95);' : 'background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);'}
      ${hasBackground ? 'color: #1e293b;' : 'color: white;'}
      ${hasBackground ? 'border: 2px solid #cbd5e1;' : ''}
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header h2 {
      font-size: 24px;
      margin-top: 15px;
    }
    .header p {
      font-size: 14px;
      margin-bottom: 5px;
    }
    .image-container {
      text-align: center;
      margin: 30px 0;
    }
    .image-container img {
      max-width: 500px;
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .description-box {
      padding: 25px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.95);
      border-right: 4px solid #cbd5e1;
      color: #1e293b;
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .detail-box {
      padding: 25px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.95);
      border-right: 4px solid #cbd5e1;
      margin-bottom: 25px;
    }
    .detail-box h3 {
      font-size: 20px;
      color: #1e293b;
      margin-bottom: 15px;
    }
    .detail-box p {
      font-size: 15px;
      color: #1e293b;
      line-height: 1.7;
      white-space: pre-wrap;
    }
    .detail-box ul {
      margin: 10px 0;
      padding-right: 25px;
      list-style-type: disc;
    }
    .detail-box li {
      font-size: 15px;
      color: #1e293b;
      margin-bottom: 8px;
      line-height: 1.7;
    }
    .description-box ul {
      margin: 10px 0;
      padding-right: 25px;
      list-style-type: disc;
    }
    .description-box li {
      font-size: 16px;
      color: #1e293b;
      margin-bottom: 8px;
      line-height: 1.8;
    }
    .detail-box ol {
      margin: 10px 0;
      padding-right: 25px;
      list-style-type: decimal;
    }
    .description-box ol {
      margin: 10px 0;
      padding-right: 25px;
      list-style-type: decimal;
    }
  </style>
</head>
<body>
  <!-- الصفحة الأولى -->
  <div class="page">
    <div class="header">
      <p>المملكة العربية السعودية</p>
      <h1>وزارة التعليم</h1>
      <h2>${data.evidenceName}</h2>
      ${data.subEvidenceName ? `<p style="font-size: 18px; margin-top: 10px;">${data.subEvidenceName}</p>` : ''}
    </div>

    ${data.image1Url ? `
    <div class="image-container">
      <img src="${data.image1Url}" alt="صورة الشاهد" />
    </div>
    ` : ''}

    <div class="description-box">
      ${formatTextWithBullets(data.description)}
    </div>
  </div>

  <!-- الصفحة الثانية -->
  <div class="page">
    <div class="header">
      <h2>التفاصيل</h2>
    </div>

    ${data.page2BoxesData.map(box => `
      <div class="detail-box">
        <h3>${box.title}</h3>
        <div>${formatTextWithBullets(box.content)}</div>
      </div>
    `).join('')}

    ${data.image2Url ? `
    <div class="image-container">
      <img src="${data.image2Url}" alt="صورة إضافية" />
    </div>
    ` : ''}
  </div>
</body>
</html>
  `;
}

export async function generatePDF(data: PDFData): Promise<Buffer> {
  const html = generateHTML(data);

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
