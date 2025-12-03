import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Plus, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STAGES, SUBJECTS } from "@/../../shared/constants";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // حالة البحث والتصفية
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const { data: profile, isLoading: profileLoading } = trpc.teacherProfile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: standards = [], isLoading: standardsLoading } = trpc.standards.list.useQuery();

  const { data: progressData } = trpc.standards.getProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || profileLoading || standardsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">نظام الأداء المهني للمعلمين</h1>
              </div>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </div>
        </header>

        <main className="flex-1 container py-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">نظام توثيق الأداء المهني</h2>
              <p className="text-lg text-muted-foreground">
                نظام متكامل لتوثيق وإدارة معايير الأداء المهني للمعلمين والمعلمات
              </p>
            </div>

            <Card className="text-right">
              <CardHeader>
                <CardTitle>المعايير المهنية</CardTitle>
                <CardDescription>11 معياراً للأداء المهني المتميز</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {standards.map((standard) => (
                    <div key={standard.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{standard.title}</p>
                        <p className="text-sm text-muted-foreground">{standard.description}</p>
                      </div>
                      <Badge variant="secondary">{standard.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button size="lg" asChild>
              <a href={getLoginUrl()}>ابدأ الآن</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const needsProfile = !profile;
  const totalProgress = progressData?.totalProgress || 0;
  const completedCount = progressData?.completedCount || 0;
  const totalCount = progressData?.totalCount || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">نظام الأداء المهني للمعلمين</h1>
                <p className="text-xs text-muted-foreground">مرحباً، {user?.name || "المستخدم"}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation("/my-evidence")}>
                شواهدي
              </Button>
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                لوحة البيانات
              </Button>
            </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {needsProfile && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>يرجى إكمال معلومات الملف الشخصي للبدء</span>
                <Button size="sm" onClick={() => setLocation("/profile-setup")}>
                  إعداد الملف الشخصي الآن
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!needsProfile && (
            <Card>
              <CardHeader>
                <CardTitle>التقدم الإجمالي</CardTitle>
                <CardDescription>
                  أكملت {completedCount} من {totalCount} معيار
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={totalProgress} className="h-3" />
                <p className="text-center text-sm text-muted-foreground">
                  {totalProgress.toFixed(0)}% مكتمل
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>المعايير المهنية</CardTitle>
              <CardDescription>اضغط على أي معيار لعرض الشواهد المرتبطة به</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* واجهة البحث والتصفية */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">البحث والتصفية</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  {/* شريط البحث */}
                  <div className="relative">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث في الشواهد..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  {/* تصفية المرحلة */}
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المراحل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المراحل</SelectItem>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* تصفية المادة */}
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع المواد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المواد</SelectItem>
                      {SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* عداد الفلاتر النشطة */}
                {(searchQuery || selectedStage !== "all" || selectedSubject !== "all") && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
                    {searchQuery && (
                      <Badge variant="secondary" className="gap-1">
                        بحث: {searchQuery}
                      </Badge>
                    )}
                    {selectedStage !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        مرحلة: {selectedStage}
                      </Badge>
                    )}
                    {selectedSubject !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        مادة: {selectedSubject}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedStage("all");
                        setSelectedSubject("all");
                      }}
                      className="h-7 text-xs"
                    >
                      إعادة تعيين
                    </Button>
                  </div>
                )}
              </div>

              <Accordion type="single" collapsible className="w-full">
                {standards.map((standard) => (
                  <StandardAccordionItem
                    key={standard.id}
                    standard={standard}
                    disabled={needsProfile}
                    searchQuery={searchQuery}
                    selectedStage={selectedStage}
                    selectedSubject={selectedSubject}
                  />
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StandardAccordionItem({
  standard,
  disabled,
  searchQuery,
  selectedStage,
  selectedSubject,
}: {
  standard: { id: number; title: string; description: string | null; weight: number };
  disabled: boolean;
  searchQuery: string;
  selectedStage: string;
  selectedSubject: string;
}) {
  const [, setLocation] = useLocation();
  
  const { data: evidenceSubTemplates = [], isLoading } = trpc.evidenceSubTemplates.listByStandard.useQuery(
    { standardId: standard.id },
    { enabled: !disabled }
  );

  const { data: userEvidences = [] } = trpc.evidenceDetails.getUserEvidenceDetails.useQuery(
    undefined,
    { enabled: !disabled }
  );

  // تطبيق التصفية على الشواهد (فقط البحث حالياً)
  const filteredSubTemplates = evidenceSubTemplates.filter((template) => {
    // تصفية البحث
    if (searchQuery && !template.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !(template.description || "").toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // حساب التقدم بناءً على الشواهد المكتملة
  const completedSubTemplateIds = new Set(
    userEvidences
      .filter((e: any) => e.evidenceSubTemplateId)
      .map((e: any) => e.evidenceSubTemplateId)
  );
  const completedCount = filteredSubTemplates.filter((st: any) => 
    completedSubTemplateIds.has(st.id)
  ).length;
  const totalCount = filteredSubTemplates.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // إخفاء المعيار إذا لم تكن هناك شواهد بعد التصفية
  if (filteredSubTemplates.length === 0 && (searchQuery || selectedStage !== "all" || selectedSubject !== "all")) {
    return null;
  }

  return (
    <AccordionItem value={`standard-${standard.id}`}>
      <AccordionTrigger className="hover:no-underline" disabled={disabled}>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
              {standard.id}
            </div>
            <div className="text-right">
              <p className="font-semibold">{standard.title}</p>
              <p className="text-sm text-muted-foreground">{standard.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{standard.weight}%</Badge>
            {!disabled && (
              <Badge variant={progress === 100 ? "default" : "outline"}>
                {completedCount}/{totalCount}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="px-4">
              <p className="text-sm font-medium">الشواهد ({totalCount})</p>
            </div>

            {filteredSubTemplates.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                {(searchQuery || selectedStage !== "all" || selectedSubject !== "all") 
                  ? "لا توجد شواهد مطابقة للفلاتر المختارة"
                  : "لا توجد شواهد مضافة لهذا المعيار"}
              </p>
            ) : (
              <div className="grid gap-2 px-4">
                {filteredSubTemplates.map((subTemplate: any) => {
                  const isCompleted = completedSubTemplateIds.has(subTemplate.id);
                  const userEvidence = userEvidences.find(
                    (e: any) => e.evidenceSubTemplateId === subTemplate.id
                  );
                  
                  return (
                    <div
                      key={subTemplate.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (userEvidence) {
                          setLocation(`/evidence/sub-preview/${userEvidence.id}`);
                        } else {
                          setLocation(`/evidence/sub/${subTemplate.id}`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className="font-medium">{subTemplate.title}</span>
                      </div>
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-600">
                          مكتمل
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

