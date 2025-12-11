import { drizzle } from "drizzle-orm/mysql2";
import { standards, evidence } from "./drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const standardsData = [
  {
    orderIndex: 1,
    title: "الرؤية والرسالة والقيم",
    description: "وضوح رؤية المؤسسة ورسالتها وقيمها الأساسية وتوافقها مع الأهداف الاستراتيجية",
    createdBy: 1
  },
  {
    orderIndex: 2,
    title: "القيادة والحوكمة",
    description: "فعالية القيادة المؤسسية ووجود أنظمة حوكمة واضحة وشفافة",
    createdBy: 1
  },
  {
    orderIndex: 3,
    title: "التخطيط الاستراتيجي",
    description: "وجود خطة استراتيجية واضحة قابلة للتنفيذ والقياس مع آليات متابعة فعالة",
    createdBy: 1
  },
  {
    orderIndex: 4,
    title: "الموارد البشرية",
    description: "كفاءة إدارة الموارد البشرية وتطوير الكفاءات والمحافظة على بيئة عمل محفزة",
    createdBy: 1
  },
  {
    orderIndex: 5,
    title: "البنية التحتية والموارد",
    description: "توفر البنية التحتية المناسبة والموارد اللازمة لتحقيق الأهداف المؤسسية",
    createdBy: 1
  },
  {
    orderIndex: 6,
    title: "العمليات والإجراءات",
    description: "وضوح العمليات والإجراءات وتوثيقها وتطويرها المستمر لضمان الجودة",
    createdBy: 1
  },
  {
    orderIndex: 7,
    title: "الشراكات والعلاقات الخارجية",
    description: "بناء شراكات فعالة مع الجهات ذات العلاقة وتعزيز العلاقات الخارجية",
    createdBy: 1
  },
  {
    orderIndex: 8,
    title: "الابتكار والتطوير",
    description: "تشجيع ثقافة الابتكار والتطوير المستمر في جميع جوانب العمل المؤسسي",
    createdBy: 1
  },
  {
    orderIndex: 9,
    title: "قياس الأداء والتحسين المستمر",
    description: "وجود نظام فعال لقياس الأداء وآليات للتحسين المستمر بناءً على النتائج",
    createdBy: 1
  },
  {
    orderIndex: 10,
    title: "رضا المستفيدين",
    description: "قياس رضا المستفيدين والاستجابة لاحتياجاتهم وتوقعاتهم بشكل مستمر",
    createdBy: 1
  },
  {
    orderIndex: 11,
    title: "الأثر والاستدامة",
    description: "تحقيق أثر إيجابي ملموس وضمان استدامة المؤسسة على المدى البعيد",
    createdBy: 1
  }
];

