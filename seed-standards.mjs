import { drizzle } from "drizzle-orm/mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const officialStandards = [
  {
    orderIndex: 1,
    title: "أداء الواجبات الوظيفية",
    description: "التزام المعلم بأداء واجباته الوظيفية بدقة ومسؤولية",
    weight: 10
  },
  {
    orderIndex: 2,
    title: "التفاعل مع المجتمع المدرسي",
    description: "التعاون والتفاعل الإيجابي مع الزملاء والإدارة المدرسية",
    weight: 10
  },
  {
    orderIndex: 3,
    title: "التفاعل مع أولياء الأمور",
    description: "بناء علاقات إيجابية مع أولياء الأمور والتواصل الفعال معهم",
    weight: 10
  },
  {
    orderIndex: 4,
    title: "التنويع في استراتيجيات التدريس",
    description: "استخدام استراتيجيات تدريس متنوعة تناسب احتياجات المتعلمين",
    weight: 10
  },
  {
    orderIndex: 5,
    title: "تحسين نتائج المتعلمين",
    description: "العمل على رفع مستوى تحصيل الطلاب وتحسين نتائجهم التعليمية",
    weight: 10
  },
  {
    orderIndex: 6,
    title: "إعداد وتنفيذ خطة التعلم",
    description: "التخطيط الجيد للدروس وتنفيذها بفاعلية",
    weight: 10
  },
  {
    orderIndex: 7,
    title: "توظيف تقنيات ووسائل التعلم المناسبة",
    description: "استخدام التقنية والوسائل التعليمية بشكل فعال",
    weight: 10
  },
  {
    orderIndex: 8,
    title: "تهيئة بيئة تعليمية",
    description: "خلق بيئة تعليمية محفزة وآمنة للطلاب",
    weight: 5
  },
  {
    orderIndex: 9,
    title: "الإدارة الصفية",
    description: "إدارة الصف بكفاءة وفاعلية",
    weight: 5
  },
  {
    orderIndex: 10,
    title: "تحليل نتائج المتعلمين وتشخيص مستوياتهم",
    description: "تحليل نتائج الطلاب وتشخيص احتياجاتهم التعليمية",
    weight: 10
  },
  {
    orderIndex: 11,
    title: "تنوع أساليب التقويم",
    description: "استخدام أساليب تقويم متنوعة وملائمة",
    weight: 10
  }
];

async function seedStandards() {
  try {
    console.log("🌱 بدء إدخال المعايير الرسمية...");
    
    // حذف المعايير القديمة
    await db.execute("DELETE FROM standards");
    console.log("✅ تم حذف المعايير القديمة");
    
    // إدخال المعايير الجديدة
    for (const standard of officialStandards) {
      await db.execute(
        `INSERT INTO standards (title, description, orderIndex, weight) VALUES ('${standard.title}', '${standard.description}', ${standard.orderIndex}, ${standard.weight})`
      );
      console.log(`✅ تم إضافة: ${standard.title}`);
    }
    
    console.log("\n🎉 تم إدخال جميع المعايير الـ 11 بنجاح!");
    
  } catch (error) {
    console.error("❌ خطأ:", error);
  }
  
  process.exit(0);
}

seedStandards();
