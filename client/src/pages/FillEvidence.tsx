import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { useState, useEffect } from "react";


export default function FillEvidence() {
  const params = useParams<{ id: string }>();
  const templateId = parseInt(params.id || "0");
  const [, navigate] = useLocation();


  // جلب بيانات القالب
  const { data: template, isLoading } = trpc.evidenceTemplates.get.useQuery({ id: templateId });

  // State للحقول
  const [formData, setFormData] = useState({
    description: "",
    field1: "",
    field2: "",
    field3: "",
    field4: "",
    field5: "",
    field6: "",
    field7: "",
    field8: "",
    section1: "",
    section2: "",
    section3: "",
    section4: "",
    section5: "",
    section6: "",
    image1: null as File | null,
    image2: null as File | null,
  });

  // تحميل البيانات الافتراضية من القالب
  useEffect(() => {
    if (template) {
      setFormData(prev => ({
        ...prev,
        description: template.description || "",
        section1: template.section1Content || "",
        section2: template.section2Content || "",
        section3: template.section3Content || "",
        section4: template.section4Content || "",
        section5: template.section5Content || "",
        section6: template.section6Content || "",
      }));
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

    // تحضير البيانات
    const customFields = {
      field1: formData.field1,
      field2: formData.field2,
      field3: formData.field3,
      field4: formData.field4,
      field5: formData.field5,
      field6: formData.field6,
      field7: formData.field7,
      field8: formData.field8,
    };

    const sections = {
      section1: formData.section1,
      section2: formData.section2,
      section3: formData.section3,
      section4: formData.section4,
      section5: formData.section5,
      section6: formData.section6,
    };

    saveMutation.mutate({
      templateId: template.id,
      description: formData.description,
      customFields: JSON.stringify(customFields),
      sections: JSON.stringify(sections),
      image1Url: template.defaultImage1Url || null,
      image2Url: template.defaultImage2Url || null,
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
            <CardTitle className="text-2xl">{template.title}</CardTitle>
          </CardHeader>
        </Card>

        {/* نموذج التعبئة */}
        <Card className="shadow-lg">
          <CardContent className="pt-6 space-y-6">
            {/* الوصف */}
            <div>
              <Label htmlFor="description" className="text-lg font-semibold">وصف الشاهد</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="mt-2"
                placeholder="اكتب وصف الشاهد هنا..."
              />
            </div>

            {/* الحقول الديناميكية (8 حقول) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <div key={num}>
                  <Label htmlFor={`field${num}`}>حقل {num}</Label>
                  <Input
                    id={`field${num}`}
                    value={formData[`field${num}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`field${num}`]: e.target.value })}
                    placeholder={`أدخل البيانات للحقل ${num}`}
                  />
                </div>
              ))}
            </div>

            {/* الأقسام الستة */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">أقسام المحتوى</h3>
              {[
                { num: 1, title: template.section1Title || "القسم الأول" },
                { num: 2, title: template.section2Title || "القسم الثاني" },
                { num: 3, title: template.section3Title || "القسم الثالث" },
                { num: 4, title: template.section4Title || "القسم الرابع" },
                { num: 5, title: template.section5Title || "القسم الخامس" },
                { num: 6, title: template.section6Title || "القسم السادس" },
              ].map(({ num, title }) => (
                <div key={num}>
                  <Label htmlFor={`section${num}`} className="font-semibold">{title}</Label>
                  <Textarea
                    id={`section${num}`}
                    value={formData[`section${num}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [`section${num}`]: e.target.value })}
                    rows={4}
                    className="mt-2"
                    placeholder={`اكتب محتوى ${title} هنا...`}
                  />
                </div>
              ))}
            </div>

            {/* أزرار الحفظ */}
            <div className="flex gap-4 pt-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
