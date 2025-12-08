import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Upload, User, ZoomIn } from "lucide-react";

import { STAGES, getSubjectsForGrades } from "../../../shared/constants";

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
    preferredTheme: "white",
    preferredCoverTheme: "theme1",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewTheme, setPreviewTheme] = useState<{ type: 'evidence' | 'cover', value: string, name: string, image: string | null } | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        teacherName: profile.teacherName || "",
        email: profile.email || "",
        phone: profile.phoneNumber || "",
        gender: profile.gender,
        profileImage: profile.profileImage || "",
        educationDepartment: profile.educationDepartment || "",
        schoolName: profile.schoolName || "",
        principalName: profile.principalName || "",
        grades: profile.stage ? (typeof profile.stage === 'string' && profile.stage.startsWith('[') ? JSON.parse(profile.stage) : [profile.stage]) : [],
        subjects: profile.subjects ? JSON.parse(profile.subjects) : [],
        licenseNumber: profile.professionalLicenseNumber || "",
        licenseIssueDate: profile.licenseStartDate ? (profile.licenseStartDate instanceof Date ? profile.licenseStartDate.toISOString().split('T')[0] : profile.licenseStartDate) : "",
        licenseExpiryDate: profile.licenseEndDate ? (profile.licenseEndDate instanceof Date ? profile.licenseEndDate.toISOString().split('T')[0] : profile.licenseEndDate) : "",
        teacherLevel: (profile.jobTitle === "practitioner" || profile.jobTitle === "advanced" || profile.jobTitle === "expert") ? profile.jobTitle : "practitioner",
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
                  {formData.grades.length === 0 ? (
                    <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                      <p className="text-yellow-800 font-medium">⚠️ يرجى اختيار المرحلة الدراسية أولاً لعرض المواد المناسبة</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                      {getSubjectsForGrades(formData.grades).map((subject) => (
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
                  )}
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 border-b pb-2">إعدادات التصميم</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    اختر الثيم المفضل لديك من خلال النقر على الصورة
                  </p>
                </div>
                
                {/* ثيمات الشواهد */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">ثيم الشواهد</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* ورقة بيضاء */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredTheme: 'white' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredTheme === 'white'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <div className="aspect-[3/4] bg-white flex items-center justify-center border border-gray-300">
                            <span className="text-gray-400 text-sm">ورقة بيضاء</span>
                          </div>
                          {formData.preferredTheme === 'white' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ورقة بيضاء</p>
                          <p className="text-xs text-gray-500">الافتراضي</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'evidence', value: 'white', name: 'ورقة بيضاء', image: null });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>

                    {/* ثيم 1 */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredTheme: 'theme1' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredTheme === 'theme1'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src="/themes/evidences/evidence-theme1.png"
                            alt="ثيم الشواهد 1"
                            className="w-full aspect-[3/4] object-cover"
                          />
                          {formData.preferredTheme === 'theme1' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ثيم الشواهد 1</p>
                          <p className="text-xs text-gray-500">كلاسيكي</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'evidence', value: 'theme1', name: 'ثيم الشواهد 1', image: '/themes/evidences/evidence-theme1.png' });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>

                    {/* ثيم 2 */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredTheme: 'theme2' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredTheme === 'theme2'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src="/themes/evidences/evidence-theme2.png"
                            alt="ثيم الشواهد 2"
                            className="w-full aspect-[3/4] object-cover"
                          />
                          {formData.preferredTheme === 'theme2' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ثيم الشواهد 2</p>
                          <p className="text-xs text-gray-500">حديث</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'evidence', value: 'theme2', name: 'ثيم الشواهد 2', image: '/themes/evidences/evidence-theme2.png' });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>
                  </div>
                </div>

                {/* ثيمات الغلاف */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">ثيم الغلاف</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* ثيم غلاف 1 */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredCoverTheme: 'theme1' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredCoverTheme === 'theme1'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src="/themes/covers/cover-theme1.png"
                            alt="ثيم الغلاف 1"
                            className="w-full aspect-[3/4] object-cover"
                          />
                          {formData.preferredCoverTheme === 'theme1' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ثيم الغلاف 1</p>
                          <p className="text-xs text-gray-500">رسمي</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'cover', value: 'theme1', name: 'ثيم الغلاف 1', image: '/themes/covers/cover-theme1.png' });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>

                    {/* ثيم غلاف 2 */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredCoverTheme: 'theme2' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredCoverTheme === 'theme2'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src="/themes/covers/cover-theme2.png"
                            alt="ثيم الغلاف 2"
                            className="w-full aspect-[3/4] object-cover"
                          />
                          {formData.preferredCoverTheme === 'theme2' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ثيم الغلاف 2</p>
                          <p className="text-xs text-gray-500">أنيق</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'cover', value: 'theme2', name: 'ثيم الغلاف 2', image: '/themes/covers/cover-theme2.png' });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>

                    {/* ثيم غلاف 3 */}
                    <div className="relative group">
                      <div
                        onClick={() => setFormData({ ...formData, preferredCoverTheme: 'theme3' })}
                        className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                          formData.preferredCoverTheme === 'theme3'
                            ? 'border-green-500 shadow-xl'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src="/themes/covers/cover-theme3.png"
                            alt="ثيم الغلاف 3"
                            className="w-full aspect-[3/4] object-cover"
                          />
                          {formData.preferredCoverTheme === 'theme3' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <p className="text-sm font-medium">ثيم الغلاف 3</p>
                          <p className="text-xs text-gray-500">عصري</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTheme({ type: 'cover', value: 'theme3', name: 'ثيم الغلاف 3', image: '/themes/covers/cover-theme3.png' });
                        }}
                      >
                        <ZoomIn className="w-4 h-4 ml-1" />
                        معاينة
                      </Button>
                    </div>
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

      {/* Dialog للمعاينة المكبرة */}
      <Dialog open={previewTheme !== null} onOpenChange={() => setPreviewTheme(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-right">{previewTheme?.name}</DialogTitle>
            <DialogDescription className="text-right">
              معاينة الثيم بحجم أكبر
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {previewTheme?.image ? (
              <img
                src={previewTheme.image}
                alt={previewTheme.name}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-2xl">ورقة بيضاء</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                if (previewTheme) {
                  if (previewTheme.type === 'evidence') {
                    setFormData({ ...formData, preferredTheme: previewTheme.value });
                  } else {
                    setFormData({ ...formData, preferredCoverTheme: previewTheme.value });
                  }
                }
                setPreviewTheme(null);
              }}
              className="flex-1"
            >
              اختيار هذا الثيم
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewTheme(null)}
              className="flex-1"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
