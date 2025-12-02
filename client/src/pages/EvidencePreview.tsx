import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";

export default function EvidencePreview() {
  const params = useParams<{ id: string }>();
  const evidenceId = parseInt(params.id || "0");

  const { data: evidence, isLoading } = trpc.evidence.getById.useQuery(evidenceId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">الشاهد غير موجود</h2>
          <p className="text-muted-foreground">لم يتم العثور على الشاهد المطلوب</p>
        </Card>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    alert("سيتم إضافة وظيفة تحميل PDF قريباً");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - لا يُطبع */}
      <div className="print:hidden bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">معاينة الشاهد</h1>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="ml-2 h-4 w-4" />
              طباعة
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="ml-2 h-4 w-4" />
              تحميل PDF
            </Button>
          </div>
        </div>
      </div>

      {/* محتوى الشاهد - يُطبع */}
      <div className="container mx-auto py-8 print:py-0">
        {/* الصفحة الأولى */}
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8 print:shadow-none print:rounded-none print:mb-0 print:page-break-after-always" 
             style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          
          {/* عنوان المعيار */}
          <div className="border-2 border-black p-4 text-center mb-6">
            <h2 className="text-xl font-bold">معيار: {evidence.standardName || "غير محدد"}</h2>
          </div>

          {/* اسم العنصر */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-black p-3 text-center">
              <span className="font-semibold">استخدام التقنية الحديثة</span>
            </div>
            <div className="border border-black p-3 text-right">
              <span className="font-semibold">اسم العنصر</span>
            </div>
          </div>

          {/* جدول البيانات */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">مدة البرنامج</div>
              <div className="font-medium">{evidence.customFields?.duration || ""}</div>
            </div>
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">المستفيدون</div>
              <div className="font-medium">{evidence.customFields?.beneficiaries || ""}</div>
            </div>
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">الصف</div>
              <div className="font-medium">{evidence.customFields?.grade || ""}</div>
            </div>
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">العنوان</div>
              <div className="font-medium">{evidence.customFields?.title || ""}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">عدد الطلاب</div>
              <div className="font-medium">{evidence.customFields?.studentsCount || ""}</div>
            </div>
            <div className="border border-black p-3">
              <div className="text-sm text-gray-600 mb-1">مكان التنفيذ</div>
              <div className="font-medium">{evidence.customFields?.location || ""}</div>
            </div>
            <div className="border border-black p-3 col-span-1">
              {/* فارغ */}
            </div>
          </div>

          <div className="border border-black p-3 mb-6">
            <div className="text-sm text-gray-600 mb-1">عنوان الدرس</div>
            <div className="font-medium">{evidence.customFields?.lessonTitle || ""}</div>
          </div>

          {/* مربع الوصف */}
          <div className="border-2 border-black rounded-lg p-6 relative" style={{ minHeight: '300px' }}>
            <div className="absolute top-2 right-2 border border-black px-3 py-1 bg-white">
              <span className="text-sm font-semibold">الوصف</span>
            </div>
            <div className="mt-8 text-justify leading-relaxed">
              {evidence.section1Content || ""}
            </div>
          </div>
        </div>

        {/* الصفحة الثانية */}
        <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:rounded-none" 
             style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-right">
              <div className="font-bold text-lg">وزارة التعليم</div>
              <div className="text-sm">الإدارة العامة للتعليم بالباحة</div>
              <div className="text-sm">مدرسة متوسطة القموص</div>
            </div>
            <div className="w-16 h-16 border-2 border-black flex items-center justify-center">
              <span className="text-xs">QR</span>
            </div>
          </div>

          <div className="h-1 bg-gray-300 mb-6"></div>

          {/* عنوان المعيار */}
          <div className="border-2 border-black p-4 text-center mb-4">
            <h2 className="text-xl font-bold">معيار: {evidence.standardName || "غير محدد"}</h2>
          </div>

          {/* اسم العنصر */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-black p-2 text-center">
              <span className="font-semibold">استخدام التقنية الحديثة</span>
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
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section1Content || ""}
              </div>
            </div>

            {/* أهداف */}
            <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
              <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                أهداف
              </div>
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section2Content || ""}
              </div>
            </div>

            {/* مقترحات */}
            <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
              <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                مقترحات
              </div>
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section3Content || ""}
              </div>
            </div>

            {/* آلية التنفيذ */}
            <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
              <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                آلية التنفيذ
              </div>
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section4Content || ""}
              </div>
            </div>

            {/* توصيات */}
            <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
              <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                توصيات
              </div>
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section5Content || ""}
              </div>
            </div>

            {/* الوسائل المستخدمة */}
            <div className="border-2 border-black rounded-lg p-4 relative" style={{ minHeight: '180px' }}>
              <div className="absolute top-2 right-2 border border-black px-2 py-1 bg-white text-xs">
                الوسائل المستخدمة
              </div>
              <div className="mt-6 text-sm leading-relaxed">
                {evidence.section6Content || ""}
              </div>
            </div>
          </div>

          {/* الصور */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border-2 border-dashed border-gray-400 rounded-lg overflow-hidden" style={{ height: '200px' }}>
              {evidence.image1Url ? (
                <img src={evidence.image1Url} alt="صورة 1" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  صورة 1
                </div>
              )}
            </div>
            <div className="border-2 border-dashed border-gray-400 rounded-lg overflow-hidden" style={{ height: '200px' }}>
              {evidence.image2Url ? (
                <img src={evidence.image2Url} alt="صورة 2" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  صورة 2
                </div>
              )}
            </div>
          </div>

          {/* التوقيع */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-black p-3 text-center">
              <span className="font-medium">مدير المدرسة</span>
            </div>
            <div className="border border-black p-3 text-center">
              <span className="font-medium">اسم المعلم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
