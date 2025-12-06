import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq } from "drizzle-orm";
import * as schema from "../drizzle/schema.ts";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

const standards = [
  { id: 1, title: "أداء الواجبات الوظيفية" },
  { id: 2, title: "التفاعل مع المجتمع المهني" },
  { id: 3, title: "التفاعل مع أولياء الأمور" },
  { id: 4, title: "التنوع في استراتيجيات التدريس" },
  { id: 5, title: "تحسين نتائج المتعلمين" },
  { id: 6, title: "إعداد وتنفيذ خطة التعلم" },
  { id: 7, title: "توظيف تقنيات ووسائل التعلم" },
  { id: 8, title: "تهيئة بيئة تعليمية" },
  { id: 9, title: "الإدارة الصفية" },
  { id: 10, title: "تحليل نتائج المتعلمين" },
  { id: 11, title: "تنوع أساليب التقويم" },
];

console.log("🔄 بدء تحديث المعايير...\n");

for (const standard of standards) {
  try {
    await db
      .update(schema.standards)
      .set({ title: standard.title })
      .where(eq(schema.standards.id, standard.id));
    
    console.log(`✅ المعيار ${standard.id}: ${standard.title}`);
  } catch (error) {
    console.error(`❌ خطأ في المعيار ${standard.id}:`, error.message);
  }
}

console.log("\n✅ تم تحديث جميع المعايير بنجاح!");

await connection.end();
process.exit(0);
