
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { privateProcedure, publicProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { z } from 'zod'

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

    // Api端点3：上传文件/私密
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

    // Api端点4：删除文件/私密
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