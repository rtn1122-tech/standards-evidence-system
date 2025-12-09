import { db } from "./server/db";
import { evidences, standards } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import fs from "fs";

// الصور الافتراضية
const defaultImages = [
  "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-1.jpg",
  "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-2.jpg",
  "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-3.jpg",
  "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-4.jpg",
  "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-5.jpg"
];

// دالة لاختيار صورة عشوائية
function randomImage() {
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}

// دالة لاستخراج المادة والصف من النص
function extractSubjectGrade(firstLine: string): { subject: string; grade: string; stage: string } | null {
  const match = firstLine.match(/^\d+\)\s*(.+?)\s*–\s*الصف\s+(.+?)\s*–/);
  if (!match) return null;
  
  let subject = match[1].trim();
  const gradeText = match[2].trim();
  
  // تحديد المرحلة
  let stage: 'kindergarten' | 'elementary' | 'middle' | 'high' | 'all' = 'middle';
  if (gradeText.includes('ابتدائي')) stage = 'elementary';
  else if (gradeText.includes('ثانوي')) stage = 'high';
  
  // تنسيق الصف
  let grade = gradeText;
  if (stage === 'elementary') {
    // المرحلة الابتدائية
    if (gradeText.includes('الأول')) grade = 'الأول الابتدائي';
    else if (gradeText.includes('الثاني')) grade = 'الثاني الابتدائي';
    else if (gradeText.includes('الثالث')) grade = 'الثالث الابتدائي';
    else if (gradeText.includes('الرابع')) grade = 'الرابع الابتدائي';
    else if (gradeText.includes('الخامس')) grade = 'الخامس الابتدائي';
    else if (gradeText.includes('السادس')) grade = 'السادس الابتدائي';
  } else {
    // المرحلة المتوسطة
    if (gradeText.includes('الأول')) grade = 'الأول المتوسط';
    else if (gradeText.includes('الثاني')) grade = 'الثاني المتوسط';
    else if (gradeText.includes('الثالث')) grade = 'الثالث المتوسط';
  }
  
  return { subject, grade, stage };
}

// دالة لمعالجة ملف واحد
function processFile(filePath: string): any[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parts = content.split(/\n(?=\d+\))/);
  const results: any[] = [];
  
  for (const part of parts) {
    if (!part.trim()) continue;
    
    const lines = part.trim().split('\n');
    if (lines.length < 10) continue;
    
    // استخراج المادة والصف
    const info = extractSubjectGrade(lines[0]);
    if (!info) continue;
    
    // استخراج الأقسام
    const sections: Record<string, string> = {};
    let currentSection: string | null = null;
    let currentContent: string[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // التحقق من عناوين الأقسام
      if (['المقدمة', 'الأهداف', 'الإجراءات المنفذة', 'الإجراءات', 'النتائج', 'التوصيات والملاحظات', 'التوصيات', 'الخاتمة'].includes(line)) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join(' ');
        }
        currentSection = line;
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // حفظ القسم الأخير
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join(' ');
    }
    
    // التأكد من وجود المقدمة على الأقل
    if (!sections['المقدمة']) continue;
    
    results.push({
      title: `الزيارات التبادلية بين المعلمين - ${info.subject} - ${info.grade}`,
      subject: info.subject,
      grade: info.grade,
      stage: info.stage,
      description: sections['المقدمة'].substring(0, 200),
      box1Content: sections['المقدمة'] || '',
      box2Content: sections['الأهداف'] || '',
      box3Content: sections['الإجراءات المنفذة'] || sections['الإجراءات'] || '',
      box4Content: sections['النتائج'] || '',
      box5Content: sections['التوصيات والملاحظات'] || sections['التوصيات'] || '',
      box6Content: sections['الخاتمة'] || ''
    });
  }
  
  return results;
}

async function main() {
  console.log('🚀 بدء إضافة الشواهد...\n');
  
  // الحصول على المعيار الثاني
  const standardResult = await db.select().from(standards).where(eq(standards.orderIndex, 2)).limit(1);
  if (standardResult.length === 0) {
    console.error('❌ المعيار الثاني غير موجود!');
    process.exit(1);
  }
  
  const standardId = standardResult[0].id;
  console.log(`✅ المعيار الثاني: ID = ${standardId}\n`);
  
  // معالجة جميع الملفات
  const files = [
    '/home/ubuntu/upload/pasted_content_12.txt'
  ];
  
  let allEvidences: any[] = [];
  for (const file of files) {
    if (fs.existsSync(file)) {
      const fileEvidences = processFile(file);
      allEvidences = allEvidences.concat(fileEvidences);
      console.log(`📄 ${file}: ${fileEvidences.length} شاهد`);
    }
  }
  
  console.log(`\n📊 إجمالي الشواهد المستخرجة: ${allEvidences.length}\n`);
  
  // الحصول على أعلى ID موجود
  const maxIdResult = await db.select({ maxId: evidences.id }).from(evidences).orderBy(evidences.id).limit(1);
  let nextId = 1;
  if (maxIdResult.length > 0 && maxIdResult[0].maxId) {
    // الحصول على جميع ال IDs وإيجاد أعلى رقم
    const allIds = await db.select({ id: evidences.id }).from(evidences);
    const ids = allIds.map(r => r.id).sort((a, b) => b - a);
    nextId = ids[0] + 1;
  }
  
  console.log(`➡️  سيبدأ الإدراج من ID: ${nextId}\n`);
  
  // إضافة الشواهد
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const evidence of allEvidences) {
    // التحقق من التكرار
    const existing = await db.select().from(evidences).where(eq(evidences.title, evidence.title)).limit(1);
    
    if (existing.length > 0) {
      console.log(`⏭️  تخطي مكرر: ${evidence.title}`);
      skippedCount++;
      continue;
    }
    
    try {
      await db.insert(evidences).values({
        id: nextId++,
        standardId,
        title: evidence.title,
        description: evidence.description,
        field1Label: 'التاريخ',
        field1Value: '',
        field2Label: 'موضوع الدرس',
        field2Value: '',
        field3Label: 'الصف',
        field3Value: '',
        field4Label: 'المعلم الزائر',
        field4Value: '',
        field5Label: 'المعلم المزار',
        field5Value: '',
        field6Label: 'مدة التنفيذ',
        field6Value: '',
        box1Title: 'المقدمة',
        box1Content: evidence.box1Content,
        box2Title: 'الأهداف',
        box2Content: evidence.box2Content,
        box3Title: 'الإجراءات المنفذة',
        box3Content: evidence.box3Content,
        box4Title: 'النتائج',
        box4Content: evidence.box4Content,
        box5Title: 'التوصيات والملاحظات',
        box5Content: evidence.box5Content,
        box6Title: 'الخاتمة',
        box6Content: evidence.box6Content,
        stage: evidence.stage
      });
      
      console.log(`✅ تمت إضافة: ${evidence.title}`);
      addedCount++;
    } catch (error: any) {
      console.error(`❌ خطأ في ${evidence.title}: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 النتيجة النهائية:`);
  console.log(`   ✅ تمت إضافة: ${addedCount} شاهد`);
  console.log(`   ⏭️  تم تخطي: ${skippedCount} شاهد مكرر`);
  console.log('='.repeat(60));
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ خطأ:', error);
  process.exit(1);
});
