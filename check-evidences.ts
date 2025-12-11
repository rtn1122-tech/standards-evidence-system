import { db } from './server/db';
import { evidenceTemplates, standards } from './drizzle/schema';
import { eq, count } from 'drizzle-orm';

async function main() {
  console.log('📊 فحص الشواهد في قاعدة البيانات...\n');

  // عدد الشواهد الكلي
  const total = await db.select({ count: count() }).from(evidenceTemplates);
  console.log(`📝 إجمالي الشواهد: ${total[0].count}`);

  // عدد الشواهد لكل معيار
  const allStandards = await db.select().from(standards);
  
  console.log('\n📋 توزيع الشواهد حسب المعيار:\n');
  
  for (const standard of allStandards) {
    const evidences = await db
      .select({ count: count() })
      .from(evidenceTemplates)
      .where(eq(evidenceTemplates.standardId, standard.id));
    
    console.log(`${standard.id}. ${standard.title}: ${evidences[0].count} شواهد`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
