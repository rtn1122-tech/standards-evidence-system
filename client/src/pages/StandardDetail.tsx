import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, FileText, Plus, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function StandardDetail() {
  const params = useParams<{ id: string }>();
  const standardId = parseInt(params.id || "0");
  const { user } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: standard, isLoading: standardLoading } = trpc.standards.getById.useQuery({ id: standardId });
  const { data: evidenceList, isLoading: evidenceLoading } = trpc.evidence.getByStandardId.useQuery({ standardId });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvidence, setNewEvidence] = useState({ title: "", description: "" });
  
  const createMutation = trpc.evidence.create.useMutation({
    onSuccess: () => {
      utils.evidence.getByStandardId.invalidate({ standardId });
      setIsAddDialogOpen(false);
      setNewEvidence({ title: "", description: "" });
      toast.success("تم إضافة الشاهد بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    }
  });
  
  const deleteMutation = trpc.evidence.delete.useMutation({
    onSuccess: () => {
      utils.evidence.getByStandardId.invalidate({ standardId });
      toast.success("تم حذف الشاهد بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    }
  });

  const handleAddEvidence = () => {
    if (!newEvidence.title.trim()) {
      toast.error("يرجى إدخال عنوان الشاهد");
      return;
    }
    
    createMutation.mutate({
      standardId,
      title: newEvidence.title,
      description: newEvidence.description,
    });
  };

  if (standardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">المعيار غير موجود</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </header>

      {/* Standard Info */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-3xl">المعيار {standard.orderIndex}</CardTitle>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-lg font-medium">
                  {standard.orderIndex}
                </div>
              </div>
              <CardTitle className="text-2xl mb-4">{standard.title}</CardTitle>
              <CardDescription className="text-base">
                {standard.description || "لا يوجد وصف لهذا المعيار"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Evidence Section */}
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">الشواهد المرتبطة</h3>
            {user && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة شاهد
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة شاهد جديد</DialogTitle>
                    <DialogDescription>
                      أضف شاهداً جديداً للمعيار {standard.orderIndex}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">عنوان الشاهد</Label>
                      <Input
                        id="title"
                        value={newEvidence.title}
                        onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })}
                        placeholder="أدخل عنوان الشاهد"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">الوصف</Label>
                      <Textarea
                        id="description"
                        value={newEvidence.description}
                        onChange={(e) => setNewEvidence({ ...newEvidence, description: e.target.value })}
                        placeholder="أدخل وصف الشاهد (اختياري)"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleAddEvidence} disabled={createMutation.isPending}>
                      {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {evidenceLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : evidenceList && evidenceList.length > 0 ? (
            <div className="space-y-4">
              {evidenceList.map((evidence) => (
                <Card key={evidence.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{evidence.title}</CardTitle>
                        <CardDescription className="text-base">
                          {evidence.description || "لا يوجد وصف"}
                        </CardDescription>
                        {evidence.fileUrl && (
                          <a 
                            href={evidence.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-3"
                          >
                            <ExternalLink className="h-4 w-4 ml-1" />
                            عرض الملف المرفق
                          </a>
                        )}
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا الشاهد؟")) {
                              deleteMutation.mutate({ id: evidence.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">لا توجد شواهد لهذا المعيار بعد</p>
                {user && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول شاهد
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
