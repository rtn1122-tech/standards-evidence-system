import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

interface Box {
  title: string;
  content: string;
}

export default function FillEvidence() {
  const params = useParams<{ id: string }>();
  const templateId = parseInt(params.id || "0");
  const [, navigate] = useLocation();

  // جلب بيانات القالب
  const { data: template, isLoading } = trpc.evidenceTemplates.get.useQuery({ id: templateId });

  // State للحقول
  const [formData, setFormData] = useState({
    description: "",
    userFieldsData: {} as Record<string, string>,
    page2BoxesData: [] as Box[],
  });

  // تحميل البيانات الافتراضية من القالب
  useEffect(() => {
    if (template) {
      // Parse page2Boxes
      let boxes: Box[] = [];
      try {
        boxes = JSON.parse(template.page2Boxes || "[]");
      } catch (e) {
        console.error("Error parsing page2Boxes:", e);
      }

      setFormData({
        description: template.description || "",
        userFieldsData: {},
        page2BoxesData: boxes,
      });
    }
  }, [template]);

  // Mutation للحفظ
  const saveMutation = trpc.userEvidences.create.useMutation({
    onSuccess: () => {
      alert("تم حفظ الشاهد بنجاح");
      navigate("/my-evidences");
    },
    onError: (error) => {
      alert("حدث خطأ: " + error.message);
    },
  });

  const handleSave = async () => {
    if (!template) return;

    saveMutation.mutate({
      templateId: template.id,
      description: formData.description,
      customFields: JSON.stringify(formData.userFieldsData),
      sections: JSON.stringify(formData.page2BoxesData),
      image1Url: template.defaultImageUrl || null,
      image2Url: null,
    });
  };

  const updateBoxContent = (index: number, content: string) => {
    const newBoxes = [...formData.page2BoxesData];
    newBoxes[index] = { ...newBoxes[index], content };
    setFormData({ ...formData, page2BoxesData: newBoxes });
  };

  const updateUserField = (fieldName: string, value: string) => {
    setFormData({
      ...formData,
      userFieldsData: {
        ...formData.userFieldsData,
        [fieldName]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">الشاهد غير موجود</p>
          <Link href="/standards">
            <Button>
              <ArrowRight className="ml-2 w-4 h-4" />
              العودة للمعايير
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Parse userFields
  let userFields: any[] = [];
  try {
    userFields = JSON.parse(template.userFields || "[]");
  } catch (e) {
    console.error("Error parsing userFields:", e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المملكة العربية السعودية</p>
              <h1 className="text-xl font-bold text-gray-800">وزارة التعليم</h1>
            </div>
            <Link href={`/standard/${template.standardId}`}>
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 w-4 h-4" />
                العودة
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* عنوان الشاهد */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">{template.evidenceName}</CardTitle>
            {template.subEvidenceName && (
              <p className="text-blue-100 text-sm mt-1">{template.subEvidenceName}</p>
            )}
          </CardHeader>
        </Card>

        {/* نموذج التعبئة */}
        <Card className="shadow-lg mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* الصفحة الأولى: الوصف */}
            <div>
              <Label htmlFor="description" className="text-lg font-semibold text-gray-800">
                الصفحة الأولى: الوصف
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className="mt-2"
                placeholder="اكتب وصف الشاهد هنا..."
              />
              <p className="text-sm text-gray-500 mt-1">
                هذا النص سيظهر في الصفحة الأولى من الشاهد
              </p>
            </div>

            {/* الحقول الديناميكية من userFields */}
            {userFields.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  معلومات إضافية (اختياري)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userFields.map((field: any, index: number) => (
                    <div key={index}>
                      <Label htmlFor={`field-${index}`}>
                        {field.name || `حقل ${index + 1}`}
                        {field.required && <span className="text-red-500 mr-1">*</span>}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={`field-${index}`}
                          value={formData.userFieldsData[field.name] || ""}
                          onChange={(e) => updateUserField(field.name, e.target.value)}
                          placeholder={field.placeholder || `أدخل ${field.name}`}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={`field-${index}`}
                          type={field.type || "text"}
                          value={formData.userFieldsData[field.name] || ""}
                          onChange={(e) => updateUserField(field.name, e.target.value)}
                          placeholder={field.placeholder || `أدخل ${field.name}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* الصفحة الثانية: المربعات الستة */}
        {formData.page2BoxesData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">الصفحة الثانية: المربعات التفصيلية</CardTitle>
              <p className="text-sm text-gray-500">
                يمكنك تعديل محتوى المربعات حسب الحاجة
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.page2BoxesData.map((box, index) => (
                <div key={index} className="border-r-4 border-blue-500 pr-4">
                  <Label htmlFor={`box-${index}`} className="font-semibold text-gray-800">
                    {box.title}
                  </Label>
                  <Textarea
                    id={`box-${index}`}
                    value={box.content}
                    onChange={(e) => updateBoxContent(index, e.target.value)}
                    rows={6}
                    className="mt-2"
                    placeholder={`اكتب محتوى ${box.title} هنا...`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* أزرار الحفظ */}
        <div className="flex gap-4 pt-6">
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1"
            size="lg"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="ml-2 w-4 h-4" />
                حفظ الشاهد
              </>
            )}
          </Button>
          <Link href={`/standard/${template.standardId}`}>
            <Button variant="outline" size="lg">
              <X className="ml-2 w-4 h-4" />
              إلغاء
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
