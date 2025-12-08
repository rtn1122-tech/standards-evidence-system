import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileText, Loader2 } from "lucide-react";

export default function StandardDetail() {
  const params = useParams<{ id: string }>();
  const standardId = parseInt(params.id || "0");

  // جلب بيانات المعيار
  const { data: standard, isLoading: loadingStandard } = trpc.standards.get.useQuery({ id: standardId });

  // جلب الشواهد المتاحة للمعيار
  const { data: templates, isLoading: loadingTemplates } = trpc.evidenceTemplates.list.useQuery({ standardId });

  if (loadingStandard || loadingTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
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
            <Link href="/standards">
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 w-4 h-4" />
                العودة للمعايير
              </Button>
            </Link>
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
