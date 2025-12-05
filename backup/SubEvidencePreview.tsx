import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";


export default function SubEvidencePreview() {
  const params = useParams();
  const evidenceDetailId = params.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();

  const [isGenerating, setIsGenerating] = useState(false);

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
      
      setIsGenerating(false);
      alert(`✅ تم تحميل الملف بنجاح: ${data.filename}`);
    },
    onError: (error) => {
      setIsGenerating(false);
      alert(`❌ خطأ في توليد PDF: ${error.message}`);
    },
  });

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    generatePDF.mutate({ evidenceDetailId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-teal-700 mb-2">
            معاينة الشاهد المكتمل
          </h1>
          <p className="text-gray-600">
            تم حفظ الشاهد بنجاح! يمكنك الآن تحميل ملف PDF
          </p>
        </div>

        {/* Success Card */}
        <Card className="p-8 mb-6 bg-white shadow-lg border-2 border-teal-200">
          <div className="text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              تم حفظ الشاهد بنجاح! 🎉
            </h2>
            
            <p className="text-gray-600 mb-6">
              الشاهد رقم #{evidenceDetailId} - الحضور والانصراف
            </p>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-teal-800 mb-3">
                محتويات ملف PDF:
              </h3>
              <ul className="text-right space-y-2 text-gray-700">
                <li className="flex items-center justify-end gap-2">
                  <span>صفحة الغلاف مع اسم المعلم</span>
                  <span className="text-teal-600">✓</span>
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>6 صفحات فارغة للاستخدام المستقبلي</span>
                  <span className="text-teal-600">✓</span>
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>صفحة البيانات الأساسية (8 حقول)</span>
                  <span className="text-teal-600">✓</span>
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>صفحة تفاصيل الشاهد (6 أقسام + صورتين)</span>
                  <span className="text-teal-600">✓</span>
                </li>
                <li className="flex items-center justify-end gap-2">
                  <span>QR Code للتحقق من صحة الشاهد</span>
                  <span className="text-teal-600">✓</span>
                </li>
              </ul>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري توليد PDF...
                </>
              ) : (
                <>
                  <Download className="ml-2 h-5 w-5" />
                  تحميل ملف PDF
                </>
              )}
            </Button>

            <p className="text-sm text-gray-500 mt-4">
              الملف سيحتوي على 9 صفحات بثيم الألوان الأخضر الفيروزي
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-teal-300 text-teal-700 hover:bg-teal-50"
          >
            العودة للصفحة الرئيسية
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(`/evidence/sub-new/${evidenceDetailId}`)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            تعديل الشاهد
          </Button>
        </div>
      </div>
    </div>
  );
}
