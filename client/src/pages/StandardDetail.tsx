import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, ChevronDown, ChevronUp, Save, Upload, Check, Loader2, Search, Filter, X, SortAsc } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

interface QuickFillData {
  userFieldsData: Record<string, string>;
  image1?: File;
  image2?: File;
}

export default function StandardDetail() {
  const params = useParams<{ id: string }>();
  const standardId = parseInt(params.id || "0");
  // استخدام sonner toast
  
  // جلب بيانات المستخدم
  const { data: user } = trpc.auth.me.useQuery();

  // جلب بيانات المعيار
  const { data: standard, isLoading: loadingStandard } = trpc.standards.get.useQuery({ id: standardId });

  // جلب الشواهد المتاحة للمعيار
  const { data: templates, isLoading: loadingTemplates } = trpc.evidenceTemplates.list.useQuery({ standardId });

  // جلب تقدم الشواهد (فقط للمستخدمين المسجلين)
  const { data: progress } = trpc.standards.getProgress.useQuery(
    { standardId },
    { enabled: !!user } // تفعيل فقط إذا كان المستخدم مسجل
  );

  // State للتعبئة السريعة
  const [expandedTemplateId, setExpandedTemplateId] = useState<number | null>(null);
  const [quickFillData, setQuickFillData] = useState<Record<number, QuickFillData>>({});
  const [isSaving, setIsSaving] = useState<number | null>(null);
  const [savedTemplates, setSavedTemplates] = useState<Set<number>>(new Set());

  // State للبحث والفلترة
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("alphabetical");
  const [showFilters, setShowFilters] = useState(false);

  // Mutation للحفظ السريع
  const saveEvidenceMutation = trpc.userEvidences.create.useMutation();
  const uploadImageMutation = trpc.userEvidences.uploadImage.useMutation();
  const utils = trpc.useUtils();

  // حفظ واستعادة الفلاتر من localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`filters_standard_${standardId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSearchQuery(parsed.searchQuery || "");
        setSelectedSubject(parsed.selectedSubject || "all");
        setSelectedGrade(parsed.selectedGrade || "all");
        setSelectedStage(parsed.selectedStage || "all");
        setSortBy(parsed.sortBy || "alphabetical");
      } catch (e) {
        console.error("Error loading filters:", e);
      }
    }
  }, [standardId]);

  useEffect(() => {
    localStorage.setItem(`filters_standard_${standardId}`, JSON.stringify({
      searchQuery,
      selectedSubject,
      selectedGrade,
      selectedStage,
      sortBy
    }));
  }, [searchQuery, selectedSubject, selectedGrade, selectedStage, sortBy, standardId]);

  // استخراج قوائم المواد والصفوف والمراحل
  const { subjects, grades, stages } = useMemo(() => {
    if (!templates) return { subjects: [], grades: [], stages: [] };
    
    const subjectsSet = new Set<string>();
    const gradesSet = new Set<string>();
    const stagesSet = new Set<string>();

    templates.forEach((template: any) => {
      if (template.subject) subjectsSet.add(template.subject);
      if (template.stage) stagesSet.add(template.stage);
      if (template.grades) {
        try {
          const gradesList = JSON.parse(template.grades as string);
          gradesList.forEach((grade: string) => gradesSet.add(grade));
        } catch (e) {}
      }
    });

    return {
      subjects: Array.from(subjectsSet).sort(),
      grades: Array.from(gradesSet).sort(),
      stages: Array.from(stagesSet).sort()
    };
  }, [templates]);

  // فلترة وترتيب الشواهد
  const filteredAndSortedTemplates = useMemo(() => {
    if (!templates) return [];

    let filtered = templates.filter((template: any) => {
      // فلترة البحث
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = template.title?.toLowerCase().includes(query);
        const descMatch = template.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      // فلترة المادة
      if (selectedSubject !== "all" && template.subject !== selectedSubject) {
        return false;
      }

      // فلترة المرحلة
      if (selectedStage !== "all" && template.stage !== selectedStage) {
        return false;
      }

      // فلترة الصف
      if (selectedGrade !== "all") {
        try {
          const gradesList = JSON.parse(template.grades as string);
          if (!gradesList.includes(selectedGrade)) return false;
        } catch (e) {
          return false;
        }
      }

      return true;
    });

    // ترتيب
    if (sortBy === "alphabetical") {
      filtered = filtered.sort((a: any, b: any) => 
        (a.title || "").localeCompare(b.title || "", "ar")
      );
    } else if (sortBy === "newest") {
      filtered = filtered.sort((a: any, b: any) => b.id - a.id);
    } else if (sortBy === "mostUsed") {
      filtered = filtered.sort((a: any, b: any) => 
        (b.usageCount || 0) - (a.usageCount || 0)
      );
    }

    return filtered;
  }, [templates, searchQuery, selectedSubject, selectedGrade, selectedStage, sortBy]);

  // دالة لمسح الفلاتر
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSubject("all");
    setSelectedGrade("all");
    setSelectedStage("all");
    setSortBy("alphabetical");
  };

  // دالة لتوسيع/طي القائمة المنسدلة
  const toggleExpand = (templateId: number) => {
    if (expandedTemplateId === templateId) {
      setExpandedTemplateId(null);
    } else {
      setExpandedTemplateId(templateId);
      // تهيئة البيانات الافتراضية
      if (!quickFillData[templateId]) {
        const template = templates?.find((t: any) => t.id === templateId);
        if (template && template.userFields) {
          const userFields = JSON.parse(template.userFields as string);
          const defaultData: Record<string, string> = {};
          
          // قيم مقترحة افتراضية
          userFields.forEach((field: any) => {
            if (field.name === 'date' || field.name === 'التاريخ') {
              defaultData[field.name] = new Date().toISOString().split('T')[0];
            } else if (field.name === 'studentCount' || field.name === 'عدد الطلاب') {
              defaultData[field.name] = '25';
            } else if (field.name === 'class' || field.name === 'الصف') {
              defaultData[field.name] = 'الأول';
            } else {
              defaultData[field.name] = '';
            }
          });
          
          setQuickFillData({
            ...quickFillData,
            [templateId]: { userFieldsData: defaultData }
          });
        }
      }
    }
  };

  // دالة لتحديث حقل
  const updateField = (templateId: number, fieldName: string, value: string) => {
    setQuickFillData({
      ...quickFillData,
      [templateId]: {
        ...quickFillData[templateId],
        userFieldsData: {
          ...quickFillData[templateId]?.userFieldsData,
          [fieldName]: value
        }
      }
    });
  };

  // دالة لرفع صورة
  const handleImageUpload = (templateId: number, imageNumber: 1 | 2, file: File) => {
    setQuickFillData({
      ...quickFillData,
      [templateId]: {
        ...quickFillData[templateId],
        userFieldsData: quickFillData[templateId]?.userFieldsData || {},
        [`image${imageNumber}`]: file
      }
    });
  };

  // دالة للحفظ السريع
  const handleQuickSave = async (templateId: number) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setIsSaving(templateId);

    try {
      const template = templates?.find((t: any) => t.id === templateId);
      if (!template) throw new Error("القالب غير موجود");

      const data = quickFillData[templateId];
      if (!data) throw new Error("لا توجد بيانات للحفظ");

      // رفع الصور إلى S3 إذا وجدت
      let image1Url = null;
      let image2Url = null;

      if (data.image1) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.image1!);
        });
        const base64 = await base64Promise;
        const uploadResult = await uploadImageMutation.mutateAsync({
          imageData: base64,
          fileName: data.image1.name
        });
        image1Url = uploadResult.url;
      }

      if (data.image2) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.image2!);
        });
        const base64 = await base64Promise;
        const uploadResult = await uploadImageMutation.mutateAsync({
          imageData: base64,
          fileName: data.image2.name
        });
        image2Url = uploadResult.url;
      }

      // Parse page2Boxes من القالب
      const page2Boxes = JSON.parse(template.page2Boxes || "[]");

      // حفظ الشاهد
      await saveEvidenceMutation.mutateAsync({
        templateId,
        userData: JSON.stringify({
          description: template.description || "",
          userFieldsData: data.userFieldsData,
          page2BoxesData: page2Boxes
        }),
        image1Url,
        image2Url
      });

      // تحديث قائمة الشواهد المحفوظة
      setSavedTemplates(new Set(Array.from(savedTemplates).concat(templateId)));
      setExpandedTemplateId(null);

      // تحديث التقدم
      await utils.standards.getProgress.invalidate({ standardId });

      toast.success("تم حفظ الشاهد بنجاح");
    } catch (error: any) {
      console.error("Error saving evidence:", error);
      toast.error(error.message || "حدث خطأ أثناء حفظ الشاهد");
    } finally {
      setIsSaving(null);
    }
  };

  // Skeleton Loading بدلاً من شاشة التحميل الكاملة
  if (loadingStandard || loadingTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header Skeleton */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* معلومات المعيار Skeleton */}
          <Card className="mb-8 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <Skeleton className="h-8 w-3/4 bg-blue-400" />
              <Skeleton className="h-4 w-32 mt-2 bg-blue-400" />
            </CardHeader>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* عنوان الشواهد Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-8 w-48" />
          </div>

          {/* قائمة الشواهد Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">المعيار غير موجود</p>
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
            <div className="flex items-center gap-4">
              {/* مؤشر التقدم */}
              {user && progress && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    <div className="text-sm">
                      <span className="font-bold text-blue-900">{progress.completedCount}</span>
                      <span className="text-gray-600"> من </span>
                      <span className="font-bold text-blue-900">{progress.totalCount}</span>
                      <span className="text-gray-600"> شاهد</span>
                    </div>
                    <div className="text-xs text-blue-600 font-semibold">
                      {progress.percentage}%
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.percentage === 0 ? 'bg-red-500' :
                        progress.percentage === 100 ? 'bg-green-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
              <Link href="/standards">
                <Button variant="outline" size="sm">
                  <ArrowRight className="ml-2 w-4 h-4" />
                  العودة للمعايير
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* معلومات المعيار */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">
                  المعيار {standard.id}: {standard.title}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  الوزن النسبي: {standard.weight}%
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 leading-relaxed text-lg">
              {standard.description}
            </p>
          </CardContent>
        </Card>

        {/* قائمة الشواهد المتاحة */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FileText className="ml-2 w-6 h-6 text-blue-600" />
              الشواهد المتاحة
              <span className="mr-2 text-lg font-normal text-gray-600">
                ({filteredAndSortedTemplates.length} من {templates?.length || 0})
              </span>
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="ml-2 w-4 h-4" />
              {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            </Button>
          </div>

          {/* شريط البحث والفلاتر */}
          {showFilters && (
            <Card className="mb-6 shadow-md">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* شريط البحث */}
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="ابحث بالاسم أو الوصف..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* الفلاتر */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* فلتر المادة */}
                    <div>
                      <Label htmlFor="subject-filter" className="text-sm font-semibold mb-2 block">
                        المادة
                      </Label>
                      <select
                        id="subject-filter"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">جميع المواد</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* فلتر الصف */}
                    <div>
                      <Label htmlFor="grade-filter" className="text-sm font-semibold mb-2 block">
                        الصف
                      </Label>
                      <select
                        id="grade-filter"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">جميع الصفوف</option>
                        {grades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* فلتر المرحلة */}
                    <div>
                      <Label htmlFor="stage-filter" className="text-sm font-semibold mb-2 block">
                        المرحلة
                      </Label>
                      <select
                        id="stage-filter"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">جميع المراحل</option>
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* فلتر الترتيب */}
                    <div>
                      <Label htmlFor="sort-filter" className="text-sm font-semibold mb-2 block">
                        الترتيب
                      </Label>
                      <select
                        id="sort-filter"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="alphabetical">أبجدي</option>
                        <option value="newest">الأحدث</option>
                        <option value="mostUsed">الأكثر استخداماً</option>
                      </select>
                    </div>
                  </div>

                  {/* زر مسح الفلاتر */}
                  {(searchQuery || selectedSubject !== "all" || selectedGrade !== "all" || selectedStage !== "all" || sortBy !== "alphabetical") && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                      >
                        <X className="ml-2 w-4 h-4" />
                        مسح جميع الفلاتر
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {!templates || filteredAndSortedTemplates.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد شواهد متاحة لهذا المعيار حالياً</p>
              <p className="text-gray-400 text-sm mt-2">سيتم إضافة المزيد من الشواهد قريباً</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTemplates.map((template: any) => {
              const isExpanded = expandedTemplateId === template.id;
              const isSaved = savedTemplates.has(template.id);
              const userFields = template.userFields ? JSON.parse(template.userFields as string) : [];

              return (
                <Card key={template.id} className="shadow-md hover:shadow-xl transition-shadow duration-300 group relative">
                  {/* أيقونة ✓ إذا تم الحفظ */}
                  {isSaved && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {template.description || "لا يوجد وصف"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {template.grades && (
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(template.grades as string).map((grade: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {grade}
                            </span>
                          ))}
                        </div>
                      )}
                      {template.subject && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">المادة:</span> {template.subject}
                        </div>
                      )}
                    </div>

                    {/* زر التعبئة الكاملة */}
                    <Link href={`/evidence/fill/${template.id}`}>
                      <Button className="w-full group-hover:bg-blue-700 transition-colors mb-2">
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        ابدأ التعبئة
                      </Button>
                    </Link>

                    {/* زر التعبئة السريعة */}
                    {user && userFields.length > 0 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleExpand(template.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="mr-2 w-4 h-4" />
                            إخفاء التعبئة السريعة
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 w-4 h-4" />
                            تعبئة سريعة
                          </>
                        )}
                      </Button>
                    )}

                    {/* القائمة المنسدلة للتعبئة السريعة */}
                    {isExpanded && user && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          ⚡ تعبئة سريعة (القيم المقترحة يمكن تعديلها)
                        </p>

                        {/* الحقول الديناميكية */}
                        {userFields.map((field: any, idx: number) => (
                          <div key={idx}>
                            <Label htmlFor={`quick-${template.id}-${field.name}`} className="text-xs">
                              {field.label}
                            </Label>
                            <Input
                              id={`quick-${template.id}-${field.name}`}
                              type={field.type === 'date' ? 'date' : 'text'}
                              value={quickFillData[template.id]?.userFieldsData?.[field.name] || ''}
                              onChange={(e) => updateField(template.id, field.name, e.target.value)}
                              className="mt-1"
                              placeholder={field.placeholder || ''}
                            />
                          </div>
                        ))}

                        {/* رفع الصور (اختياري) */}
                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs text-gray-500 mb-2">
                            📸 الصور (اختياري - يمكنك استخدام الصور الافتراضية)
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`quick-img1-${template.id}`} className="text-xs">
                                صورة 1
                              </Label>
                              <Input
                                id={`quick-img1-${template.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(template.id, 1, file);
                                }}
                                className="mt-1 text-xs"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`quick-img2-${template.id}`} className="text-xs">
                                صورة 2
                              </Label>
                              <Input
                                id={`quick-img2-${template.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(template.id, 2, file);
                                }}
                                className="mt-1 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* أزرار الحفظ والإلغاء */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleQuickSave(template.id)}
                            disabled={isSaving === template.id}
                          >
                            {isSaving === template.id ? (
                              <>
                                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                جاري الحفظ...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 w-4 h-4" />
                                حفظ
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedTemplateId(null)}
                            disabled={isSaving === template.id}
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
