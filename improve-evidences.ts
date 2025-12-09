import { invokeLLM } from './server/_core/llm';
import fs from 'fs';
import csv from 'csv-parser';

interface CSVRow {
  'المعيار': string;
  'اسم الشاهد': string;
  'الوصف': string;
  'عنوان المربع 1': string;
  'محتوى المربع 1': string;
  'عنوان المربع 2': string;
  'محتوى المربع 2': string;
  'عنوان المربع 3': string;
  'محتوى المربع 3': string;
  'عنوان المربع 4': string;
  'محتوى المربع 4': string;
  'عنوان المربع 5': string;
  'محتوى المربع 5': string;
  'عنوان المربع 6': string;
  'محتوى المربع 6': string;
}

async function main() {
  console.log('🔄 بدء تحسين الشواهد...\n');

  // قراءة الشواهد
  const rows: CSVRow[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('new-evidences-clean.csv')
      .pipe(csv())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📄 تم قراءة ${rows.length} شاهد\n`);

  const improved: CSVRow[] = [];
  let count = 0;

  for (const row of rows) {
    count++;
    console.log(`🔄 ${count}/${rows.length}: ${row['اسم الشاهد'].substring(0, 40)}...`);

    const prompt = `أنت خبير في تحسين المحتوى التعليمي. مهمتك تحسين هذا الشاهد:

**الشاهد الحالي:**
- المعيار: ${row['المعيار']}
- الاسم: ${row['اسم الشاهد']}
- الوصف: ${row['الوصف']}

**المربعات الستة:**
1. ${row['عنوان المربع 1']}: ${row['محتوى المربع 1']}
2. ${row['عنوان المربع 2']}: ${row['محتوى المربع 2']}
3. ${row['عنوان المربع 3']}: ${row['محتوى المربع 3']}
4. ${row['عنوان المربع 4']}: ${row['محتوى المربع 4']}
5. ${row['عنوان المربع 5']}: ${row['محتوى المربع 5']}
6. ${row['عنوان المربع 6']}: ${row['محتوى المربع 6']}

**التحسينات المطلوبة:**

1. **الوصف (100-120 كلمة):**
   - تنويع العبارة الافتتاحية (استخدم: يُعد، يُمثل، تُعتبر، يُوضح، يُجسد، تم تنفيذ، إلخ)
   - تجنب البدء بـ "يُبرز" أو "يهدف" إذا كان الوصف الحالي يبدأ بهما
   - محتوى غني بالتفاصيل

2. **المربعات (50-65 كلمة لكل مربع):**
   - **على الأقل 3 مربعات** يجب أن تحتوي على نقاط (•) بدلاً من السرد المتصل
   - استخدم النقاط في: الأهداف، الإجراءات، النتائج، التوصيات
   - اجعل النقاط واضحة ومنظمة (• النقطة الأولى\n• النقطة الثانية)
   - المقدمة والخاتمة يمكن أن تبقى سرداً متصلاً

3. **الجودة:**
   - حافظ على المعنى الأصلي
   - تحسين الصياغة والوضوح
   - تجنب التكرار`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "أنت خبير في تحسين المحتوى التعليمي. تلتزم بالمعايير المطلوبة بدقة." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "improved_evidence",
            strict: true,
            schema: {
              type: "object",
              properties: {
                description: { type: "string" },
                box1_content: { type: "string" },
                box2_content: { type: "string" },
                box3_content: { type: "string" },
                box4_content: { type: "string" },
                box5_content: { type: "string" },
                box6_content: { type: "string" }
              },
              required: ["description", "box1_content", "box2_content", "box3_content", "box4_content", "box5_content", "box6_content"],
              additionalProperties: false
            }
          }
        }
      });

      const result = JSON.parse(response.choices[0].message.content);

      improved.push({
        'المعيار': row['المعيار'],
        'اسم الشاهد': row['اسم الشاهد'],
        'الوصف': result.description,
        'عنوان المربع 1': row['عنوان المربع 1'],
        'محتوى المربع 1': result.box1_content,
        'عنوان المربع 2': row['عنوان المربع 2'],
        'محتوى المربع 2': result.box2_content,
        'عنوان المربع 3': row['عنوان المربع 3'],
        'محتوى المربع 3': result.box3_content,
        'عنوان المربع 4': row['عنوان المربع 4'],
        'محتوى المربع 4': result.box4_content,
        'عنوان المربع 5': row['عنوان المربع 5'],
        'محتوى المربع 5': result.box5_content,
        'عنوان المربع 6': row['عنوان المربع 6'],
        'محتوى المربع 6': result.box6_content
      });

      console.log(`✅ تم التحسين`);
    } catch (error: any) {
      console.error(`❌ فشل: ${error.message}`);
      improved.push(row); // الاحتفاظ بالنسخة الأصلية
    }
  }

  // حفظ النتائج
  const writer = fs.createWriteStream('evidences-improved.csv');
  writer.write('\ufeff'); // BOM for Excel
  
  const headers = Object.keys(improved[0]);
  writer.write(headers.join(',') + '\n');
  
  for (const row of improved) {
    const values = headers.map(h => `"${(row as any)[h].replace(/"/g, '""')}"`);
    writer.write(values.join(',') + '\n');
  }
  
  writer.end();

  console.log(`\n✅ تم حفظ ${improved.length} شاهد محسّن في evidences-improved.csv`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
