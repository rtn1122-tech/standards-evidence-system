import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Save, Upload, Loader2, Pencil, Plus, X, Eye, Settings, GraduationCap, BookOpen, Hash } from "lucide-react";
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
  
  // PDF Preview state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  
  // Page 1 - Dynamic fields (8 fields + date)
  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [duration, setDuration] = useState("");
  const [executionLocation, setExecutionLocation] = useState("");
  const [studentsCount, setStudentsCount] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Custom field labels (editable by user)
  const [field1Label, setField1Label] = useState("مدة البرنامج");
  const [field2Label, setField2Label] = useState("مكان التنفيذ");
  const [field3Label, setField3Label] = useState("المستفيدون");
  const [field4Label, setField4Label] = useState("التاريخ");
  const [field5Label, setField5Label] = useState("الصف");
  const [field6Label, setField6Label] = useState("العنوان");
  const [field7Label, setField7Label] = useState("عدد الطلاب");
  const [field8Label, setField8Label] = useState("عنوان الدرس");
  
  // Dynamic fields (additional fields beyond the 8 default ones)
  const [dynamicFields, setDynamicFields] = useState<Array<{ label: string; value: string }>>([]);
  
  // Visibility settings (for admin/collaborator only)
  const [showVisibilitySettings] = useState(true); // Enabled for testing
  const [applicableStages, setApplicableStages] = useState<string[]>([]);
  const [applicableSubjects, setApplicableSubjects] = useState<string[]>([]);
  const [applicableGrades, setApplicableGrades] = useState<string[]>([]);

  
  // Page 2 - 6 sections (pre-filled from database)
  const [section1, setSection1] = useState(`1. الالتزام بالأنظمة والتعليمات

الالتزام بمواعيد الحضور والانصراف الرسمية وفق أنظمة وزارة التعليم.

متابعة التحديثات والتعاميم الخاصة بالدوام المدرسي والعمل بها فورًا.

تطبيق آليات إثبات الحضور عبر المنصات أو الأنظمة المعتمدة دون تأخير.`);
  const [section2, setSection2] = useState(`2. أثر الانضباط على جودة التعليم

انتظام الحضور يسهم في استقرار الجدول الدراسي وعدم فقد الحصص.

تعزيز تواصل المعلم مع طلابه واستكمال الخطط الدراسية دون تعثر.

توفير بيئة تعليمية محفزة تعكس المهنية والانضباط.`);
  const [section3, setSection3] = useState(`3. تنظيم العمل وتوزيع المهام

تسهيل مهام الإدارة في إعداد الجداول ومعالجة الغياب الطارئ.

ضمان تنفيذ الإشراف اليومي والحصص البديلة بانسيابية.

الإسهام في استقرار أعمال المدرسة وبرامجها.`);
  const [section4, setSection4] = useState(`4. تعزيز الانضباط والمسؤولية المهنية

الحضور المبكر يعكس استعداد المعلم لليوم الدراسي.

الانصراف في الوقت المحدد يؤكد التزامه بإتمام مهامه اليومية.

تحسين الصورة المهنية للمعلم أمام الطلاب والزملاء والمجتمع.`);
  const [section5, setSection5] = useState(`5. توثيق الحضور والانصراف كأحد الشواهد

حفظ سجلات الدوام اليومية أو الأسبوعية ضمن ملف الأداء المهني.

إرفاق تقارير أو كشوف من النظام المعتمد كدليل على الالتزام.

استخدام هذه السجلات في دعم المعايير الخاصة بالأداء الوظيفي.`);
  const [section6, setSection6] = useState(`6. الانعكاسات الإيجابية على بيئة العمل

تقليل حالات العجز الطارئ وزيادة الاستقرار المدرسي.

تعزيز ثقافة الالتزام والانضباط بين جميع العاملين.

تحسين رضا أولياء الأمور والمجتمع عن مستوى التنظيم داخل المدرسة.`);
  
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
  
  // Pre-fill sections and default images when data loads
  useEffect(() => {
    if (subTemplate) {
      setSection1(subTemplate.section1Content || "");
      setSection2(subTemplate.section2Content || "");
      setSection3(subTemplate.section3Content || "");
      setSection4(subTemplate.section4Content || "");
      setSection5(subTemplate.section5Content || "");
      setSection6(subTemplate.section6Content || "");
      
      // Set default images if available
      if (subTemplate.defaultImage1Url) {
        setImage1Preview(subTemplate.defaultImage1Url);
        setImage1Url(subTemplate.defaultImage1Url);
      }
      if (subTemplate.defaultImage2Url) {
        setImage2Preview(subTemplate.defaultImage2Url);
        setImage2Url(subTemplate.defaultImage2Url);
      }
    }
  }, [subTemplate]);
  
  // Upload image mutation
  const uploadImageMutation = trpc.evidenceDetails.uploadImage.useMutation();
  
  // Handle image upload
  const handleImageUpload = async (file: File, imageNumber: 1 | 2) => {
    // Accept images and PDFs
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("يرجى اختيار ملف صورة أو PDF");
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
    // Accept images and PDFs
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      handleImageUpload(file, imageNumber);
    } else {
      toast.error("يرجى سحب ملف صورة أو PDF");
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  // Save mutation
  const saveMutation = trpc.evidenceDetails.save.useMutation({
    onSuccess: (data) => {
      toast.success("تم حفظ بيانات الشاهد بنجاح");
      // Navigate to preview page with the returned evidenceDetailId
      setLocation(`/evidence/sub-preview/${data.evidenceDetailId}`);
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء الحفظ");
    },
  });
  
  // Preview PDF mutation
  const previewMutation = trpc.evidenceDetails.generatePreviewPDF.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob URL
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setPreviewPdfUrl(url);
      setShowPdfPreview(true);
      toast.success("تم توليد معاينة PDF");
    },
    onError: (error) => {
      toast.error(error.message || "حدث خطأ أثناء توليد المعاينة");
    },
  });
  
  const handlePreview = async () => {
    if (!subTemplateId || !profile) {
      toast.error("معلومات غير كاملة");
      return;
    }
    
    const dynamicFieldsData = {
      title,
      grade,
      beneficiaries,
      duration,
      location: executionLocation,
      studentsCount,
      lessonTitle,
      teacherName: profile.teacherName,
      principalName: profile.principalName || "",
      date: date,
      standardName: subTemplate?.standardId ? `المعيار ${subTemplate.standardId}` : "",
      evidenceName: subTemplate?.title || "",
      field1Label,
      field2Label,
      field3Label,
      field4Label,
      field5Label,
      field6Label,
      field7Label,
      field8Label,
      additionalFields: JSON.stringify(dynamicFields),
    };
    
    previewMutation.mutate({
      subTemplateId,
      description,
      dynamicFields: dynamicFieldsData,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      image1: image1Url,
      image2: image2Url,
    });
  };
  
  const handleSave = async () => {
    if (!subTemplateId || !profile) {
      toast.error("معلومات غير كاملة");
      return;
    }
    
    // Validation - allow saving even with empty fields
    // Teacher can fill them later
    
    // Images are already uploaded to S3 (image1Url, image2Url)
    
    const dynamicFieldsData = {
      title,
      grade,
      beneficiaries,
      duration,
      location: executionLocation,
      studentsCount,
      lessonTitle,
      teacherName: profile.teacherName,
      principalName: profile.principalName || "", // Principal name from profile
      date: date, // Use the editable date field
      standardName: subTemplate?.standardId ? `المعيار ${subTemplate.standardId}` : "",
      evidenceName: subTemplate?.title || "",
      // Custom field labels (editable by user for all templates)
      field1Label,
      field2Label,
      field3Label,
      field4Label,
      field5Label,
      field6Label,
      field7Label,
      field8Label,
      // Additional dynamic fields
      additionalFields: JSON.stringify(dynamicFields),
    };
    
    saveMutation.mutate({
      subTemplateId,
      templateId: subTemplate?.evidenceTemplateId || 30002,
      dynamicFields: dynamicFieldsData,
      section1,
      section2,
      section3,
      section4,
      section5,
      section6,
      image1: image1Url,
      image2: image2Url,
      theme: "default",
      // Visibility settings
      applicableStages: applicableStages.length > 0 ? JSON.stringify(applicableStages) : null,
      applicableSubjects: applicableSubjects.length > 0 ? JSON.stringify(applicableSubjects) : null,
      applicableGrades: applicableGrades.length > 0 ? JSON.stringify(applicableGrades) : null,
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
            <div className="flex gap-2">
              <Button 
                onClick={handlePreview} 
                disabled={previewMutation.isPending}
                variant="outline"
              >
                {previewMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 ml-2" />
                    معاينة PDF
                  </>
                )}
              </Button>
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
        
        {/* Visibility Settings */}
        {showVisibilitySettings && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-bold text-right mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              إعدادات الظهور
            </h3>
            <p className="text-sm text-muted-foreground text-right mb-4">
              حدد المراحل والمواد والصفوف التي سيظهر لها هذا الشاهد. اترك الكل فارغاً لجعله عاماً للجميع.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stages */}
              <div>
                <h4 className="font-semibold text-right mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  المراحل الدراسية
                </h4>
                <div className="space-y-2">
                  {['ابتدائي', 'متوسط', 'ثانوي'].map((stage) => (
                    <label key={stage} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applicableStages.includes(stage)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApplicableStages([...applicableStages, stage]);
                          } else {
                            setApplicableStages(applicableStages.filter(s => s !== stage));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Subjects */}
              <div>
                <h4 className="font-semibold text-right mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  المواد الدراسية
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {['رياضيات', 'علوم', 'لغة عربية', 'لغة إنجليزية', 'اجتماعيات', 'قرآن كريم', 'حاسب آلي', 'تربية فنية', 'تربية بدنية', 'أخرى'].map((subject) => (
                    <label key={subject} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applicableSubjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApplicableSubjects([...applicableSubjects, subject]);
                          } else {
                            setApplicableSubjects(applicableSubjects.filter(s => s !== subject));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Grades */}
              <div>
                <h4 className="font-semibold text-right mb-3 flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  الصفوف الدراسية
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => `الصف ${i + 1}`).map((grade) => (
                    <label key={grade} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applicableGrades.includes(grade)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApplicableGrades([...applicableGrades, grade]);
                          } else {
                            setApplicableGrades(applicableGrades.filter(g => g !== grade));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{grade}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-right">
                💡 <strong>ملاحظة:</strong> إذا لم تحدد أي خيار، سيظهر الشاهد لجميع المعلمين (عام).
              </p>
            </div>
          </div>
        )}

        
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
                معيار: {subTemplate?.standardId || "توظيف تقنيات ووسائل تعليم مناسبة"}
              </h3>
            </div>

            {/* اسم العنصر */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={subTemplateId === 102 ? "التواصل مع أولياء الأمور" : "استخدام التقنية الحديثة"}
                className="text-center font-semibold border-black"
              />
              <div className="border border-black p-3 text-right flex items-center justify-end">
                <span className="font-semibold">اسم العنصر</span>
              </div>
            </div>

            {/* جدول البيانات - 4 حقول للشاهد 102، 8 حقول للباقي */}
            {subTemplateId === 102 ? (
              // 4 حقول فقط للشاهد 102
              <>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field3Label}
                        onChange={(e) => setField3Label(e.target.value)}
                        placeholder="المستفيدون"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={beneficiaries}
                      onChange={(e) => setBeneficiaries(e.target.value)}
                      placeholder="أولياء الأمور"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field2Label}
                        onChange={(e) => setField2Label(e.target.value)}
                        placeholder="الوسائل المستخدمة"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={executionLocation}
                      onChange={(e) => setExecutionLocation(e.target.value)}
                      placeholder="منصة مدرستي - قروب الواتس - الرسائل النصية"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field1Label}
                        onChange={(e) => setField1Label(e.target.value)}
                        placeholder="مدة البرنامج"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="طوال العام"
                      className="border-0 p-0 h-auto text-sm"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field4Label}
                        onChange={(e) => setField4Label(e.target.value)}
                        placeholder="التاريخ"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-0 p-0 h-auto text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              // 8 حقول للشواهد الأخرى
              <>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field1Label}
                        onChange={(e) => setField1Label(e.target.value)}
                        placeholder="مدة البرنامج"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="طوال العام"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field3Label}
                        onChange={(e) => setField3Label(e.target.value)}
                        placeholder="المستفيدون"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={beneficiaries}
                      onChange={(e) => setBeneficiaries(e.target.value)}
                      placeholder="الطلاب"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field5Label}
                        onChange={(e) => setField5Label(e.target.value)}
                        placeholder="الصف"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="جميع الفصول"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field6Label}
                        onChange={(e) => setField6Label(e.target.value)}
                        placeholder="العنوان"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="التقنية في التعليم"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                </div>

                {/* 3 حقول */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field7Label}
                        onChange={(e) => setField7Label(e.target.value)}
                        placeholder="عدد الطلاب"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      value={studentsCount}
                      onChange={(e) => setStudentsCount(e.target.value)}
                      placeholder="جميع الطلاب"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field2Label}
                        onChange={(e) => setField2Label(e.target.value)}
                        placeholder="مكان التنفيذ"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                    value={executionLocation}
                    onChange={(e) => setExecutionLocation(e.target.value)}
                      placeholder="الفصل - مصادر التعلم"
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                  <div className="border border-black p-2">
                    <div className="relative group">
                      <Input
                        value={field4Label}
                        onChange={(e) => setField4Label(e.target.value)}
                        placeholder="التاريخ"
                        className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                      />
                      <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="border-0 p-0 h-auto text-sm text-center"
                    />
                  </div>
                </div>

                {/* عنوان الدرس */}
                <div className="border border-black p-2 mb-6">
                  <div className="relative group">
                    <Input
                      value={field8Label}
                      onChange={(e) => setField8Label(e.target.value)}
                      placeholder="عنوان الدرس"
                      className="text-xs text-gray-600 block mb-1 border-0 p-0 h-auto font-semibold pr-5 text-center"
                    />
                    <Pencil className="absolute left-0 top-0 w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="جميع المناهج المستندة"
                    className="border-0 p-0 h-auto text-sm text-center"
                  />
                </div>
                
                {/* الحقول الديناميكية */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  {dynamicFields.map((field, index) => (
                    <div key={index} className="border border-black p-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          const newFields = [...dynamicFields];
                          newFields.splice(index, 1);
                          setDynamicFields(newFields);
                        }}
                        className="absolute top-1 left-1 text-red-500 hover:text-red-700 z-10"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <label className="text-xs text-gray-600 block mb-1 text-center">
                        <Input
                          value={field.label}
                          onChange={(e) => {
                            const newFields = [...dynamicFields];
                            newFields[index].label = e.target.value;
                            setDynamicFields(newFields);
                          }}
                          placeholder="اسم الحقل"
                          className="border-0 p-0 h-auto text-xs text-center font-normal"
                        />
                      </label>
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...dynamicFields];
                          newFields[index].value = e.target.value;
                          setDynamicFields(newFields);
                        }}
                        placeholder="القيمة"
                        className="border-0 p-0 h-auto text-sm text-center"
                      />
                    </div>
                  ))}
                </div>
                
                {/* زر إضافة حقل */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDynamicFields([...dynamicFields, { label: "", value: "" }]);
                  }}
                  className="w-full mb-6 border-2 border-dashed border-gray-400 hover:border-blue-500 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة حقل جديد
                </Button>
              </>
            )}

            {/* مربع الوصف */}
            <div className="border-2 border-black rounded-lg p-6 relative" style={{ minHeight: '300px' }}>
              <div className="absolute top-2 right-2 border border-black px-3 py-1 bg-white">
                <span className="text-sm font-semibold">الوصف</span>
              </div>
              <Textarea
                dir="rtl"
                className="text-right mt-8 border-0 resize-none h-64 leading-relaxed"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل الوصف هنا..."
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
                <div className="text-sm">{profile?.schoolName || "الإدارة العامة للتعليم"}</div>
              </div>
              <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
                <span className="text-xs">QR</span>
              </div>
            </div>

            <div className="h-1 bg-gray-300 mb-6"></div>

            {/* عنوان المعيار */}
            <div className="border-2 border-black p-4 text-center mb-4">
              <h3 className="text-xl font-bold">
                معيار: {subTemplate?.standardId || "توظيف تقنيات ووسائل تعليم مناسبة"}
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
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section1}
                  onChange={(e) => setSection1(e.target.value)}
                />
              </div>

              {/* أهداف */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  أهداف
                </div>
                <Textarea
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section2}
                  onChange={(e) => setSection2(e.target.value)}
                />
              </div>

              {/* مقترحات */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  مقترحات
                </div>
                <Textarea
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section3}
                  onChange={(e) => setSection3(e.target.value)}
                />
              </div>

              {/* آلية التنفيذ */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  آلية التنفيذ
                </div>
                <Textarea
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section4}
                  onChange={(e) => setSection4(e.target.value)}
                />
              </div>

              {/* توصيات */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  توصيات
                </div>
                <Textarea
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section5}
                  onChange={(e) => setSection5(e.target.value)}
                />
              </div>

              {/* الوسائل المستخدمة */}
              <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
                <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                  الوسائل المستخدمة
                </div>
                <Textarea
                  dir="rtl"
                  className="text-right mt-6 text-sm leading-relaxed border-0 resize-none h-36"
                  value={section6}
                  onChange={(e) => setSection6(e.target.value)}
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
                  accept="image/*,application/pdf"
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
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 2)}
                />
              </div>
            </div>

            {/* التوقيع */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-3 text-right flex items-center justify-end">
                <span className="font-medium mr-2">{profile?.principalName || ""}</span>
                <span className="bg-[#00A896] text-white px-3 py-1 font-medium">مدير المدرسة</span>
              </div>
              <div className="border border-black p-3 text-right flex items-center justify-end">
                <span className="font-medium mr-2">{profile?.teacherName || ""}</span>
                <span className="bg-[#00A896] text-white px-3 py-1 font-medium">اسم المعلم</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* PDF Preview Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-6xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>معاينة PDF</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {previewPdfUrl && (
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowPdfPreview(false);
                if (previewPdfUrl) {
                  URL.revokeObjectURL(previewPdfUrl);
                  setPreviewPdfUrl(null);
                }
              }}
            >
              إغلاق
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ الشاهد
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
