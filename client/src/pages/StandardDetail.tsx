import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowRight, FileText, Plus } from "lucide-react";
import { useLocation, useRoute } from "wouter";

export default function StandardDetail() {
  const [, params] = useRoute("/standard/:id");
  const standardId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const { data: standard, isLoading: standardLoading } = trpc.standards.getById.useQuery(
    { id: standardId },
    { enabled: standardId > 0 }
  );

  const { data: subTemplates = [], isLoading: subTemplatesLoading } = trpc.evidenceSubTemplates.listByStandard.useQuery(
    { standardId },
    { enabled: standardId > 0 }
  );

  const { data: userEvidences = [] } = trpc.evidenceDetails.getUserEvidenceDetails.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading || standardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>المعيار غير موجود</CardTitle>
            <CardDescription>لم يتم العثور على المعيار المطلوب</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // حساب التقدم بناءً على الشواهد المكتملة
  const completedSubTemplateIds = new Set(
    userEvidences
      .filter((e: any) => e.evidenceSubTemplateId)
      .map((e: any) => e.evidenceSubTemplateId)
  );
  const completedCount = subTemplates.filter((st: any) => 
    completedSubTemplateIds.has(st.id)
  ).length;
  const totalCount = subTemplates.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setLocation("/")}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground">وزارة التعليم</p>
              <h1 className="text-xl font-bold text-primary">المعيار {standard.orderIndex}</h1>
              <p className="text-sm text-muted-foreground">{standard.title}</p>
            </div>
          </div>

        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* معلومات المعيار */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{standard.title}</CardTitle>
                <CardDescription className="text-base">{standard.description}</CardDescription>
              </div>
              <div className="text-center bg-primary/10 rounded-lg p-4 min-w-[100px]">
                <div className="text-3xl font-bold text-primary">{standard.weight}%</div>
                <div className="text-xs text-muted-foreground mt-1">الوزن</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* عداد التقدم */}
        {user && (
          <Card className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">التقدم في الشواهد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl font-bold text-primary">{progress}%</div>
                  <div className="text-xs text-muted-foreground">
                    {completedCount} من {totalCount}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* قائمة الشواهد */}
        {!user ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">يرجى تسجيل الدخول</h3>
              <p className="text-muted-foreground mb-4">لعرض وإضافة الشواهد، يرجى تسجيل الدخول أولاً</p>
              <Button onClick={() => (window.location.href = "/api/oauth/login")}>تسجيل الدخول</Button>
            </CardContent>
          </Card>
        ) : subTemplatesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الشواهد...</p>
          </div>
        ) : subTemplates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد شواهد فرعية بعد</h3>
              <p className="text-muted-foreground mb-4">اختر شاهد فرعي من القائمة أدناه لإضافته</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {subTemplates.map((subTemplate: any) => {
              const isCompleted = completedSubTemplateIds.has(subTemplate.id);
              const userEvidence = userEvidences.find(
                (e: any) => e.evidenceSubTemplateId === subTemplate.id
              );
              
              return (
                <Card
                  key={subTemplate.id}
                  className={`cursor-pointer hover:shadow-lg transition-all ${
                    isCompleted ? "border-teal-500 bg-teal-50/50" : ""
                  }`}
                  onClick={() => {
                    if (userEvidence) {
                      setLocation(`/evidence/sub-preview/${userEvidence.id}`);
                    } else {
                      setLocation(`/evidence/sub-form/${subTemplate.id}`);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{subTemplate.title}</CardTitle>
                      {isCompleted && (
                        <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">مكتمل</div>
                      )}
                    </div>
                    {subTemplate.description && (
                      <CardDescription className="line-clamp-2">{subTemplate.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {isCompleted ? (
                        <span className="text-teal-600 font-medium">✓ تم إكمال الشاهد</span>
                      ) : (
                        <span>اضغط لإضافة الشاهد</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
