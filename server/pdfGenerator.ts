import puppeteer from "puppeteer";

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
  image1Url?: string;
  image2Url?: string;
  selectedTheme: string;
}

const themes = {
  classic: {
    headerBg: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    boxBg: "#f8fafc",
    boxBorder: "#cbd5e1",
    textColor: "#1e293b",
  },
  modern: {
    headerBg: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    boxBg: "#faf5ff",
    boxBorder: "#d8b4fe",
    textColor: "#581c87",
  },
  elegant: {
    headerBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    boxBg: "#f0fdf4",
    boxBorder: "#86efac",
    textColor: "#064e3b",
  },
  formal: {
    headerBg: "linear-gradient(135deg, #334155 0%, #64748b 100%)",
    boxBg: "#f8fafc",
    boxBorder: "#94a3b8",
    textColor: "#0f172a",
  },
};

function generateHTML(data: PDFData): string {
  const theme = themes[data.selectedTheme as keyof typeof themes] || themes.classic;

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
    }
    .header {
      text-align: center;
      padding: 30px;
      border-radius: 10px;
      background: ${theme.headerBg};
      color: white;
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
      background: ${theme.boxBg};
      border-right: 4px solid ${theme.boxBorder};
      color: ${theme.textColor};
      margin-bottom: 30px;
      font-size: 16px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .detail-box {
      padding: 25px;
      border-radius: 10px;
      background: ${theme.boxBg};
      border-right: 4px solid ${theme.boxBorder};
      margin-bottom: 25px;
    }
    .detail-box h3 {
      font-size: 20px;
      color: ${theme.textColor};
      margin-bottom: 15px;
    }
    .detail-box p {
      font-size: 15px;
      color: ${theme.textColor};
      line-height: 1.7;
      white-space: pre-wrap;
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
      ${data.description}
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
        <p>${box.content}</p>
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
