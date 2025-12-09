import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, ArrowLeft, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Standards() {
  const [, setLocation] = useLocation();
  const { data: standards, isLoading } = trpc.standards.list.useQuery();
  const { data: user } = trpc.auth.me.useQuery();
  
  // جلب تقدم جميع المعايير (فقط للمستخدمين المسجلين)
  const { data: allProgress } = trpc.standards.getAllProgress.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header Skeleton */}
          <div className="text-center mb-12">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-10 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>

          {/* Standards Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <Card key={i} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="w-10 h-10 rounded-full mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Back Button Skeleton */}
          <div className="text-center">
            <Skeleton className="h-11 w-40 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            المعايير المهنية للمعلمين
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            المعايير الـ 11 للأداء المهني للمعلمين في المملكة العربية السعودية
          </p>
        </div>

        {/* Standards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {standards?.map((standard: any) => (
            <Card 
              key={standard.id}
              className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 group cursor-pointer"
              onClick={() => setLocation(`/standard/${standard.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="relative inline-block">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-3 group-hover:bg-blue-600 transition-colors">
                        <span className="text-lg font-bold text-blue-600 group-hover:text-white">
                          {standard.orderIndex}
                        </span>
                      </div>
                      {/* مؤشر دائري للتقدم */}
                      {user && allProgress && allProgress[standard.id] !== undefined && (
                        <div 
                          className={`absolute -top-1 -left-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${
                            allProgress[standard.id].percentage === 0 ? 'bg-red-500 text-white' :
                            allProgress[standard.id].percentage === 100 ? 'bg-green-500 text-white' :
                            'bg-orange-500 text-white'
                          }`}
                          title={`${allProgress[standard.id].completed} من ${allProgress[standard.id].total} شاهد (${allProgress[standard.id].percentage}%)`}
                        >
                          {allProgress[standard.id].percentage === 100 ? '✓' : allProgress[standard.id].percentage}
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                      {standard.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      الوزن النسبي: {standard.weight}%
                    </CardDescription>
                    {/* عداد الشواهد */}
                    {user && allProgress && allProgress[standard.id] !== undefined && (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-semibold text-blue-600">{allProgress[standard.id].completed}</span>
                        <span> من </span>
                        <span className="font-semibold">{allProgress[standard.id].total}</span>
                        <span> شاهد</span>
                      </div>
                    )}
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {standard.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
