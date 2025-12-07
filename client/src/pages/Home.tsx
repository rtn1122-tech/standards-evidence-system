import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            مرحباً {user.name}
          </h1>
          <p className="text-xl text-gray-600">
            نظام إدارة المعايير والشواهد
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* خدمات مميزة */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎨</span>
                خدمة التعبئة المخصصة
              </CardTitle>
              <CardDescription>ارفع صورك ونحن نملأ الشواهد لك</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => window.location.href = "/request-custom-service"}>
                طلب الخدمة
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🖨️</span>
                طباعة احترافية
              </CardTitle>
              <CardDescription>اطبع ملفك بجودة عالية واستلمه في منزلك</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => window.location.href = "/request-print"}>
                طلب طباعة
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                إنشاء شاهد خاص
              </CardTitle>
              <CardDescription>أنشئ شاهد مخصص حسب احتياجاتك</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = "/create-custom-evidence"}>
                إنشاء شاهد
              </Button>
            </CardContent>
          </Card>
          
          {/* الخدمات الأساسية */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>المعايير</CardTitle>
              <CardDescription>عرض جميع المعايير الـ 11</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">عرض المعايير</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>شواهدي</CardTitle>
              <CardDescription>عرض الشواهد التي أنشأتها</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = "/my-evidences"}>عرض شواهدي</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>الملف الشخصي</CardTitle>
              <CardDescription>تحديث بياناتك الشخصية</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = "/profile-setup"}>
                تحديث الملف
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle>✨ ميزات جديدة!</CardTitle>
              <CardDescription>
                تم إضافة خدمات مميزة لتسهيل عملك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-purple-600 mb-2">🎨 خدمة التعبئة المخصصة</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ ارفع صورك دفعة واحدة</li>
                    <li>✅ نحن نفرز ونملأ الشواهد</li>
                    <li>✅ استلم شواهد جاهزة 100%</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="font-bold text-green-600 mb-2">🖨️ طباعة احترافية</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✅ 3 أنواع ورق (عادي/فاخر/VIP)</li>
                    <li>✅ 3 أنواع تجليد</li>
                    <li>✅ شحن مجاني لجميع المناطق</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
