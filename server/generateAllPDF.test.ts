import { describe, it, expect } from 'vitest';
import { htmlToPdf } from './htmlToPdf';
import * as introPages from './introPages';

describe('generateAllPDF - Intro Pages', () => {
  it('should generate index page PDF', async () => {
    const html = introPages.generateIndexPage({ standards: [] });
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate teacher info page PDF', async () => {
    const html = introPages.generateTeacherInfoPage({
      teacherName: 'محمد أحمد',
      schoolName: 'مدرسة الأمل الابتدائية',
      educationDepartment: 'الرياض',
      specialty: 'رياضيات',
      stage: 'ابتدائي',
      licenseNumber: '123456',
      licenseDate: '2024-01-01',
    });
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate documents page PDF', async () => {
    const html = introPages.generateDocumentsPage();
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate vision/mission page PDF', async () => {
    const html = introPages.generateVisionMissionPage();
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate kings quotes page PDF', async () => {
    const html = introPages.generateKingsQuotesPage();
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate professional performance page PDF', async () => {
    const html = introPages.generateProfessionalPerformancePage();
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate standards list page PDF', async () => {
    const standards = [
      { number: 1, title: 'المعيار الأول' },
      { number: 2, title: 'المعيار الثاني' },
    ];
    const html = introPages.generateStandardsListPage(standards);
    const pdfBuffer = await htmlToPdf(html);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });

  it('should generate all 7 intro pages successfully', async () => {
    const pages = [
      introPages.generateIndexPage({ standards: [] }),
      introPages.generateTeacherInfoPage({
        teacherName: 'محمد أحمد',
        schoolName: 'مدرسة الأمل',
        educationDepartment: 'الرياض',
      }),
      introPages.generateDocumentsPage(),
      introPages.generateVisionMissionPage(),
      introPages.generateKingsQuotesPage(),
      introPages.generateProfessionalPerformancePage(),
      introPages.generateStandardsListPage([
        { number: 1, title: 'المعيار الأول' },
      ]),
    ];

    const pdfBuffers = await Promise.all(
      pages.map(html => htmlToPdf(html))
    );

    expect(pdfBuffers).toHaveLength(7);
    pdfBuffers.forEach(buffer => {
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
