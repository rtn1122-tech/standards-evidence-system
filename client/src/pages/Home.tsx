import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, LogOut, Settings, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: standards, isLoading: standardsLoading } = trpc.standards.list.useQuery();
  const { data: userEvidenceList } = trpc.userEvidence.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: profile } = trpc.teacherProfile.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.reload();
    },
  });

  // حساب التقدم
  const totalEvidence = standards?.length || 0;
  const completedEvidence = userEvidenceList?.filter(e => e.isCompleted).length || 0;
  const progressPercentage = totalEvidence > 0 ? (completedEvidence / totalEvidence) * 100 : 0;

  if (loading || standardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">نظام الأداء المهني للمعلمين</CardTitle>
            <CardDescription>
              نظام متكامل لتوثيق وإدارة معايير الأداء المهني للمعلمين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" size="lg">
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">نظام الأداء المهني للمعلمين</h1>
              <p className="text-sm text-gray-600">مرحباً، {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!profile && (
              <Button asChild variant="outline" size="sm">
                <Link href="/profile-setup">
                  <Settings className="h-4 w-4 ml-2" />
                  إعداد الملف الشخصي
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Card */}
        {profile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>التقدم الإجمالي</CardTitle>
              <CardDescription>
                أكملت {completedEvidence} من {totalEvidence} معيار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-sm text-gray-600 text-center">
                  {progressPercentage.toFixed(0)}% مكتمل
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Setup Warning */}
        {!profile && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">يرجى إكمال الملف الشخصي</CardTitle>
              <CardDescription className="text-yellow-700">
                قبل البدء في توثيق الشواهد، يجب إكمال معلوماتك الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/profile-setup">
                  <Settings className="h-4 w-4 ml-2" />
                  إعداد الملف الشخصي الآن
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Standards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {standards?.map((standard) => {
            const evidenceForStandard = userEvidenceList?.filter(
              (e) => e.standardId === standard.id
            );
            const isCompleted = evidenceForStandard?.some((e) => e.isCompleted);

            return (
              <Card
                key={standard.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <Link href={`/standard/${standard.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                            {standard.orderIndex}
                          </span>
                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <CardTitle className="text-lg">{standard.title}</CardTitle>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {standard.weight}%
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {standard.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      عرض التفاصيل
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
