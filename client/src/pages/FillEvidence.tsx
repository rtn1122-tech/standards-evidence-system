import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Save, Loader2, X, Upload, Eye, Check, ZoomIn, Palette } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Box {
  title: string;
  content: string;
}

export default function FillEvidence() {
  const params = useParams<{ id: string }>();
  const templateId = parseInt(params.id || "0");
  const [, navigate] = useLocation();

  // جلب بيانات القالب
  const { data: template, isLoading, error } = trpc.evidenceTemplates.get.useQuery({ id: templateId });
  
  console.log('=== QUERY STATUS ===');
  console.log('isLoading:', isLoading);
  console.log('template:', template);
  console.log('error:', error);

  // State للحقول
  const [formData, setFormData] = useState({
    description: "",
    userFieldsData: {} as Record<string, string>,
    page2BoxesData: [] as Box[],
    image1: null as File | null,
    image2: null as File | null,
    image1Preview: "",
    image2Preview: "",
    image1Url: "",
    image2Url: "",
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<string>("");
  const [showThemePreview, setShowThemePreview] = useState(false);
  const [selectedThemeForPreview, setSelectedThemeForPreview] = useState<string>("white");
  const image1InputRef = useRef<HTMLInputElement>(null);
  const image2InputRef = useRef<HTMLInputElement>(null);

  // تحميل البيانات الافتراضية من القالب
  useEffect(() => {
    if (template) {
      console.log('=== TEMPLATE DATA ===');
      console.log('template.page2Boxes:', template.page2Boxes);
      console.log('template keys:', Object.keys(template));
      
      // Parse page2Boxes
      let boxes: Box[] = [];
      try {
        boxes = JSON.parse(template.page2Boxes || "[]");
        console.log('Parsed boxes:', boxes);
      } catch (e) {
        console.error("Error parsing page2Boxes:", e);
      }

      // محاولة استعادة البيانات من localStorage
      const savedData = localStorage.getItem(`evidence_draft_${templateId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData({
            ...parsed,
            // دمج page2BoxesData من template إذا لم تكن موجودة في المسودة
            page2BoxesData: parsed.page2BoxesData && parsed.page2BoxesData.length > 0 ? parsed.page2BoxesData : boxes,
            image1: null,
            image2: null,
            image1Preview: parsed.image1Preview || template.defaultImageUrl || "",
            image2Preview: parsed.image2Preview || "",
          });
          setAutoSaveStatus("تم استعادة المسودة المحفوظة");
          setTimeout(() => setAutoSaveStatus(""), 3000);
          return;
        } catch (e) {
          console.error("Error restoring draft:", e);
        }
      }

      setFormData({
        description: template.description || "",
        userFieldsData: {},
        page2BoxesData: boxes,
        image1: null,
        image2: null,
        image1Preview: template.defaultImageUrl || "",
        image2Preview: "",
        image1Url: "",
        image2Url: "",
      });
      
      // تحميل الثيم المحفوظ إن وجد
      const savedTheme = localStorage.getItem(`evidence_theme_${templateId}`);
      if (savedTheme) {
        setSelectedThemeForPreview(savedTheme);
      }
    }
  }, [template, templateId]);

  // الحفظ التلقائي كل دقيقة
  useEffect(() => {
    const interval = setInterval(() => {
      if (template) {
        const dataToSave = {
          description: formData.description,
          userFieldsData: formData.userFieldsData,
          page2BoxesData: formData.page2BoxesData,
          image1Preview: formData.image1Preview,
          image2Preview: formData.image2Preview,
        };
        localStorage.setItem(`evidence_draft_${templateId}`, JSON.stringify(dataToSave));
        setAutoSaveStatus("تم الحفظ تلقائياً");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      }
    }, 60000); // كل دقيقة

    return () => clearInterval(interval);
  }, [formData, template, templateId]);

  // Mutation للحفظ
  const saveMutation = trpc.userEvidences.create.useMutation({
    onSuccess: () => {
      // حذف المسودة بعد الحفظ الناجح
      localStorage.removeItem(`evidence_draft_${templateId}`);
      alert("تم حفظ الشاهد بنجاح");
      navigate("/my-evidences");
    },
    onError: (error) => {
      alert("حدث خطأ: " + error.message);
    },
  });

  const handleSave = async () => {
    if (!template) return;

    // استخدام روابط S3 المحفوظة (تم رفعها مسبقاً)
    const selectedTheme = localStorage.getItem(`selected_theme_${template.id}`) || 'classic';

    saveMutation.mutate({
      templateId: template.id,
      userData: JSON.stringify({
        description: formData.description,
        userFieldsData: formData.userFieldsData,
        page2BoxesData: formData.page2BoxesData,
      }),
      image1Url: formData.image1Url || formData.image1Preview || null,
      image2Url: formData.image2Url || formData.image2Preview || null,
      selectedTheme,
    });
  };

  const handlePreviewPDF = () => {
    if (!template) return;

    // حفظ البيانات في localStorage للمعاينة
    const previewData = {
      templateId: template.id,
      evidenceName: template.evidenceName,
      subEvidenceName: template.subEvidenceName,
      description: formData.description,
      userFieldsData: formData.userFieldsData,
      page2BoxesData: formData.page2BoxesData,
      image1Preview: formData.image1Preview,
      image2Preview: formData.image2Preview,
    };
    
    const key = `evidence_preview_${template.id}`;
    localStorage.setItem(key, JSON.stringify(previewData));
    
    // التحقق من الحفظ
    const saved = localStorage.getItem(key);
    console.log('Preview data saved:', key, saved ? 'SUCCESS' : 'FAILED');
    console.log('Preview data:', previewData);
    
    // فتح صفحة معاينة الثيمات في نفس التبويب
    window.location.href = `/preview-themes?templateId=${template.id}`;
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

  const uploadImageMutation = trpc.userEvidences.uploadImage.useMutation();

  const handleImageChange = async (imageNumber: 1 | 2, file: File | null) => {
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار ملف صورة");
      return;
    }

    // التحقق من حجم الملف (أقل من 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    // إنشاء معاينة
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      
      // معاينة فورية
      if (imageNumber === 1) {
        setFormData(prev => ({
          ...prev,
          image1: file,
          image1Preview: base64,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          image2: file,
          image2Preview: base64,
        }));
      }
      
      // رفع إلى S3 في الخلفية
      try {
        const result = await uploadImageMutation.mutateAsync({
          imageData: base64,
          fileName: file.name,
        });
        
        // حفظ رابط S3
        if (imageNumber === 1) {
          setFormData(prev => ({ ...prev, image1Url: result.url }));
        } else {
          setFormData(prev => ({ ...prev, image2Url: result.url }));
        }
      } catch (error) {
        console.error('خطأ في رفع الصورة:', error);
        alert('فشل رفع الصورة. حاول مرة أخرى.');
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageNumber: 1 | 2) => {
    if (imageNumber === 1) {
      setFormData({
        ...formData,
        image1: null,
        image1Preview: template?.defaultImageUrl || "",
      });
      if (image1InputRef.current) {
        image1InputRef.current.value = "";
      }
    } else {
      setFormData({
        ...formData,
        image2: null,
        image2Preview: "",
      });
      if (image2InputRef.current) {
        image2InputRef.current.value = "";
      }
    }
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
            <div className="flex items-center gap-3">
              {autoSaveStatus && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  {autoSaveStatus}
                </div>
              )}
              <Link href={`/standard/${template.standardId}`}>
                <Button variant="outline" size="sm">
                  <ArrowRight className="ml-2 w-4 h-4" />
                  العودة
                </Button>
              </Link>
            </div>
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

            {/* رفع الصور */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">الصور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الصورة الأولى */}
                <div>
                  <Label className="mb-2 block">الصورة الأولى</Label>
                  {formData.image1Preview ? (
                    <div className="relative">
                      <img
                        src={formData.image1Preview}
                        alt="معاينة الصورة الأولى"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 left-2"
                        onClick={() => removeImage(1)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">اضغط لرفع صورة</p>
                    </div>
                  )}
                  <Input
                    ref={image1InputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(1, e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>

                {/* الصورة الثانية */}
                <div>
                  <Label className="mb-2 block">الصورة الثانية (اختياري)</Label>
                  {formData.image2Preview ? (
                    <div className="relative">
                      <img
                        src={formData.image2Preview}
                        alt="معاينة الصورة الثانية"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 left-2"
                        onClick={() => removeImage(2)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-2">اضغط لرفع صورة</p>
                    </div>
                  )}
                  <Input
                    ref={image2InputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(2, e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
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

        {/* أزرار الحفظ والمعاينة */}
        <div className="flex gap-4 pt-6">
          <Button
            onClick={() => setShowThemePreview(true)}
            variant="outline"
            size="lg"
            className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-300"
          >
            <Palette className="ml-2 w-4 h-4" />
            اختيار الثيم
            {selectedThemeForPreview !== 'white' && (
              <span className="mr-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                {selectedThemeForPreview === 'theme1' ? 'ثيم 1' : selectedThemeForPreview === 'theme2' ? 'ثيم 2' : 'ثيم 3'}
              </span>
            )}
          </Button>
          <Button
            onClick={handlePreviewPDF}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Eye className="ml-2 w-4 h-4" />
            معاينة PDF
          </Button>
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

      {/* Dialog معاينة الثيمات */}
      <Dialog open={showThemePreview} onOpenChange={setShowThemePreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-4">اختر ثيم الشاهد</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {/* ورقة بيضاء */}
            <div
              onClick={() => setSelectedThemeForPreview('white')}
              className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                selectedThemeForPreview === 'white'
                  ? 'border-green-500 shadow-xl'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="relative bg-white aspect-[3/4] flex items-center justify-center border">
                <div className="text-center p-4">
                  <div className="text-6xl mb-2">📄</div>
                  <p className="text-sm text-gray-600">ورقة بيضاء</p>
                </div>
                {selectedThemeForPreview === 'white' && (
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

            {/* ثيم 1 */}
            <div
              onClick={() => setSelectedThemeForPreview('theme1')}
              className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                selectedThemeForPreview === 'theme1'
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
                {selectedThemeForPreview === 'theme1' && (
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

            {/* ثيم 2 */}
            <div
              onClick={() => setSelectedThemeForPreview('theme2')}
              className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                selectedThemeForPreview === 'theme2'
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
                {selectedThemeForPreview === 'theme2' && (
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

            {/* ثيم 3 */}
            <div
              onClick={() => setSelectedThemeForPreview('theme3')}
              className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all hover:scale-105 hover:shadow-lg ${
                selectedThemeForPreview === 'theme3'
                  ? 'border-green-500 shadow-xl'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="relative">
                <img
                  src="/themes/evidences/evidence-theme3.png"
                  alt="ثيم الشواهد 3"
                  className="w-full aspect-[3/4] object-cover"
                />
                {selectedThemeForPreview === 'theme3' && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-2 bg-gray-50 text-center">
                <p className="text-sm font-medium">ثيم الشواهد 3</p>
                <p className="text-xs text-gray-500">وردي</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              onClick={() => {
                // حفظ الثيم المختار في localStorage للاستخدام عند توليد PDF
                localStorage.setItem(`evidence_theme_${templateId}`, selectedThemeForPreview);
                setShowThemePreview(false);
              }}
              className="flex-1"
            >
              <Check className="ml-2 w-4 h-4" />
              تطبيق الثيم
            </Button>
            <Button
              onClick={() => setShowThemePreview(false)}
              variant="outline"
              className="flex-1"
            >
              <X className="ml-2 w-4 h-4" />
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
