import { storagePut } from '../server/storage.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadSharedImages() {
  console.log('🚀 بدء رفع الصور المشتركة إلى S3...\n');

  const images = [
    { file: 'teacher-classroom.jpg', name: 'معلم في فصل دراسي' },
    { file: 'teacher-teaching.jpg', name: 'معلم يشرح الدرس' },
    { file: 'teacher-students.jpg', name: 'معلم مع الطلاب' },
    { file: 'students-learning.jpg', name: 'طلاب يتعلمون' },
    { file: 'school-gate.jpg', name: 'بوابة المدرسة' }
  ];

  const uploadedUrls = [];

  for (const img of images) {
    const filePath = path.join(__dirname, '..', 'shared-images', img.file);
    const buffer = fs.readFileSync(filePath);
    
    const { url } = await storagePut(
      `shared-evidence-images/${img.file}`,
      buffer,
      'image/jpeg'
    );

    uploadedUrls.push({ name: img.name, url });
    console.log(`✅ ${img.name}: ${url}`);
  }

  console.log('\n📋 جميع الروابط:');
  console.log(JSON.stringify(uploadedUrls, null, 2));

  return uploadedUrls;
}

uploadSharedImages()
  .then(() => {
    console.log('\n✅ تم رفع جميع الصور بنجاح!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ خطأ:', err);
    process.exit(1);
  });
