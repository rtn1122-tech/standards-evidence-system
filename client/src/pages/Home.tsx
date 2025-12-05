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
              <Button className="w-full">عرض شواهدي</Button>
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
          <Card>
            <CardHeader>
              <CardTitle>النظام قيد التطوير</CardTitle>
              <CardDescription>
                جاري العمل على إكمال الواجهات والميزات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                ✅ قاعدة البيانات: جاهزة<br/>
                ✅ ملف Excel: جاهز<br/>
                ✅ سكريبت الاستيراد: يعمل<br/>
                ⏳ الواجهات: قيد التطوير<br/>
                ⏳ نظام PDF: قيد التطوير
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
