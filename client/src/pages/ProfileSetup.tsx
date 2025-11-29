import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { trpc } from "@/lib/trpc";
import { ArrowRight, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STAGES = ["ابتدائي", "متوسط", "ثانوي"];
const SUBJECTS = [
  "لغة عربية",
  "رياضيات",
  "علوم",
  "اجتماعيات",
  "لغة إنجليزية",
  "تربية إسلامية",
  "تربية فنية",
  "تربية بدنية",
  "حاسب آلي",
  "مهارات حياتية",
];

export default function ProfileSetup() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.teacherProfile.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    educationDepartment: "",
    schoolName: "",
    teacherName: "",
    principalName: "",
    gender: "male" as "male" | "female",
    stage: "",
    subjects: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        educationDepartment: profile.educationDepartment || "",
        schoolName: profile.schoolName || "",
        teacherName: profile.teacherName || "",
        principalName: profile.principalName || "",
        gender: profile.gender,
        stage: profile.stage || "",
        subjects: profile.subjects ? JSON.parse(profile.subjects) : [],
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        teacherName: user.name || "",
      }));
    }
  }, [profile, user]);

  const upsertMutation = trpc.teacherProfile.upsert.useMutation({
    onSuccess: () => {
      utils.teacherProfile.get.invalidate();
      toast.success("تم حفظ المعلومات بنجاح");
      setLocation("/");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء الحفظ");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.gender) {
      toast.error("يرجى اختيار الجنس");
      return;
    }

    upsertMutation.mutate({
      ...formData,
      subjects: JSON.stringify(formData.subjects),
    });
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للرئيسية
        </Button>

        <Card>
          <CardHeader>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">وزارة التعليم</p>
            </div>
            <CardTitle>إعداد الملف الشخصي</CardTitle>
            <CardDescription>
              يرجى إدخال معلوماتك الأساسية. هذه المعلومات ستستخدم في جميع الشواهد.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* إدارة التعليم */}
              <div className="space-y-2">
                <Label htmlFor="educationDepartment">إدارة التعليم</Label>
                <Input
                  id="educationDepartment"
                  value={formData.educationDepartment}
                  onChange={(e) =>
                    setFormData({ ...formData, educationDepartment: e.target.value })
                  }
                  placeholder="مثال: إدارة التعليم بالرياض"
                />
              </div>

              {/* اسم المدرسة */}
              <div className="space-y-2">
                <Label htmlFor="schoolName">اسم المدرسة</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="مثال: مدرسة الأمل الابتدائية"
                />
              </div>

              {/* اسم المعلم */}
              <div className="space-y-2">
                <Label htmlFor="teacherName">اسم المعلم</Label>
                <Input
                  id="teacherName"
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  placeholder="الاسم الكامل"
                />
              </div>

              {/* اسم المدير */}
              <div className="space-y-2">
                <Label htmlFor="principalName">اسم المدير</Label>
                <Input
                  id="principalName"
                  value={formData.principalName}
                  onChange={(e) =>
                    setFormData({ ...formData, principalName: e.target.value })
                  }
                  placeholder="اسم مدير المدرسة"
                />
              </div>

              {/* الجنس */}
              <div className="space-y-2">
                <Label>الجنس</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as "male" | "female" })
                  }
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">معلم</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">معلمة</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* المرحلة */}
              <div className="space-y-2">
                <Label>المرحلة التعليمية</Label>
                <RadioGroup
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value })}
                >
                  {STAGES.map((stage) => (
                    <div key={stage} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={stage} id={`stage-${stage}`} />
                      <Label htmlFor={`stage-${stage}`} className="cursor-pointer">{stage}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* المواد التدريسية */}
              <div className="space-y-2">
                <Label>المواد التدريسية</Label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((subject) => (
                    <div
                      key={subject}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.subjects.includes(subject)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleSubject(subject)}
                    >
                      <span className="text-sm">{subject}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  المواد المختارة: {formData.subjects.length > 0 ? formData.subjects.join("، ") : "لا يوجد"}
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-2">
                <Button type="submit" disabled={upsertMutation.isPending} className="flex-1">
                  <Save className="h-4 w-4 ml-2" />
                  {upsertMutation.isPending ? "جاري الحفظ..." : "حفظ المعلومات"}
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
