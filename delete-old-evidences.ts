import { db } from './server/db';
import { evidenceTemplates } from './drizzle/schema';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🗑️  حذف الشواهد القديمة...\n');

  const result = await db.delete(evidenceTemplates).where(sql`1=1`);
  
  console.log(`✅ تم حذف جميع الشواهد القديمة`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
