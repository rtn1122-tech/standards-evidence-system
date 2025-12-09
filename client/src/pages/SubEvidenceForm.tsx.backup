import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Save, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function SubEvidenceForm() {
  const [, params] = useRoute("/evidence/sub/:subTemplateId");
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
  
  // Page 1 - Dynamic fields
  const [executor, setExecutor] = useState("");
  const [contributors, setContributors] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  
  // Page 2 - Text sections (pre-filled from database)
  const [section1, setSection1] = useState(""); // المقدمة
  const [section2, setSection2] = useState(""); // الأهداف
  const [section3, setSection3] = useState(""); // الإجراءات
  const [section4, setSection4] = useState(""); // النتائج
  const [section5, setSection5] = useState(""); // التحليل والمناقشة
  const [section6, setSection6] = useState(""); // التوصيات
  // Note: Only 6 sections in new schema
  
  // Images
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string>("/placeholder-image-1.jpg");
  const [image2Preview, setImage2Preview] = useState<string>("/placeholder-image-2.jpg");
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // Pre-fill sections when data loads
  useEffect(() => {
    if (subTemplate) {
      console.log("🔍 SubTemplate Data:", subTemplate);
      console.log("📝 Title:", subTemplate.title);
      console.log("📄 Description:", subTemplate.description);
      setSection1(subTemplate.section1Content || "");
      setSection2(subTemplate.section2Content || "");
      setSection3(subTemplate.section3Content || "");
      setSection4(subTemplate.section4Content || "");
      setSection5(subTemplate.section5Content || "");
      setSection6(subTemplate.section6Content || "");
      // Note: Only 6 sections in new schema
    }
  }, [subTemplate]);
  
  // Handle image upload
  const handleImageUpload = (file: File, imageNumber: 1 | 2) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (imageNumber === 1) {
        setImage1(file);
        setImage1Preview(reader.result as string);
      } else {
        setImage2(file);
        setImage2Preview(reader.result as string);
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
    
    if (!executor.trim() || !beneficiaries.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة (المنفذ والمستفيدون)");
      return;
    }
    
    // Upload images to S3 if they exist
    let image1Url = null;
    let image2Url = null;
    
    // TODO: Implement image upload to S3
    // For now, we'll save without images
    
    const dynamicFields = {
      executor,
      contributors,
      beneficiaries,
      teacherName: profile.teacherName,
      date: new Date().toISOString(),
      standardName: subTemplate?.standardId ? `المعيار ${subTemplate.standardId}` : "",
      evidenceName: subTemplate?.title || "",
    };
    
    saveMutation.mutate({
      subTemplateId,
      templateId: subTemplate.evidenceTemplateId || 30002, // Default to 30002 if not found
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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>يرجى تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = "/api/oauth/login")} className="w-full">
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                رجوع
              </Button>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">نموذج تعبئة الشاهد</h1>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 ml-2" />
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Evidence Title */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-right">{subTemplate.title}</CardTitle>
            {subTemplate.description && (
              <p className="text-sm text-muted-foreground text-right">{subTemplate.description}</p>
            )}
          </CardHeader>
        </Card>
        
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
        
        {/* Page 1 - Dynamic Fields */}
        {currentPage === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-filled fields (read-only) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اسم المعلم</Label>
                    <Input value={profile?.teacherName || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ</Label>
                    <Input value={new Date().toLocaleDateString("ar-SA")} disabled />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المعيار</Label>
                    <Input value={`المعيار ${subTemplate.standardId}`} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>اسم الشاهد</Label>
                    <Input value={subTemplate.title} disabled />
                  </div>
                </div>
                
                {/* User-filled fields */}
                <div className="space-y-2">
                  <Label htmlFor="executor">المنفذ *</Label>
                  <Input
                    id="executor"
                    value={executor}
                    onChange={(e) => setExecutor(e.target.value)}
                    placeholder="أدخل اسم المنفذ"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contributors">ساهم في التنفيذ</Label>
                  <Input
                    id="contributors"
                    value={contributors}
                    onChange={(e) => setContributors(e.target.value)}
                    placeholder="أدخل أسماء المساهمين (اختياري)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="beneficiaries">المستفيدون *</Label>
                  <Input
                    id="beneficiaries"
                    value={beneficiaries}
                    onChange={(e) => setBeneficiaries(e.target.value)}
                    placeholder="أدخل المستفيدين (مثال: طلاب الصف الثالث)"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Images Section */}
            <Card>
              <CardHeader>
                <CardTitle>الصور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Image 1 */}
                  <div className="space-y-2">
                    <Label>الصورة الأولى</Label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors relative"
                      onDrop={(e) => handleDrop(e, 1)}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById("image1-input")?.click()}
                    >
                      {image1Preview ? (
                        <div className="relative">
                          <img
                            src={image1Preview}
                            alt="معاينة الصورة 1"
                            className="w-full h-48 object-cover rounded"
                          />
                          {image1 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImage1(null);
                                setImage1Preview("/placeholder-image-1.jpg");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="py-8">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">اسحب الصورة هنا أو انقر للاختيار</p>
                        </div>
                      )}
                      <input
                        id="image1-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 1);
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Image 2 */}
                  <div className="space-y-2">
                    <Label>الصورة الثانية</Label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/50 transition-colors relative"
                      onDrop={(e) => handleDrop(e, 2)}
                      onDragOver={handleDragOver}
                      onClick={() => document.getElementById("image2-input")?.click()}
                    >
                      {image2Preview ? (
                        <div className="relative">
                          <img
                            src={image2Preview}
                            alt="معاينة الصورة 2"
                            className="w-full h-48 object-cover rounded"
                          />
                          {image2 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImage2(null);
                                setImage2Preview("/placeholder-image-2.jpg");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="py-8">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">اسحب الصورة هنا أو انقر للاختيار</p>
                        </div>
                      )}
                      <input
                        id="image2-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 2);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Page 2 - Text Sections */}
        {currentPage === 2 && (
          <div className="space-y-6">
            {/* Section 1 */}
            <Card>
              <CardHeader>
                <CardTitle>{subTemplate?.section1Title || "القسم الأول"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section1}
                  onChange={(e) => setSection1(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder="أدخل المقدمة..."
                />
              </CardContent>
            </Card>
            
            {/* Section 2 */}
            <Card>
              <CardHeader>
                <CardTitle>{subTemplate?.section2Title || "القسم الثاني"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section2}
                  onChange={(e) => setSection2(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder="أدخل الأهداف..."
                />
              </CardContent>
            </Card>
            
            {/* Section 3 - الإجراءات */}
            <Card>
              <CardHeader>
                <CardTitle>{subTemplate?.section3Title || "القسم الثالث"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section3}
                  onChange={(e) => setSection3(e.target.value)}
                  rows={8}
                  className="w-full"
                  placeholder="أدخل الإجراءات..."
                />
              </CardContent>
            </Card>
            
            {/* Section 4 - النتائج */}
            <Card>
              <CardHeader>
                <CardTitle>{subTemplate?.section4Title || "القسم الرابع"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section4}
                  onChange={(e) => setSection4(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder="أدخل النتائج..."
                />
              </CardContent>
            </Card>
            
            {/* Section 5 - التحليل والمناقشة */}
            <Card>
              <CardHeader>
                <CardTitle>التحليل والمناقشة</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section5}
                  onChange={(e) => setSection5(e.target.value)}
                  rows={8}
                  className="w-full"
                  placeholder="أدخل التحليل والمناقشة..."
                />
              </CardContent>
            </Card>
            
            {/* Section 6 - التوصيات */}
            <Card>
              <CardHeader>
                <CardTitle>{subTemplate?.section5Title || "القسم الخامس"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={section6}
                  onChange={(e) => setSection6(e.target.value)}
                  rows={6}
                  className="w-full"
                  placeholder="أدخل التوصيات..."
                />
              </CardContent>
            </Card>
            

          </div>
        )}
        
        {/* Bottom Navigation */}
        <div className="flex justify-between mt-8">
          {currentPage === 2 && (
            <Button variant="outline" onClick={() => setCurrentPage(1)}>
              الصفحة السابقة
            </Button>
          )}
          {currentPage === 1 && (
            <Button onClick={() => setCurrentPage(2)} className="mr-auto">
              الصفحة التالية
            </Button>
          )}
          {currentPage === 2 && (
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="mr-auto">
              <Save className="h-4 w-4 ml-2" />
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
