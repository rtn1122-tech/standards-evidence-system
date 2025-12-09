import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/_core/hooks/useAuth";

export default function StandardDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const standardId = parseInt(params.id || "0");
  const { user } = useAuth();

  // جلب بيانات المعلم
  const { data: profile } = trpc.teacherProfile.get.useQuery(undefined, { enabled: !!user });

  // جلب بيانات المعيار
  const { data: standard, isLoading: loadingStandard } = trpc.standards.get.useQuery({ id: standardId });

  // استخراج المرحلة من الصف الدراسي
  const extractStage = (gradeString: string) => {
    if (!gradeString) return undefined;
    
    // إذا كان يحتوي على "ابتدائي" أو "الابتدائي"
    if (gradeString.includes('ابتدائي')) return 'primary';
    // إذا كان يحتوي على "متوسط" أو "المتوسط"
    if (gradeString.includes('متوسط')) return 'middle';
    // إذا كان يحتوي على "ثانوي" أو "الثانوي"
    if (gradeString.includes('ثانوي')) return 'high';
    
    return undefined;
  };

  // استخراج المرحلة والمادة من بيانات المعلم
  const stageArray = profile?.stage ? (typeof profile.stage === 'string' && profile.stage.startsWith('[') ? JSON.parse(profile.stage) : [profile.stage]) : [];
  const firstGrade = stageArray[0]; // أول صف دراسي
  const stage = firstGrade ? extractStage(firstGrade) : undefined;
  const subjects = profile?.subjects ? JSON.parse(profile.subjects) : [];
  const subject = subjects[0]; // نأخذ أول مادة

  // جلب الشواهد المتاحة للمعيار مع الفلترة حسب المرحلة والمادة
  const { data: templates, isLoading: loadingTemplates } = trpc.evidenceTemplates.list.useQuery({ 
    standardId,
    stage,
    subject
  });

  // جلب تقدم الشواهد
  const { data: progress } = trpc.standards.getProgress.useQuery(
    { standardId },
    { enabled: !!user }
  );

  // جلب الشواهد المحفوظة للمستخدم
  const { data: userEvidences } = trpc.userEvidences.list.useQuery(undefined, { enabled: !!user });

  // التحقق من الشواهد المكتملة
  const completedTemplateIds = new Set(
    userEvidences?.map((e: any) => e.templateId) || []
  );

  if (loadingStandard || loadingTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">المعيار غير موجود</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* زر العودة */}
        <Button
          variant="outline"
          onClick={() => setLocation("/standards")}
          className="mb-4"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          العودة للمعايير
        </Button>

        {/* بطاقة المعيار */}
        <Card className="shadow-xl border-2 border-blue-300">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">{standard.title}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    الوزن النسبي: {standard.weight}%
                  </CardDescription>
                </div>
              </div>
              
              {/* مؤشر التقدم */}
              {progress && (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {progress.completedCount} / {progress.totalCount}
                    </div>
                    <div className="text-sm text-gray-600">شاهد مكتمل</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {progress.percentage}%
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed text-base md:text-lg">
              {standard.description}
            </p>
          </CardContent>
        </Card>

        {/* عنوان الشواهد */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <Sparkles className="ml-2 w-6 h-6 text-yellow-500" />
            الشواهد الجاهزة
            <span className="mr-2 text-base md:text-lg font-normal text-gray-600">
              ({templates?.length || 0} شاهد)
            </span>
          </h2>
        </div>

        {/* قائمة الشواهد */}
        {!templates || templates.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد شواهد متاحة لهذا المعيار حالياً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {templates.map((template: any) => {
              const isCompleted = completedTemplateIds.has(template.id);

              return (
                <Card 
                  key={template.id} 
                  className={`shadow-md hover:shadow-xl transition-all duration-300 group relative ${
                    isCompleted ? 'border-2 border-green-500 bg-green-50' : ''
                  }`}
                >
                  {/* علامة الإكمال */}
                  {isCompleted && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg group-hover:text-blue-600 transition-colors">
                      {template.evidenceName || template.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
                      {template.description || "شاهد جاهز ومعبّأ بالكامل"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* معلومات إضافية */}
                    {template.stage && template.stage !== 'all' && (
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">المرحلة:</span> {template.stage}
                      </div>
                    )}
                    
                    {template.subject && (
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">المادة:</span> {template.subject}
                      </div>
                    )}

                    {/* زر التعبئة */}
                    <Link href={`/evidence/fill/${template.id}`}>
                      <Button 
                        className={`w-full text-base py-6 ${
                          isCompleted 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        {isCompleted ? 'تعديل الشاهد' : 'تعبئة الشاهد'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
