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

  const { data: evidences = [], isLoading: evidencesLoading } = trpc.evidence.listByStandard.useQuery(
    { standardId },
    { enabled: standardId > 0 && !!user }
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

  const completedCount = evidences.filter((e: any) => e.isCompleted).length;
  const totalCount = evidences.length;
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
              <h1 className="text-xl font-bold text-primary">المعيار {standard.orderIndex}</h1>
              <p className="text-sm text-muted-foreground">{standard.title}</p>
            </div>
          </div>
          {user && (
            <Button onClick={() => setLocation(`/evidence/new?standardId=${standardId}`)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة شاهد جديد
            </Button>
          )}
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
        ) : evidencesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الشواهد...</p>
          </div>
        ) : evidences.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">لا توجد شواهد بعد</h3>
              <p className="text-muted-foreground mb-4">ابدأ بإضافة أول شاهد لهذا المعيار</p>
              <Button onClick={() => setLocation(`/evidence/new?standardId=${standardId}`)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة شاهد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {evidences.map((evidence: any) => (
              <Card
                key={evidence.id}
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  evidence.isCompleted ? "border-teal-500 bg-teal-50/50" : ""
                }`}
                onClick={() => setLocation(`/evidence/${evidence.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{evidence.title}</CardTitle>
                    {evidence.isCompleted && (
                      <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">مكتمل</div>
                    )}
                  </div>
                  {evidence.description && (
                    <CardDescription className="line-clamp-2">{evidence.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {evidence.lessonName && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">{evidence.lessonName}</span>
                    )}
                    {evidence.eventDate && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {new Date(evidence.eventDate).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
