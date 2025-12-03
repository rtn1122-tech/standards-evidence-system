import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, FileText, Calendar, User, Users, Award } from "lucide-react";

export default function VerifyEvidence() {
  const params = useParams();
  const evidenceId = parseInt(params.id || "0");

  const { data: evidence, isLoading } = trpc.evidenceDetails.getForVerification.useQuery(
    { id: evidenceId },
    { enabled: evidenceId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">التحقق من الشاهد</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">الشاهد غير موجود</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              لم يتم العثور على الشاهد المطلوب. تأكد من صحة الرابط أو QR Code.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dynamicFields = JSON.parse(evidence.dynamicFields || "{}");

  return (
    <div className="min-h-screen flex flex-col bg-accent/10">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">وزارة التعليم</p>
              <h1 className="text-xl font-bold">التحقق من الشاهد</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Verification Badge */}
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900 dark:text-green-100">
                    شاهد موثّق ومعتمد
                  </h2>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    هذا الشاهد تم توثيقه في نظام الأداء المهني للمعلمين
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  معلومات الشاهد
                </CardTitle>
                <Badge>#{evidence.id}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    المعيار
                  </p>
                  <p className="font-medium">{evidence.standardTitle || "غير محدد"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    عنوان الشاهد
                  </p>
                  <p className="font-medium">{evidence.subTemplateTitle || "غير محدد"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ التوثيق
                  </p>
                  <p className="font-medium">
                    {evidence.createdAt ? new Date(evidence.createdAt).toLocaleDateString('ar-SA') : "غير محدد"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    المعلم
                  </p>
                  <p className="font-medium">{evidence.teacherName || "غير محدد"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Fields */}
          {dynamicFields && Object.keys(dynamicFields).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>البيانات الأساسية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {dynamicFields.executor && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" />
                        المنفذ
                      </p>
                      <p className="font-medium">{dynamicFields.executor}</p>
                    </div>
                  )}
                  {dynamicFields.contributors && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        ساهم في التنفيذ
                      </p>
                      <p className="font-medium">{dynamicFields.contributors}</p>
                    </div>
                  )}
                  {dynamicFields.beneficiaries && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        المستفيدون
                      </p>
                      <p className="font-medium">{dynamicFields.beneficiaries}</p>
                    </div>
                  )}
                  {dynamicFields.date && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        التاريخ
                      </p>
                      <p className="font-medium">{dynamicFields.date}</p>
                    </div>
                  )}
                  {dynamicFields.semester && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">الفصل الدراسي</p>
                      <p className="font-medium">{dynamicFields.semester}</p>
                    </div>
                  )}
                  {dynamicFields.class && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">الصف</p>
                      <p className="font-medium">{dynamicFields.class}</p>
                    </div>
                  )}
                  {dynamicFields.subject && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">المادة</p>
                      <p className="font-medium">{dynamicFields.subject}</p>
                    </div>
                  )}
                  {dynamicFields.lesson && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">الدرس</p>
                      <p className="font-medium">{dynamicFields.lesson}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Sections */}
          <Card>
            <CardHeader>
              <CardTitle>محتوى الشاهد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {evidence.section1 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم الأول</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section1}</p>
                </div>
              )}
              {evidence.section2 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم الثاني</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section2}</p>
                </div>
              )}
              {evidence.section3 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم الثالث</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section3}</p>
                </div>
              )}
              {evidence.section4 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم الرابع</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section4}</p>
                </div>
              )}
              {evidence.section5 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم الخامس</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section5}</p>
                </div>
              )}
              {evidence.section6 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-primary">القسم السادس</h3>
                  <p className="text-sm whitespace-pre-wrap">{evidence.section6}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {(evidence.image1 || evidence.image2) && (
            <Card>
              <CardHeader>
                <CardTitle>الصور المرفقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {evidence.image1 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">الصورة الأولى</p>
                      <img
                        src={evidence.image1}
                        alt="الصورة الأولى"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {evidence.image2 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">الصورة الثانية</p>
                      <img
                        src={evidence.image2}
                        alt="الصورة الثانية"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
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
