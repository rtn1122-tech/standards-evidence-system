import { invokeLLM } from '../server/_core/llm.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHARED_IMAGES = {
  image1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/teacher-classroom.jpg",
  image2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/students-learning.jpg",
  image3: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/teacher-teaching.jpg",
  image4: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/teacher-students.jpg",
  image5: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/school-gate.jpg"
};

// تعريفات المعايير الكاملة (سنضيف المعايير 4-11 لاحقاً)
const STANDARDS_CONFIG = {
  1: {
    name: "أداء الواجبات الوظيفية",
    evidences: [
      {title: "الحضور والانصراف في الوقت المحدد", activeFields: [1, 6, 17, 20]},
      {title: "جدول الحصص الدراسية", activeFields: [1, 6, 17, 20]},
      {title: "جدول المناوبة والإشراف اليومي", activeFields: [1, 6, 17, 20]},
      {title: "تفعيل حصص الانتظار", activeFields: [1, 6, 17, 20]},
      {title: "المشاركات المدرسية: اليوم الوطني", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: يوم العلم", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: يوم التأسيس", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: يوم المدير", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: يوم المعلم", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: يوم اللغة العربية", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: الإذاعة المدرسية", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: السعودية الخضراء", activeFields: [1, 2, 5, 6, 7, 9, 16]},
      {title: "المشاركات المدرسية: الابتكارات والإبداع", activeFields: [1, 2, 5, 6, 7, 9, 16]}
    ]
  },
  2: {
    name: "التفاعل مع المجتمع المهني",
    evidences: [
      {title: "حضور اجتماعات المجتمع المهني", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21]},
      {title: "المشاركة في مجتمعات التعلم المهنية PLC", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس رياضيات", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["رياضيات"], grades: ["الصف الأول"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس علوم", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["علوم"], grades: ["الصف الثاني"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس لغة عربية", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["لغة عربية"], grades: ["الصف الثالث"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس تربية إسلامية", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["تربية إسلامية"], grades: ["الصف الرابع"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس اجتماعيات", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["اجتماعيات"], grades: ["الصف الخامس"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس لغة إنجليزية", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["لغة إنجليزية"], grades: ["الصف السادس"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس حاسب آلي", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["حاسب آلي"], grades: ["الصف الأول"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس تربية فنية", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["تربية فنية"], grades: ["الصف الثاني"]},
      {title: "تبادل الخبرات مع الزملاء - زيارة لدرس تربية بدنية", activeFields: [1, 2, 3, 4, 5, 8, 10, 11, 21], subjects: ["تربية بدنية"], grades: ["الصف الثالث"]}
    ]
  },
  3: {
    name: "التفاعل مع أولياء الأمور",
    evidences: [
      {title: "التواصل عبر منصة مدرستي", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "الإشعارات النصية لأولياء الأمور", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "لقاءات مجلس الآباء", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "إشراك أولياء الأمور في الخطط العلاجية", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "تقارير مستوى الطلاب", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "الاجتماعات الفردية مع أولياء الأمور", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "الاستجابة لملاحظات أولياء الأمور", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]},
      {title: "الخطة الأسبوعية وجداول الاختبارات الدورية", activeFields: [1, 2, 3, 4, 10, 11, 14, 22]}
    ]
  }
};

async function generateEvidenceContent(standardId, evidenceTitle) {
  const standardName = STANDARDS_CONFIG[standardId].name;
  
  const prompt = `أنت خبير تربوي متخصص في إعداد شواهد المعلمين للترقية المهنية في السعودية.

**المطلوب:** إنشاء محتوى احترافي لشاهد بعنوان "${evidenceTitle}" ضمن المعيار "${standardName}".

**المحتوى المطلوب:**

1. **الوصف** (10 أسطر): وصف شامل يوضح أهمية هذا الشاهد ودوره في الأداء المهني للمعلم.

2. **6 خانات** (section1-section6):
   - كل خانة تحتوي على: **عنوان** + **محتوى**
   - العناوين يجب أن تكون **مخصصة** لموضوع الشاهد (ليست عامة)
   - المحتوى يتراوح بين **3-5 أسطر**
   - **التنوع مهم:** بعض الخانات على شكل **نقاط** (•)، وبعضها **فقرات** متصلة
   - الخانات يجب أن تغطي جوانب مختلفة: (الأهمية، الإجراءات، الأثر، التوثيق، التحديات، التوصيات، إلخ)

**مثال على التنوع:**
- خانة 1: فقرة متصلة
- خانة 2: نقاط (• • •)
- خانة 3: فقرة متصلة
- خانة 4: نقاط مرقمة (1. 2. 3.)
- خانة 5: فقرة متصلة
- خانة 6: نقاط (• • •)

**ملاحظات:**
- المحتوى يجب أن يكون **احترافي ومفصل**
- تجنب التكرار
- استخدم لغة تربوية راقية
- ركز على الجوانب العملية والتطبيقية

**الإخراج:** JSON بالصيغة التالية:
{
  "description": "...",
  "section1Title": "...",
  "section1Content": "...",
  "section2Title": "...",
  "section2Content": "...",
  "section3Title": "...",
  "section3Content": "...",
  "section4Title": "...",
  "section4Content": "...",
  "section5Title": "...",
  "section5Content": "...",
  "section6Title": "...",
  "section6Content": "..."
}`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "أنت خبير تربوي متخصص في إعداد محتوى احترافي لشواهد المعلمين." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "evidence_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            section1Title: { type: "string" },
            section1Content: { type: "string" },
            section2Title: { type: "string" },
            section2Content: { type: "string" },
            section3Title: { type: "string" },
            section3Content: { type: "string" },
            section4Title: { type: "string" },
            section4Content: { type: "string" },
            section5Title: { type: "string" },
            section5Content: { type: "string" },
            section6Title: { type: "string" },
            section6Content: { type: "string" }
          },
          required: ["description", "section1Title", "section1Content", "section2Title", "section2Content", "section3Title", "section3Content", "section4Title", "section4Content", "section5Title", "section5Content", "section6Title", "section6Content"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(response.choices[0].message.content);
}

async function generateBatch(standardIds) {
  const allEvidences = [];
  let counter = 0;

  for (const standardId of standardIds) {
    const standard = STANDARDS_CONFIG[standardId];
    console.log(`\n📚 المعيار ${standardId}: ${standard.name}`);
    console.log(`عدد الشواهد: ${standard.evidences.length}\n`);

    for (const evidence of standard.evidences) {
      counter++;
      console.log(`⏳ [${counter}] توليد: ${evidence.title}...`);

      try {
        const content = await generateEvidenceContent(standardId, evidence.title);

        const fullEvidence = {
          standardId: standardId,
          title: evidence.title,
          description: content.description,
          section1Title: content.section1Title,
          section1Content: content.section1Content,
          section2Title: content.section2Title,
          section2Content: content.section2Content,
          section3Title: content.section3Title,
          section3Content: content.section3Content,
          section4Title: content.section4Title,
          section4Content: content.section4Content,
          section5Title: content.section5Title,
          section5Content: content.section5Content,
          section6Title: content.section6Title,
          section6Content: content.section6Content,
          applicableStages: evidence.stages || ["ابتدائي", "متوسط", "ثانوي"],
          applicableSubjects: evidence.subjects || [],
          applicableGrades: evidence.grades || [],
          priority: Math.floor(Math.random() * 3),
          defaultImage1Url: SHARED_IMAGES.image1,
          defaultImage2Url: SHARED_IMAGES.image2,
          activeFields: evidence.activeFields
        };

        allEvidences.push(fullEvidence);
        console.log(`✅ [${counter}] تم بنجاح!\n`);

        // تأخير بسيط لتجنب rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ [${counter}] خطأ في توليد "${evidence.title}":`, error.message);
      }
    }
  }

  return allEvidences;
}

// توليد العينة (المعايير 1-3)
async function main() {
  console.log('🚀 بدء توليد العينة (المعايير 1-3)...\n');

  const evidences = await generateBatch([1, 2, 3]);

  const outputPath = path.join(__dirname, '..', 'data', 'sample-30-evidences.json');
  fs.writeFileSync(outputPath, JSON.stringify(evidences, null, 2), 'utf-8');

  console.log(`\n✅ تم توليد ${evidences.length} شاهد بنجاح!`);
  console.log(`📁 الملف: ${outputPath}`);
}

main().catch(console.error);
