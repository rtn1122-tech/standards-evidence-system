import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

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
      const allEvidence = await db.getUserEvidenceByUserId(ctx.user.id);
      const completedEvidence = allEvidence.filter(e => e.isCompleted);
      
      const totalCount = standards.length;
      const completedCount = completedEvidence.length;
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
  }),

  evidence: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEvidenceByUserId(ctx.user.id);
    }),
    
    listByStandard: protectedProcedure
      .input(z.object({ standardId: z.number() }))
      .query(async ({ input, ctx }) => {
        const allEvidence = await db.getUserEvidenceByUserId(ctx.user.id);
        return allEvidence.filter(e => e.standardId === input.standardId);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const evidence = await db.getUserEvidenceById(input.id);
        if (evidence && evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return evidence;
      }),
    
    create: protectedProcedure
      .input(z.object({
        evidenceTemplateId: z.number(),
        standardId: z.number(),
        page1Title: z.string().optional(),
        page1Content: z.string().optional(),
        page1Images: z.string().optional(),
        page2Title: z.string().optional(),
        page2Content: z.string().optional(),
        page2Images: z.string().optional(),
        eventDate: z.date().optional(),
        lessonName: z.string().optional(),
        celebrationName: z.string().optional(),
        initiativeName: z.string().optional(),
        additionalData: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createUserEvidence({
          userId: ctx.user.id,
          ...input,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        page1Title: z.string().optional(),
        page1Content: z.string().optional(),
        page1Images: z.string().optional(),
        page2Title: z.string().optional(),
        page2Content: z.string().optional(),
        page2Images: z.string().optional(),
        eventDate: z.date().optional(),
        lessonName: z.string().optional(),
        celebrationName: z.string().optional(),
        initiativeName: z.string().optional(),
        additionalData: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const evidence = await db.getUserEvidenceById(id);
        
        if (!evidence || evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.updateUserEvidence(id, data);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const evidence = await db.getUserEvidenceById(input.id);
        
        if (!evidence || evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.deleteUserEvidence(input.id);
        
        return { success: true };
      }),
  }),

  userEvidence: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserEvidenceByUserId(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const evidence = await db.getUserEvidenceById(input.id);
        if (evidence && evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return evidence;
      }),
    
    create: protectedProcedure
      .input(z.object({
        evidenceTemplateId: z.number(),
        standardId: z.number(),
        page1Title: z.string().optional(),
        page1Content: z.string().optional(),
        page1Images: z.string().optional(),
        page2Title: z.string().optional(),
        page2Content: z.string().optional(),
        page2Images: z.string().optional(),
        eventDate: z.date().optional(),
        lessonName: z.string().optional(),
        celebrationName: z.string().optional(),
        initiativeName: z.string().optional(),
        additionalData: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createUserEvidence({
          userId: ctx.user.id,
          ...input,
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        page1Title: z.string().optional(),
        page1Content: z.string().optional(),
        page1Images: z.string().optional(),
        page2Title: z.string().optional(),
        page2Content: z.string().optional(),
        page2Images: z.string().optional(),
        eventDate: z.date().optional(),
        lessonName: z.string().optional(),
        celebrationName: z.string().optional(),
        initiativeName: z.string().optional(),
        additionalData: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const evidence = await db.getUserEvidenceById(id);
        
        if (!evidence || evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.updateUserEvidence(id, data);
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const evidence = await db.getUserEvidenceById(input.id);
        
        if (!evidence || evidence.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.deleteUserEvidence(input.id);
        
        return { success: true };
      }),
  }),

  backgrounds: router({
    list: publicProcedure.query(async () => {
      return await db.getAllBackgrounds();
    }),
  }),
});

export type AppRouter = typeof appRouter;
