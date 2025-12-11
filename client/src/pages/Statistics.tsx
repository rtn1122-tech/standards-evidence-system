import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, BarChart3, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// تسجيل مكونات Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Statistics() {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: standards, isLoading: loadingStandards } = trpc.standards.list.useQuery();
  const { data: allProgress, isLoading: loadingProgress } = trpc.standards.getAllProgress.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: userEvidences, isLoading: loadingEvidences } = trpc.userEvidences.list.useQuery(
    undefined,
    { enabled: !!user }
  );

  const isLoading = loadingStandards || loadingProgress || loadingEvidences;

  // حساب الإحصائيات العامة
  const totalStandards = standards?.length || 0;
  const completedStandards = allProgress 
    ? Object.values(allProgress).filter(p => p.percentage === 100).length 
    : 0;
  const inProgressStandards = allProgress 
    ? Object.values(allProgress).filter(p => p.percentage > 0 && p.percentage < 100).length 
    : 0;
  const notStartedStandards = allProgress 
    ? Object.values(allProgress).filter(p => p.percentage === 0).length 
    : 0;
  const totalEvidences = userEvidences?.length || 0;
  const overallProgress = allProgress 
    ? Math.round(Object.values(allProgress).reduce((sum, p) => sum + p.percentage, 0) / totalStandards)
    : 0;

  // بيانات الرسم البياني الشريطي (Bar Chart)
  const barChartData = {
    labels: standards?.map((s: any) => `المعيار ${s.orderIndex}`) || [],
    datasets: [
      {
        label: 'نسبة الإنجاز (%)',
        data: standards?.map((s: any) => allProgress?.[s.id]?.percentage || 0) || [],
        backgroundColor: standards?.map((s: any) => {
          const progress = allProgress?.[s.id]?.percentage || 0;
          if (progress === 0) return 'rgba(239, 68, 68, 0.6)'; // أحمر
          if (progress === 100) return 'rgba(34, 197, 94, 0.6)'; // أخضر
          return 'rgba(249, 115, 22, 0.6)'; // برتقالي
        }) || [],
        borderColor: standards?.map((s: any) => {
          const progress = allProgress?.[s.id]?.percentage || 0;
          if (progress === 0) return 'rgb(239, 68, 68)';
          if (progress === 100) return 'rgb(34, 197, 94)';
          return 'rgb(249, 115, 22)';
        }) || [],
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'نسبة الإنجاز لكل معيار',
        font: {
          size: 18,
          family: 'Cairo, sans-serif',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%',
        },
      },
    },
  };

  // بيانات الرسم البياني الدائري (Doughnut Chart)
  const doughnutChartData = {
    labels: ['مكتملة', 'قيد التنفيذ', 'لم تبدأ'],
    datasets: [
      {
        data: [completedStandards, inProgressStandards, notStartedStandards],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // أخضر
          'rgba(249, 115, 22, 0.8)', // برتقالي
          'rgba(239, 68, 68, 0.8)', // أحمر
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 14,
            family: 'Cairo, sans-serif',
          },
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'توزيع حالة المعايير',
        font: {
          size: 18,
          family: 'Cairo, sans-serif',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">تسجيل الدخول مطلوب</CardTitle>
            <CardDescription className="text-center">
              يجب تسجيل الدخول لعرض الإحصائيات
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>
                <ArrowRight className="ml-2 w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            لوحة الإحصائيات
          </h1>
          <p className="text-lg text-gray-600">
            تتبع تقدمك في المعايير المهنية والشواهد
          </p>
        </div>

        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* إجمالي التقدم */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-100">إجمالي التقدم</CardDescription>
              <CardTitle className="text-4xl font-bold">{overallProgress}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>من جميع المعايير</span>
              </div>
            </CardContent>
          </Card>

          {/* المعايير المكتملة */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-100">معايير مكتملة</CardDescription>
              <CardTitle className="text-4xl font-bold">{completedStandards}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>من {totalStandards} معيار</span>
              </div>
            </CardContent>
          </Card>

          {/* المعايير قيد التنفيذ */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-100">قيد التنفيذ</CardDescription>
              <CardTitle className="text-4xl font-bold">{inProgressStandards}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>معيار</span>
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الشواهد */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-100">إجمالي الشواهد</CardDescription>
              <CardTitle className="text-4xl font-bold">{totalEvidences}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>شاهد معبأ</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* الرسم البياني الشريطي */}
          <Card>
            <CardContent className="pt-6">
              <div style={{ height: '400px' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* الرسم البياني الدائري */}
          <Card>
            <CardContent className="pt-6">
              <div style={{ height: '400px' }} className="flex items-center justify-center">
                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول تفصيلي للمعايير */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المعايير</CardTitle>
            <CardDescription>نظرة تفصيلية على تقدمك في كل معيار</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-semibold">المعيار</th>
                    <th className="text-right py-3 px-4 font-semibold">العنوان</th>
                    <th className="text-center py-3 px-4 font-semibold">نسبة الإنجاز</th>
                    <th className="text-center py-3 px-4 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {standards?.map((standard: any) => {
                    const progress = allProgress?.[standard.id] || { percentage: 0, completed: 0, total: 0 };
                    return (
                      <tr key={standard.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-blue-600">
                          {standard.orderIndex}
                        </td>
                        <td className="py-3 px-4">{standard.title}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  progress.percentage === 0 ? 'bg-red-500' :
                                  progress.percentage === 100 ? 'bg-green-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{progress.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              progress.percentage === 0 ? 'bg-red-100 text-red-700' :
                              progress.percentage === 100 ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {progress.percentage === 0 ? '⭕ لم يبدأ' :
                             progress.percentage === 100 ? '✅ مكتمل' :
                             '🔄 قيد التنفيذ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* أزرار التنقل */}
        <div className="flex justify-center gap-4 mt-8">
          <Link href="/standards">
            <Button variant="outline" size="lg">
              <ArrowRight className="ml-2 w-4 h-4" />
              المعايير
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg">
              <ArrowRight className="ml-2 w-4 h-4" />
              الرئيسية
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
