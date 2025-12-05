import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function ProfileSetup() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: profile, isLoading } = trpc.teacherProfile.get.useQuery();
  const utils = trpc.useUtils();

  const [formData, setFormData] = useState({
    educationDepartment: "",
    schoolName: "",
    teacherName: "",
    principalName: "",
    gender: "male" as "male" | "female",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        educationDepartment: profile.educationDepartment || "",
        schoolName: profile.schoolName || "",
        teacherName: profile.teacherName || "",
        principalName: profile.principalName || "",
        gender: profile.gender,
      });
    }
  }, [profile]);

  const upsertMutation = trpc.teacherProfile.upsert.useMutation({
    onSuccess: () => {
      utils.teacherProfile.get.invalidate();
      setLocation("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">الملف الشخصي</CardTitle>
            <CardDescription>
              أكمل بياناتك الشخصية للمتابعة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="educationDepartment">إدارة التعليم</Label>
                <Input
                  id="educationDepartment"
                  value={formData.educationDepartment}
                  onChange={(e) => setFormData({ ...formData, educationDepartment: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">اسم المدرسة</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherName">اسم المعلم/ة</Label>
                <Input
                  id="teacherName"
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principalName">اسم المدير/ة</Label>
                <Input
                  id="principalName"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>الجنس</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "male" | "female" })}
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">معلم</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">معلمة</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" disabled={upsertMutation.isPending}>
                {upsertMutation.isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
