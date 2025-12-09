import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Check, FileText, Download, QrCode, Shield, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: FileText,
      title: "نماذج جاهزة",
      description: "11 معيار مهني مع شواهد جاهزة للتعبئة"
    },
    {
      icon: Download,
      title: "تحميل PDF",
      description: "توليد ملف PDF احترافي بثيم وزارة التعليم"
    },
    {
      icon: QrCode,
      title: "باركود للتحقق",
      description: "QR Code لكل شاهد للتحقق من الصحة"
    },
    {
      icon: Shield,
      title: "حفظ آمن",
      description: "جميع بياناتك محفوظة بشكل آمن"
    },
    {
      icon: Zap,
      title: "سهل الاستخدام",
      description: "واجهة بسيطة وسهلة للمعلمين"
    },
    {
      icon: Check,
      title: "تحديثات مجانية",
      description: "جميع التحديثات المستقبلية مجاناً"
    }
  ];

  const standards = [
    "أداء الواجبات الوظيفية المنوطة",
    "التفاعل مع المجتمع المهني داخل المدرسة وخارجها",
    "التفاعل مع أولياء الأمور بفاعلية",
    "إدارة الصف",
    "التخطيط للتدريس",
    "استراتيجيات التدريس",
    "تقويم تعلم الطلاب",
    "بناء بيئة صفية داعمة",
    "التطوير المهني",
    "الالتزام بأخلاقيات المهنة",
    "التمكن من المعارف والمهارات"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">وزارة التعليم</p>
              <h1 className="text-xl font-bold">نظام الأداء المهني للمعلمين</h1>
            </div>
          </div>
          <Button onClick={() => window.location.href = getLoginUrl()}>
            تسجيل الدخول
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <Badge className="mb-4" variant="outline">
          نظام إدارة المعايير والشواهد المهنية
        </Badge>
        <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
          ملف الأداء المهني
          <br />
          بكل سهولة واحترافية
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          نظام متكامل لإدارة المعايير المهنية وتوثيق الشواهد مع إمكانية توليد ملف PDF احترافي بثيم وزارة التعليم
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
            ابدأ الآن مجاناً
          </Button>
          <Button size="lg" variant="outline" onClick={() => setLocation("/about")}>
            تعرف على النظام
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container py-16 bg-accent/30">
        <h3 className="text-3xl font-bold text-center mb-12">مميزات النظام</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Standards */}
      <section className="container py-16">
        <h3 className="text-3xl font-bold text-center mb-12">المعايير المهنية (11 معيار)</h3>
        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {standards.map((standard, index) => (
            <div key={index} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {index + 1}
              </div>
              <p className="font-medium">{standard}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center bg-primary/5">
        <h3 className="text-3xl font-bold mb-4">جاهز للبدء؟</h3>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          سجل الآن واحصل على رابط ثابت لحسابك. جميع التحديثات المستقبلية ستظهر تلقائياً دون الحاجة لرابط جديد.
        </p>
        <Button size="lg" onClick={() => window.location.href = getLoginUrl()}>
          ابدأ الآن
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 نظام الأداء المهني للمعلمين - وزارة التعليم</p>
        </div>
      </footer>
    </div>
  );
}
