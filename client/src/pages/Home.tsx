import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { FileText, LogIn, LogOut, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: standards, isLoading } = trpc.standards.list.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">نظام إدارة المعايير والشواهد</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">مرحباً، {user?.name}</span>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 ml-2" />
                      لوحة التحكم
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 ml-2" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">
                  <LogIn className="h-4 w-4 ml-2" />
                  تسجيل الدخول
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            منصة شاملة لإدارة المعايير والشواهد
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            نظام متكامل يساعدك على تنظيم وإدارة المعايير الـ 11 مع إمكانية ربط كل معيار بشواهد متعددة وملفات داعمة
          </p>
        </div>
      </section>

      {/* Standards Grid */}
      <section className="py-8 px-4 pb-16">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">المعايير</h3>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(11)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : standards && standards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standards.map((standard) => (
                <Link key={standard.id} href={`/standard/${standard.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg">المعيار {standard.orderIndex}</CardTitle>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {standard.orderIndex}
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2">{standard.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {standard.description || "لا يوجد وصف"}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">لا توجد معايير بعد</p>
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <Button>إضافة معيار جديد</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 نظام إدارة المعايير والشواهد. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
