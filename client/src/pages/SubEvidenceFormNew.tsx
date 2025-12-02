import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Save, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SubEvidenceFormNew() {
  const [, params] = useRoute("/evidence/sub-new/:subTemplateId");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const subTemplateId = params?.subTemplateId ? parseInt(params.subTemplateId) : null;
  
  // Fetch sub-evidence template data
  const { data: subTemplate, isLoading } = trpc.evidenceTemplates.getSubTemplateById.useQuery(
    { id: subTemplateId! },
    { enabled: !!subTemplateId }
  );
  
  const { data: profile } = trpc.teacherProfile.get.useQuery(undefined, {
    enabled: !!user
  });
  
  // Page 1 - Dynamic fields (8 fields)
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [duration, setDuration] = useState("");
  const [executionLocation, setExecutionLocation] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Page 2 - 6 sections (pre-filled from database)
  const [section1, setSection1] = useState(""); // المقدمة
  const [section2, setSection2] = useState(""); // الأهداف
  const [section3, setSection3] = useState(""); // المقترحات
  const [section4, setSection4] = useState(""); // آلية التنفيذ
  const [section5, setSection5] = useState(""); // التوصيات
  const [section6, setSection6] = useState(""); // الوسائل المستخدمة
  
  // Images
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string>("");
  const [image2Preview, setImage2Preview] = useState<string>("");
  const [image1Url, setImage1Url] = useState<string | null>(null);
  const [image2Url, setImage2Url] = useState<string | null>(null);
  const [uploadingImage1, setUploadingImage1] = useState(false);
  const [uploadingImage2, setUploadingImage2] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pre-fill sections when data loads
  useEffect(() => {
    if (subTemplate) {
      setSection1(subTemplate.section1Content || "");
      setSection2(subTemplate.section2Content || "");
      setSection3(subTemplate.section3Content || "");
      setSection4(subTemplate.section4Content || "");
      setSection5(subTemplate.section5Content || "");
      setSection6(subTemplate.section6Content || "");
    }
  }, [subTemplate]);
  
  // Upload image mutation
  const uploadImageMutation = trpc.evidenceDetails.uploadImage.useMutation();
  
  // Handle image upload
  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }
    
    // Set uploading state
    if (imageNumber === 1) {
      setUploadingImage1(true);
    } else {
      setUploadingImage2(true);
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      // Set preview immediately
      if (imageNumber === 1) {
        setImage1(file);
        setImage1Preview(base64String);
      } else {
        setImage2(file);
        setImage2Preview(base64String);
      }
      
      try {
        // Upload to S3
        const result = await uploadImageMutation.mutateAsync({
          file: base64String,
          fileName: file.name,
        });
        
        // Save URL
        if (imageNumber === 1) {
          setImage1Url(result.url);
          toast.success("تم رفع الصورة الأولى بنجاح");
        } else {
          setImage2Url(result.url);
          toast.success("تم رفع الصورة الثانية بنجاح");
        }
      } catch (error) {
        toast.error("فشل رفع الصورة");
        console.error("Upload error:", error);
      } finally {
        if (imageNumber === 1) {
          setUploadingImage1(false);
        } else {
          setUploadingImage2(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Handle drag and drop
  const handleDrop = (e: React.DragEvent, imageNumber: 1 | 2) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file, imageNumber);
    } else {
      toast.error("يرجى سحب ملف صورة");
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Save mutation
  const saveMutation = trpc.evidenceDetails.save.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ بيانات الشاهد بنجاح");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    },
  });
  
  const handleSave = async () => {
    if (!subTemplateId || !profile) {
      toast.error("معلومات غير كاملة");
      return;
    }
    
    // Validation
    if (!title.trim() || !beneficiaries.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    
    // Images are already uploaded to S3 (image1Url, image2Url)
    
    const dynamicFields = {
      title,
      grade,
      beneficiaries,
      duration,
      location: executionLocation,
      studentsCount,
      lessonTitle,
      teacherName: profile.teacherName,
      date: new Date().toISOString(),
      standardName: subTemplate?.standardId ? `المعيار ${subTemplate.standardId}` : "",
      evidenceName: subTemplate?.title || "",
    };
    
    saveMutation.mutate({
      subTemplateId,
      templateId: subTemplate.evidenceTemplateId || 30002,
      dynamicFields,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      image1: image1Url,
      image2: image2Url,
      theme: "default",
    });
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => (window.location.href = "/api/oauth/login")} size="lg">
          تسجيل الدخول
        </Button>
      </div>
    );
  }
  
  if (!subTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">لم يتم العثور على الشاهد</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <ArrowRight className="h-4 w-4 ml-1" />
                رجوع
              </Button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">نموذج تعبئة الشاهد</h1>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '210mm' }}>
        {/* Evidence Title */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-right mb-2">{subTemplate.title}</h2>
          {subTemplate.description && (
            <p className="text-sm text-muted-foreground text-right">{subTemplate.description}</p>
          )}
        </div>
        
        {/* Page Navigation */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            onClick={() => setCurrentPage(1)}
            className="flex-1"
          >
            الصفحة الأولى - المعلومات الأساسية
          </Button>
          <Button
            variant={currentPage === 2 ? "default" : "outline"}
            onClick={() => setCurrentPage(2)}
            className="flex-1"
          >
            الصفحة الثانية - المحتوى التفصيلي
          </Button>
        </div>
        
        {/* Page 1 */}
        {currentPage === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-8" style={{ minHeight: '297mm' }}>
            {/* عنوان المعيار */}
            <div className="border-2 border-black p-4 text-center mb-6">
              <h3 className="text-xl font-bold">
                معيار: {subTemplate.standardName || "توظيف تقنيات ووسائل تعليم مناسبة"}
              </h3>
            </div>

            {/* اسم العنصر */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="استخدام التقنية الحديثة"
                className="text-center font-semibold border-black"
              />
              <div className="border border-black p-3 text-right flex items-center justify-end">
                <span className="font-semibold">اسم العنصر</span>
              </div>
            </div>

            {/* جدول البيانات - 4 حقول */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">مدة البرنامج</label>
                <Input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="طوال العام"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">المستفيدون</label>
                <Input
                  value={beneficiaries}
                  onChange={(e) => setBeneficiaries(e.target.value)}
                  placeholder="الطلاب"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">الصف</label>
                <Input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="جميع الفصول"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">العنوان</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="التقنية في التعليم"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
            </div>

            {/* 3 حقول */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">عدد الطلاب</label>
                <Input
                  value={studentsCount}
                  onChange={(e) => setStudentsCount(e.target.value)}
                  placeholder="جميع الطلاب"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
              <div className="border border-black p-2">
                <label className="text-xs text-gray-600 block mb-1">مكان التنفيذ</label>
                <Input
                value={executionLocation}
                onChange={(e) => setExecutionLocation(e.target.value)}
                  placeholder="الفصل - مصادر التعلم"
                  className="border-0 p-0 h-auto text-sm"
                />
              </div>
              <div className="border border-black p-2">
                {/* فارغ */}
              </div>
            </div>

            {/* عنوان الدرس */}
            <div className="border border-black p-2 mb-6">
              <label className="text-xs text-gray-600 block mb-1">عنوان الدرس</label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="جميع المناهج المستندة"
                className="border-0 p-0 h-auto text-sm"
              />
            </div>

            {/* مربع الوصف */}
            <div className="border-2 border-black rounded-lg p-6 relative" style={{ minHeight: '300px' }}>
              <div className="absolute top-2 right-2 border border-black px-3 py-1 bg-white">
                <span className="text-sm font-semibold">الوصف</span>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل الوصف هنا..."
                className="mt-8 border-0 resize-none h-64 text-justify leading-relaxed"
              />
            </div>
          </div>
        )}
        
        {/* Page 2 */}
        {currentPage === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-8" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-right">
                <div className="font-bold text-lg">وزارة التعليم</div>
                <div className="text-sm">الإدارة العامة للتعليم بالباحة</div>
                <div className="text-sm">مدرسة متوسطة القموص</div>
              </div>
              <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
                <span className="text-xs">QR</span>
              </div>
            </div>

            <div className="h-1 bg-gray-300 mb-6"></div>

            {/* عنوان المعيار */}
            <div className="border-2 border-black p-4 text-center mb-4">
              <h3 className="text-xl font-bold">
                معيار: {subTemplate.standardName || "توظيف تقنيات ووسائل تعليم مناسبة"}
              </h3>
            </div>

            {/* اسم العنصر */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-black p-2 text-center">
                <span className="font-semibold">{title || "استخدام التقنية الحديثة"}</span>
              </div>
              <div className="border border-black p-2 text-right">
                <span className="font-semibold">اسم العنصر</span>
              </div>
            </div>

            {/* المربعات الستة */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* المقدمة */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  المقدمة
                </div>
                <Textarea
                  value={section1}
                  onChange={(e) => setSection1(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>

              {/* أهداف */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  أهداف
                </div>
                <Textarea
                  value={section2}
                  onChange={(e) => setSection2(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>

              {/* مقترحات */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  مقترحات
                </div>
                <Textarea
                  value={section3}
                  onChange={(e) => setSection3(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>

              {/* آلية التنفيذ */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  آلية التنفيذ
                </div>
                <Textarea
                  value={section4}
                  onChange={(e) => setSection4(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>

              {/* توصيات */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  توصيات
                </div>
                <Textarea
                  value={section5}
                  onChange={(e) => setSection5(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>

              {/* الوسائل المستخدمة */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  الوسائل المستخدمة
                </div>
                <Textarea
                  value={section6}
                  onChange={(e) => setSection6(e.target.value)}
                  className="mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                />
              </div>
            </div>

            {/* الصور */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* صورة 1 */}
              <div
                className="border-2 border-dashed border-gray-400 rounded-lg overflow-hidden relative cursor-pointer hover:border-gray-600 transition-colors"
                style={{ height: '200px' }}
                onDrop={(e) => handleDrop(e, 1)}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('image1-input')?.click()}
              >
                {image1Preview ? (
                  <img src={image1Preview} alt="صورة 1" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm">اسحب الصورة هنا أو انقر للاختيار</span>
                  </div>
                )}
                <input
                  id="image1-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 1)}
                />
              </div>

              {/* صورة 2 */}
              <div
                className="border-2 border-dashed border-gray-400 rounded-lg overflow-hidden relative cursor-pointer hover:border-gray-600 transition-colors"
                style={{ height: '200px' }}
                onDrop={(e) => handleDrop(e, 2)}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('image2-input')?.click()}
              >
                {image2Preview ? (
                  <img src={image2Preview} alt="صورة 2" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Upload className="h-8 w-8 mb-2" />
                    <span className="text-sm">اسحب الصورة هنا أو انقر للاختيار</span>
                  </div>
                )}
                <input
                  id="image2-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 2)}
                />
              </div>
            </div>

            {/* التوقيع */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-3 text-center">
                <span className="font-medium">مدير المدرسة</span>
              </div>
              <div className="border border-black p-3 text-center">
                <span className="font-medium">اسم المعلم: {profile?.teacherName || ""}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
