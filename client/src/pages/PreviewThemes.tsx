import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface Box {
  title: string;
  content: string;
}

interface PreviewData {
  templateId: number;
  evidenceName: string;
  subEvidenceName: string;
  description: string;
  userFieldsData: Record<string, string>;
  page2BoxesData: Box[];
  image1Preview: string;
  image2Preview: string;
}

const themes = [
  {
    id: "classic",
    name: "كلاسيكي",
    headerBg: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    boxBg: "#f8fafc",
    boxBorder: "#cbd5e1",
    textColor: "#1e293b",
  },
  {
    id: "modern",
    name: "حديث",
    headerBg: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    boxBg: "#faf5ff",
    boxBorder: "#d8b4fe",
    textColor: "#581c87",
  },
  {
    id: "elegant",
    name: "أنيق",
    headerBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    boxBg: "#f0fdf4",
    boxBorder: "#86efac",
    textColor: "#064e3b",
  },
  {
    id: "formal",
    name: "رسمي",
    headerBg: "linear-gradient(135deg, #334155 0%, #64748b 100%)",
    boxBg: "#f8fafc",
    boxBorder: "#94a3b8",
    textColor: "#0f172a",
  },
];

export default function PreviewThemes() {
  const [, setLocation] = useLocation();
  const navigate = (path: string | number) => {
    if (typeof path === 'number') {
      window.history.go(path);
    } else {
      setLocation(path);
    }
  };
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  useEffect(() => {
    // استرجاع البيانات من localStorage
    const params = new URLSearchParams(window.location.search);
    const templateId = params.get("templateId");
    
    console.log('PreviewThemes - templateId from URL:', templateId);
    
    if (templateId) {
      const key = `evidence_preview_${templateId}`;
      const savedData = localStorage.getItem(key);
      
      console.log('PreviewThemes - looking for key:', key);
      console.log('PreviewThemes - found data:', savedData ? 'YES' : 'NO');
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          console.log('PreviewThemes - parsed data:', parsed);
          setPreviewData(parsed);
        } catch (e) {
          console.error("Error loading preview data:", e);
        }
      } else {
        console.error('No preview data found in localStorage for key:', key);
      }
    } else {
      console.error('No templateId in URL');
    }
  }, []);

  if (!previewData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">لا توجد بيانات للمعاينة</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowRight className="ml-2 w-4 h-4" />
            العودة
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectTheme = () => {
    // حفظ الثيم المختار
    localStorage.setItem(`selected_theme_${previewData.templateId}`, selectedTheme.id);
    alert(`تم اختيار ثيم "${selectedTheme.name}"`);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* شريط الثيمات */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">اختر تصميم الشاهد</h2>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowRight className="ml-2 w-4 h-4" />
              العودة
            </Button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedTheme.id === theme.id
                    ? "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {selectedTheme.id === theme.id && (
                  <Check className="inline-block ml-2 w-4 h-4" />
                )}
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* معاينة الشاهد */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
          {/* الصفحة الأولى */}
          <div className="min-h-[297mm] p-12 relative">
            {/* الهيدر */}
            <div
              className="text-center py-8 rounded-t-lg mb-8"
              style={{ background: selectedTheme.headerBg }}
            >
              <p className="text-white text-sm mb-2">المملكة العربية السعودية</p>
              <h1 className="text-white text-3xl font-bold mb-4">وزارة التعليم</h1>
              <h2 className="text-white text-2xl font-semibold">{previewData.evidenceName}</h2>
              {previewData.subEvidenceName && (
                <p className="text-white/90 text-lg mt-2">{previewData.subEvidenceName}</p>
              )}
            </div>

            {/* الصورة */}
            {previewData.image1Preview && (
              <div className="mb-8 flex justify-center">
                <img
                  src={previewData.image1Preview}
                  alt="صورة الشاهد"
                  className="max-w-md w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}

            {/* الوصف */}
            <div
              className="p-6 rounded-lg mb-8"
              style={{
                backgroundColor: selectedTheme.boxBg,
                borderRight: `4px solid ${selectedTheme.boxBorder}`,
                color: selectedTheme.textColor,
              }}
            >
              <p className="text-lg leading-relaxed whitespace-pre-wrap">{previewData.description}</p>
            </div>
          </div>

          {/* الصفحة الثانية */}
          <div className="min-h-[297mm] p-12 bg-gray-50">
            <div
              className="text-center py-6 rounded-lg mb-8"
              style={{ background: selectedTheme.headerBg }}
            >
              <h2 className="text-white text-2xl font-bold">التفاصيل</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {previewData.page2BoxesData.map((box, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg"
                  style={{
                    backgroundColor: selectedTheme.boxBg,
                    borderRight: `4px solid ${selectedTheme.boxBorder}`,
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: selectedTheme.textColor }}
                  >
                    {box.title}
                  </h3>
                  <p
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ color: selectedTheme.textColor }}
                  >
                    {box.content}
                  </p>
                </div>
              ))}
            </div>

            {/* الصورة الثانية */}
            {previewData.image2Preview && (
              <div className="mt-8 flex justify-center">
                <img
                  src={previewData.image2Preview}
                  alt="صورة إضافية"
                  className="max-w-md w-full h-64 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* زر الاختيار */}
        <div className="mt-8 text-center">
          <Button onClick={handleSelectTheme} size="lg" className="px-12">
            <Check className="ml-2 w-5 h-5" />
            اختيار ثيم "{selectedTheme.name}"
          </Button>
        </div>
      </div>
    </div>
  );
}
