import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function StandardDetail() {
  const params = useParams<{ id: string }>();
  const standardId = parseInt(params.id || "0");
  
  // جلب بيانات المستخدم
  const { data: user } = trpc.auth.me.useQuery();

  // جلب بيانات المعيار
  const { data: standard, isLoading: loadingStandard } = trpc.standards.get.useQuery({ id: standardId });

  // جلب الشواهد المتاحة للمعيار
  const { data: templates, isLoading: loadingTemplates } = trpc.evidenceTemplates.list.useQuery({ standardId });

  // جلب تقدم الشواهد (فقط للمستخدمين المسجلين)
  const { data: progress } = trpc.standards.getProgress.useQuery(
    { standardId },
    { enabled: !!user } // تفعيل فقط إذا كان المستخدم مسجل
  );

  // Skeleton Loading بدلاً من شاشة التحميل الكاملة
  if (loadingStandard || loadingTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* معلومات المعيار Skeleton */}
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <Skeleton className="h-8 w-3/4 bg-blue-400" />
              <Skeleton className="h-4 w-32 mt-2 bg-blue-400" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* عنوان الشواهد Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>

          {/* قائمة الشواهد Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">المعيار غير موجود</p>
          <Link href="/standards">
            <Button>
              <ArrowRight className="ml-2 w-4 h-4" />
              العودة للمعايير
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المملكة العربية السعودية</p>
              <h1 className="text-xl font-bold text-gray-800">وزارة التعليم</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* مؤشر التقدم */}
              {user && progress && (
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <div className="text-sm">
                    <span className="font-bold text-blue-900">{progress.completedCount}</span>
                    <span className="text-gray-600"> من </span>
                    <span className="font-bold text-blue-900">{progress.totalCount}</span>
                    <span className="text-gray-600"> شاهد</span>
                  </div>
                  <div className="text-xs text-blue-600 font-semibold">
                    {progress.percentage}%
                  </div>
                </div>
              )}
              <Link href="/standards">
                <Button variant="outline" size="sm">
                  <ArrowRight className="ml-2 w-4 h-4" />
                  العودة للمعايير
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* معلومات المعيار */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  المعيار {standard.id}: {standard.title}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  الوزن النسبي: {standard.weight}%
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed text-lg">
              {standard.description}
            </p>
          </CardContent>
        </Card>

        {/* قائمة الشواهد المتاحة */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <FileText className="ml-2 w-6 h-6 text-blue-600" />
            الشواهد المتاحة ({templates?.length || 0})
          </h2>
        </div>

        {!templates || templates.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد شواهد متاحة لهذا المعيار حالياً</p>
              <p className="text-gray-400 text-sm mt-2">سيتم إضافة المزيد من الشواهد قريباً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => (
              <Card key={template.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 group">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {template.description || "لا يوجد وصف"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {template.grades && (
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(template.grades as string).map((grade: string, idx: number) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {grade}
                          </span>
                        ))}
                      </div>
                    )}
                    {template.subject && (
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">المادة:</span> {template.subject}
                      </div>
                    )}
                  </div>
                  <Link href={`/evidence/fill/${template.id}`}>
                    <Button className="w-full group-hover:bg-blue-700 transition-colors">
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      ابدأ التعبئة
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
