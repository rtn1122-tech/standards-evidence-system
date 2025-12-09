import ExcelJS from 'exceljs';

const standards = [
  { id: 1, name: "أداء الواجبات الوظيفية" },
  { id: 2, name: "التفاعل مع المجتمع المهني" },
  { id: 3, name: "التفاعل مع أولياء الأمور" },
  { id: 4, name: "التنوع في استراتيجيات التدريس" },
  { id: 5, name: "تحسين نتائج المتعلمين" },
  { id: 6, name: "إعداد وتنفيذ خطة التعلم" },
  { id: 7, name: "توظيف تقنيات ووسائل التعلم" },
  { id: 8, name: "تهيئة بيئة تعليمية" },
  { id: 9, name: "الإدارة الصفية" },
  { id: 10, name: "تحليل نتائج المتعلمين" },
  { id: 11, name: "تنوع أساليب التقويم" },
];

console.log("🔄 بدء تحديث ملف Excel...\n");

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('evidence_templates.xlsx');

// تحديث ورقة "دليل الاستخدام"
const guideSheet = workbook.getWorksheet('دليل الاستخدام');
if (guideSheet) {
  // تحديث قائمة المعايير في الدليل
  let row = 10; // ابدأ من الصف 10 (بعد العناوين)
  standards.forEach((standard) => {
    const cell = guideSheet.getCell(`B${row}`);
    if (cell.value && cell.value.toString().includes('المعيار')) {
      cell.value = `${standard.id}. ${standard.name}`;
    }
    row++;
  });
  console.log("✅ تم تحديث ورقة 'دليل الاستخدام'");
}

// تحديث ورقة "أمثلة" - تحديث أسماء المعايير في الأمثلة
const examplesSheet = workbook.getWorksheet('أمثلة');
if (examplesSheet) {
  examplesSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // تخطي صف العناوين
      const standardIdCell = row.getCell(1); // رقم_المعيار
      const standardNameCell = row.getCell(2); // اسم_المعيار
      
      if (standardIdCell.value) {
        const standardId = parseInt(standardIdCell.value);
        const standard = standards.find(s => s.id === standardId);
        if (standard) {
          standardNameCell.value = standard.name;
        }
      }
    }
  });
  console.log("✅ تم تحديث ورقة 'أمثلة'");
}

// حفظ الملف
await workbook.xlsx.writeFile('evidence_templates.xlsx');
console.log("\n✅ تم حفظ ملف Excel بنجاح!");

process.exit(0);
