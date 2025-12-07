import { initDb } from '../server/db.ts';
import * as schema from '../drizzle/schema.ts';

async function showStandards() {
  const db = await initDb();
  const standards = await db.select().from(schema.standards);
  
  console.log('=== المعايير في قاعدة البيانات ===\n');
  standards.forEach((std, index) => {
    console.log(`${index + 1}. ${std.title}`);
  });
}

showStandards()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('خطأ:', error);
    process.exit(1);
  });
