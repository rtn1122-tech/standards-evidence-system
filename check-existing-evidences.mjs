import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// جلب جميع الشواهد الموجودة
const [evidences] = await connection.execute(`
  SELECT id, standardCode, evidenceName, subEvidenceName 
  FROM evidenceTemplates 
  ORDER BY standardCode, id
`);

console.log(`\n📊 إجمالي الشواهد الموجودة: ${evidences.length}\n`);

// تجميع حسب المعيار
const byStandard = {};
evidences.forEach(ev => {
  if (!byStandard[ev.standardCode]) {
    byStandard[ev.standardCode] = [];
  }
  byStandard[ev.standardCode].push({
    id: ev.id,
    name: ev.evidenceName,
    subName: ev.subEvidenceName
  });
});

// عرض الإحصائيات
Object.keys(byStandard).sort().forEach(code => {
  console.log(`\n${code}: ${byStandard[code].length} شاهد`);
  byStandard[code].forEach((ev, idx) => {
    console.log(`  ${idx + 1}. [${ev.id}] ${ev.name}${ev.subName ? ' - ' + ev.subName : ''}`);
  });
});

await connection.end();
