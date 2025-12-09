import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { createDatabaseBackup } from "./backup";
import { TRPCError } from "@trpc/server";
import { storagePut } from "./storage";
import crypto from "crypto";
import { generatePDF } from "./pdfGenerator";

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
          // معلومات أساسية
          teacherName: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          gender: z.enum(["male", "female"]),
          profileImage: z.string().optional(),
          
          // معلومات مهنية
          educationDepartment: z.string().optional(),
          schoolName: z.string().optional(),
          principalName: z.string().optional(),
          stage: z.string().optional(), // JSON string للصفوف الدراسية
          subjects: z.string().optional(), // JSON string
          
          // معلومات الرخصة
          licenseNumber: z.string().optional(),
          licenseIssueDate: z.string().optional(),
          licenseExpiryDate: z.string().optional(),
          teacherLevel: z.enum(["practitioner", "advanced", "expert"]).optional(),
          
          // إعدادات التصميم
          preferredTheme: z.string().optional(),
          preferredCoverTheme: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.upsertTeacherProfile({
          userId: ctx.user.id,
          ...input,
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

    // حساب عدد المعايير المرتبطة بالمادة والمرحلة
    countBySubjectAndStage: protectedProcedure
      .input(
        z.object({
          subject: z.string().optional(),
          stage: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        // إذا لم يتم تحديد مادة أو مرحلة، نرجع إجمالي عدد المعايير
        if (!input.subject && !input.stage) {
          const allStandards = await db.listStandards();
          return { count: allStandards.length };
        }

        // حساب عدد المعايير المرتبطة
        const templates = await db.listEvidenceTemplates(input);
        // استخراج المعايير الفريدة من القوالب
        const uniqueStandardIds = new Set(templates.map((t: any) => t.standardId));
        return { count: uniqueStandardIds.size };
      }),

    // حساب تقدم الشواهد لمعيار محدد
    getProgress: protectedProcedure
      .input(z.object({ standardId: z.number() }))
      .query(async ({ ctx, input }) => {
        // جلب جميع الشواهد المتاحة للمعيار
        const templates = await db.listEvidenceTemplates({ standardId: input.standardId });
        const totalCount = templates.length;

        // جلب الشواهد المعبأة من قبل المعلم
        const userEvidences = await db.listUserEvidences(ctx.user.id);
        
        // حساب عدد الشواهد المعبأة لهذا المعيار
        const completedCount = userEvidences.filter(
          (evidence: any) => evidence.standardId === input.standardId
        ).length;

        return {
          totalCount,
          completedCount,
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        };
      }),

    // حساب تقدم جميع المعايير (للمؤشرات الدائرية)
    getAllProgress: protectedProcedure
      .query(async ({ ctx }) => {
        // جلب جميع المعايير
        const standards = await db.listStandards();
        
        // جلب جميع الشواهد المتاحة
        const allTemplates = await db.listEvidenceTemplates({});
        
        // جلب الشواهد المعبأة من قبل المعلم
        const userEvidences = await db.listUserEvidences(ctx.user.id);
        
        // حساب النسبة لكل معيار
        const progressMap: Record<number, number> = {};
        
        for (const standard of standards) {
          const standardTemplates = allTemplates.filter(
            (t: any) => t.standardId === standard.id
          );
          const totalCount = standardTemplates.length;
          
          const completedCount = userEvidences.filter(
            (e: any) => e.standardId === standard.id
          ).length;
          
          progressMap[standard.id] = totalCount > 0 
            ? Math.round((completedCount / totalCount) * 100) 
            : 0;
        }
        
        return progressMap;
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

    uploadImage: protectedProcedure
      .input(
        z.object({
          imageData: z.string(), // base64
          fileName: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // تحويل base64 إلى buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        
        // توليد اسم ملف فريد
        const randomSuffix = crypto.randomBytes(8).toString('hex');
        const ext = input.fileName.split('.').pop() || 'jpg';
        const fileKey = `evidence-images/${ctx.user.id}/${Date.now()}-${randomSuffix}.${ext}`;
        
        // رفع إلى S3
        const mimeType = input.imageData.match(/^data:([^;]+);/)?.[1] || 'image/jpeg';
        const result = await storagePut(fileKey, buffer, mimeType);
        
        return { url: result.url, key: fileKey };
      }),

    generatePDF: protectedProcedure
      .input(
        z.object({
          evidenceName: z.string(),
          subEvidenceName: z.string().optional(),
          description: z.string(),
          userFieldsData: z.record(z.string(), z.unknown()),
          page2BoxesData: z.array(z.object({
            title: z.string(),
            content: z.string(),
          })),
          image1Url: z.string().nullable().optional(),
          image2Url: z.string().nullable().optional(),
          selectedTheme: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // توليد PDF
        const pdfBuffer = await generatePDF(input);
        
        // رفع PDF إلى S3
        const randomSuffix = crypto.randomBytes(8).toString('hex');
        const fileKey = `evidence-pdfs/${ctx.user.id}/${Date.now()}-${randomSuffix}.pdf`;
        const result = await storagePut(fileKey, pdfBuffer, 'application/pdf');
        
        return { url: result.url, key: fileKey };
      }),

    create: protectedProcedure
      .input(
        z.object({
          templateId: z.number(),
          userData: z.string(), // JSON
          image1Url: z.string().nullable().optional(),
          image2Url: z.string().nullable().optional(),
          selectedTheme: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Increment template usage count
        await db.incrementTemplateUsage(input.templateId);
        
        // توليد PDF
        const template = await db.getEvidenceTemplate(input.templateId);
        const userData = JSON.parse(input.userData);
        
        const pdfData = {
          evidenceName: template.evidenceName,
          subEvidenceName: template.subEvidenceName || undefined,
          description: userData.description,
          userFieldsData: userData.userFieldsData,
          page2BoxesData: userData.page2BoxesData,
          image1Url: input.image1Url,
          image2Url: input.image2Url,
          selectedTheme: input.selectedTheme || 'classic',
        };
        
        const pdfBuffer = await generatePDF(pdfData);
        
        // رفع PDF إلى S3
        const randomSuffix = crypto.randomBytes(8).toString('hex');
        const fileKey = `evidence-pdfs/${ctx.user.id}/${Date.now()}-${randomSuffix}.pdf`;
        const pdfResult = await storagePut(fileKey, pdfBuffer, 'application/pdf');
        
        return await db.createUserEvidence({
          userId: ctx.user.id,
          customImageUrl: input.image1Url,
          pdfUrl: pdfResult.url,
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

  // ========================================
  // Custom Evidences
  // ========================================
  customEvidences: router({
    create: protectedProcedure
      .input(
        z.object({
          standardId: z.number(),
          evidenceName: z.string(),
          description: z.string(),
          grades: z.array(z.string()), // مصفوفة من أسماء الصفوف
          subject: z.string().optional(),
          customFields: z.array(z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await db.createCustomEvidence({
          userId: ctx.user.id,
          ...input,
        });
        
        // إرسال إشعار للمالك
        await notifyOwner({
          title: "طلب شاهد خاص جديد",
          content: `المعلم: ${ctx.user.name || 'غير محدد'}\nاسم الشاهد: ${input.evidenceName}\nالوصف: ${input.description.substring(0, 200)}...\nالصفوف: ${input.grades.join(', ')}`,
        }).catch(err => {
          console.error('فشل إرسال الإشعار:', err);
        });
        
        return result;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.listCustomEvidences(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomEvidence(input.id);
      }),

    // للمالك فقط
    listAll: protectedProcedure.query(async ({ ctx }) => {
      // TODO: إضافة فحص للمالك (ctx.user.role === 'admin')
      return await db.listAllCustomEvidences();
    }),

    makePublic: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          ownerNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: إضافة فحص للمالك (ctx.user.role === 'admin')
        await db.makeCustomEvidencePublic(input.id, input.ownerNotes);
        return { success: true };
      }),
  }),

  // ========================================
  // Admin Panel
  // ========================================
  admin: router({
    // النسخ الاحتياطي
    createBackup: protectedProcedure.mutation(async ({ ctx }) => {
      // التحقق من صلاحيات المشرف
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const result = await createDatabaseBackup();
      return result;
    }),

    // قائمة جميع المستخدمين
    listUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      return await db.getAllUsers();
    }),

    // إحصائيات مستخدم معين
    getUserStats: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        return await db.getUserStatistics(input.userId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
