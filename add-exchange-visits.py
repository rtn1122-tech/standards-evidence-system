#!/usr/bin/env python3
import sqlite3
import json
import random
import re

# الاتصال بقاعدة البيانات
db_path = "/home/ubuntu/standards-evidence-system/.data/sqlite.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# الصور الافتراضية
default_images = [
    "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-1.jpg",
    "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-2.jpg",
    "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-3.jpg",
    "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-4.jpg",
    "https://manus-file-storage.s3.us-west-1.amazonaws.com/standards-evidence-system/default-evidence-5.jpg"
]

# الحصول على المعيار الثاني
cursor.execute("SELECT id FROM standards WHERE orderIndex = 2")
standard = cursor.fetchone()
if not standard:
    print("❌ المعيار الثاني غير موجود!")
    exit(1)

standard_id = standard[0]
print(f"✅ المعيار الثاني: ID = {standard_id}")

# دالة لاستخراج المادة والصف من النص
def extract_subject_grade(text):
    # استخراج المادة والصف من السطر الأول
    match = re.match(r'^\d+\)\s*(.+?)\s*–\s*الصف\s+(.+?)\s*–', text)
    if match:
        subject = match.group(1).strip()
        grade = match.group(2).strip()
        
        # تحديد المرحلة
        if 'متوسط' in grade:
            stage = 'متوسط'
        elif 'ابتدائي' in grade:
            stage = 'ابتدائي'
        elif 'ثانوي' in grade:
            stage = 'ثانوي'
        else:
            stage = 'متوسط'
        
        # تنسيق الصف
        if 'الأول' in grade:
            grade_formatted = 'الأول المتوسط'
        elif 'الثاني' in grade:
            grade_formatted = 'الثاني المتوسط'
        elif 'الثالث' in grade:
            grade_formatted = 'الثالث المتوسط'
        else:
            grade_formatted = grade
        
        return subject, grade_formatted, stage
    return None, None, None

# قراءة الملفات الثلاثة
files = [
    '/home/ubuntu/upload/pasted_content_2.txt',
    '/home/ubuntu/upload/pasted_content_3.txt',
    '/home/ubuntu/upload/pasted_content_4.txt'
]

all_evidences = []

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # تقسيم المحتوى إلى شواهد منفصلة
    # كل شاهد يبدأ برقم متبوع بقوس
    parts = re.split(r'\n(?=\d+\))', content)
    
    for part in parts:
        if not part.strip():
            continue
        
        lines = part.strip().split('\n')
        if len(lines) < 10:
            continue
        
        # استخراج المادة والصف
        subject, grade, stage = extract_subject_grade(lines[0])
        if not subject or not grade:
            continue
        
        # استخراج الأقسام الستة
        sections = {}
        current_section = None
        current_content = []
        
        for line in lines[1:]:
            line = line.strip()
            if not line:
                continue
            
            # التحقق من عناوين الأقسام
            if line in ['المقدمة', 'الأهداف', 'الإجراءات المنفذة', 'الإجراءات', 'النتائج', 'التوصيات والملاحظات', 'التوصيات', 'الخاتمة']:
                if current_section and current_content:
                    sections[current_section] = ' '.join(current_content)
                current_section = line
                current_content = []
            else:
                if current_section:
                    current_content.append(line)
        
        # حفظ القسم الأخير
        if current_section and current_content:
            sections[current_section] = ' '.join(current_content)
        
        # التأكد من وجود جميع الأقسام
        if 'المقدمة' not in sections:
            continue
        
        # إنشاء الشاهد
        evidence = {
            'title': f'الزيارات التبادلية بين المعلمين - {subject} - {grade}',
            'subject': subject,
            'grade': grade,
            'stage': stage,
            'description': sections.get('المقدمة', '')[:200],
            'box1_content': sections.get('المقدمة', ''),
            'box2_content': sections.get('الأهداف', ''),
            'box3_content': sections.get('الإجراءات المنفذة', sections.get('الإجراءات', '')),
            'box4_content': sections.get('النتائج', ''),
            'box5_content': sections.get('التوصيات والملاحظات', sections.get('التوصيات', '')),
            'box6_content': sections.get('الخاتمة', '')
        }
        
        all_evidences.append(evidence)

print(f"\n📊 تم استخراج {len(all_evidences)} شاهد من الملفات")

# إضافة الشواهد إلى قاعدة البيانات
added_count = 0
skipped_count = 0

for evidence in all_evidences:
    # التحقق من التكرار
    cursor.execute("SELECT id FROM evidences WHERE title = ?", (evidence['title'],))
    existing = cursor.fetchone()
    
    if existing:
        print(f"⏭️  تخطي شاهد مكرر: {evidence['title']}")
        skipped_count += 1
        continue
    
    # اختيار صورتين عشوائيتين
    image1 = random.choice(default_images)
    image2 = random.choice(default_images)
    
    try:
        cursor.execute("""
            INSERT INTO evidences (
                standardId, title, description,
                field1Title, field2Title, field3Title, field4Title, field5Title, field6Title, field7Title, field8Title,
                box1Title, box1Content, box2Title, box2Content, box3Title, box3Content,
                box4Title, box4Content, box5Title, box5Content, box6Title, box6Content,
                image1Url, image2Url,
                applicableSubjects, applicableGrades, applicableStages
            ) VALUES (
                ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?,
                ?, ?, ?
            )
        """, (
            standard_id,
            evidence['title'],
            evidence['description'],
            'التاريخ', 'موضوع الدرس', 'الصف', 'المعلم الزائر', 'المعلم المزار', 'مدة التنفيذ', 'الاستراتيجية', '',
            'المقدمة', evidence['box1_content'],
            'الأهداف', evidence['box2_content'],
            'الإجراءات المنفذة', evidence['box3_content'],
            'النتائج', evidence['box4_content'],
            'التوصيات والملاحظات', evidence['box5_content'],
            'الخاتمة', evidence['box6_content'],
            image1, image2,
            json.dumps([evidence['subject']], ensure_ascii=False),
            json.dumps([evidence['grade']], ensure_ascii=False),
            json.dumps([evidence['stage']], ensure_ascii=False)
        ))
        
        print(f"✅ تمت إضافة: {evidence['title']}")
        added_count += 1
    except Exception as e:
        print(f"❌ خطأ في إضافة {evidence['title']}: {str(e)}")

conn.commit()
conn.close()

print("\n" + "="*60)
print(f"📊 النتيجة النهائية:")
print(f"   ✅ تمت إضافة: {added_count} شاهد")
print(f"   ⏭️  تم تخطي: {skipped_count} شاهد مكرر")
print("="*60)
