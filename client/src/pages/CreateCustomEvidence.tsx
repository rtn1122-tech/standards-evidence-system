import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";
import { STAGES } from "../../../shared/constants";

export default function CreateCustomEvidence() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: standards } = trpc.standards.list.useQuery();

  const [formData, setFormData] = useState({
    standardId: 0,
    evidenceName: "",
    description: "",
    grades: [] as string[],
    subject: "",
  });

  const createMutation = trpc.customEvidences.create.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  const handleGradeToggle = (grade: string) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade];
    setFormData({ ...formData, grades: newGrades });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.standardId || !formData.evidenceName || !formData.description || formData.grades.length === 0) {
      alert("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>يرجى تسجيل الدخول أولاً</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة للرئيسية
        </Button>

        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8" />
              <div>
                <CardTitle className="text-3xl">إنشاء شاهد خاص</CardTitle>
                <CardDescription className="text-purple-100">
                  أنشئ شاهد مخصص حسب احتياجاتك - سيتم مراجعته من قبل المالك
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* المعيار */}
              <div className="space-y-2">
                <Label htmlFor="standardId">المعيار *</Label>
                <Select
                  value={formData.standardId.toString()}
                  onValueChange={(value) => setFormData({ ...formData, standardId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المعيار" />
                  </SelectTrigger>
                  <SelectContent>
                    {standards?.map((standard: any) => (
                      <SelectItem key={standard.id} value={standard.id.toString()}>
                        {standard.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* اسم الشاهد */}
              <div className="space-y-2">
                <Label htmlFor="evidenceName">اسم الشاهد *</Label>
                <Input
                  id="evidenceName"
                  value={formData.evidenceName}
                  onChange={(e) => setFormData({ ...formData, evidenceName: e.target.value })}
                  required
                  placeholder="مثال: ورشة عمل تطوير المهارات"
                />
              </div>

              {/* الوصف */}
              <div className="space-y-2">
                <Label htmlFor="description">الوصف *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="اكتب وصفاً تفصيلياً للشاهد..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {/* الصفوف الدراسية */}
              <div className="space-y-2">
                <Label>الصفوف الدراسية المناسبة * (اختر صف أو أكثر)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                  {STAGES.map((grade) => (
                    <div key={grade} className="flex items-center gap-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={formData.grades.includes(grade)}
                        onCheckedChange={() => handleGradeToggle(grade)}
                      />
                      <Label htmlFor={`grade-${grade}`} className="cursor-pointer">{grade}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* المادة */}
              <div className="space-y-2">
                <Label htmlFor="subject">المادة (اختياري)</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="مثال: الرياضيات"
                />
              </div>

              {/* ملاحظة */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>✅ ملاحظة:</strong> سيكون الشاهد <strong>جاهز للاستخدام فوراً</strong> بعد الإنشاء. يمكنك عرضه وطباعته مباشرة. الشاهد <strong>خاص بك</strong> ولن يظهر للمعلمين الآخرين إلا إذا قرر المالك نشره.
                </p>
              </div>

              {/* أزرار */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء الشاهد"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
