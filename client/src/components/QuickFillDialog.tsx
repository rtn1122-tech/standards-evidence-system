import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QuickFillDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickFillDialog({ template, open, onOpenChange, onSuccess }: QuickFillDialogProps) {
  const [userFieldsData, setUserFieldsData] = useState<Record<string, string>>({});
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string>("");
  const [image2Preview, setImage2Preview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const saveMutation = trpc.userEvidences.create.useMutation();

  // Parse userFields
  let userFields: any[] = [];
  try {
    userFields = JSON.parse(template.userFields || "[]");
  } catch (e) {
    console.error("Error parsing userFields:", e);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, imageNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة");
      return;
    }

    // التحقق من حجم الملف (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن يكون أقل من 5 ميجابايت");
      return;
    }

    if (imageNumber === 1) {
      setImage1(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage1Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage2(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage2Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Parse page2Boxes
      let page2BoxesData: any[] = [];
      try {
        page2BoxesData = JSON.parse(template.page2Boxes || "[]");
      } catch (e) {
        console.error("Error parsing page2Boxes:", e);
      }

      await saveMutation.mutateAsync({
        templateId: template.id,
        userData: JSON.stringify({
          description: template.description,
          userFieldsData,
          page2BoxesData,
        }),
        image1Url: image1Preview || null,
        image2Url: image2Preview || null,
      });

      toast.success("تم حفظ الشاهد بنجاح!");
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // Reset form
      setUserFieldsData({});
      setImage1(null);
      setImage2(null);
      setImage1Preview("");
      setImage2Preview("");
    } catch (error) {
      console.error("Error saving evidence:", error);
      toast.error("حدث خطأ أثناء حفظ الشاهد");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">تعبئة سريعة: {template.evidenceName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* الحقول الديناميكية */}
          {userFields.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-3">
                المعلومات المطلوبة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userFields.map((field: any, index: number) => (
                  <div key={index}>
                    <Label htmlFor={`quick-field-${index}`}>
                      {field.name || `حقل ${index + 1}`}
                      {field.required && <span className="text-red-500 mr-1">*</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={`quick-field-${index}`}
                        value={userFieldsData[field.name] || ""}
                        onChange={(e) =>
                          setUserFieldsData({ ...userFieldsData, [field.name]: e.target.value })
                        }
                        placeholder={field.placeholder || `أدخل ${field.name}`}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={`quick-field-${index}`}
                        type={field.type || "text"}
                        value={userFieldsData[field.name] || ""}
                        onChange={(e) =>
                          setUserFieldsData({ ...userFieldsData, [field.name]: e.target.value })
                        }
                        placeholder={field.placeholder || `أدخل ${field.name}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* رفع الصور */}
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              الصور (اختياري)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* الصورة الأولى */}
              <div>
                <Label htmlFor="quick-image1">الصورة الأولى</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="quick-image1"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 1)}
                    className="hidden"
                  />
                  <label
                    htmlFor="quick-image1"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {image1Preview ? (
                      <img
                        src={image1Preview}
                        alt="معاينة الصورة 1"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">اضغط لاختيار صورة</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* الصورة الثانية */}
              <div>
                <Label htmlFor="quick-image2">الصورة الثانية</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="quick-image2"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 2)}
                    className="hidden"
                  />
                  <label
                    htmlFor="quick-image2"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {image2Preview ? (
                      <img
                        src={image2Preview}
                        alt="معاينة الصورة 2"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">اضغط لاختيار صورة</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Check className="ml-2 w-4 h-4" />
                  حفظ سريع
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
