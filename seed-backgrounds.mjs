import { drizzle } from "drizzle-orm/mysql2";
import { backgrounds } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const backgroundsData = [
  {
    name: "خلفية كلاسيكية",
    description: "خلفية بيضاء بسيطة مع إطار أزرق",
    imageUrl: "/backgrounds/classic.svg",
    thumbnailUrl: "/backgrounds/classic.svg",
    orderIndex: 1,
    isDefault: true,
  },
  {
    name: "خلفية حديثة",
    description: "تصميم عصري بألوان متدرجة",
    imageUrl: "/backgrounds/modern.svg",
    thumbnailUrl: "/backgrounds/modern.svg",
    orderIndex: 2,
    isDefault: false,
  },
  {
    name: "خلفية تعليمية",
    description: "تصميم مناسب للمجال التعليمي",
    imageUrl: "/backgrounds/educational.svg",
    thumbnailUrl: "/backgrounds/educational.svg",
    orderIndex: 3,
    isDefault: false,
  },
  {
    name: "خلفية رسمية",
    description: "تصميم رسمي للوثائق الرسمية",
    imageUrl: "/backgrounds/formal.svg",
    thumbnailUrl: "/backgrounds/formal.svg",
    orderIndex: 4,
    isDefault: false,
  },
];

async function seedBackgrounds() {
  try {
    console.log("🎨 بدء إضافة الخلفيات...");

    for (const bg of backgroundsData) {
      await db.insert(backgrounds).values(bg).onDuplicateKeyUpdate({
        set: {
          name: bg.name,
          description: bg.description,
        },
      });
      console.log(`✓ تمت إضافة: ${bg.name}`);
    }

    console.log("✅ تم إضافة جميع الخلفيات بنجاح!");
    process.exit(0);
  } catch (error) {
    console.error("❌ خطأ:", error);
    process.exit(1);
  }
}

seedBackgrounds();
