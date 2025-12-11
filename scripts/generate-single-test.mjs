import { invokeLLM } from '../server/_core/llm.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SHARED_IMAGES = {
  image1: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/teacher-classroom.jpg",
  image2: "https://d2xsxph8kpxj0f.cloudfront.net/310519663229092848/PdwWnVF2DAatRAKFwvgWXk/shared-evidence-images/students-learning.jpg"
};

async function generateTestEvidence() {
  const evidenceTitle = "الحضور والانصراف في الوقت المحدد";
  const standardName = "أداء الواجبات الوظيفية";
  
  const prompt = `أنت خبير تربوي متخصص في إعداد شواهد المعلمين للترقية المهنية في السعودية.

**المطلوب:** إنشاء محتوى احترافي لشاهد بعنوان "${evidenceTitle}" ضمن المعيار "${standardName}".

**⚠️ مهم جداً - الأسلوب التقريري:**
- استخدم ضمائر تدل على أن المعلم **نفّذ العمل فعلاً** (هذا تقرير إنجاز)
- استخدم: "التزمت بـ"، "قمت بـ"، "تم تنفيذ"، "نُفّذت"، "تم عقد"، "حضرت"، "شاركت"
- **تجنب تماماً:** "يجب"، "ينبغي"، "يتم"، "سيتم"، "من المهم"

**المحتوى المطلوب:**

1. **الوصف** (12-15 سطر):
   - وصف **تقريري** يوضح ما تم إنجازه فعلاً
   - يبدأ بـ "التزمت بـ..." أو "قمت بـ..." أو "تم تنفيذ..."
   - يذكر تفاصيل محددة (أرقام، تواريخ، إجراءات)
   - يوضح الأثر والنتائج المحققة
   - **طول الوصف:** 12-15 سطر (حوالي 800-1000 كلمة)

2. **6 خانات** (section1-section6):
   - كل خانة تحتوي على: **عنوان** + **محتوى**
   - العناوين **مخصصة** لموضوع الشاهد
   - المحتوى **تقريري** (4-6 أسطر لكل خانة)
   - **التنوع:** بعض الخانات نقاط (•)، وبعضها فقرات، وبعضها نقاط مرقمة (1. 2. 3.)

**مثال على الأسلوب التقريري:**

❌ **خطأ (أسلوب عام):**
"يعد الالتزام بالحضور والانصراف في المواعيد المحددة ركيزة أساسية للأداء الوظيفي..."

✅ **صحيح (أسلوب تقريري):**
"التزمت بالحضور والانصراف في المواعيد المحددة طوال الفصل الدراسي الأول 1446هـ، حيث تم تسجيل الحضور يومياً عبر نظام البصمة الإلكترونية بنسبة 100%. قمت بالوصول إلى المدرسة قبل بدء الدوام الرسمي بـ 15-20 دقيقة لضمان الاستعداد الكامل للحصص الدراسية. تم توثيق هذا الالتزام من خلال سجلات الحضور الرسمية المعتمدة من إدارة المدرسة..."

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
      { role: "system", content: "أنت خبير تربوي متخصص في إعداد محتوى احترافي لشواهد المعلمين بأسلوب تقريري." },
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

  const content = JSON.parse(response.choices[0].message.content);

  const evidence = {
    standardId: 1,
    title: evidenceTitle,
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
    applicableStages: ["ابتدائي", "متوسط", "ثانوي"],
    applicableSubjects: [],
    applicableGrades: [],
    priority: 0,
    defaultImage1Url: SHARED_IMAGES.image1,
    defaultImage2Url: SHARED_IMAGES.image2,
    activeFields: [1, 6, 17, 20]
  };

  return evidence;
}

async function main() {
  console.log('🧪 توليد شاهد تجريبي واحد...\n');

  const evidence = await generateTestEvidence();

  const outputPath = path.join(__dirname, '..', 'data', 'test-evidence.json');
  fs.writeFileSync(outputPath, JSON.stringify(evidence, null, 2), 'utf-8');

  console.log('\n✅ تم توليد الشاهد التجريبي بنجاح!');
  console.log(`📁 الملف: ${outputPath}`);
  
  // طباعة معلومات عن الوصف
  const descLines = evidence.description.split('\n').length;
  const descWords = evidence.description.split(' ').length;
  console.log(`\n📊 معلومات الوصف:`);
  console.log(`   - عدد الأسطر: ${descLines}`);
  console.log(`   - عدد الكلمات: ${descWords}`);
  console.log(`   - عدد الأحرف: ${evidence.description.length}`);
}

main().catch(console.error);
