import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";
import { ArrowRight, Target, Users, BookOpen, Award } from "lucide-react";

export default function About() {
  const [, setLocation] = useLocation();

  const faqs = [
    {
      question: "ما هو نظام الأداء المهني للمعلمين؟",
      answer: "نظام متكامل لإدارة المعايير المهنية وتوثيق الشواهد مع إمكانية توليد ملف PDF احترافي بثيم وزارة التعليم. يساعد المعلمين على توثيق أدائهم المهني بطريقة منظمة واحترافية."
    },
    {
      question: "كم عدد المعايير المتوفرة؟",
      answer: "النظام يحتوي على 11 معيار مهني حسب معايير وزارة التعليم، كل معيار يحتوي على شاهد واحد جاهز للتعبئة (سيتم إضافة المزيد من الشواهد لاحقاً)."
    },
    {
      question: "هل أحتاج لرابط جديد عند إضافة شواهد جديدة؟",
      answer: "لا، الرابط ثابت ويعمل للأبد. جميع التحديثات والشواهد الجديدة ستظهر تلقائياً في حسابك دون الحاجة لرابط جديد."
    },
    {
      question: "كيف أقوم بتحميل ملف PDF؟",
      answer: "بعد تعبئة الشاهد، اضغط على زر 'حفظ' ثم 'تحميل ملف PDF'. سيتم توليد ملف PDF احترافي (9 صفحات) بثيم وزارة التعليم مع QR Code للتحقق."
    },
    {
      question: "هل بياناتي آمنة؟",
      answer: "نعم، جميع بياناتك محفوظة بشكل آمن في قاعدة البيانات ولا يمكن الوصول إليها إلا من خلال حسابك الشخصي."
    },
    {
      question: "هل يمكنني تعديل الشواهد بعد حفظها؟",
      answer: "نعم، يمكنك تعديل أو حذف أي شاهد من صفحة 'شواهدي' في أي وقت."
    }
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
              <h1 className="text-xl font-bold">عن النظام</h1>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowRight className="h-4 w-4 ml-1" />
            العودة
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* نظرة عامة */}
          <section className="text-center">
            <h2 className="text-4xl font-bold mb-4">نظام الأداء المهني للمعلمين</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نظام متكامل لإدارة المعايير المهنية وتوثيق الشواهد بطريقة احترافية ومنظمة
            </p>
          </section>

          {/* الأهداف */}
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              أهداف النظام
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    توثيق الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    توثيق الأداء المهني للمعلمين بطريقة منظمة ومهنية حسب معايير وزارة التعليم
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    سهولة الاستخدام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    واجهة بسيطة وسهلة الاستخدام تمكن المعلمين من إضافة وتعديل الشواهد بكل سهولة
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    ملف احترافي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    توليد ملف PDF احترافي (9 صفحات) بثيم وزارة التعليم مع QR Code للتحقق
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    متابعة التقدم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    لوحة تحكم شاملة لمتابعة التقدم في كل معيار ونسبة الإنجاز الإجمالية
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* كيفية الاستخدام */}
          <section>
            <h3 className="text-2xl font-bold mb-6">كيفية الاستخدام</h3>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">تسجيل الدخول</h4>
                  <p className="text-sm text-muted-foreground">
                    سجل دخول باستخدام حساب Manus الخاص بك
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">إعداد الملف الشخصي</h4>
                  <p className="text-sm text-muted-foreground">
                    أدخل بياناتك الأساسية (الاسم، المدرسة، المرحلة، التخصص، إلخ)
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">اختيار المعيار والشاهد</h4>
                  <p className="text-sm text-muted-foreground">
                    من الصفحة الرئيسية، اختر المعيار المطلوب ثم اضغط على الشاهد الفرعي
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold mb-1">تعبئة الشاهد</h4>
                  <p className="text-sm text-muted-foreground">
                    املأ الحقول المطلوبة (المنفذ، المستفيدون، إلخ) وعدّل المحتوى النصي حسب الحاجة
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 border rounded-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  5
                </div>
                <div>
                  <h4 className="font-semibold mb-1">حفظ وتحميل PDF</h4>
                  <p className="text-sm text-muted-foreground">
                    اضغط على 'حفظ' ثم 'تحميل ملف PDF' للحصول على ملف احترافي جاهز للطباعة
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* الأسئلة الشائعة */}
          <section>
            <h3 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h3>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-right">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="text-center p-8 bg-accent/30 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">جاهز للبدء؟</h3>
            <p className="text-muted-foreground mb-6">
              ابدأ الآن في توثيق أدائك المهني بطريقة احترافية
            </p>
            <Button size="lg" onClick={() => setLocation("/")}>
              الذهاب للصفحة الرئيسية
            </Button>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 نظام الأداء المهني للمعلمين - وزارة التعليم</p>
        </div>
      </footer>
    </div>
  );
}
