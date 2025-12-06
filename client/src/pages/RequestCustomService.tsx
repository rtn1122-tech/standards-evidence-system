import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { storagePut } from "../../../server/storage";

export default function RequestCustomService() {
  const [, setLocation] = useLocation();
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Fetch available templates
  const { data: templates } = trpc.evidenceTemplates.list.useQuery();
  
  // Create request mutation
  const createRequest = trpc.customService.createRequest.useMutation({
    onSuccess: () => {
      setLocation("/custom-service-status");
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("image/") || file.type === "application/pdf"
    );
    
    setUploadedImages(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(
        file => file.type.startsWith("image/") || file.type === "application/pdf"
      );
      setUploadedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedTemplates.length === 0) {
      alert("الرجاء اختيار شاهد واحد على الأقل");
      return;
    }
    
    if (uploadedImages.length === 0) {
      alert("الرجاء رفع صورة واحدة على الأقل");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload images to S3 first
      const imageUrls: string[] = [];
      
      for (const file of uploadedImages) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        // Convert to base64
        const base64 = btoa(
          buffer.reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        
        const dataUrl = `data:${file.type};base64,${base64}`;
        
        // Upload to S3 via tRPC
        const result = await createRequest.mutateAsync({
          templateIds: selectedTemplates,
          imageUrls: imageUrls,
          notes,
        });
        return;
        
        // OLD CODE - REMOVE
        /*
        const result = await trpc.customService.uploadImage.mutate({
          imageData: dataUrl,
          filename: file.name,
        });
        
        imageUrls.push(result.url);
        */
      }
      
      // Create the request
      await createRequest.mutateAsync({
        templateIds: selectedTemplates,
        imageUrls,
        notes,
      });
      
    } catch (error) {
      console.error("Error uploading:", error);
      alert("حدث خطأ أثناء رفع الصور");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            طلب خدمة التعبئة المخصصة
          </h1>
          <p className="text-gray-600">
            ارفع صورك واختر الشواهد المطلوبة، وسنقوم بتعبئتها لك
          </p>
        </div>

        {/* Step 1: Select Templates */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            اختر الشواهد المطلوبة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates?.map((template: any) => (
              <label
                key={template.id}
                className={`
                  flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedTemplates.includes(template.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedTemplates.includes(template.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTemplates(prev => [...prev, template.id]);
                    } else {
                      setSelectedTemplates(prev => prev.filter(id => id !== template.id));
                    }
                  }}
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{template.evidenceName}</div>
                  <div className="text-sm text-gray-500">{template.standardName}</div>
                </div>
                {selectedTemplates.includes(template.id) && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                )}
              </label>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            تم اختيار {selectedTemplates.length} شاهد
          </div>
        </Card>

        {/* Step 2: Upload Images */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            ارفع جميع صورك دفعة واحدة
          </h2>
          
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400"
              }
            `}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              اسحب الصور هنا أو انقر للاختيار
            </p>
            <p className="text-sm text-gray-500 mb-4">
              يمكنك رفع صور (JPG, PNG, PDF) - حتى 20 صورة
            </p>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button type="button" variant="outline" className="cursor-pointer">
                اختر الملفات
              </Button>
            </label>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">الصور المرفوعة ({uploadedImages.length}):</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Step 3: Notes */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            ملاحظات إضافية (اختياري)
          </h2>
          
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: صور الحضور من شهر سبتمبر، صورة الاجتماع مع أولياء الأمور..."
            className="min-h-[120px]"
          />
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={isUploading || selectedTemplates.length === 0 || uploadedImages.length === 0}
            className="flex-1 h-12 text-lg"
          >
            {isUploading ? "جاري الرفع..." : "إرسال الطلب"}
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="h-12"
          >
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
