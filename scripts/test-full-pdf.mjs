import { generateIndexPage, generateTeacherInfoPage, generateDocumentsPage, generateVisionMissionPage, generateKingsQuotesPage, generateProfessionalPerformancePage, generateStandardsListPage } from '../server/introPages.ts';
import { generateStandardPage, generateEvidencePDF } from '../server/generatePDF.ts';
import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

async function testFullPDF() {
  console.log('Starting full PDF generation...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pages = [];

  // 1. Index Page
  console.log('Generating index page...');
  const indexHTML = generateIndexPage({
    standards: [
      {
        number: 1,
        title: 'أداء الواجبات الوظيفية',
        evidences: [
          { name: 'الحضور والانصراف في الوقت المحدد', pageNumber: 10 },
          { name: 'جدول الحصص الدراسية', pageNumber: 12 },
        ],
      },
    ],
  });
  const indexPage = await browser.newPage();
  await indexPage.setContent(indexHTML, { waitUntil: 'networkidle0' });
  const indexPDF = await indexPage.pdf({ format: 'A4', printBackground: true });
  pages.push(indexPDF);
  await indexPage.close();

  // 2. Teacher Info Page
  console.log('Generating teacher info page...');
  const teacherInfoHTML = generateTeacherInfoPage({
    teacherName: 'أ. محمد أحمد',
    schoolName: 'مدرسة الأمل الابتدائية',
    educationDepartment: 'إدارة تعليم الرياض',
    specialty: 'رياضيات',
    stage: 'ابتدائي',
    licenseNumber: '123456789',
    licenseDate: '1445/05/15',
  });
  const teacherInfoPage = await browser.newPage();
  await teacherInfoPage.setContent(teacherInfoHTML, { waitUntil: 'networkidle0' });
  const teacherInfoPDF = await teacherInfoPage.pdf({ format: 'A4', printBackground: true });
  pages.push(teacherInfoPDF);
  await teacherInfoPage.close();

  // 3. Documents Page
  console.log('Generating documents page...');
  const documentsHTML = generateDocumentsPage();
  const documentsPage = await browser.newPage();
  await documentsPage.setContent(documentsHTML, { waitUntil: 'networkidle0' });
  const documentsPDF = await documentsPage.pdf({ format: 'A4', printBackground: true });
  pages.push(documentsPDF);
  await documentsPage.close();

  // 4. Vision Mission Page
  console.log('Generating vision mission page...');
  const visionMissionHTML = generateVisionMissionPage();
  const visionMissionPage = await browser.newPage();
  await visionMissionPage.setContent(visionMissionHTML, { waitUntil: 'networkidle0' });
  const visionMissionPDF = await visionMissionPage.pdf({ format: 'A4', printBackground: true });
  pages.push(visionMissionPDF);
  await visionMissionPage.close();

  // 5. Kings Quotes Page
  console.log('Generating kings quotes page...');
  const kingsQuotesHTML = generateKingsQuotesPage();
  const kingsQuotesPage = await browser.newPage();
  await kingsQuotesPage.setContent(kingsQuotesHTML, { waitUntil: 'networkidle0' });
  const kingsQuotesPDF = await kingsQuotesPage.pdf({ format: 'A4', printBackground: true });
  pages.push(kingsQuotesPDF);
  await kingsQuotesPage.close();

  // 6. Professional Performance Page
  console.log('Generating professional performance page...');
  const professionalPerformanceHTML = generateProfessionalPerformancePage();
  const professionalPerformancePage = await browser.newPage();
  await professionalPerformancePage.setContent(professionalPerformanceHTML, { waitUntil: 'networkidle0' });
  const professionalPerformancePDF = await professionalPerformancePage.pdf({ format: 'A4', printBackground: true });
  pages.push(professionalPerformancePDF);
  await professionalPerformancePage.close();

  // 7. Standards List Page
  console.log('Generating standards list page...');
  const standardsListHTML = generateStandardsListPage([
    { number: 1, title: 'أداء الواجبات الوظيفية' },
    { number: 2, title: 'التفاعل مع المجتمع المهني' },
    { number: 3, title: 'التفاعل مع أولياء الأمور' },
    { number: 4, title: 'التنوع في استراتيجيات التدريس' },
    { number: 5, title: 'تحسين نتائج المتعلمين' },
    { number: 6, title: 'إعداد وتنفيذ خطة التعلم' },
    { number: 7, title: 'توظيف تقنيات ووسائل التعلم' },
    { number: 8, title: 'تهيئة بيئة تعليمية' },
    { number: 9, title: 'الإدارة الصفية' },
    { number: 10, title: 'تحليل نتائج المتعلمين' },
    { number: 11, title: 'تنوع أساليب التقويم' },
  ]);
  const standardsListPage = await browser.newPage();
  await standardsListPage.setContent(standardsListHTML, { waitUntil: 'networkidle0' });
  const standardsListPDF = await standardsListPage.pdf({ format: 'A4', printBackground: true });
  pages.push(standardsListPDF);
  await standardsListPage.close();

  // 8. Standard Page (Example)
  console.log('Generating standard page...');
  const standardPageHTML = generateStandardPage({
    standardNumber: 1,
    standardName: 'أداء الواجبات الوظيفية',
    standardDescription: 'يهدف هذا المعيار إلى قياس مدى التزام المعلم بأداء واجباته الوظيفية بدقة واحترافية عالية.',
  });
  const standardPageObj = await browser.newPage();
  await standardPageObj.setContent(standardPageHTML, { waitUntil: 'networkidle0' });
  const standardPagePDF = await standardPageObj.pdf({ format: 'A4', printBackground: true });
  pages.push(standardPagePDF);
  await standardPageObj.close();

  await browser.close();

  // Merge PDFs (simple concatenation for testing)
  const PDFDocument = (await import('pdf-lib')).PDFDocument;
  const mergedPdf = await PDFDocument.create();

  for (const pdfBytes of pages) {
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();

  // Save
  await mkdir('data', { recursive: true });
  const fs = await import('fs/promises');
  await fs.writeFile('data/full-pdf-test.pdf', mergedPdfBytes);

  console.log('✅ Full PDF generated: data/full-pdf-test.pdf');
  console.log(`Size: ${(mergedPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
}

testFullPDF().catch(console.error);
