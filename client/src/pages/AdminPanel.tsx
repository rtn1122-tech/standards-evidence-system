import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Users, Database, Download, Search, Shield } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // جلب قائمة المستخدمين
  const { data: users, isLoading } = trpc.admin.listUsers.useQuery();

  // التحقق من صلاحيات Admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-red-600" />
              <CardTitle className="text-2xl">غير مصرح</CardTitle>
            </div>
            <CardDescription>
              هذه الصفحة متاحة للمشرفين فقط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // فلترة المستخدمين حسب البحث
  const filteredUsers = users?.filter((u: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(query) ||
      (u.email || "").toLowerCase().includes(query) ||
      (u.teacherName || "").toLowerCase().includes(query) ||
      (u.schoolName || "").toLowerCase().includes(query)
    );
  });

  // دالة إنشاء نسخة احتياطية
  const createBackupMutation = trpc.admin.createBackup.useMutation();

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result = await createBackupMutation.mutateAsync();
      if (result.success) {
        alert(`✅ تم إنشاء النسخة الاحتياطية بنجاح!\n\nالملف: ${result.filename}\nالحجم: ${((result.size || 0) / 1024 / 1024).toFixed(2)} MB`);
      } else {
        alert(`❌ فشل إنشاء النسخة الاحتياطية\n\nالخطأ: ${result.error}`);
      }
    } catch (error: any) {
      alert(`❌ حدث خطأ: ${error.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
          <p className="text-gray-600">إدارة المستخدمين والنسخ الاحتياطي</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                إجمالي المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{users?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                النسخ الاحتياطي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isCreatingBackup ? "جاري الإنشاء..." : "إنشاء نسخة احتياطية"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-orange-600" />
                تصدير البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => alert("ميزة قيد التطوير")}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                تصدير CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* قائمة المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              قائمة المستخدمين
            </CardTitle>
            <CardDescription>
              عرض وإدارة جميع المعلمين المسجلين في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* شريط البحث */}
            <div className="flex items-center gap-3 mb-6">
              <Search className="h-5 w-5 text-gray-600" />
              <Input
                type="text"
                placeholder="ابحث عن مستخدم (الاسم، البريد، المدرسة)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                  مسح
                </Button>
              )}
            </div>

            {/* الجدول */}
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الاسم</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">البريد</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المدرسة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">إدارة التعليم</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">رقم الرخصة</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{u.teacherName || u.name || "غير محدد"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{u.email || "غير محدد"}</td>
                        <td className="px-4 py-3 text-sm">{u.schoolName || "غير محدد"}</td>
                        <td className="px-4 py-3 text-sm">{u.educationDepartment || "غير محدد"}</td>
                        <td className="px-4 py-3 text-sm">{u.licenseNumber || "غير محدد"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(u.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert(`عرض إحصائيات المستخدم ${u.id}`)}
                          >
                            عرض الإحصائيات
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمون"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
