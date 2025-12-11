import { db } from './server/db.ts';
import { evidences } from './drizzle/schema.ts';
import { sql } from 'drizzle-orm';

console.log('🧹 تنظيف الفواصل المنقوطة من الشواهد...\n');

try {
  // Get all evidences
  const allEvidences = await db.select().from(evidences);
  
  console.log(`📊 عدد الشواهد الكلي: ${allEvidences.length}`);
  
  let updatedCount = 0;
  
  for (const evidence of allEvidences) {
    let needsUpdate = false;
    const updates = {};
    
    // Check and clean each box content
    const boxFields = ['box1Content', 'box2Content', 'box3Content', 'box4Content', 'box5Content', 'box6Content'];
    
    for (const field of boxFields) {
      const content = evidence[field];
      if (content && content.includes(';')) {
        updates[field] = content.replace(/;/g, '');
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      await db.update(evidences)
        .set(updates)
        .where(sql`id = ${evidence.id}`);
      
      updatedCount++;
      console.log(`✅ تم تحديث الشاهد #${evidence.id}: ${evidence.title}`);
    }
  }
  
  console.log(`\n🎉 تم الانتهاء! تم تحديث ${updatedCount} شاهد`);
  
  process.exit(0);
} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
}