const evidenceData = [
  // Evidence for Standard 1
  { standardId: 1, title: "وثيقة الرؤية والرسالة المعتمدة", description: "الوثيقة الرسمية المعتمدة من مجلس الإدارة تتضمن الرؤية والرسالة والقيم", createdBy: 1 },
  { standardId: 1, title: "محاضر اجتماعات مناقشة الرؤية", description: "محاضر الاجتماعات التي تمت فيها مناقشة وإقرار الرؤية والرسالة", createdBy: 1 },
  
  // Evidence for Standard 2
  { standardId: 2, title: "الهيكل التنظيمي المعتمد", description: "الهيكل التنظيمي الواضح والمعتمد يوضح خطوط السلطة والمسؤولية", createdBy: 1 },
  { standardId: 2, title: "لوائح الحوكمة والسياسات", description: "اللوائح والسياسات المنظمة لعمل مجلس الإدارة واللجان", createdBy: 1 },
  
  // Evidence for Standard 3
  { standardId: 3, title: "الخطة الاستراتيجية 2024-2027", description: "الخطة الاستراتيجية المعتمدة للفترة القادمة مع الأهداف والمبادرات", createdBy: 1 },
  { standardId: 3, title: "تقارير متابعة تنفيذ الخطة", description: "التقارير الدورية لمتابعة تنفيذ الخطة الاستراتيجية", createdBy: 1 },
  
  // Evidence for Standard 4
  { standardId: 4, title: "سياسات الموارد البشرية", description: "السياسات المعتمدة للتوظيف والتدريب والتطوير", createdBy: 1 },
  { standardId: 4, title: "خطة التدريب السنوية", description: "الخطة التدريبية السنوية وسجلات التدريب المنفذة", createdBy: 1 },
  
  // Evidence for Standard 5
  { standardId: 5, title: "جرد الأصول والموارد", description: "قائمة بالأصول والموارد المتاحة وحالتها", createdBy: 1 },
  { standardId: 5, title: "خطة الصيانة الدورية", description: "خطة الصيانة الدورية للمرافق والمعدات", createdBy: 1 },
  
  // Evidence for Standard 6
  { standardId: 6, title: "دليل الإجراءات المعتمد", description: "دليل الإجراءات الموثق والمعتمد لجميع العمليات الرئيسية", createdBy: 1 },
  { standardId: 6, title: "سجلات مراجعة الإجراءات", description: "سجلات المراجعة الدورية للإجراءات وتحديثاتها", createdBy: 1 },
  
  // Evidence for Standard 7
  { standardId: 7, title: "اتفاقيات الشراكة", description: "الاتفاقيات الموقعة مع الشركاء الاستراتيجيين", createdBy: 1 },
  { standardId: 7, title: "تقارير الأنشطة المشتركة", description: "تقارير الأنشطة والفعاليات المشتركة مع الشركاء", createdBy: 1 },
  
  // Evidence for Standard 8
  { standardId: 8, title: "سجل المبادرات الابتكارية", description: "قائمة بالمبادرات الابتكارية المنفذة أو قيد التنفيذ", createdBy: 1 },
  { standardId: 8, title: "نتائج مسابقات الابتكار", description: "نتائج ومخرجات مسابقات الابتكار الداخلية", createdBy: 1 },
  
  // Evidence for Standard 9
  { standardId: 9, title: "لوحة مؤشرات الأداء", description: "لوحة مؤشرات الأداء الرئيسية ونتائجها الدورية", createdBy: 1 },
  { standardId: 9, title: "تقارير التحسين المستمر", description: "تقارير مبادرات التحسين المستمر والنتائج المحققة", createdBy: 1 },
  
  // Evidence for Standard 10
  { standardId: 10, title: "نتائج استبيانات الرضا", description: "نتائج استبيانات قياس رضا المستفيدين", createdBy: 1 },
  { standardId: 10, title: "خطة تحسين تجربة المستفيد", description: "الخطة المعتمدة لتحسين تجربة المستفيدين بناءً على الملاحظات", createdBy: 1 },
  
  // Evidence for Standard 11
  { standardId: 11, title: "تقرير الأثر السنوي", description: "التقرير السنوي الذي يوضح الأثر المحقق على المستفيدين والمجتمع", createdBy: 1 },
  { standardId: 11, title: "خطة الاستدامة المالية", description: "الخطة المالية طويلة المدى لضمان استدامة المؤسسة", createdBy: 1 }
];

async function seedData() {
  try {
    console.log("بدء إضافة البيانات الأولية...");
    
    // Insert standards
    console.log("إضافة المعايير...");
    for (const standard of standardsData) {
      await db.insert(standards).values(standard);
    }
    console.log(`تم إضافة ${standardsData.length} معيار`);
    
    // Insert evidence
    console.log("إضافة الشواهد...");
    for (const ev of evidenceData) {
      await db.insert(evidence).values(ev);
    }
    console.log(`تم إضافة ${evidenceData.length} شاهد`);
    
    console.log("✅ تمت إضافة جميع البيانات بنجاح!");
  } catch (error) {
    console.error("❌ حدث خطأ أثناء إضافة البيانات:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedData();
