import { exec } from "child_process";
import { promisify } from "util";
import { storagePut } from "./storage.js";
import { notifyOwner } from "./_core/notification.js";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

interface BackupResult {
  success: boolean;
  filename?: string;
  url?: string;
  size?: number;
  error?: string;
}

/**
 * إنشاء نسخة احتياطية من قاعدة البيانات
 */
export async function createDatabaseBackup(): Promise<BackupResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.sql`;
  const tempPath = `/tmp/${filename}`;

  try {
    console.log("[Backup] Starting database backup...");

    // استخراج معلومات الاتصال من DATABASE_URL
    const dbUrl = process.env.DATABASE_URL!;
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      throw new Error("Invalid DATABASE_URL format");
    }

    const [, username, password, host, port, database] = urlMatch;

    // إنشاء النسخة الاحتياطية باستخدام mysqldump
    const command = `mysqldump -h ${host} -P ${port} -u ${username} -p${password} ${database} > ${tempPath}`;
    
    await execAsync(command);

    // قراءة الملف
    const backupData = fs.readFileSync(tempPath);
    const fileSize = backupData.length;

    console.log(`[Backup] Backup file created: ${filename} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // رفع الملف إلى S3
    const s3Key = `backups/${filename}`;
    const { url } = await storagePut(s3Key, backupData, "application/sql");

    console.log(`[Backup] Backup uploaded to S3: ${url}`);

    // حذف الملف المؤقت
    fs.unlinkSync(tempPath);

    // إرسال إشعار للمالك
    await notifyOwner({
      title: "✅ تم إنشاء نسخة احتياطية بنجاح",
      content: `تم إنشاء نسخة احتياطية من قاعدة البيانات بنجاح.\n\nالملف: ${filename}\nالحجم: ${(fileSize / 1024 / 1024).toFixed(2)} MB\nالتاريخ: ${new Date().toLocaleString("ar-SA")}`,
    });

    return {
      success: true,
      filename,
      url,
      size: fileSize,
    };
  } catch (error: any) {
    console.error("[Backup] Failed to create backup:", error);

    // إرسال إشعار بالفشل للمالك
    await notifyOwner({
      title: "❌ فشل إنشاء النسخة الاحتياطية",
      content: `حدث خطأ أثناء إنشاء النسخة الاحتياطية من قاعدة البيانات.\n\nالخطأ: ${error.message}\nالتاريخ: ${new Date().toLocaleString("ar-SA")}`,
    });

    // حذف الملف المؤقت إذا كان موجوداً
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * حذف النسخ الاحتياطية القديمة (الاحتفاظ بآخر 30 نسخة فقط)
 */
export async function cleanupOldBackups(): Promise<void> {
  try {
    console.log("[Backup] Cleanup old backups not implemented yet (requires S3 list functionality)");
    // TODO: تنفيذ حذف النسخ القديمة عند توفر دالة list من S3
  } catch (error) {
    console.error("[Backup] Failed to cleanup old backups:", error);
  }
}

/**
 * تشغيل النسخ الاحتياطي اليومي
 */
export async function runDailyBackup(): Promise<void> {
  console.log("[Backup] Running daily backup...");
  
  const result = await createDatabaseBackup();
  
  if (result.success) {
    console.log("[Backup] Daily backup completed successfully");
    await cleanupOldBackups();
  } else {
    console.error("[Backup] Daily backup failed");
  }
}

// إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  runDailyBackup()
    .then(() => {
      console.log("[Backup] Backup script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Backup] Backup script failed:", error);
      process.exit(1);
    });
}
