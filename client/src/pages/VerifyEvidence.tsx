import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, FileText } from "lucide-react";

export default function VerifyEvidence() {
  const params = useParams();
  const evidenceId = parseInt(params.id || "0");

  const { data: evidence, isLoading } = trpc.evidenceDetails.getById.useQuery(
    { id: evidenceId },
    { enabled: evidenceId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">وزارة التعليم</p>
                <h1 className="text-xl font-bold">التحقق من الشاهد</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">الشاهد غير موجود</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>الرجاء التحقق من الرابط والمحاولة مرة أخرى</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">وزارة التعليم</p>
              <h1 className="text-xl font-bold">التحقق من الشاهد</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Banner */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-green-900">تم التحقق بنجاح</h2>
                  <p className="text-green-700">هذا شاهد صحيح ومُسجّل في النظام</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الشاهد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الشاهد</p>
                  <p className="font-medium">{evidence.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="font-medium">{new Date(evidence.createdAt).toLocaleDateString('ar-SA')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
