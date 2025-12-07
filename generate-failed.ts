import { invokeLLM } from './server/_core/llm';
import fs from 'fs';

const failedStandards = [
  {
    id: 2,
    title: "التفاعل مع المجتمع المهني",
    description: "يتفاعل المعلم مع زملائه والمجتمع المدرسي بشكل فعال، يشارك في الأنشطة المهنية، يتبادل الخبرات، ويساهم في تطوير البيئة المدرسية."
  },
  {
    id: 4,
    title: "التنوع في استراتيجيات التدريس",
    description: "يستخدم المعلم استراتيجيات تدريس متنوعة تناسب احتياجات المتعلمين المختلفة، يطبق أساليب تعليمية حديثة، ويراعي الفروق الفردية."
  },
  {
    id: 7,
    title: "توظيف تقنيات ووسائل التعلم",
    description: "يوظف المعلم التقنيات الحديثة والوسائل التعليمية بشكل فعال، يدمج التكنولوجيا في التدريس، ويستخدم الأدوات الرقمية لتحسين التعلم."
  }
];

async function main() {
  const results = [];

  for (const standard of failedStandards) {
    console.log(`\n🔄 توليد شواهد للمعيار: ${standard.title}`);
    
    const prompt = `أنت خبير في تطوير الأداء المهني للمعلمين. مهمتك إنشاء **3 شواهد جديدة** للمعيار التالي:

المعيار: ${standard.title}
الوصف: ${standard.description}

**المعايير الواجب اتباعها:**

1. **الوصف (100-120 كلمة):**
   - نص شامل يوضح أهمية الشاهد وعلاقته بالمعيار
   - بدون عبارات افتتاحية مكررة
   - محتوى غني بالتفاصيل

2. **المربعات الستة (50-65 كلمة لكل مربع):**
   - المقدمة: سياق الشاهد وأهميته
   - الأهداف: أهداف واضحة ومحددة
   - الإجراءات: خطوات التنفيذ بالتفصيل
   - النتائج: نتائج ملموسة وقابلة للقياس
   - التوصيات: توصيات عملية للتحسين
   - الخاتمة: ملخص شامل

3. **التنوع:**
   - كل شاهد يجب أن يكون مختلفاً تماماً عن الآخر
   - تنوع في المواضيع والسياقات
   - عدم تكرار نفس العبارات`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "أنت خبير في تطوير الأداء المهني للمعلمين. تلتزم بالمعايير المطلوبة بدقة." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "evidences_schema",
            strict: true,
            schema: {
              type: "object",
              properties: {
                evidence1_name: { type: "string" },
                evidence1_description: { type: "string" },
                evidence1_box1_title: { type: "string" },
                evidence1_box1_content: { type: "string" },
                evidence1_box2_title: { type: "string" },
                evidence1_box2_content: { type: "string" },
                evidence1_box3_title: { type: "string" },
                evidence1_box3_content: { type: "string" },
                evidence1_box4_title: { type: "string" },
                evidence1_box4_content: { type: "string" },
                evidence1_box5_title: { type: "string" },
                evidence1_box5_content: { type: "string" },
                evidence1_box6_title: { type: "string" },
                evidence1_box6_content: { type: "string" },
                evidence2_name: { type: "string" },
                evidence2_description: { type: "string" },
                evidence2_box1_title: { type: "string" },
                evidence2_box1_content: { type: "string" },
                evidence2_box2_title: { type: "string" },
                evidence2_box2_content: { type: "string" },
                evidence2_box3_title: { type: "string" },
                evidence2_box3_content: { type: "string" },
                evidence2_box4_title: { type: "string" },
                evidence2_box4_content: { type: "string" },
                evidence2_box5_title: { type: "string" },
                evidence2_box5_content: { type: "string" },
                evidence2_box6_title: { type: "string" },
                evidence2_box6_content: { type: "string" },
                evidence3_name: { type: "string" },
                evidence3_description: { type: "string" },
                evidence3_box1_title: { type: "string" },
                evidence3_box1_content: { type: "string" },
                evidence3_box2_title: { type: "string" },
                evidence3_box2_content: { type: "string" },
                evidence3_box3_title: { type: "string" },
                evidence3_box3_content: { type: "string" },
                evidence3_box4_title: { type: "string" },
                evidence3_box4_content: { type: "string" },
                evidence3_box5_title: { type: "string" },
                evidence3_box5_content: { type: "string" },
                evidence3_box6_title: { type: "string" },
                evidence3_box6_content: { type: "string" }
              },
              required: [
                "evidence1_name", "evidence1_description",
                "evidence1_box1_title", "evidence1_box1_content",
                "evidence1_box2_title", "evidence1_box2_content",
                "evidence1_box3_title", "evidence1_box3_content",
                "evidence1_box4_title", "evidence1_box4_content",
                "evidence1_box5_title", "evidence1_box5_content",
                "evidence1_box6_title", "evidence1_box6_content",
                "evidence2_name", "evidence2_description",
                "evidence2_box1_title", "evidence2_box1_content",
                "evidence2_box2_title", "evidence2_box2_content",
                "evidence2_box3_title", "evidence2_box3_content",
                "evidence2_box4_title", "evidence2_box4_content",
                "evidence2_box5_title", "evidence2_box5_content",
                "evidence2_box6_title", "evidence2_box6_content",
                "evidence3_name", "evidence3_description",
                "evidence3_box1_title", "evidence3_box1_content",
                "evidence3_box2_title", "evidence3_box2_content",
                "evidence3_box3_title", "evidence3_box3_content",
                "evidence3_box4_title", "evidence3_box4_content",
                "evidence3_box5_title", "evidence3_box5_content",
                "evidence3_box6_title", "evidence3_box6_content"
              ],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const output = JSON.parse(content);
      
      results.push({
        standard: standard,
        output: output,
        success: true
      });
      
      console.log(`✅ نجح توليد 3 شواهد`);
    } catch (error: any) {
      console.error(`❌ فشل: ${error.message}`);
      results.push({
        standard: standard,
        output: null,
        success: false,
        error: error.message
      });
    }
  }

  // حفظ النتائج
  fs.writeFileSync('/home/ubuntu/failed_evidences_results.json', JSON.stringify(results, null, 2));

  console.log(`\n📊 النتيجة النهائية:`);
  console.log(`✅ نجح: ${results.filter((r: any) => r.success).length}/3`);
  console.log(`❌ فشل: ${results.filter((r: any) => !r.success).length}/3`);
  console.log(`\n📁 الملف: /home/ubuntu/failed_evidences_results.json`);
}

main();
