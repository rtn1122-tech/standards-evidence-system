import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  // ========================================
  // Auth
  // ========================================
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: protectedProcedure.mutation(({ ctx }) => {
      // Clear session cookie
      ctx.res.clearCookie('session');
      return { success: true };
    }),
  }),

  // ========================================
  // Teacher Profile
  // ========================================
  teacherProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTeacherProfile(ctx.user.id);
    }),

    upsert: protectedProcedure
      .input(
        z.object({
          educationDepartment: z.string().optional(),
          schoolName: z.string().optional(),
          teacherName: z.string().optional(),
          principalName: z.string().optional(),
          gender: z.enum(["male", "female"]),
          stage: z.string().optional(),
          subjects: z.string().optional(),
          selectedTheme: z.string().optional(),
          email: z.string().optional(),
          phoneNumber: z.string().optional(),
          professionalLicenseNumber: z.string().optional(),
          licenseStartDate: z.string().optional(),
          licenseEndDate: z.string().optional(),
          employeeNumber: z.string().optional(),
          jobTitle: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertTeacherProfile({
          userId: ctx.user.id,
          ...input,
          licenseStartDate: input.licenseStartDate ? new Date(input.licenseStartDate) : undefined,
          licenseEndDate: input.licenseEndDate ? new Date(input.licenseEndDate) : undefined,
        } as any);
      }),
  }),

  // ========================================
  // Standards
  // ========================================
  standards: router({
    list: publicProcedure.query(async () => {
      return await db.listStandards();
    }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getStandard(input.id);
      }),
  }),

  // ========================================
  // Evidence Templates
  // ========================================
  evidenceTemplates: router({
    list: publicProcedure
      .input(
        z.object({
          standardId: z.number().optional(),
          subject: z.string().optional(),
          stage: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await db.listEvidenceTemplates(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEvidenceTemplate(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          standardId: z.number(),
          standardCode: z.string(),
          standardName: z.string(),
          evidenceName: z.string(),
          subEvidenceName: z.string().optional(),
          description: z.string(),
          defaultImageUrl: z.string().optional(),
          page2Boxes: z.string(), // JSON
          userFields: z.string(), // JSON
          subject: z.string().optional(),
          stage: z.enum(["primary", "middle", "high", "all"]).default("all"),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createEvidenceTemplate(input as any);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            standardId: z.number().optional(),
            standardCode: z.string().optional(),
            standardName: z.string().optional(),
            evidenceName: z.string().optional(),
            subEvidenceName: z.string().optional(),
            description: z.string().optional(),
            defaultImageUrl: z.string().optional(),
            page2Boxes: z.string().optional(),
            userFields: z.string().optional(),
            subject: z.string().optional(),
            stage: z.enum(["primary", "middle", "high", "all"]).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateEvidenceTemplate(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEvidenceTemplate(input.id);
        return { success: true };
      }),
  }),

  // ========================================
  // User Evidences
  // ========================================
  userEvidences: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.listUserEvidences(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserEvidence(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          userData: z.string(), // JSON
          customImageUrl: z.string().optional(),
          themeId: z.number().optional(),
          coverThemeId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Increment template usage count
        await db.incrementTemplateUsage(input.templateId);
        
        return await db.createUserEvidence({
          userId: ctx.user.id,
          ...input,
        } as any);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            userData: z.string().optional(),
            customImageUrl: z.string().optional(),
            themeId: z.number().optional(),
            coverThemeId: z.number().optional(),
            pdfUrl: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateUserEvidence(input.id, input.data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUserEvidence(input.id);
        return { success: true };
      }),
  }),

  // ========================================
  // Themes
  // ========================================
  themes: router({
    list: publicProcedure
      .input(z.object({ type: z.enum(["full", "cover"]).optional() }).optional())
      .query(async ({ input }) => {
        return await db.listThemes(input?.type);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTheme(input.id);
      }),
  }),

  // ========================================
  // Custom Service
  // ========================================
  customService: router({
    // Create a new custom service request
    createRequest: protectedProcedure
      .input(
        z.object({
          templateIds: z.array(z.number()),
          imageUrls: z.array(z.string()),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.createCustomServiceRequest({
          userId: ctx.user.id,
          templateIds: input.templateIds,
          imageUrls: input.imageUrls,
          notes: input.notes,
        });
      }),

    // Upload image to S3
    uploadImage: protectedProcedure
      .input(
        z.object({
          imageData: z.string(), // base64 data URL
          filename: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Extract base64 data
        const matches = input.imageData.match(/^data:(.+);base64,(.+)$/);
        if (!matches) {
          throw new Error("صيغة الصورة غير صحيحة");
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const ext = input.filename.split('.').pop();
        const fileKey = `custom-service/${timestamp}-${randomSuffix}.${ext}`;
        
        // Upload to S3
        const { storagePut } = await import("./storage");
        const { url } = await storagePut(fileKey, buffer, mimeType);
        
        return { url };
      }),

    // List user's custom service requests
    listRequests: protectedProcedure.query(async ({ ctx }) => {
      return await db.listCustomServiceRequests(ctx.user.id);
    }),

    // Get request details
    getRequest: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getCustomServiceRequest(input.id, ctx.user.id);
      }),
  }),

  // ========================================
  // Print Orders
  // ========================================
  printOrders: router({
    // Create a new print order
    create: protectedProcedure
      .input(
        z.object({
          evidenceIds: z.array(z.number()),
          paperType: z.enum(["standard", "premium", "vip"]),
          bindingType: z.enum(["spiral", "thermal", "luxury"]),
          copies: z.number().min(1).max(5),
          shippingAddress: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Calculate price
        const basePrices = {
          standard: 50,
          premium: 80,
          vip: 120,
        };
        const price = basePrices[input.paperType] * input.copies;
        
        // Create order
        const order = await db.createPrintOrder({
          userId: ctx.user.id,
          evidenceIds: input.evidenceIds,
          paperType: input.paperType,
          bindingType: input.bindingType,
          copies: input.copies,
          price,
          shippingAddress: input.shippingAddress,
          notes: input.notes,
        });
        
        // TODO: Generate Salla payment link
        // For now, return the order
        return { orderId: order.id, paymentUrl: null };
      }),

    // List user's print orders
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.listPrintOrders(ctx.user.id);
    }),

    // Get order details
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getPrintOrder(input.id, ctx.user.id);
      }),
  }),

  // ========================================
  // Activation
  // ========================================
  activation: router({
    verify: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const activationCode = await db.getActivationCode(input.code);
        
        if (!activationCode) {
          throw new Error("رمز التفعيل غير صحيح");
        }
        
        if (activationCode.isUsed) {
          throw new Error("رمز التفعيل مستخدم بالفعل");
        }
        
        // تفعيل الاشتراك لمدة سنة (حتى 10 محرم 1448هـ)
        const subscriptionStart = new Date();
        const subscriptionEnd = new Date('2027-07-08'); // 10 محرم 1448هـ
        
        await db.useActivationCode(input.code, ctx.user.id);
        await db.updateUserSubscription(ctx.user.id, {
          activationCode: input.code,
          subscriptionStart,
          subscriptionEnd,
          isActive: true,
        });
        
        return { success: true, subscriptionEnd };
      }),
  }),
});

export type AppRouter = typeof appRouter;
