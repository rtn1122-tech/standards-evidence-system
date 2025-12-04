import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  standards: router({
    list: publicProcedure.query(async () => {
      return await db.getAllStandards();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStandardById(input.id);
      }),
    
    getProgress: protectedProcedure.query(async ({ ctx }) => {
      const standards = await db.getAllStandards();
      const allEvidence = await db.getUserEvidenceDetails(ctx.user.id);
      
      const totalCount = standards.length;
      const completedCount = allEvidence.length; // evidenceDetails are always completed
      const totalProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      
      return {
        totalCount,
        completedCount,
        totalProgress,
      };
    }),
    
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        orderIndex: z.number(),
        weight: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        
        await db.createStandard(input);
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        orderIndex: z.number().optional(),
        weight: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        
        const { id, ...data } = input;
        await db.updateStandard(id, data);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
        }
        
        await db.deleteStandard(input.id);
        
        return { success: true };
      }),
  }),

  teacherProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeacherProfileByUserId(ctx.user.id);
    }),
    
    upsert: protectedProcedure
      .input(z.object({
        educationDepartment: z.string().optional(),
        schoolName: z.string().optional(),
        teacherName: z.string().optional(),
        principalName: z.string().optional(),
        gender: z.enum(["male", "female"]),
        stage: z.string().optional(),
        subjects: z.string().optional(), // JSON string
        selectedBackground: z.string().optional(),
        selectedTheme: z.string().optional(),
        preferredSortBy: z.enum(["newest", "oldest", "priority"]).optional(),
        // حقول جديدة (اختيارية)
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        professionalLicenseNumber: z.string().optional(),
        licenseStartDate: z.string().optional(),
        licenseEndDate: z.string().optional(),
        employeeNumber: z.string().optional(),
        jobTitle: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { licenseStartDate, licenseEndDate, ...rest } = input;
        await db.upsertTeacherProfile({
          userId: ctx.user.id,
          ...rest,
          licenseStartDate: licenseStartDate ? new Date(licenseStartDate) : undefined,
          licenseEndDate: licenseEndDate ? new Date(licenseEndDate) : undefined,
        });
        
        return { success: true };
      }),
  }),

  evidenceTemplates: router({
    list: publicProcedure.query(async () => {
      return await db.getAllEvidenceTemplates();
    }),
    
    getByStandardId: publicProcedure
      .input(z.object({ standardId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEvidenceTemplatesByStandardId(input.standardId);
      }),
    
    listByStandard: publicProcedure
      .input(z.object({ standardId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEvidenceTemplatesByStandardId(input.standardId);
      }),
    
    getSubEvidence: publicProcedure
      .input(z.object({ templateId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubEvidenceByTemplateId(input.templateId);
      }),
    
    getFilteredSubEvidence: protectedProcedure
      .input(z.object({ templateId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Get user profile
        const profile = await db.getTeacherProfileByUserId(ctx.user.id);
        if (!profile) {
          // If no profile, return all sub-evidence
          return await db.getSubEvidenceByTemplateId(input.templateId);
        }
        
        // Parse stages and subjects
        // stage is stored as plain text, not JSON array
        const userStages = profile.stage ? [profile.stage] : [];
        const userSubjects = profile.subjects ? JSON.parse(profile.subjects) : [];
        
        return await db.getFilteredSubEvidence(input.templateId, userStages, userSubjects);
      }),
    
    getSubTemplateById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubTemplateById(input.id);
      }),
  }),

  evidenceDetails: router({
    save: protectedProcedure
      .input(z.object({
        subTemplateId: z.number(),
        templateId: z.number(),
        dynamicFields: z.any(),
        section1: z.string(),
        section2: z.string(),
        section3: z.string(),
        section4: z.string(),
        section5: z.string(),
        section6: z.string(),
        image1: z.string().nullable(),
        image2: z.string().nullable(),
        theme: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const evidenceDetailId = await db.createEvidenceDetail({
          userId: ctx.user.id,
          subTemplateId: input.subTemplateId,
          templateId: input.templateId,
          dynamicFields: JSON.stringify(input.dynamicFields),
          section1: input.section1,
          section2: input.section2,
          section3: input.section3,
          section4: input.section4,
          section5: input.section5,
          section6: input.section6,
          image1: input.image1,
          image2: input.image2,
          theme: input.theme,
        });
        
        return { success: true, evidenceDetailId };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        dynamicFields: z.any(),
        section1: z.string(),
        section2: z.string(),
        section3: z.string(),
        section4: z.string(),
        section5: z.string(),
        section6: z.string(),
        image1: z.string().nullable(),
        image2: z.string().nullable(),
        applicableStages: z.string().nullable().optional(),
        applicableSubjects: z.string().nullable().optional(),
        applicableGrades: z.string().nullable().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const evidenceDetail = await db.getEvidenceDetailById(input.id);
        if (!evidenceDetail) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        // Update evidence detail
        await db.updateEvidenceDetail(input.id, {
          customFields: JSON.stringify(input.dynamicFields),
          section1Content: input.section1,
          section2Content: input.section2,
          section3Content: input.section3,
          section4Content: input.section4,
          section5Content: input.section5,
          section6Content: input.section6,
          image1Url: input.image1,
          image2Url: input.image2,
        });
        
        // Update visibility settings in subTemplate if provided
        if (input.applicableStages !== undefined || input.applicableSubjects !== undefined || input.applicableGrades !== undefined) {
          await db.updateEvidenceSubTemplate(evidenceDetail.subTemplateId, {
            applicableStages: input.applicableStages,
            applicableSubjects: input.applicableSubjects,
            applicableGrades: input.applicableGrades,
          });
        }
        
        return { success: true };
      }),
    
    uploadImage: protectedProcedure
      .input(z.object({
        file: z.string(), // base64 encoded image
        fileName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Convert base64 to buffer
        const base64Data = input.file.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique file name
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const fileExtension = input.fileName.split('.').pop() || 'jpg';
        const fileKey = `evidence-images/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;
        
        // Upload to S3
        const { url } = await storagePut(
          fileKey,
          buffer,
          `image/${fileExtension}`
        );
        
        return { url };
      }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEvidenceDetails(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const evidenceDetail = await db.getEvidenceDetailById(input.id);
        
        if (!evidenceDetail || evidenceDetail.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Evidence detail not found',
          });
        }
        
        return evidenceDetail;
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const success = await db.deleteEvidenceDetail(input.id, ctx.user.id);
        
        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Evidence detail not found or you do not have permission to delete it',
          });
        }
        
        return { success: true };
      }),
    
    getForVerification: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const evidenceDetail = await db.getEvidenceDetailById(input.id);
        
        if (!evidenceDetail) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Evidence detail not found',
          });
        }
        
        return evidenceDetail;
      }),
    
    generatePDF: protectedProcedure
      .input(z.object({
        evidenceDetailId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { generateEvidencePDF } = await import('./generatePDF');
        
        // Fetch evidence detail from database
        const evidenceDetail = await db.getEvidenceDetailById(input.evidenceDetailId);
        
        if (!evidenceDetail) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Evidence detail not found',
          });
        }
        
        // Fetch teacher profile for additional data
        const profile = await db.getTeacherProfileByUserId(ctx.user.id);
        
        // Fetch sub-template for title and description
        const subTemplate = evidenceDetail.evidenceSubTemplateId 
          ? await db.getSubTemplateById(evidenceDetail.evidenceSubTemplateId)
          : null;
        
        // Parse customFields JSON
        const customFields = evidenceDetail.customFields 
          ? JSON.parse(evidenceDetail.customFields)
          : {};
        
        // Build evidence data for PDF generation
        const evidenceData = {
          id: evidenceDetail.id,
          subTemplateId: evidenceDetail.evidenceSubTemplateId || undefined,
          title: subTemplate?.title || "شاهد",
          standardName: "أداء الواجبات الوظيفية", // TODO: fetch from standard
          description: subTemplate?.description || "",
          // Page 1 fields from customFields
          elementTitle: customFields.elementTitle || "",
          grade: customFields.grade || "",
          beneficiaries: customFields.beneficiaries || "",
          duration: customFields.duration || "",
          executionLocation: customFields.executionLocation || "",
          studentsCount: customFields.studentsCount || "",
          lessonTitle: customFields.lessonTitle || "",
          date: customFields.date || new Date().toISOString().split('T')[0],
          // Custom field labels
          field1Label: customFields.field1Label || "مدة البرنامج",
          field2Label: customFields.field2Label || "الوسائل المستخدمة",
          field3Label: customFields.field3Label || "المستفيدون",
          field4Label: customFields.field4Label || "التاريخ",
          // Page 2 sections
          section1: evidenceDetail.section1Content || "",
          section2: evidenceDetail.section2Content || "",
          section3: evidenceDetail.section3Content || "",
          section4: evidenceDetail.section4Content || "",
          section5: evidenceDetail.section5Content || "",
          section6: evidenceDetail.section6Content || "",
          // Images
          image1Url: evidenceDetail.image1Url || null,
          image2Url: evidenceDetail.image2Url || null,
          // Teacher info
          teacherName: profile?.teacherName || ctx.user.name || "المعلم",
          schoolName: profile?.schoolName || "المدرسة",
          principalName: profile?.principalName || "",
          educationDepartment: profile?.educationDepartment || "",
        };
        
        const pdfBuffer = await generateEvidencePDF(evidenceData);
        
        // Return as base64 for download
        return {
          pdf: pdfBuffer.toString('base64'),
          filename: `evidence-${input.evidenceDetailId}.pdf`,
        };
      }),
    
    generateAllPDF: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { generateCoverAndEmptyPages } = await import('./generateCoverPages');
        const { generateEvidencePages } = await import('./generateEvidencePages');
        const PDFDocument = (await import('pdf-lib')).PDFDocument;
        
        // Fetch all evidence details for the user
        const evidenceList = await db.getUserEvidenceDetails(ctx.user.id);
        
        if (!evidenceList || evidenceList.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'لا توجد شواهد لتحميلها',
          });
        }
        
        // Fetch teacher profile once
        const profile = await db.getTeacherProfileByUserId(ctx.user.id);
        
        // Generate cover + empty pages ONCE
        const coverPdfBuffer = await generateCoverAndEmptyPages({
          teacherName: profile?.teacherName || ctx.user.name || 'المعلم',
          schoolName: profile?.schoolName || 'المدرسة',
        });
        
        // Generate individual evidence pages (without cover/empty pages)
        const evidencePdfBuffers: Buffer[] = [];
        
        for (const evidence of evidenceList) {
          // Fetch sub-template
          const subTemplate = evidence.evidenceSubTemplateId 
            ? await db.getSubTemplateById(evidence.evidenceSubTemplateId)
            : null;
          
          // Parse customFields
          const customFields = evidence.customFields 
            ? JSON.parse(evidence.customFields)
            : {};
          
          // Build evidence data
          const evidenceData = {
            id: evidence.id,
            title: subTemplate?.title || "شاهد",
            standardName: "أداء الواجبات الوظيفية",
            description: subTemplate?.description || "",
            elementTitle: customFields.elementTitle || "",
            grade: customFields.grade || "",
            beneficiaries: customFields.beneficiaries || "",
            duration: customFields.duration || "",
            executionLocation: customFields.executionLocation || "",
            studentsCount: customFields.studentsCount || "",
            lessonTitle: customFields.lessonTitle || "",
            date: customFields.date || new Date().toISOString().split('T')[0],
            section1: evidence.section1Content || "",
            section2: evidence.section2Content || "",
            section3: evidence.section3Content || "",
            section4: evidence.section4Content || "",
            section5: evidence.section5Content || "",
            section6: evidence.section6Content || "",
            image1Url: evidence.image1Url || null,
            image2Url: evidence.image2Url || null,
            teacherName: profile?.teacherName || ctx.user.name || "المعلم",
            schoolName: profile?.schoolName || "المدرسة",
            principalName: profile?.principalName || "",
            educationDepartment: profile?.educationDepartment || "",
          };
          
          const pdfBuffer = await generateEvidencePages(evidenceData);
          evidencePdfBuffers.push(pdfBuffer);
        }
        
        // Merge: Cover + Empty Pages + All Evidence Pages
        const mergedPdf = await PDFDocument.create();
        
        // 1. Add cover + empty pages (7 pages total)
        const coverPdf = await PDFDocument.load(coverPdfBuffer);
        const coverPages = await mergedPdf.copyPages(coverPdf, coverPdf.getPageIndices());
        coverPages.forEach((page) => mergedPdf.addPage(page));
        
        // 2. Add all evidence pages sequentially
        for (const evidencePdfBuffer of evidencePdfBuffers) {
          const evidencePdf = await PDFDocument.load(evidencePdfBuffer);
          const evidencePages = await mergedPdf.copyPages(evidencePdf, evidencePdf.getPageIndices());
          evidencePages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const mergedPdfBytes = await mergedPdf.save();
        const mergedBuffer = Buffer.from(mergedPdfBytes);
        
        // Return as base64 for download
        return {
          pdf: mergedBuffer.toString('base64'),
          filename: `all-evidence-${ctx.user.id}-${Date.now()}.pdf`,
        };
      }),
    
    generatePreviewPDF: protectedProcedure
      .input(z.object({
        subTemplateId: z.number(),
        dynamicFields: z.any(),
        section1: z.string(),
        section2: z.string(),
        section3: z.string(),
        section4: z.string(),
        section5: z.string(),
        section6: z.string(),
        image1: z.string().nullable(),
        image2: z.string().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { generateEvidencePDF } = await import('./generatePDF');
        
        // Fetch teacher profile for additional data
        const profile = await db.getTeacherProfileByUserId(ctx.user.id);
        
        // Fetch sub-template for title and description
        const subTemplate = await db.getSubTemplateById(input.subTemplateId);
        
        // Build evidence data for PDF generation (without saving to DB)
        const evidenceData = {
          id: 0, // Temporary ID for preview
          subTemplateId: input.subTemplateId,
          title: subTemplate?.title || "شاهد",
          standardName: "أداء الواجبات الوظيفية",
          description: subTemplate?.description || "",
          // Page 1 fields from dynamicFields
          elementTitle: input.dynamicFields.title || "",
          grade: input.dynamicFields.grade || "",
          beneficiaries: input.dynamicFields.beneficiaries || "",
          duration: input.dynamicFields.duration || "",
          executionLocation: input.dynamicFields.location || "",
          studentsCount: input.dynamicFields.studentsCount || "",
          lessonTitle: input.dynamicFields.lessonTitle || "",
          date: input.dynamicFields.date || new Date().toISOString().split('T')[0],
          // Custom field labels
          field1Label: input.dynamicFields.field1Label || "مدة البرنامج",
          field2Label: input.dynamicFields.field2Label || "مكان التنفيذ",
          field3Label: input.dynamicFields.field3Label || "المستفيدون",
          field4Label: input.dynamicFields.field4Label || "التاريخ",
          field5Label: input.dynamicFields.field5Label || "الصف",
          field6Label: input.dynamicFields.field6Label || "العنوان",
          field7Label: input.dynamicFields.field7Label || "عدد الطلاب",
          field8Label: input.dynamicFields.field8Label || "عنوان الدرس",
          // Additional dynamic fields
          additionalFields: input.dynamicFields.additionalFields || "",
          // Page 2 sections
          section1: input.section1,
          section2: input.section2,
          section3: input.section3,
          section4: input.section4,
          section5: input.section5,
          section6: input.section6,
          // Images
          image1Url: input.image1,
          image2Url: input.image2,
          // Teacher info
          teacherName: profile?.teacherName || ctx.user.name || "المعلم",
          schoolName: profile?.schoolName || "المدرسة",
          principalName: profile?.principalName || "",
          educationDepartment: profile?.educationDepartment || "",
        };
        
        const pdfBuffer = await generateEvidencePDF(evidenceData);
        
        // Return as base64 for preview
        return {
          pdf: pdfBuffer.toString('base64'),
          filename: `preview-${Date.now()}.pdf`,
        };
      }),
  }),

  backgrounds: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBackgrounds();
    }),
  }),

  evidenceSubTemplates: router({
    listByStandard: publicProcedure
      .input(z.object({ 
        standardId: z.number()
      }))
      .query(async ({ input, ctx }) => {
        // Get all sub-templates for this standard
        const allTemplates = await db.getEvidenceSubTemplatesByStandard(input.standardId);
        
        // If user is not logged in, return all templates
        if (!ctx.user) {
          return allTemplates;
        }
        
        // Get teacher profile to filter by stages and subjects
        const profile = await db.getTeacherProfileByUserId(ctx.user.id);
        
        // If no profile, return all templates
        if (!profile) {
          return allTemplates;
        }
        
        // Parse teacher's stages and subjects
        let userStages: string[] = [];
        let userSubjects: string[] = [];
        
        try {
          if (profile.stage) {
            // Try to parse as JSON array first
            try {
              userStages = JSON.parse(profile.stage);
            } catch {
              // If not JSON, treat as single value
              userStages = [profile.stage];
            }
          }
          
          if (profile.subjects) {
            // Try to parse as JSON array first
            try {
              userSubjects = JSON.parse(profile.subjects);
            } catch {
              // If not JSON, treat as single value
              userSubjects = [profile.subjects];
            }
          }
        } catch (e) {
          console.error('Error parsing teacher profile data:', e);
        }
        
        // Filter templates based on teacher's profile
        const filteredTemplates = allTemplates.filter((template: any) => {
          // If template has no restrictions (all fields are null/empty), it's general → show it
          const hasNoRestrictions = 
            (!template.applicableStages || template.applicableStages === '[]') &&
            (!template.applicableSubjects || template.applicableSubjects === '[]') &&
            (!template.applicableGrades || template.applicableGrades === '[]');
          
          if (hasNoRestrictions) {
            return true; // Show general templates to everyone
          }
          
          // Parse template's applicable stages and subjects
          let templateStages: string[] = [];
          let templateSubjects: string[] = [];
          
          try {
            if (template.applicableStages && template.applicableStages !== '[]') {
              templateStages = JSON.parse(template.applicableStages);
            }
            if (template.applicableSubjects && template.applicableSubjects !== '[]') {
              templateSubjects = JSON.parse(template.applicableSubjects);
            }
          } catch (e) {
            console.error('Error parsing template restrictions:', e);
          }
          
          // Check if template matches teacher's stages or subjects
          const matchesStage = templateStages.length === 0 || 
            templateStages.some((stage: string) => userStages.includes(stage));
          
          const matchesSubject = templateSubjects.length === 0 || 
            templateSubjects.some((subject: string) => userSubjects.includes(subject));
          
          // Show template if it matches either stage OR subject
          return matchesStage || matchesSubject;
        });
        
        // Sort templates by id (order of creation/insertion)
        const sortedTemplates = [...filteredTemplates].sort((a: any, b: any) => a.id - b.id);
        
        return sortedTemplates;
      }),
  }),

});

export type AppRouter = typeof appRouter;
