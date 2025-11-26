import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function dropOldTables() {
  try {
    console.log("حذف الجداول القديمة...");
    await db.execute("DROP TABLE IF EXISTS evidence");
    console.log("✅ تم حذف جدول evidence القديم");
  } catch (error) {
    console.error("❌ خطأ:", error);
  }
  process.exit(0);
}

dropOldTables();
