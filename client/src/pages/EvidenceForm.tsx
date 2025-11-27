import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Loader2, Save, Upload } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute, useSearch } from "wouter";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";

export default function EvidenceForm() {
  const [, params] = useRoute("/evidence/:id");
  const search = useSearch();
  const evidenceId = params?.id ? parseInt(params.id) : null;
  const standardIdFromQuery = new URLSearchParams(search).get("standardId");
  const standardId = standardIdFromQuery ? parseInt(standardIdFromQuery) : null;
  
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  // Form state
  const [page1Title, setPage1Title] = useState("");
  const [page1Content, setPage1Content] = useState("");
  const [page2Title, setPage2Title] = useState("");
  const [page2Content, setPage2Content] = useState("");
  const [lessonName, setLessonName] = useState("");
  const [celebrationName, setCelebrationName] = useState("");
  const [initiativeName, setInitiativeName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [page1Images, setPage1Images] = useState<string[]>([]);
  const [page2Images, setPage2Images] = useState<string[]>([]);

  // Load existing evidence if editing
  const { data: evidence, isLoading: evidenceLoading } = trpc.evidence.getById.useQuery(
    { id: evidenceId! },
    { 
      enabled: evidenceId !== null && !!user
    }
  );

  // Update form when evidence data loads
  if (evidence && !page1Title) {
    setPage1Title(evidence.page1Title || "");
    setPage1Content(evidence.page1Content || "");
    setPage2Title(evidence.page2Title || "");
    setPage2Content(evidence.page2Content || "");
    setLessonName(evidence.lessonName || "");
    setCelebrationName(evidence.celebrationName || "");
    setInitiativeName(evidence.initiativeName || "");
    if (evidence.eventDate) {
      setEventDate(new Date(evidence.eventDate).toISOString().split('T')[0]);
    }
    if (evidence.page1Images) {
      try {
        setPage1Images(JSON.parse(evidence.page1Images));
      } catch {}
    }
    if (evidence.page2Images) {
      try {
        setPage2Images(JSON.parse(evidence.page2Images));
      } catch {}
    }
  }

  const { data: standard } = trpc.standards.getById.useQuery(
    { id: standardId || evidence?.standardId || 0 },
    { enabled: !!(standardId || evidence?.standardId) }
  );

  const createMutation = trpc.evidence.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الشاهد بنجاح");
      setLocation(`/standard/${standardId}`);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء إضافة الشاهد");
      console.error(error);
    },
  });

  const updateMutation = trpc.evidence.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الشاهد بنجاح");
      setLocation(`/standard/${evidence?.standardId}`);
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء تحديث الشاهد");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!page1Title.trim()) {
      toast.error("يرجى إدخال عنوان الصفحة الأولى");
      return;
    }

    const data = {
      page1Title,
      page1Content,
      page1Images: page1Images.length > 0 ? JSON.stringify(page1Images) : undefined,
      page2Title,
      page2Content,
      page2Images: page2Images.length > 0 ? JSON.stringify(page2Images) : undefined,
      lessonName: lessonName || undefined,
      celebrationName: celebrationName || undefined,
      initiativeName: initiativeName || undefined,
      eventDate: eventDate ? new Date(eventDate) : undefined,
    };

    if (evidenceId) {
      updateMutation.mutate({ id: evidenceId, ...data });
    } else if (standardId) {
      createMutation.mutate({
        standardId,
        evidenceTemplateId: 1, // Default template
        ...data,
      });
    }
  };

  if (authLoading || evidenceLoading) {
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
            <CardDescription>يجب تسجيل الدخول لإضافة أو تعديل الشواهد</CardDescription>
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

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation(standardId ? `/standard/${standardId}` : "/")}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">
                {evidenceId ? "تعديل الشاهد" : "إضافة شاهد جديد"}
              </h1>
              {standard && (
                <p className="text-sm text-muted-foreground">{standard.title}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الصفحة الأولى */}
          <Card>
            <CardHeader>
              <CardTitle>الصفحة الأولى - المعلومات الأساسية</CardTitle>
              <CardDescription>
                أدخل المعلومات الأساسية والنصوص التوضيحية للشاهد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page1Title">عنوان الصفحة الأولى *</Label>
                <Input
                  id="page1Title"
                  value={page1Title}
                  onChange={(e) => setPage1Title(e.target.value)}
                  placeholder="مثال: تطبيق استراتيجية التعلم النشط"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page1Content">المحتوى والنصوص</Label>
                <Textarea
                  id="page1Content"
                  value={page1Content}
                  onChange={(e) => setPage1Content(e.target.value)}
                  placeholder="اكتب الوصف التفصيلي للشاهد..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>الصور - الصفحة الأولى</Label>
                <ImageUpload 
                  images={page1Images} 
                  onImagesChange={setPage1Images}
                  maxImages={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* الصفحة الثانية */}
          <Card>
            <CardHeader>
              <CardTitle>الصفحة الثانية - التفاصيل الإضافية</CardTitle>
              <CardDescription>
                أضف معلومات تكميلية وتفاصيل إضافية للشاهد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="page2Title">عنوان الصفحة الثانية</Label>
                <Input
                  id="page2Title"
                  value={page2Title}
                  onChange={(e) => setPage2Title(e.target.value)}
                  placeholder="مثال: نتائج التطبيق"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page2Content">المحتوى الإضافي</Label>
                <Textarea
                  id="page2Content"
                  value={page2Content}
                  onChange={(e) => setPage2Content(e.target.value)}
                  placeholder="اكتب التفاصيل الإضافية..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label>الصور - الصفحة الثانية</Label>
                <ImageUpload 
                  images={page2Images} 
                  onImagesChange={setPage2Images}
                  maxImages={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* الحقول الإضافية */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
              <CardDescription>
                أضف معلومات خاصة بالشاهد (اختياري)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonName">اسم الدرس</Label>
                  <Input
                    id="lessonName"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    placeholder="مثال: درس الكسور"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">التاريخ</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="celebrationName">اسم الاحتفال</Label>
                  <Input
                    id="celebrationName"
                    value={celebrationName}
                    onChange={(e) => setCelebrationName(e.target.value)}
                    placeholder="مثال: اليوم الوطني"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initiativeName">اسم المبادرة</Label>
                  <Input
                    id="initiativeName"
                    value={initiativeName}
                    onChange={(e) => setInitiativeName(e.target.value)}
                    placeholder="مثال: مبادرة القراءة"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* أزرار الحفظ */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation(standardId ? `/standard/${standardId}` : "/")}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  {evidenceId ? "تحديث الشاهد" : "حفظ الشاهد"}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
