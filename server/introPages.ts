// Introduction pages for PDF (placeholder - white pages)

// 1. Table of Contents (Index)
export function generateIndexPage(data: {
  standards: Array<{
    number: number;
    title: string;
    evidences: Array<{ name: string; pageNumber: number }>;
  }>;
}): string {
  const standardsHTML = data.standards
    .map(
      (std) => `
      <div class="standard-section">
        <div class="standard-header">
          <span class="standard-number">المعيار ${std.number}</span>
          <span class="standard-title">${std.title}</span>
        </div>
        ${std.evidences
          .map(
            (ev, idx) => `
          <div class="evidence-item">
            <span class="evidence-name">${idx + 1}. ${ev.name}</span>
            <span class="page-number">${ev.pageNumber}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          direction: rtl;
        }
        .page-title {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 30px;
        }
        .standard-section {
          margin-bottom: 25px;
        }
        .standard-header {
          background: #f3f4f6;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          display: flex;
          gap: 10px;
        }
        .standard-number {
          font-weight: bold;
          color: #1e3a8a;
        }
        .standard-title {
          color: #374151;
        }
        .evidence-item {
          padding: 8px 20px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
        }
        .evidence-name {
          color: #4b5563;
          font-size: 14px;
        }
        .page-number {
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="page-title">الفهرس</div>
      ${standardsHTML}
    </body>
    </html>
  `;
}

// 2. Teacher Information Page
export function generateTeacherInfoPage(data: {
  teacherName: string;
  schoolName: string;
  educationDepartment: string;
  specialty?: string;
  stage?: string;
  licenseNumber?: string;
  licenseDate?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
          direction: rtl;
        }
        .page-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 40px;
          text-align: center;
        }
        .info-grid {
          width: 100%;
          max-width: 500px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 20px;
          border-bottom: 2px solid #e5e7eb;
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          color: #6b7280;
          font-size: 16px;
        }
        .info-value {
          color: #1e3a8a;
          font-size: 18px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="page-title">بيانات المعلم</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">اسم المعلم:</span>
          <span class="info-value">${data.teacherName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">المدرسة:</span>
          <span class="info-value">${data.schoolName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">إدارة التعليم:</span>
          <span class="info-value">${data.educationDepartment}</span>
        </div>
        ${
          data.specialty
            ? `
        <div class="info-row">
          <span class="info-label">التخصص:</span>
          <span class="info-value">${data.specialty}</span>
        </div>
        `
            : ''
        }
        ${
          data.stage
            ? `
        <div class="info-row">
          <span class="info-label">المرحلة:</span>
          <span class="info-value">${data.stage}</span>
        </div>
        `
            : ''
        }
        ${
          data.licenseNumber
            ? `
        <div class="info-row">
          <span class="info-label">رقم الرخصة المهنية:</span>
          <span class="info-value">${data.licenseNumber}</span>
        </div>
        `
            : ''
        }
        ${
          data.licenseDate
            ? `
        <div class="info-row">
          <span class="info-label">تاريخ الرخصة:</span>
          <span class="info-value">${data.licenseDate}</span>
        </div>
        `
            : ''
        }
      </div>
    </body>
    </html>
  `;
}

// 3. Documents Page (License + Certificate)
export function generateDocumentsPage(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          height: 297mm;
          padding: 20mm;
          direction: rtl;
        }
        .page-title {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 30px;
        }
        .document-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .document-box {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          background: #f8fafc;
          min-height: 100mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .document-label {
          font-size: 20px;
          color: #64748b;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="page-title">الوثائق</div>
      <div class="document-container">
        <div class="document-box">
          <div class="document-label">الرخصة المهنية</div>
        </div>
        <div class="document-box">
          <div class="document-label">وثيقة التخرج</div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 4. Vision, Mission, Values Page
export function generateVisionMissionPage(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          direction: rtl;
        }
        .page-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 40px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 22px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 3px solid #f59e0b;
        }
        .section-content {
          font-size: 16px;
          line-height: 1.9;
          color: #374151;
          text-align: justify;
        }
        .values-list {
          font-size: 18px;
          font-weight: 600;
          color: #1e3a8a;
          text-align: center;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 10px;
        }
      </style>
    </head>
    <body>
      <div class="page-title">رؤية ورسالة وقيم وزارة التعليم</div>
      
      <div class="section">
        <div class="section-title">الرؤية</div>
        <div class="section-content">
          تحقيق تعليم شامل للجميع يعزز القيم ويضعنا في صدارة المنافسة العالمية، ويُمكن الأفراد والمجتمعات من اكتساب مهارات ذات جودة عالية.
        </div>
      </div>

      <div class="section">
        <div class="section-title">الرسالة</div>
        <div class="section-content">
          تقديم تعليم ذي جودة عالية بكوادر مؤهلة، معزز للقيم، متاح للجميع، ضمن بيئة آمنة ومحفزة لإعداد أفراد فاعلين في المجتمع ومساهمين في صناعة وطن رائد عالمياً.
        </div>
      </div>

      <div class="section">
        <div class="section-title">القيم</div>
        <div class="values-list">
          الجودة • الالتزام • الإبداع • روح الفريق • التعلم المستمر
        </div>
      </div>
    </body>
    </html>
  `;
}

// 5. Kings Quotes Page
export function generateKingsQuotesPage(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          direction: rtl;
        }
        .page-title {
          font-size: 28px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 30px;
        }
        .quote-section {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 12px;
          background: #f8fafc;
        }
        .king-name {
          font-size: 20px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 15px;
          text-align: center;
        }
        .quote-text {
          font-size: 16px;
          line-height: 1.8;
          color: #374151;
          text-align: center;
          font-style: italic;
          padding: 15px;
          border-right: 4px solid #f59e0b;
          background: white;
          border-radius: 8px;
        }
        .image-placeholder {
          width: 80px;
          height: 80px;
          background: #e5e7eb;
          border-radius: 50%;
          margin: 0 auto 15px;
        }
      </style>
    </head>
    <body>
      <div class="page-title">أقوال ملوك المملكة عن التعليم</div>
      
      <div class="quote-section">
        <div class="image-placeholder"></div>
        <div class="king-name">الملك عبدالعزيز آل سعود</div>
        <div class="quote-text">
          "التعليم في المملكة هو الركيزة الأساسية لنحقق بها تطلعات شعبنا نحو التقدم والرقي في العلوم والمعارف"
        </div>
      </div>

      <div class="quote-section">
        <div class="image-placeholder"></div>
        <div class="king-name">الملك سلمان بن عبدالعزيز</div>
        <div class="quote-text">
          "لا شك في أن التعليم في هذه البلاد هو من أسّس التنمية، ومن الأسس التي تعتمد الدولة عليها في بناء هذه الدولة الفتية"
        </div>
      </div>

      <div class="quote-section">
        <div class="image-placeholder"></div>
        <div class="king-name">الأمير محمد بن سلمان</div>
        <div class="quote-text">
          "طموحنا أن نكون ضمن أفضل 20 إلى 30 نظاماً تعليمياً ونملك كل شيء لتحقيق ذلك"
        </div>
      </div>
    </body>
    </html>
  `;
}

// 6. Professional Performance Page
export function generateProfessionalPerformancePage(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          min-height: 297mm;
          padding: 20mm;
          direction: rtl;
        }
        .page-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 40px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #1e3a8a;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 2px solid #f59e0b;
        }
        .section-content {
          font-size: 15px;
          line-height: 1.8;
          color: #374151;
          text-align: justify;
        }
        .highlight-box {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 10px;
          border-right: 4px solid #1e3a8a;
        }
      </style>
    </head>
    <body>
      <div class="page-title">الأداء المهني للمعلمين</div>
      
      <div class="section">
        <div class="section-title">التعريف</div>
        <div class="section-content highlight-box">
          الأداء المهني للمعلمين هو عملية منهجية ومستمرة لقياس وتقييم فعالية المعلم في أداء مهامه التعليمية والمهنية، باستخدام معايير محددة ومؤشرات أداء واضحة تهدف إلى تحسين جودة التعليم وتطوير الممارسات التربوية.
        </div>
      </div>

      <div class="section">
        <div class="section-title">الأهداف</div>
        <div class="section-content">
          • رفع جودة الأداء التعليمي وتحسين قدرات المعلمين ومهاراتهم المهنية بشكل مستمر<br><br>
          • تحديد نقاط القوة والضعف وتحليل الأداء الفعلي للمعلم<br><br>
          • تعزيز التطوير المهني وتوفير خطط تحسين مخصصة لكل معلم<br><br>
          • ضمان الجودة التعليمية والتأكد من امتلاك المعلمين للكفاءات اللازمة<br><br>
          • دعم اتخاذ القرارات وتوفير بيانات دقيقة للقيادات التعليمية
        </div>
      </div>

      <div class="section">
        <div class="section-title">الأهمية</div>
        <div class="section-content">
          يُعد الأداء المهني للمعلمين الركيزة الأساسية لتحقيق التميز التعليمي، حيث يساهم في بناء جيل واعٍ ومبدع قادر على المنافسة العالمية، وتعزيز القيم والهوية الوطنية لدى الطلاب، وتحقيق رؤية المملكة 2030 في مجال التعليم والتطوير، ورفع كفاءة المنظومة التعليمية بشكل شامل.
        </div>
      </div>
    </body>
    </html>
  `;
}

// 7. Standards List Page
export function generateStandardsListPage(standards: Array<{ number: number; title: string }>): string {
  const standardsHTML = standards
    .map(
      (std) => `
      <div class="standard-item">
        <span class="standard-number">${std.number}</span>
        <span class="standard-title">${std.title}</span>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: white;
          width: 210mm;
          height: 297mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 30mm;
          direction: rtl;
        }
        .page-title {
          font-size: 32px;
          font-weight: bold;
          color: #1e3a8a;
          text-align: center;
          margin-bottom: 40px;
        }
        .standards-container {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .standard-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 15px 20px;
          background: #f8fafc;
          border-radius: 10px;
          border-right: 4px solid #1e3a8a;
        }
        .standard-number {
          font-size: 24px;
          font-weight: bold;
          color: #1e3a8a;
          min-width: 40px;
        }
        .standard-title {
          font-size: 18px;
          color: #374151;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="page-title">معايير الأداء المهني للمعلمين</div>
      <div class="standards-container">
        ${standardsHTML}
      </div>
    </body>
    </html>
  `;
}
