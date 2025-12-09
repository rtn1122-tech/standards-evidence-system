import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await connection.execute(
  'SELECT id, title, defaultImage1Url, defaultImage2Url FROM evidenceSubTemplates WHERE id IN (101, 102, 103, 104, 105) LIMIT 5'
);

console.log(JSON.stringify(result[0], null, 2));

await connection.end();
