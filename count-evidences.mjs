import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [rows] = await connection.execute(`
    SELECT 
      s.id, 
      s.title, 
      COUNT(et.id) as evidence_count 
    FROM standards s 
    LEFT JOIN evidenceTemplates et ON s.id = et.standardId 
    GROUP BY s.id, s.title 
    ORDER BY s.orderIndex
  `);
  
  console.log('\n📊 عدد الشواهد لكل معيار:\n');
  console.log('المعيار | عدد الشواهد');
  console.log('------- | -----------');
  
  let total = 0;
  rows.forEach(row => {
    console.log(`${row.title} | ${row.evidence_count}`);
    total += row.evidence_count;
  });
  
  console.log('\n✅ المجموع الكلي:', total, 'شاهد');
  
} catch (error) {
  console.error('خطأ:', error);
} finally {
  await connection.end();
}
