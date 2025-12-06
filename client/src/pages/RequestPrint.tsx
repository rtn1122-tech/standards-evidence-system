import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Printer, Package, Truck } from "lucide-react";

export default function RequestPrint() {
  const [, setLocation] = useLocation();
  const [selectedEvidences, setSelectedEvidences] = useState<number[]>([]);
  const [paperType, setPaperType] = useState<"standard" | "premium" | "vip">("standard");
  const [bindingType, setBindingType] = useState<"spiral" | "thermal" | "luxury">("spiral");
  const [copies, setCopies] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  // Fetch user's evidences
  const { data: evidences } = trpc.userEvidences.list.useQuery();
  
  // Pricing logic
  const getPricing = () => {
    const basePrices = {
      standard: 50,
      premium: 80,
      vip: 120,
    };
    
    const basePrice = basePrices[paperType];
    const totalPrice = basePrice * copies;
    
    return {
      basePrice,
      totalPrice,
      perCopy: basePrice,
    };
  };
  
  const pricing = getPricing();
  
  // Create print order mutation
  const createOrder = trpc.printOrders.create.useMutation({
    onSuccess: (data) => {
      // Redirect to Salla payment
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setLocation("/print-orders");
      }
    },
  });
  
  const handleSubmit = () => {
    if (selectedEvidences.length === 0) {
      alert("الرجاء اختيار شاهد واحد على الأقل");
      return;
    }
    
    if (!shippingAddress.trim()) {
      alert("الرجاء إدخال عنوان الشحن");
      return;
    }
    
    createOrder.mutate({
      evidenceIds: selectedEvidences,
      paperType,
      bindingType,
      copies,
      shippingAddress,
      notes,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Printer className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            طلب طباعة احترافية
          </h1>
          <p className="text-gray-600">
            اطبع ملف الأداء المهني الكامل بجودة عالية واستلمه في منزلك
          </p>
        </div>

        {/* Step 1: Select Evidences */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            اختر الشواهد المطلوبة
          </h2>
          
          {evidences && evidences.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {evidences.map((evidence: any) => (
                <label
                  key={evidence.id}
                  className={`
                    flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                    ${selectedEvidences.includes(evidence.id)
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedEvidences.includes(evidence.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvidences(prev => [...prev, evidence.id]);
                      } else {
                        setSelectedEvidences(prev => prev.filter(id => id !== evidence.id));
                      }
                    }}
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">شاهد #{evidence.id}</div>
                    <div className="text-sm text-gray-500">تم الإنشاء: {new Date(evidence.createdAt).toLocaleDateString('ar-SA')}</div>
                  </div>
                  {selectedEvidences.includes(evidence.id) && (
                    <CheckCircle2 className="w-5 h-5 text-purple-500" />
                  )}
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد شواهد محفوظة بعد</p>
              <Button onClick={() => setLocation("/standards")} className="mt-4">
                إنشاء شاهد جديد
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            تم اختيار {selectedEvidences.length} شاهد
          </div>
        </Card>

        {/* Step 2: Choose Options */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            اختر نوع الطباعة
          </h2>
          
          {/* Paper Type */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">نوع الورق:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${paperType === "standard"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paperType"
                  value="standard"
                  checked={paperType === "standard"}
                  onChange={() => setPaperType("standard")}
                  className="hidden"
                />
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <div className="font-bold text-lg">عادي</div>
                  <div className="text-sm text-gray-600">ورق 80 جرام</div>
                  <div className="text-purple-600 font-bold mt-2">50 ر.س</div>
                </div>
              </label>
              
              <label
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${paperType === "premium"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paperType"
                  value="premium"
                  checked={paperType === "premium"}
                  onChange={() => setPaperType("premium")}
                  className="hidden"
                />
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="font-bold text-lg">فاخر</div>
                  <div className="text-sm text-gray-600">ورق 120 جرام</div>
                  <div className="text-purple-600 font-bold mt-2">80 ر.س</div>
                </div>
              </label>
              
              <label
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${paperType === "vip"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                  }
                `}
              >
                <input
                  type="radio"
                  name="paperType"
                  value="vip"
                  checked={paperType === "vip"}
                  onChange={() => setPaperType("vip")}
                  className="hidden"
                />
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                  <div className="font-bold text-lg">VIP</div>
                  <div className="text-sm text-gray-600">ورق فاخر + غلاف</div>
                  <div className="text-purple-600 font-bold mt-2">120 ر.س</div>
                </div>
              </label>
            </div>
          </div>
          
          {/* Binding Type */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3">نوع التجليد:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["spiral", "thermal", "luxury"].map((type) => (
                <label
                  key={type}
                  className={`
                    p-4 border-2 rounded-lg cursor-pointer transition-all text-center
                    ${bindingType === type
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="bindingType"
                    value={type}
                    checked={bindingType === type}
                    onChange={() => setBindingType(type as any)}
                    className="hidden"
                  />
                  <div className="font-semibold">
                    {type === "spiral" && "حلزوني"}
                    {type === "thermal" && "حراري"}
                    {type === "luxury" && "فاخر"}
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          {/* Copies */}
          <div>
            <h3 className="font-semibold mb-3">عدد النسخ:</h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setCopies(Math.max(1, copies - 1))}
                variant="outline"
                className="w-12 h-12"
              >
                -
              </Button>
              <div className="text-2xl font-bold w-16 text-center">{copies}</div>
              <Button
                onClick={() => setCopies(Math.min(5, copies + 1))}
                variant="outline"
                className="w-12 h-12"
              >
                +
              </Button>
              <span className="text-sm text-gray-600">(حد أقصى 5 نسخ)</span>
            </div>
          </div>
        </Card>

        {/* Step 3: Shipping Address */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            عنوان الشحن
          </h2>
          
          <Textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="مثال: الرياض، حي النرجس، شارع التخصصي، مبنى 123، شقة 456"
            className="min-h-[120px] mb-4"
          />
          
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <Truck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">معلومات الشحن:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>الشحن مجاني لجميع مناطق المملكة</li>
                <li>مدة التوصيل: 3-5 أيام عمل</li>
                <li>سيصلك رقم تتبع الشحنة عبر الإشعارات</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">ملاحظات إضافية (اختياري):</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات خاصة بالطلب..."
              className="min-h-[80px]"
            />
          </div>
        </Card>

        {/* Pricing Summary */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>نوع الورق:</span>
              <span className="font-semibold">
                {paperType === "standard" && "عادي"}
                {paperType === "premium" && "فاخر"}
                {paperType === "vip" && "VIP"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>نوع التجليد:</span>
              <span className="font-semibold">
                {bindingType === "spiral" && "حلزوني"}
                {bindingType === "thermal" && "حراري"}
                {bindingType === "luxury" && "فاخر"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>عدد النسخ:</span>
              <span className="font-semibold">{copies}</span>
            </div>
            <div className="flex justify-between">
              <span>عدد الشواهد:</span>
              <span className="font-semibold">{selectedEvidences.length}</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg">
              <span>السعر لكل نسخة:</span>
              <span className="font-bold">{pricing.perCopy} ر.س</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-purple-600 mt-2">
              <span>المجموع:</span>
              <span>{pricing.totalPrice} ر.س</span>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={createOrder.isPending || selectedEvidences.length === 0 || !shippingAddress.trim()}
            className="flex-1 h-12 text-lg bg-purple-600 hover:bg-purple-700"
          >
            {createOrder.isPending ? "جاري المعالجة..." : "متابعة للدفع"}
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
