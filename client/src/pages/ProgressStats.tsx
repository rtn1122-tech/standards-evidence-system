import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, TrendingUp, Award, Target, CheckCircle2, Download } from "lucide-react";
import { useState } from "react";

export default function ProgressStats() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: standards, isLoading: loadingStandards } = trpc.standards.list.useQuery();
  const { data: userEvidences, isLoading: loadingEvidences } = trpc.userEvidences.list.useQuery();
  const { data: templates } = trpc.evidenceTemplates.list.useQuery();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  if (loadingStandards || loadingEvidences) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // حساب الإحصائيات
  const totalStandards = standards?.length || 0;
  const totalEvidences = userEvidences?.length || 0;
  const totalTemplates = templates?.length || 0;

  // حساب التقدم لكل معيار
  const standardsProgress = standards?.map((standard: any) => {
    const standardEvidences = userEvidences?.filter(
      (e: any) => e.standardId === standard.id
    ) || [];
    
    const standardTemplates = templates?.filter(
      (t: any) => t.standardId === standard.id
    ) || [];
    
    const completed = standardEvidences.length;
    const total = standardTemplates.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      ...standard,
      completed,
      total,
      percentage,
    };
  }) || [];

  // حساب النسبة الإجمالية
  const totalCompleted = totalEvidences;
  const overallPercentage = totalTemplates > 0 
    ? Math.round((totalCompleted / totalTemplates) * 100) 
    : 0;

  // حساب عدد المعايير المكتملة (100%)
  const completedStandards = standardsProgress.filter((s: any) => s.percentage === 100).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
          
          <Button
            onClick={async () => {
              setIsExporting(true);
              try {
                // TODO: استدعاء API لتوليد PDF
                await new Promise(resolve => setTimeout(resolve, 2000));
                alert("تم تصدير الإحصائيات بنجاح! (ميزة قيد التطوير)");
              } catch (error) {
                alert("حدث خطأ أثناء التصدير");
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="ml-2 h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير كـ PDF"}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">إحصائيات التقدم</h1>
          <p className="text-lg text-gray-600">
            تتبع تقدمك في إكمال الشواهد للمعايير الـ 11
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                التقدم الإجمالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {overallPercentage}%
              </div>
              <p className="text-sm text-gray-600">
                {totalCompleted} من {totalTemplates} شاهد
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                المعايير المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {completedStandards}
              </div>
              <p className="text-sm text-gray-600">
                من {totalStandards} معيار
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                إجمالي الشواهد
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {totalEvidences}
              </div>
              <p className="text-sm text-gray-600">
                شاهد مكتمل
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Standards Progress */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">التقدم حسب المعيار</CardTitle>
            <CardDescription>
              عدد الشواهد المكتملة لكل معيار من المعايير الـ 11
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {standardsProgress.map((standard: any) => (
              <div key={standard.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      المعيار {standard.orderIndex}: {standard.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {standard.completed} من {standard.total} شاهد مكتمل
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-blue-600 min-w-[60px] text-left">
                      {standard.percentage}%
                    </span>
                    {standard.percentage === 100 && (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={standard.percentage} 
                  className="h-3"
                />
                {standard.total === 0 && (
                  <p className="text-xs text-gray-500 italic">
                    لا توجد شواهد متاحة لهذا المعيار حالياً
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Motivational Message */}
        {overallPercentage < 100 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Award className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                استمر في التقدم!
              </h3>
              <p className="text-gray-700 mb-4">
                لديك {totalTemplates - totalCompleted} شاهد متبقي لإكمال جميع المعايير
              </p>
              <Button 
                onClick={() => setLocation("/standards")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                تصفح المعايير والشواهد
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Celebration */}
        {overallPercentage === 100 && (
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300">
            <CardContent className="pt-6 text-center">
              <Award className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 مبروك! أكملت جميع الشواهد!
              </h3>
              <p className="text-gray-700 mb-4">
                لقد أكملت جميع الشواهد المتاحة للمعايير الـ 11. عمل رائع!
              </p>
              <Button 
                onClick={() => setLocation("/my-evidences")}
                className="bg-green-600 hover:bg-green-700"
              >
                عرض جميع شواهدي
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
