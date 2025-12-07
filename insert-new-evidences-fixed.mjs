import mysql from 'mysql2/promise';
import fs from 'fs';
import ExcelJS from 'exceljs';

const data = JSON.parse(fs.readFileSync('/home/ubuntu/generate_new_evidences.json', 'utf-8'));
const connection = await mysql.createConnection(process.env.DATABASE_URL);

// جلب المعايير
const [standards] = await connection.execute(`
  SELECT id, title, orderIndex FROM standards ORDER BY orderIndex LIMIT 11
`);

// إنشاء Excel
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('الشواهد الجديدة');

// عناوين الأعمدة
worksheet.columns = [
  { header: 'المعيار', key: 'standard', width: 30 },
  { header: 'اسم الشاهد', key: 'name', width: 40 },
  { header: 'الوصف', key: 'description', width: 80 },
  { header: 'عنوان المربع 1', key: 'box1_title', width: 20 },
  { header: 'محتوى المربع 1', key: 'box1_content', width: 60 },
  { header: 'عنوان المربع 2', key: 'box2_title', width: 20 },
  { header: 'محتوى المربع 2', key: 'box2_content', width: 60 },
  { header: 'عنوان المربع 3', key: 'box3_title', width: 20 },
  { header: 'محتوى المربع 3', key: 'box3_content', width: 60 },
  { header: 'عنوان المربع 4', key: 'box4_title', width: 20 },
  { header: 'محتوى المربع 4', key: 'box4_content', width: 60 },
  { header: 'عنوان المربع 5', key: 'box5_title', width: 20 },
  { header: 'محتوى المربع 5', key: 'box5_content', width: 60 },
  { header: 'عنوان المربع 6', key: 'box6_title', width: 20 },
  { header: 'محتوى المربع 6', key: 'box6_content', width: 60 },
];

let insertedCount = 0;
let nextId = 150045; // بعد آخر شاهد موجود (150044)

for (let i = 0; i < data.results.length; i++) {
  const result = data.results[i];
  const standard = standards[i];
  
  if (!result.output) continue;
  
  const evidences = [
    {
      name: result.output.evidence1_name,
      description: result.output.evidence1_description,
      boxes: [
        { title: result.output.evidence1_box1_title, content: result.output.evidence1_box1_content },
        { title: result.output.evidence1_box2_title, content: result.output.evidence1_box2_content },
        { title: result.output.evidence1_box3_title, content: result.output.evidence1_box3_content },
        { title: result.output.evidence1_box4_title, content: result.output.evidence1_box4_content },
        { title: result.output.evidence1_box5_title, content: result.output.evidence1_box5_content },
        { title: result.output.evidence1_box6_title, content: result.output.evidence1_box6_content },
      ]
    },
    {
      name: result.output.evidence2_name,
      description: result.output.evidence2_description,
      boxes: [
        { title: result.output.evidence2_box1_title, content: result.output.evidence2_box1_content },
        { title: result.output.evidence2_box2_title, content: result.output.evidence2_box2_content },
        { title: result.output.evidence2_box3_title, content: result.output.evidence2_box3_content },
        { title: result.output.evidence2_box4_title, content: result.output.evidence2_box4_content },
        { title: result.output.evidence2_box5_title, content: result.output.evidence2_box5_content },
        { title: result.output.evidence2_box6_title, content: result.output.evidence2_box6_content },
      ]
    },
    {
      name: result.output.evidence3_name,
      description: result.output.evidence3_description,
      boxes: [
        { title: result.output.evidence3_box1_title, content: result.output.evidence3_box1_content },
        { title: result.output.evidence3_box2_title, content: result.output.evidence3_box2_content },
        { title: result.output.evidence3_box3_title, content: result.output.evidence3_box3_content },
        { title: result.output.evidence3_box4_title, content: result.output.evidence3_box4_content },
        { title: result.output.evidence3_box5_title, content: result.output.evidence3_box5_content },
        { title: result.output.evidence3_box6_title, content: result.output.evidence3_box6_content },
      ]
    }
  ];
  
  for (const ev of evidences) {
    // إضافة للإكسل
    worksheet.addRow({
      standard: standard.title,
      name: ev.name,
      description: ev.description,
      box1_title: ev.boxes[0].title,
      box1_content: ev.boxes[0].content,
      box2_title: ev.boxes[1].title,
      box2_content: ev.boxes[1].content,
      box3_title: ev.boxes[2].title,
      box3_content: ev.boxes[2].content,
      box4_title: ev.boxes[3].title,
      box4_content: ev.boxes[3].content,
      box5_title: ev.boxes[4].title,
      box5_content: ev.boxes[4].content,
      box6_title: ev.boxes[5].title,
      box6_content: ev.boxes[5].content,
    });
    
    // إدراج في قاعدة البيانات
    const page2Boxes = JSON.stringify(ev.boxes.map(b => ({
      title: b.title,
      content: b.content
    })));
    
    const userFields = JSON.stringify([]);  // حقول فارغة للآن
    
    await connection.execute(`
      INSERT INTO evidenceTemplates (
        id, standardId, standardCode, standardName, evidenceName, subEvidenceName,
        description, page2Boxes, userFields, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, NOW(), NOW())
    `, [
      nextId,
      standard.id,
      `${standard.orderIndex}.1.1`,
      standard.title,
      ev.name,
      ev.description,
      page2Boxes,
      userFields
    ]);
    
    insertedCount++;
    nextId++;
  }
}

await workbook.xlsx.writeFile('new-evidences.xlsx');
await connection.end();

console.log(`\n✅ تم إنشاء ${insertedCount} شاهد جديد بنجاح!`);
console.log(`📊 ملف Excel: new-evidences.xlsx`);
console.log(`💾 تم إدراج الشواهد في قاعدة البيانات (IDs: 150045-${nextId-1})`);
