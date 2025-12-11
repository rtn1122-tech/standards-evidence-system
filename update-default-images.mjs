import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq } from 'drizzle-orm';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// الصور الافتراضية (5 صور مشتركة)
const defaultImages = [
  "https://storage.googleapis.com/standards-evidence-system/default-images/teacher-classroom-1.jpg",
  "https://storage.googleapis.com/standards-evidence-system/default-images/school-gate-1.jpg"
];

// تحديث جميع الشواهد الـ 11
const evidenceIds = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111];

for (const id of evidenceIds) {
  await connection.execute(
    `UPDATE evidenceSubTemplates 
     SET defaultImage1Url = ?, defaultImage2Url = ? 
     WHERE id = ?`,
    [defaultImages[0], defaultImages[1], id]
  );
  console.log(`✅ Updated evidence ${id} with default images`);
}

console.log('\n✅ All 11 evidences updated with default images!');

await connection.end();
