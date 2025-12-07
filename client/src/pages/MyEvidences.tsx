import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, FileText, Sparkles, Trash2, Download, Filter, Search, Edit } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function MyEvidences() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filterStandard, setFilterStandard] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  
  // الشواهد العادية
  const { data: userEvidences, isLoading: loadingUser } = trpc.userEvidences.list.useQuery();
  
  // الشواهد الخاصة
  const { data: customEvidences, isLoading: loadingCustom } = trpc.customEvidences.list.useQuery();
  
  // المعايير للفلترة
  const { data: standards } = trpc.standards.list.useQuery();
  
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

  // فلترة الشواهد حسب المعيار والبحث
  let filteredUserEvidences = filterStandard === "all" 
    ? userEvidences 
    : userEvidences?.filter((e: any) => e.standardId?.toString() === filterStandard);
  
  // تطبيق البحث
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredUserEvidences = filteredUserEvidences?.filter((e: any) => {
      const title = (e.title || '').toLowerCase();
      const description = (e.description || '').toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }

  const totalCount = (filteredUserEvidences?.length || 0) + (customEvidences?.length || 0);

  // دالة تحميل جميع الشواهد PDF
  const handleDownloadAllPDF = async () => {
    if (!userEvidences || userEvidences.length === 0) {
      alert("لا توجد شواهد لتحميلها");
      return;
    }

    setIsGeneratingPDF(true);
    setPdfProgress(0);

    try {
      // محاكاة التقدم (في الواقع يجب استدعاء API)
      const interval = setInterval(() => {
        setPdfProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // TODO: استدعاء API لتوليد PDF لجميع الشواهد
      // const result = await trpc.userEvidences.generateAllPDF.mutate();
      
      // محاكاة التحميل (استبدل هذا باستدعاء حقيقي)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(interval);
      setPdfProgress(100);
      
      // TODO: تحميل الملف
      alert("تم توليد PDF بنجاح! (ميزة قيد التطوير)");
      
      setTimeout(() => {
        setIsGeneratingPDF(false);
        setPdfProgress(0);
      }, 1000);
    } catch (error) {
      console.error("خطأ في توليد PDF:", error);
      alert("حدث خطأ أثناء توليد PDF");
      setIsGeneratingPDF(false);
      setPdfProgress(0);
    }
  };

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

          {userEvidences && userEvidences.length > 0 && (
            <Button
              onClick={handleDownloadAllPDF}
              disabled={isGeneratingPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="ml-2 h-4 w-4" />
              {isGeneratingPDF ? "جاري التوليد..." : "تحميل PDF لجميع الشواهد"}
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        {isGeneratingPDF && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-900">جاري توليد ملف PDF...</span>
                  <span className="text-green-700">{pdfProgress}%</span>
                </div>
                <Progress value={pdfProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Title & Stats */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">شواهدي</h1>
          <p className="text-xl text-gray-600">
            لديك {totalCount} شاهد ({filteredUserEvidences?.length || 0} عادي + {customEvidences?.length || 0} خاص)
          </p>
        </div>

        {/* Search & Filter */}
        {userEvidences && userEvidences.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Bar */}
                <div className="flex items-center gap-3">
                  <Search className="h-5 w-5 text-gray-600" />
                  <Input
                    type="text"
                    placeholder="ابحث في الشواهد (الاسم، الوصف، المعيار)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                    >
                      مسح
                    </Button>
                  )}
                </div>
                
                {/* Filter */}
                <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">فلترة حسب المعيار:</label>
                <Select value={filterStandard} onValueChange={setFilterStandard}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="جميع المعايير" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع المعايير</SelectItem>
                    {standards?.map((standard: any) => (
                      <SelectItem key={standard.id} value={standard.id.toString()}>
                        المعيار {standard.orderIndex}: {standard.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filterStandard !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterStandard("all")}
                  >
                    إعادة تعيين
                  </Button>
                )}
              </div>
              </div>
            </CardContent>
          </Card>
        )}

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
        {filteredUserEvidences && filteredUserEvidences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">الشواهد العادية</h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredUserEvidences.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUserEvidences.map((evidence: any) => (
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
                      {/* زر تحميل PDF */}
                      {evidence.pdfUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(evidence.pdfUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* زر تعديل */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLocation(`/evidence/edit/${evidence.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {/* زر حذف */}
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

        {/* رسالة عند عدم وجود نتائج بعد الفلترة */}
        {filterStandard !== "all" && filteredUserEvidences?.length === 0 && userEvidences && userEvidences.length > 0 && (
          <Card className="text-center p-12 mt-6">
            <CardContent>
              <Filter className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد شواهد لهذا المعيار</h3>
              <p className="text-gray-600 mb-6">
                جرب اختيار معيار آخر أو إعادة تعيين الفلتر
              </p>
              <Button onClick={() => setFilterStandard("all")}>
                عرض جميع الشواهد
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
