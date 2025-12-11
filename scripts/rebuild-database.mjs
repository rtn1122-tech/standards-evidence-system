import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('🗑️  بدء إعادة بناء قاعدة البيانات...\n');

try {
  // 1. حذف الجداول القديمة
  console.log('1. حذف الجداول القديمة...');
  await connection.execute('DROP TABLE IF EXISTS evidenceDetails');
  await connection.execute('DROP TABLE IF EXISTS evidenceSubTemplates');
  await connection.execute('DROP TABLE IF EXISTS userEvidence');
  await connection.execute('DROP TABLE IF EXISTS backgrounds');
  console.log('   ✅ تم حذف 4 جداول قديمة\n');

  // 2. تعديل جدول evidenceTemplates (حذف الأعمدة القديمة)
  console.log('2. تعديل جدول evidenceTemplates...');
  
  // حذف الأعمدة القديمة
  const oldColumns = ['title', 'description', 'evidenceType', 'applicableSubjects', 'applicableStages', 'hasSubEvidence', 'orderIndex'];
  for (const col of oldColumns) {
    try {
      await connection.execute(`ALTER TABLE evidenceTemplates DROP COLUMN ${col}`);
    } catch (e) {
      // العمود غير موجود - تجاهل
    }
  }
  
  // إضافة الأعمدة الجديدة واحداً تلو الآخر
  const newColumns = [
    "ADD COLUMN standardCode VARCHAR(50) NOT NULL DEFAULT '' AFTER standardId",
    "ADD COLUMN standardName VARCHAR(255) NOT NULL DEFAULT '' AFTER standardCode",
    "ADD COLUMN evidenceName VARCHAR(255) NOT NULL DEFAULT '' AFTER standardName",
    "ADD COLUMN subEvidenceName VARCHAR(255) AFTER evidenceName",
    "ADD COLUMN description TEXT NOT NULL AFTER subEvidenceName",
    "ADD COLUMN defaultImageUrl TEXT AFTER description",
    "ADD COLUMN page2Boxes TEXT NOT NULL AFTER defaultImageUrl",
    "ADD COLUMN userFields TEXT NOT NULL AFTER page2Boxes",
    "ADD COLUMN subject VARCHAR(100) AFTER userFields",
    "ADD COLUMN stage ENUM('primary', 'middle', 'high', 'all') DEFAULT 'all' NOT NULL AFTER subject",
    "ADD COLUMN isActive BOOLEAN DEFAULT TRUE NOT NULL AFTER stage",
    "ADD COLUMN usageCount INT DEFAULT 0 NOT NULL AFTER isActive"
  ];
  
  for (const colDef of newColumns) {
    try {
      await connection.execute(`ALTER TABLE evidenceTemplates ${colDef}`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.log(`   ⚠️  ${e.message}`);
      }
    }
  }
  console.log('   ✅ تم تعديل evidenceTemplates\n');

  // 3. إنشاء جدول userEvidences
  console.log('3. إنشاء جدول userEvidences...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS userEvidences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      templateId INT NOT NULL,
      userData TEXT NOT NULL,
      customImageUrl TEXT,
      themeId INT,
      coverThemeId INT,
      pdfUrl TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log('   ✅ تم إنشاء userEvidences\n');

  // 4. إنشاء جدول themes
  console.log('4. إنشاء جدول themes...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS themes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type ENUM('full', 'cover') NOT NULL,
      previewImageUrl TEXT,
      templateFileUrl TEXT,
      isActive BOOLEAN DEFAULT TRUE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )
  `);
  console.log('   ✅ تم إنشاء themes\n');

  // 5. إنشاء جدول activationCodes
  console.log('5. إنشاء جدول activationCodes...');
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS activationCodes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      sallaOrderId VARCHAR(100),
      isUsed BOOLEAN DEFAULT FALSE NOT NULL,
      usedByUserId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      usedAt TIMESTAMP
    )
  `);
  console.log('   ✅ تم إنشاء activationCodes\n');

  // 6. تحديث جدول users
  console.log('6. تحديث جدول users...');
  
  const userColumns = [
    "ADD COLUMN phone VARCHAR(20) AFTER email",
    "ADD COLUMN gender ENUM('male', 'female') AFTER phone",
    "ADD COLUMN activationCode VARCHAR(50) AFTER role",
    "ADD COLUMN subscriptionStart DATE AFTER activationCode",
    "ADD COLUMN subscriptionEnd DATE AFTER subscriptionStart",
    "ADD COLUMN isActive BOOLEAN DEFAULT TRUE NOT NULL AFTER subscriptionEnd"
  ];
  
  for (const colDef of userColumns) {
    try {
      await connection.execute(`ALTER TABLE users ${colDef}`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.log(`   ⚠️  ${e.message}`);
      }
    }
  }
  
  // إضافة UNIQUE indexes بعد إضافة الأعمدة
  try {
    await connection.execute('CREATE UNIQUE INDEX idx_users_phone ON users(phone)');
  } catch (e) {
    // Index already exists
  }
  
  try {
    await connection.execute('CREATE UNIQUE INDEX idx_users_activation_code ON users(activationCode)');
  } catch (e) {
    // Index already exists
  }
  
  console.log('   ✅ تم تحديث users\n');

  console.log('✅ اكتملت إعادة بناء قاعدة البيانات بنجاح!');

} catch (error) {
  console.error('❌ خطأ:', error.message);
  throw error;
} finally {
  await connection.end();
}
