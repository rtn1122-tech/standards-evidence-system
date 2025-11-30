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
import { STAGES, SUBJECTS } from "@/../../shared/constants";

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
    stages: [] as string[],
    subjects: [] as string[],
    email: "",
    phoneNumber: "",
    professionalLicenseNumber: "",
    licenseStartDate: "",
    licenseEndDate: "",
    employeeNumber: "",
    jobTitle: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        educationDepartment: profile.educationDepartment || "",
        schoolName: profile.schoolName || "",
        teacherName: profile.teacherName || "",
        principalName: profile.principalName || "",
        gender: profile.gender,
        stages: profile.stage ? (profile.stage.startsWith('[') ? JSON.parse(profile.stage) : [profile.stage]) : [],
        subjects: profile.subjects ? JSON.parse(profile.subjects) : [],
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        professionalLicenseNumber: profile.professionalLicenseNumber || "",
        licenseStartDate: profile.licenseStartDate ? (profile.licenseStartDate instanceof Date ? profile.licenseStartDate.toISOString().split('T')[0] : profile.licenseStartDate) : "",
        licenseEndDate: profile.licenseEndDate ? (profile.licenseEndDate instanceof Date ? profile.licenseEndDate.toISOString().split('T')[0] : profile.licenseEndDate) : "",
        employeeNumber: profile.employeeNumber || "",
        jobTitle: profile.jobTitle || "",
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
      stage: JSON.stringify(formData.stages),
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
                <Label>المرحلة التعليمية (يمكن اختيار أكثر من مرحلة)</Label>
                <div className="grid grid-cols-1 gap-2">
                  {STAGES.map((stage) => (
                    <div
                      key={stage}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.stages.includes(stage)
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          stages: formData.stages.includes(stage)
                            ? formData.stages.filter((s) => s !== stage)
                            : [...formData.stages, stage],
                        });
                      }}
                    >
                      <span className="text-sm">{stage}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  المراحل المختارة: {formData.stages.length > 0 ? formData.stages.join("، ") : "لا يوجد"}
                </p>
              </div>

              {/* المواد التدريسية */}
              <div className="space-y-2">
                <Label>المواد التدريسية</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
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

              {/* حقول إضافية اختيارية */}
              <div className="border-t pt-6 space-y-6">
                <h3 className="text-lg font-semibold">معلومات إضافية (اختيارية)</h3>
                
                {/* البريد الإلكتروني */}
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
                  />
                </div>

                {/* رقم الجوال */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="05xxxxxxxx"
                  />
                </div>

                {/* رقم الرخصة المهنية */}
                <div className="space-y-2">
                  <Label htmlFor="professionalLicenseNumber">رقم الرخصة المهنية</Label>
                  <Input
                    id="professionalLicenseNumber"
                    value={formData.professionalLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, professionalLicenseNumber: e.target.value })}
                    placeholder="رقم الرخصة"
                  />
                </div>

                {/* تاريخ الرخصة */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseStartDate">تاريخ بداية الرخصة</Label>
                    <Input
                      id="licenseStartDate"
                      type="date"
                      value={formData.licenseStartDate}
                      onChange={(e) => setFormData({ ...formData, licenseStartDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseEndDate">تاريخ نهاية الرخصة</Label>
                    <Input
                      id="licenseEndDate"
                      type="date"
                      value={formData.licenseEndDate}
                      onChange={(e) => setFormData({ ...formData, licenseEndDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* الرقم الوظيفي */}
                <div className="space-y-2">
                  <Label htmlFor="employeeNumber">الرقم الوظيفي</Label>
                  <Input
                    id="employeeNumber"
                    value={formData.employeeNumber}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                    placeholder="رقم الموظف"
                  />
                </div>

                {/* المسمى الوظيفي */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="مثال: معلم لغة عربية"
                  />
                </div>
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
