import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// عدد الشواهد الإجمالي
const [total] = await conn.query('SELECT COUNT(*) as count FROM evidenceTemplates');
console.log('📊 إجمالي الشواهد:', total[0].count);

// عدد الشواهد لكل معيار
const [byStandard] = await conn.query(`
  SELECT s.id, s.title, COUNT(e.id) as count 
  FROM standards s 
  LEFT JOIN evidenceTemplates e ON s.id = e.standardId 
  GROUP BY s.id 
  ORDER BY s.id
`);

console.log('\n📋 توزيع الشواهد على المعايير:');
byStandard.forEach(row => {
  console.log(`المعيار ${row.id}: ${row.title} - ${row.count} شاهد`);
});

// عرض أمثلة من الشواهد
console.log('\n📝 أمثلة من الشواهد:');
const [samples] = await conn.query(`
  SELECT id, evidenceName, standardId 
  FROM evidenceTemplates 
  ORDER BY standardId, id 
  LIMIT 20
`);
samples.forEach(row => {
  console.log(`  [${row.id}] المعيار ${row.standardId}: ${row.evidenceName}`);
});

await conn.end();
