import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { User, School, MapPin, BookOpen, GraduationCap, Mail, Phone, CreditCard, Briefcase, Edit } from "lucide-react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = trpc.teacherProfile.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: standards = [] } = trpc.standards.list.useQuery();

  const { data: progressData } = trpc.standards.getProgress.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: myEvidences = [] } = trpc.evidenceDetails.getUserEvidenceDetails.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">لوحة البيانات الرئيسية</h1>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            العودة للرئيسية
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* التقدم الإجمالي */}
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

          {/* معلومات الملف الشخصي */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>معلومات الملف الشخصي</CardTitle>
                <CardDescription>البيانات الأساسية للمعلم</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/profile-setup")}>
                <Edit className="h-4 w-4 ml-1" />
                تعديل
              </Button>
            </CardHeader>
            <CardContent>
              {!profile ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">لم يتم إعداد الملف الشخصي بعد</p>
                  <Button onClick={() => setLocation("/profile-setup")}>
                    إعداد الملف الشخصي الآن
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {/* المعلومات الأساسية */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">المعلومات الأساسية</h3>
                    
                    {profile.teacherName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">اسم المعلم</p>
                          <p className="font-medium">{profile.teacherName}</p>
                        </div>
                      </div>
                    )}

                    {profile.gender && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">الجنس</p>
                          <Badge variant="secondary">
                            {profile.gender === "male" ? "معلم" : "معلمة"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {profile.educationDepartment && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">إدارة التعليم</p>
                          <p className="font-medium">{profile.educationDepartment}</p>
                        </div>
                      </div>
                    )}

                    {profile.schoolName && (
                      <div className="flex items-start gap-3">
                        <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">اسم المدرسة</p>
                          <p className="font-medium">{profile.schoolName}</p>
                        </div>
                      </div>
                    )}

                    {profile.principalName && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">اسم المدير</p>
                          <p className="font-medium">{profile.principalName}</p>
                        </div>
                      </div>
                    )}

                    {profile.stage && (
                      <div className="flex items-start gap-3">
                        <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">المراحل التعليمية</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(profile.stage.startsWith('[') ? JSON.parse(profile.stage) : [profile.stage]).map((stage: string) => (
                              <Badge key={stage} variant="outline">{stage}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {profile.subjects && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">المواد التدريسية</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {JSON.parse(profile.subjects).map((subject: string) => (
                              <Badge key={subject} variant="outline">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* المعلومات الإضافية */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">المعلومات الإضافية</h3>

                    {profile.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>
                    )}

                    {profile.phoneNumber && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">رقم الجوال</p>
                          <p className="font-medium">{profile.phoneNumber}</p>
                        </div>
                      </div>
                    )}

                    {profile.professionalLicenseNumber && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">رقم الرخصة المهنية</p>
                          <p className="font-medium">{profile.professionalLicenseNumber}</p>
                        </div>
                      </div>
                    )}

                    {(profile.licenseStartDate || profile.licenseEndDate) && (
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">تاريخ الرخصة</p>
                          <p className="font-medium">
                            {profile.licenseStartDate && new Date(profile.licenseStartDate).toLocaleDateString('ar-SA')}
                            {profile.licenseStartDate && profile.licenseEndDate && " - "}
                            {profile.licenseEndDate && new Date(profile.licenseEndDate).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    )}

                    {profile.employeeNumber && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">الرقم الوظيفي</p>
                          <p className="font-medium">{profile.employeeNumber}</p>
                        </div>
                      </div>
                    )}

                    {profile.jobTitle && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">المسمى الوظيفي</p>
                          <p className="font-medium">{profile.jobTitle}</p>
                        </div>
                      </div>
                    )}

                    {!profile.email && !profile.phoneNumber && !profile.professionalLicenseNumber && 
                     !profile.employeeNumber && !profile.jobTitle && (
                      <p className="text-sm text-muted-foreground">
                        لا توجد معلومات إضافية مضافة
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* إحصائيات سريعة */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الشواهد</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myEvidences.length}</div>
                <p className="text-xs text-muted-foreground">
                  من 11 شاهد متاح
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نسبة الإنجاز</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{((myEvidences.length / 11) * 100).toFixed(0)}%</div>
                <Progress value={(myEvidences.length / 11) * 100} className="h-2 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">المعايير المكتملة</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <p className="text-xs text-muted-foreground">
                  من {totalCount} معيار
                </p>
              </CardContent>
            </Card>
          </div>

          {/* آخر الشواهد المضافة */}
          {myEvidences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>آخر الشواهد المضافة</CardTitle>
                <CardDescription>آخر 5 شواهد تم حفظها</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {myEvidences.slice(0, 5).map((evidence: any) => (
                    <div key={evidence.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium">{evidence.evidenceSubTemplate?.title || 'شاهد'}</p>
                        <p className="text-sm text-muted-foreground">
                          المعيار {evidence.evidenceSubTemplate?.standardId}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/evidence/sub-preview/${evidence.id}`)}
                      >
                        عرض
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ملخص المعايير */}
          <Card>
            <CardHeader>
              <CardTitle>ملخص المعايير المهنية</CardTitle>
              <CardDescription>التقدم في كل معيار من المعايير الـ 11</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {standards.map((standard) => {
                  const standardEvidences = myEvidences.filter(
                    (e: any) => e.evidenceSubTemplate?.standardId === standard.id
                  );
                  const standardProgress = standardEvidences.length > 0 ? 100 : 0;
                  
                  return (
                    <div key={standard.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {standard.id}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{standard.title}</p>
                          <p className="text-sm text-muted-foreground">{standard.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={standardProgress} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {standardEvidences.length}/1
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{standard.weight}%</Badge>
                        <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                          عرض الشواهد
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
