import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: standards, isLoading } = trpc.standards.list.useQuery();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<{ id: number; title: string; description: string; orderIndex: number } | null>(null);
  const [newStandard, setNewStandard] = useState({ title: "", description: "", orderIndex: 1 });
  
  const createMutation = trpc.standards.create.useMutation({
    onSuccess: () => {
      utils.standards.list.invalidate();
      setIsAddDialogOpen(false);
      setNewStandard({ title: "", description: "", orderIndex: 1 });
      toast.success("تم إضافة المعيار بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    }
  });
  
  const updateMutation = trpc.standards.update.useMutation({
    onSuccess: () => {
      utils.standards.list.invalidate();
      setIsEditDialogOpen(false);
      setEditingStandard(null);
      toast.success("تم تحديث المعيار بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    }
  });
  
  const deleteMutation = trpc.standards.delete.useMutation({
    onSuccess: () => {
      utils.standards.list.invalidate();
      toast.success("تم حذف المعيار بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    }
  });

  // Check if user is admin
  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">ليس لديك صلاحية الوصول لهذه الصفحة</p>
            <Link href="/">
              <Button>العودة للرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddStandard = () => {
    if (!newStandard.title.trim()) {
      toast.error("يرجى إدخال عنوان المعيار");
      return;
    }
    
    createMutation.mutate(newStandard);
  };

  const handleEditStandard = () => {
    if (!editingStandard || !editingStandard.title.trim()) {
      toast.error("يرجى إدخال عنوان المعيار");
      return;
    }
    
    updateMutation.mutate({
      id: editingStandard.id,
      title: editingStandard.title,
      description: editingStandard.description,
      orderIndex: editingStandard.orderIndex,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة للرئيسية
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم - إدارة المعايير</h1>
        </div>
      </header>

      {/* Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">المعايير</h2>
              <p className="text-gray-600">إدارة المعايير الـ 11 وتعديلها</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة معيار جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة معيار جديد</DialogTitle>
                  <DialogDescription>
                    أضف معياراً جديداً إلى النظام
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderIndex">رقم الترتيب</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      min="1"
                      max="11"
                      value={newStandard.orderIndex}
                      onChange={(e) => setNewStandard({ ...newStandard, orderIndex: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان المعيار</Label>
                    <Input
                      id="title"
                      value={newStandard.title}
                      onChange={(e) => setNewStandard({ ...newStandard, title: e.target.value })}
                      placeholder="أدخل عنوان المعيار"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={newStandard.description}
                      onChange={(e) => setNewStandard({ ...newStandard, description: e.target.value })}
                      placeholder="أدخل وصف المعيار"
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleAddStandard} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : standards && standards.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {standards.map((standard) => (
                <Card key={standard.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            المعيار {standard.orderIndex}
                          </div>
                          <CardTitle className="text-xl">{standard.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          {standard.description || "لا يوجد وصف"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStandard({
                              id: standard.id,
                              title: standard.title,
                              description: standard.description || "",
                              orderIndex: standard.orderIndex,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا المعيار؟ سيتم حذف جميع الشواهد المرتبطة به.")) {
                              deleteMutation.mutate({ id: standard.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">لا توجد معايير بعد</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أول معيار
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المعيار</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المعيار
            </DialogDescription>
          </DialogHeader>
          {editingStandard && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-orderIndex">رقم الترتيب</Label>
                <Input
                  id="edit-orderIndex"
                  type="number"
                  min="1"
                  max="11"
                  value={editingStandard.orderIndex}
                  onChange={(e) => setEditingStandard({ ...editingStandard, orderIndex: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">عنوان المعيار</Label>
                <Input
                  id="edit-title"
                  value={editingStandard.title}
                  onChange={(e) => setEditingStandard({ ...editingStandard, title: e.target.value })}
                  placeholder="أدخل عنوان المعيار"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  value={editingStandard.description}
                  onChange={(e) => setEditingStandard({ ...editingStandard, description: e.target.value })}
                  placeholder="أدخل وصف المعيار"
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEditStandard} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
