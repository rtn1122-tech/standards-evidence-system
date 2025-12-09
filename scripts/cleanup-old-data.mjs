import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🗑️  بدء حذف البيانات القديمة...\n');

// حذف جميع الشواهد المحفوظة
console.log('1. حذف جميع الشواهد المحفوظة من evidenceDetails...');
await connection.execute('DELETE FROM evidenceDetails');
const [rows1] = await connection.execute('SELECT COUNT(*) as count FROM evidenceDetails');
console.log(`   ✅ تم الحذف - المتبقي: ${rows1[0].count} شاهد\n`);

// حذف جميع القوالب القديمة
console.log('2. حذف جميع القوالب من evidenceSubTemplates...');
await connection.execute('DELETE FROM evidenceSubTemplates');
const [rows2] = await connection.execute('SELECT COUNT(*) as count FROM evidenceSubTemplates');
console.log(`   ✅ تم الحذف - المتبقي: ${rows2[0].count} قالب\n`);

console.log('✅ اكتمل حذف البيانات القديمة!');

await connection.end();
