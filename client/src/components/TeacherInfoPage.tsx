import React from 'react';

interface TeacherInfo {
  // معلومات أساسية
  teacherName: string;
  email?: string;
  phone?: string;
  gender: 'male' | 'female';
  profileImage?: string;
  
  // معلومات مهنية
  educationDepartment?: string;
  schoolName?: string;
  principalName?: string;
  educationLevel?: 'elementary' | 'middle' | 'high';
  subjects?: string; // JSON string
  
  // معلومات الرخصة
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  teacherLevel?: 'practitioner' | 'advanced' | 'expert';
}

interface TeacherInfoPageProps {
  teacher: TeacherInfo;
  theme?: string;
}

const EDUCATION_LEVEL_AR = {
  elementary: 'ابتدائي',
  middle: 'متوسط',
  high: 'ثانوي',
};

const TEACHER_LEVEL_AR = {
  practitioner: 'معلم ممارس',
  advanced: 'معلم متقدم',
  expert: 'معلم خبير',
};

export default function TeacherInfoPage({ teacher, theme = 'modern' }: TeacherInfoPageProps) {
  const subjects = teacher.subjects ? JSON.parse(teacher.subjects) : [];
  
  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-12 flex flex-col"
      style={{ 
        minHeight: '297mm', // A4 height
        fontFamily: 'Cairo, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            بيانات المعلم
          </h1>
          <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 flex gap-8">
        {/* Right Side: Profile Image */}
        <div className="w-1/3 flex flex-col items-center justify-start">
          <div className="relative">
            {teacher.profileImage ? (
              <img
                src={teacher.profileImage}
                alt={teacher.teacherName}
                className="w-64 h-64 rounded-2xl object-cover shadow-2xl border-4 border-white"
              />
            ) : (
              <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-2xl border-4 border-white">
                <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg text-sm font-bold">
              {teacher.gender === 'male' ? 'معلم' : 'معلمة'}
            </div>
          </div>
        </div>

        {/* Left Side: Information */}
        <div className="w-2/3 space-y-6">
          {/* المعلومات الأساسية */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-r-4 border-blue-500">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              المعلومات الأساسية
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="الاسم الكامل" value={teacher.teacherName} />
              {teacher.email && <InfoItem label="البريد الإلكتروني" value={teacher.email} />}
              {teacher.phone && <InfoItem label="رقم الجوال" value={teacher.phone} />}
            </div>
          </div>

          {/* المعلومات المهنية */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-r-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              المعلومات المهنية
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {teacher.educationDepartment && <InfoItem label="إدارة التعليم" value={teacher.educationDepartment} />}
              {teacher.schoolName && <InfoItem label="المدرسة" value={teacher.schoolName} />}
              {teacher.principalName && <InfoItem label="المدير/ة" value={teacher.principalName} />}
              {teacher.educationLevel && (
                <InfoItem label="المرحلة الدراسية" value={EDUCATION_LEVEL_AR[teacher.educationLevel]} />
              )}
            </div>
            {subjects.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">مواد التدريس:</p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* معلومات الرخصة المهنية */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-r-4 border-green-500">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
              الرخصة المهنية
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {teacher.licenseNumber && <InfoItem label="رقم الرخصة" value={teacher.licenseNumber} />}
              {teacher.teacherLevel && (
                <InfoItem label="مستوى المعلم" value={TEACHER_LEVEL_AR[teacher.teacherLevel]} />
              )}
              {teacher.licenseIssueDate && (
                <InfoItem label="تاريخ الإصدار" value={new Date(teacher.licenseIssueDate).toLocaleDateString('ar-SA')} />
              )}
              {teacher.licenseExpiryDate && (
                <InfoItem label="تاريخ الانتهاء" value={new Date(teacher.licenseExpiryDate).toLocaleDateString('ar-SA')} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pt-6 border-t-2 border-gray-200">
        <p className="text-gray-500 text-sm">
          تم إنشاء هذا الملف بواسطة نظام إدارة المعايير والشواهد
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {new Date().toLocaleDateString('ar-SA')}
        </p>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
      <p className="text-base text-gray-900 font-medium">{value}</p>
    </div>
  );
}
