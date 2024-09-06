
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';

export const appRouter = router({
    // Api端点1：身份验证/公共回调
        authCallback: publicProcedure.query(async () => {
            const { getUser } = getKindeServerSession();
            const user = await getUser();
            if (!user?.id || !user?.email)
                throw new TRPCError({ code: 'UNAUTHORIZED' });

            const dbUser = await db.user.findFirst({
                where: {
                    id: user.id
                }
            })

            if(!dbUser) {
                // 在数据库添加
                await db.user.create({
                    data: {
                        id: user.id,
                        email: user.email,
                        name: user.username || 'Default Name', // 确保 name 字段有默认值
                    }
                })
            }



            return { success:true }
        }),
    
    // Api端点2：获取用户文件/私密
        getUserFiles: privateProcedure.query(async ({ctx}) => {
            const { userId } = ctx;
            
            return await db.file.findMany({
                where: {
                    userId
                }
            })
        }),

    // Api端点

    getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }

      return {
        messages,
        nextCursor,
      }
    }),
    

    // Api端点3：

        getFileUploadStatus: privateProcedure
            .input(z.object({ fileId: z.string() }))
            .query(async ({input, ctx}) => {
                const file = await db.file.findFirst({
                    where: {
                        id: input.fileId,
                        userId: ctx.userId
                    },
                })

                if(!file) return { status: 'PENDING' as const }

                return {status: file.uploadStatus}
            }),

    // Api端点4：上传文件/私密
        getFile: privateProcedure.input(z.object({key: z.string()}))
        .mutation(async ({ctx, input}) => {
            const {userId} = ctx

            const file = await db.file.findFirst({
                where: {
                    key: input.key,
                    userId,
                },
            })

            if(!file) throw new TRPCError({ code: 'NOT_FOUND' });

            return file
        }),

    // Api端点5：删除文件/私密
        deleteFile: privateProcedure.input(
            z.object({ id: z.string() })
        ).mutation(async ({ctx, input}) => {
            const { userId } = ctx

            const file = await db.file.findFirst({
                where: {
                    id: input.id,
                    userId,
                },
            })

            if (!file) throw new TRPCError({ code: 'NOT_FOUND' });

            await db.file.delete({ where: { id: input.id } });
            return file
        }),

});

export type AppRouter = typeof appRouter;