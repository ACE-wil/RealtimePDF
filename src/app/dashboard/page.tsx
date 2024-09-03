import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/dist/server/api-utils";

const Page = async (res:any) => {
    const {getUser} = getKindeServerSession();
    const user = await getUser();
    
    if (!user || !user.id) redirect(res,302,'auth-callback?origin=dashboard')
        // 如果用户不存在，跳转到登录页面

    return <div>{user.email}</div>
}

export default Page;