import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { User, Save, X, ArrowLeft, BookOpen, FileText, Sparkles, Printer, Palette, TrendingUp, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { user } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // جلب بيانات الملف الشخصي
  const { data: profile } = trpc.teacherProfile.get.useQuery(undefined, {
    enabled: !!user,
  });

  // حساب عدد المعايير المرتبطة بالمادة والمرحلة
  const { data: standardsCount } = trpc.standards.countBySubjectAndStage.useQuery(
    {
      subject: profile?.subjects ? JSON.parse(profile.subjects)[0] : undefined,
      stage: profile?.stage ? JSON.parse(profile.stage)[0] : undefined,
    },
    {
      enabled: !!user && !!profile,
    }
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">نظام إدارة المعايير والشواهد</CardTitle>
            <CardDescription className="text-lg">
              نظام متكامل لإدارة شواهد المعلمين
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              سجّل دخولك للبدء في إنشاء وإدارة شواهدك
            </p>
            <Button 
              onClick={() => window.location.href = getLoginUrl()} 
              className="w-full"
              size="lg"
            >
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProfileComplete = profile && profile.teacherName && profile.schoolName;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* بطاقة البيانات الشخصية - أعلى الصفحة (مستطيلة عرضية) */}
        <Card className="shadow-xl border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">مرحباً {user.name}</CardTitle>
                  <CardDescription className="text-base">
                    {isProfileComplete ? (
                      <span className="text-green-600 font-medium">✓ الملف الشخصي مكتمل</span>
                    ) : (
                      <span className="text-orange-600 font-medium">⚠ يرجى إكمال الملف الشخصي</span>
                    )}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!isProfileComplete && (
                  <Button 
                    onClick={() => window.location.href = "/profile-setup"}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <User className="ml-2 w-4 h-4" />
                    إكمال البيانات
                  </Button>
                )}
                {isProfileComplete && (
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = "/profile-setup"}
                  >
                    تعديل البيانات
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          {profile && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">الاسم</p>
                  <p className="font-medium">{profile.teacherName || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-gray-500">المدرسة</p>
                  <p className="font-medium">{profile.schoolName || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-gray-500">إدارة التعليم</p>
                  <p className="font-medium">{profile.educationDepartment || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-gray-500">رقم الرخصة</p>
                  <p className="font-medium">{profile.professionalLicenseNumber || "غير محدد"}</p>
                </div>
              </div>
              
              {/* أزرار الإجراءات */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                <Button 
                  onClick={() => window.location.href = "/profile-setup"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="ml-2 w-4 h-4" />
                  حفظ التعديلات
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = "/"}
                >
                  <X className="ml-2 w-4 h-4" />
                  إلغاء
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 mr-auto"
                  onClick={() => window.location.href = "/standards"}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  الانتقال للمعايير
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* العنوان الرئيسي */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">سير العمل الأساسي</h2>
          <p className="text-gray-600">ابدأ من هنا لإنشاء ملف شواهدك الكامل</p>
        </div>

        {/* المعايير + شواهدي (بجانب بعض - كبيرة) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-2xl transition-all duration-300 border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 cursor-pointer group"
                onClick={() => window.location.href = "/standards"}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-white" />
                    {standardsCount && standardsCount.count > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-2 py-1 rounded-full shadow-lg"
                      >
                        {standardsCount.count}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">
                      1️⃣ المعايير
                    </CardTitle>
                    <CardDescription className="text-base">
                      {standardsCount && standardsCount.count > 0 
                        ? `${standardsCount.count} معيار مرتبط بمادتك`
                        : "عرض جميع المعايير الـ 11"
                      }
                    </CardDescription>
                  </div>
                </div>
                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                تصفح المعايير المهنية واختر الشواهد المناسبة لك
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                <BookOpen className="ml-2 w-5 h-5" />
                عرض المعايير
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-2xl transition-all duration-300 border-4 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer group"
                onClick={() => window.location.href = "/my-evidences"}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl group-hover:text-green-600 transition-colors">
                      2️⃣ شواهدي
                    </CardTitle>
                    <CardDescription className="text-base">
                      عرض وإدارة شواهدك
                    </CardDescription>
                  </div>
                </div>
                <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                راجع شواهدك المكتملة وحمّلها كملف PDF
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                <FileText className="ml-2 w-5 h-5" />
                عرض شواهدي
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* لوحة الإدارة - للمشرفين فقط */}
        {user.role === "admin" && (
          <Card className="hover:shadow-lg transition-shadow border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 cursor-pointer"
                onClick={() => window.location.href = "/admin"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">🛡️ لوحة الإدارة</CardTitle>
                    <CardDescription>إدارة المستخدمين والنسخ الاحتياطي</CardDescription>
                  </div>
                </div>
                <Button className="bg-red-600 hover:bg-red-700">
                  فتح لوحة الإدارة
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* إحصائيات التقدم */}
        <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 cursor-pointer"
              onClick={() => window.location.href = "/progress"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">📊 إحصائيات التقدم</CardTitle>
                  <CardDescription>تتبع تقدمك في إكمال الشواهد</CardDescription>
                </div>
              </div>
              <Button className="bg-purple-600 hover:bg-purple-700">
                عرض الإحصائيات
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* الخدمات الإضافية - أصغر في الأسفل */}
        <div className="pt-6 border-t-2 border-gray-300">
          <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">خدمات إضافية</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-lg transition-shadow border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  خدمة التعبئة المخصصة
                </CardTitle>
                <CardDescription className="text-sm">ارفع صورك ونحن نملأ الشواهد</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full bg-orange-600 hover:bg-orange-700" 
                  onClick={() => window.location.href = "/request-custom-service"}
                >
                  طلب الخدمة
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Printer className="w-5 h-5 text-green-600" />
                  طباعة احترافية
                </CardTitle>
                <CardDescription className="text-sm">اطبع ملفك بجودة عالية</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  onClick={() => window.location.href = "/request-print"}
                >
                  طلب طباعة
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  إنشاء شاهد خاص
                </CardTitle>
                <CardDescription className="text-sm">أنشئ شاهد مخصص حسب احتياجاتك</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  size="sm" 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  onClick={() => window.location.href = "/create-custom-evidence"}
                >
                  إنشاء شاهد
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* معلومات إضافية */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">💡 نصيحة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              <strong>للحصول على ملف شواهد كامل:</strong> ابدأ بإكمال بياناتك الشخصية أعلاه، ثم انتقل للمعايير واختر الشواهد المناسبة، وأخيراً راجع شواهدك وحمّلها كملف PDF واحد.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
