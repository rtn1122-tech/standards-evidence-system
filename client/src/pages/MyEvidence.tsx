import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Edit, Trash2, Loader2, FileText } from "lucide-react";
import { useState } from "react";

export default function MyEvidence() {
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const { data: evidenceList, isLoading, refetch } = trpc.evidenceDetails.list.useQuery();

  const deleteMutation = trpc.evidenceDetails.delete.useMutation({
    onSuccess: () => {
      setDeletingId(null);
      refetch();
      alert("✅ تم حذف الشاهد بنجاح");
    },
    onError: (error) => {
      setDeletingId(null);
      alert(`❌ خطأ في حذف الشاهد: ${error.message}`);
    },
  });

  const generatePDF = trpc.evidenceDetails.generatePDF.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadingId(null);
      alert(`✅ تم تحميل الملف بنجاح: ${data.filename}`);
    },
    onError: (error) => {
      setDownloadingId(null);
      alert(`❌ خطأ في توليد PDF: ${error.message}`);
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`هل أنت متأكد من حذف الشاهد "${title}"؟`)) {
      setDeletingId(id);
      deleteMutation.mutate({ id });
    }
  };

  const handleDownloadPDF = (id: number) => {
    setDownloadingId(id);
    generatePDF.mutate({ evidenceDetailId: id });
  };

  const handleEdit = (id: number) => {
    navigate(`/evidence/sub-new/${id}`);
  };

  const generateAllPDF = trpc.evidenceDetails.generateAllPDF.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadingAll(false);
      alert(`✅ تم تحميل الملف بنجاح: ${data.filename}`);
    },
    onError: (error) => {
      setDownloadingAll(false);
      alert(`❌ خطأ في توليد PDF: ${error.message}`);
    },
  });

  const handleDownloadAllPDF = () => {
    if (!evidenceList || evidenceList.length === 0) {
      alert('لا توجد شواهد لتحميلها');
      return;
    }
    setDownloadingAll(true);
    generateAllPDF.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-teal-700 mb-2">
                شواهدي المحفوظة
              </h1>
              <p className="text-gray-600">
                جميع الشواهد التي قمت بإكمالها ({evidenceList?.length || 0} شاهد)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadAllPDF}
                disabled={downloadingAll || !evidenceList || evidenceList.length === 0}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {downloadingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 ml-2" />
                    تحميل جميع الشواهد PDF
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-teal-300 text-teal-700 hover:bg-teal-50"
              >
                العودة للصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>

        {/* Evidence List */}
        {!evidenceList || evidenceList.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد شواهد محفوظة
            </h3>
            <p className="text-gray-500 mb-6">
              ابدأ بإضافة شواهد جديدة من الصفحة الرئيسية
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-teal-600 hover:bg-teal-700"
            >
              إضافة شاهد جديد
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {evidenceList.map((evidence) => (
              <Card key={evidence.id} className="p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  {/* Evidence Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {evidence.subTemplateTitle || "شاهد"}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {evidence.subTemplateDescription || ""}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        تاريخ الإنشاء: {new Date(evidence.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                      {evidence.updatedAt && evidence.updatedAt !== evidence.createdAt && (
                        <span>
                          آخر تحديث: {new Date(evidence.updatedAt).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleDownloadPDF(evidence.id)}
                      disabled={downloadingId === evidence.id}
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {downloadingId === evidence.id ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التحميل...
                        </>
                      ) : (
                        <>
                          <Download className="ml-2 h-4 w-4" />
                          تحميل PDF
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleEdit(evidence.id)}
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="ml-2 h-4 w-4" />
                      تعديل
                    </Button>

                    <Button
                      onClick={() => handleDelete(evidence.id, evidence.subTemplateTitle || "شاهد")}
                      disabled={deletingId === evidence.id}
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      {deletingId === evidence.id ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الحذف...
                        </>
                      ) : (
                        <>
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
