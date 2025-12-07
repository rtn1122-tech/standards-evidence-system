import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, FileText, Sparkles, Trash2 } from "lucide-react";

export default function MyEvidences() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // الشواهد العادية
  const { data: userEvidences, isLoading: loadingUser } = trpc.userEvidences.list.useQuery();
  
  // الشواهد الخاصة
  const { data: customEvidences, isLoading: loadingCustom } = trpc.customEvidences.list.useQuery();
  
  const utils = trpc.useUtils();
  
  const deleteMutation = trpc.userEvidences.delete.useMutation({
    onSuccess: () => {
      utils.userEvidences.list.invalidate();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  if (loadingUser || loadingCustom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const totalCount = (userEvidences?.length || 0) + (customEvidences?.length || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للرئيسية
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">شواهدي</h1>
          <p className="text-xl text-gray-600">
            لديك {totalCount} شاهد ({userEvidences?.length || 0} عادي + {customEvidences?.length || 0} خاص)
          </p>
        </div>

        {/* الشواهد الخاصة */}
        {customEvidences && customEvidences.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">الشواهد الخاصة</h2>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {customEvidences.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customEvidences.map((evidence: any) => (
                <Card key={evidence.id} className="hover:shadow-lg transition-shadow border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{evidence.evidenceName}</CardTitle>
                        <CardDescription className="mt-1">
                          {evidence.description.substring(0, 100)}...
                        </CardDescription>
                      </div>
                      <Sparkles className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>الصفوف:</strong> {JSON.parse(evidence.grades).join(', ')}</p>
                      {evidence.subject && <p><strong>المادة:</strong> {evidence.subject}</p>}
                      {evidence.isPublic && (
                        <Badge className="bg-green-100 text-green-800">
                          ✅ منشور للجميع
                        </Badge>
                      )}
                      {!evidence.isPublic && (
                        <Badge className="bg-gray-100 text-gray-800">
                          🔒 خاص بك
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={() => setLocation(`/evidence/${evidence.id}`)}
                      >
                        عرض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* الشواهد العادية */}
        {userEvidences && userEvidences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">الشواهد العادية</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {userEvidences.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userEvidences.map((evidence: any) => (
                <Card key={evidence.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{evidence.title || 'شاهد'}</CardTitle>
                    <CardDescription>
                      تم الإنشاء: {new Date(evidence.createdAt).toLocaleDateString('ar-SA')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setLocation(`/evidence/${evidence.id}`)}
                      >
                        عرض
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا الشاهد؟')) {
                            deleteMutation.mutate({ id: evidence.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* رسالة فارغة */}
        {totalCount === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد شواهد بعد</h3>
              <p className="text-gray-600 mb-6">
                ابدأ بإنشاء شاهد جديد أو شاهد خاص
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation("/")}>
                  تصفح المعايير
                </Button>
                <Button 
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  onClick={() => setLocation("/create-custom-evidence")}
                >
                  <Sparkles className="ml-2 h-4 w-4" />
                  إنشاء شاهد خاص
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
