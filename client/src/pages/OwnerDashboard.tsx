import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Crown, Sparkles, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [ownerNotes, setOwnerNotes] = useState("");
  
  const { data: customEvidences, isLoading } = trpc.customEvidences.listAll.useQuery();
  const utils = trpc.useUtils();
  
  const makePublicMutation = trpc.customEvidences.makePublic.useMutation({
    onSuccess: () => {
      utils.customEvidences.listAll.invalidate();
      setSelectedEvidence(null);
      setOwnerNotes("");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  // TODO: إضافة فحص للمالك (user.role === 'admin')

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  const privateEvidences = customEvidences?.filter((e: any) => !e.isPublic) || [];
  const publicEvidences = customEvidences?.filter((e: any) => e.isPublic) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8" dir="rtl">
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
          <div className="flex items-center justify-center gap-3 mb-2">
            <Crown className="h-10 w-10 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">لوحة تحكم المالك</h1>
          </div>
          <p className="text-xl text-gray-600">
            مراجعة ونشر الشواهد الخاصة
          </p>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي الشواهد</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-600">{customEvidences?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>شواهد خاصة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-orange-600">{privateEvidences.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>شواهد منشورة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-600">{publicEvidences.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* الشواهد الخاصة (للمراجعة) */}
        {privateEvidences.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">شواهد خاصة (للمراجعة)</h2>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {privateEvidences.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {privateEvidences.map((evidence: any) => (
                <Card key={evidence.id} className="border-2 border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{evidence.evidenceName}</CardTitle>
                        <CardDescription className="mt-1">
                          المعلم: {evidence.userName || 'غير محدد'}
                        </CardDescription>
                      </div>
                      <Badge className="bg-gray-100 text-gray-800">خاص</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">الوصف:</p>
                        <p className="text-sm text-gray-600">{evidence.description}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-700">الصفوف:</p>
                        <p className="text-sm text-gray-600">{JSON.parse(evidence.grades).join(', ')}</p>
                      </div>
                      
                      {evidence.subject && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">المادة:</p>
                          <p className="text-sm text-gray-600">{evidence.subject}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-semibold text-gray-700">تاريخ الإنشاء:</p>
                        <p className="text-sm text-gray-600">
                          {new Date(evidence.createdAt).toLocaleString('ar-SA')}
                        </p>
                      </div>

                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => setSelectedEvidence(evidence)}
                      >
                        <CheckCircle className="ml-2 h-4 w-4" />
                        نشر للجميع
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* الشواهد المنشورة */}
        {publicEvidences.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">شواهد منشورة</h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {publicEvidences.length}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publicEvidences.map((evidence: any) => (
                <Card key={evidence.id} className="border-2 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">{evidence.evidenceName}</CardTitle>
                    <CardDescription>
                      المعلم: {evidence.userName || 'غير محدد'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ منشور للجميع
                    </Badge>
                    {evidence.ownerNotes && (
                      <div className="mt-3">
                        <p className="text-sm font-semibold text-gray-700">ملاحظات:</p>
                        <p className="text-sm text-gray-600">{evidence.ownerNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* رسالة فارغة */}
        {customEvidences?.length === 0 && (
          <Card className="text-center p-12">
            <CardContent>
              <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد شواهد خاصة بعد</h3>
              <p className="text-gray-600">
                عندما ينشئ المعلمون شواهد خاصة، ستظهر هنا للمراجعة
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* مودال النشر */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>نشر الشاهد للجميع</CardTitle>
              <CardDescription>
                سيصبح الشاهد متاحاً لجميع المعلمين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-semibold text-lg mb-2">{selectedEvidence.evidenceName}</p>
                <p className="text-sm text-gray-600">{selectedEvidence.description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerNotes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="ownerNotes"
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول هذا الشاهد..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    makePublicMutation.mutate({
                      id: selectedEvidence.id,
                      ownerNotes: ownerNotes || undefined,
                    });
                  }}
                  disabled={makePublicMutation.isPending}
                >
                  {makePublicMutation.isPending ? "جاري النشر..." : "نشر للجميع"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedEvidence(null);
                    setOwnerNotes("");
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
