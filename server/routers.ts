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
  }),

  backgrounds: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBackgrounds();
    }),
  }),

  evidenceSubTemplates: router({
    listByStandard: publicProcedure
      .input(z.object({ standardId: z.number() }))
      .query(async ({ input }) => {
        return await db.getEvidenceSubTemplatesByStandard(input.standardId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
