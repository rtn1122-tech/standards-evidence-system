import mysql from 'mysql2/promise';
import fs from 'fs';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// جلب المعايير الـ11
const [standards] = await connection.execute(`
  SELECT id, title, description, orderIndex
  FROM standards 
  ORDER BY orderIndex
  LIMIT 11
`);

// حفظ في ملف JSON
const standardsList = standards.map((s, idx) => ({
  index: s.orderIndex,
  id: s.id,
  title: s.title,
  description: s.description || ''
}));

fs.writeFileSync('standards-list.json', JSON.stringify(standardsList, null, 2), 'utf-8');

console.log('✅ تم حفظ قائمة المعايير في standards-list.json');
console.log(`\nالمعايير الـ${standards.length}:`);
standardsList.forEach(s => {
  console.log(`${s.index}. ${s.title}`);
});

await connection.end();
