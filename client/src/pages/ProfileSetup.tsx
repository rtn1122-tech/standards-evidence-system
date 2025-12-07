import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Upload, User } from "lucide-react";

import { STAGES, SUBJECTS as ALL_SUBJECTS } from "../../../shared/constants";

const SUBJECTS = [
  "الرياضيات",
  "العلوم",
  "اللغة العربية",
  "اللغة الإنجليزية",
  "التربية الإسلامية",
  "الاجتماعيات",
  "الحاسب الآلي",
  "التربية الفنية",
  "التربية البدنية",
  "التربية الأسرية",
];

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.teacherProfile.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    // معلومات أساسية
    teacherName: "",
    email: "",
    phone: "",
    gender: "male" as "male" | "female",
    profileImage: "",
    
    // معلومات مهنية
    educationDepartment: "",
    schoolName: "",
    principalName: "",
    grades: [] as string[], // الصفوف الدراسية
    subjects: [] as string[],
    
    // معلومات الرخصة المهنية
    licenseNumber: "",
    licenseIssueDate: "",
    licenseExpiryDate: "",
    teacherLevel: "practitioner" as "practitioner" | "advanced" | "expert",
    
    // إعدادات التصميم
    preferredTheme: "modern",
    preferredCoverTheme: "classic",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        teacherName: profile.teacherName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        gender: profile.gender,
        profileImage: profile.profileImage || "",
        educationDepartment: profile.educationDepartment || "",
        schoolName: profile.schoolName || "",
        principalName: profile.principalName || "",
        grades: profile.stage ? (typeof profile.stage === 'string' && profile.stage.startsWith('[') ? JSON.parse(profile.stage) : [profile.stage]) : [],
        subjects: profile.subjects ? JSON.parse(profile.subjects) : [],
        licenseNumber: profile.licenseNumber || "",
        licenseIssueDate: profile.licenseIssueDate || "",
        licenseExpiryDate: profile.licenseExpiryDate || "",
        teacherLevel: profile.teacherLevel || "practitioner",
        preferredTheme: profile.preferredTheme || "modern",
        preferredCoverTheme: profile.preferredCoverTheme || "classic",
      });
      if (profile.profileImage) {
        setImagePreview(profile.profileImage);
      }
    }
  }, [profile]);

  const upsertMutation = trpc.teacherProfile.upsert.useMutation({
    onSuccess: () => {
      utils.teacherProfile.get.invalidate();
      setLocation("/");
    },
    onError: (error) => {
      console.error("خطأ في حفظ البيانات:", error);
      // منع رسائل الخطأ المتكررة
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setFormData({ ...formData, profileImage: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleGradeToggle = (grade: string) => {
    const newGrades = formData.grades.includes(grade)
      ? formData.grades.filter(g => g !== grade)
      : [...formData.grades, grade];
    setFormData({ ...formData, grades: newGrades });
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = formData.subjects.includes(subject)
      ? formData.subjects.filter(s => s !== subject)
      : [...formData.subjects, subject];
    setFormData({ ...formData, subjects: newSubjects });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate({
      ...formData,
      stage: JSON.stringify(formData.grades),
      subjects: JSON.stringify(formData.subjects),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">الملف الشخصي الكامل</CardTitle>
            <CardDescription>
              أكمل جميع بياناتك الشخصية والمهنية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* الصورة الشخصية */}
              <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Upload className="w-5 h-5" />
                  </label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-600">اضغط على الأيقونة لرفع صورتك الشخصية</p>
              </div>

              {/* المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">الاسم الكامل *</Label>
                    <Input
                      id="teacherName"
                      value={formData.teacherName}
                      onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                      required
                      placeholder="مثال: أحمد محمد العلي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الجوال *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="05xxxxxxxx"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الجنس *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                    >
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">معلم</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">معلمة</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* المعلومات المهنية */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">المعلومات المهنية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationDepartment">إدارة التعليم *</Label>
                    <Input
                      id="educationDepartment"
                      value={formData.educationDepartment}
                      onChange={(e) => setFormData({ ...formData, educationDepartment: e.target.value })}
                      required
                      placeholder="مثال: إدارة تعليم الرياض"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolName">اسم المدرسة *</Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      required
                      placeholder="مثال: مدرسة الملك عبدالعزيز"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="principalName">اسم المدير/ة *</Label>
                    <Input
                      id="principalName"
                      value={formData.principalName}
                      onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                      required
                      placeholder="مثال: خالد أحمد السالم"
                    />
                  </div>


                </div>

                <div className="space-y-2">
                  <Label>الصفوف الدراسية * (اختر صف أو أكثر)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                    {STAGES.map((grade) => (
                      <div key={grade} className="flex items-center gap-2">
                        <Checkbox
                          id={grade}
                          checked={formData.grades.includes(grade)}
                          onCheckedChange={() => handleGradeToggle(grade)}
                        />
                        <Label htmlFor={grade} className="cursor-pointer">{grade}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>مواد التدريس * (اختر واحدة أو أكثر)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                    {SUBJECTS.map((subject) => (
                      <div key={subject} className="flex items-center gap-2">
                        <Checkbox
                          id={subject}
                          checked={formData.subjects.includes(subject)}
                          onCheckedChange={() => handleSubjectToggle(subject)}
                        />
                        <Label htmlFor={subject} className="cursor-pointer">{subject}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* معلومات الرخصة المهنية */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">الرخصة المهنية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">رقم الرخصة المهنية *</Label>
                    <Input
                      id="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      required
                      placeholder="مثال: 123456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="teacherLevel">مستوى المعلم *</Label>
                    <Select
                      value={formData.teacherLevel}
                      onValueChange={(value) => setFormData({ ...formData, teacherLevel: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="practitioner">معلم ممارس</SelectItem>
                        <SelectItem value="advanced">معلم متقدم</SelectItem>
                        <SelectItem value="expert">معلم خبير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseIssueDate">تاريخ إصدار الرخصة *</Label>
                    <Input
                      id="licenseIssueDate"
                      type="date"
                      value={formData.licenseIssueDate}
                      onChange={(e) => setFormData({ ...formData, licenseIssueDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiryDate">تاريخ انتهاء الرخصة *</Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={formData.licenseExpiryDate}
                      onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* إعدادات التصميم */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 border-b pb-2">إعدادات التصميم</h3>
                <p className="text-sm text-gray-600">
                  يمكنك تغيير الثيمات لاحقاً من صفحة الإعدادات
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredTheme">ثيم الشواهد</Label>
                    <Select
                      value={formData.preferredTheme}
                      onValueChange={(value) => setFormData({ ...formData, preferredTheme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">عصري</SelectItem>
                        <SelectItem value="classic">كلاسيكي</SelectItem>
                        <SelectItem value="elegant">أنيق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferredCoverTheme">ثيم الغلاف</Label>
                    <Select
                      value={formData.preferredCoverTheme}
                      onValueChange={(value) => setFormData({ ...formData, preferredCoverTheme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">كلاسيكي</SelectItem>
                        <SelectItem value="modern">عصري</SelectItem>
                        <SelectItem value="professional">احترافي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? "جاري الحفظ..." : "حفظ البيانات"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  disabled={upsertMutation.isPending}
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
