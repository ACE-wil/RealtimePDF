// app/login/page.tsx
import React from 'react';
import { Guard } from '@authing/react-ui-components';
import '@authing/react-ui-components/lib/index.min.css';
import { initAuthClient, getAuthClient } from '@authing/react-ui-components';

// 初始化 authClient
initAuthClient({
  appId: process.env.NEXT_PUBLIC_AUTHING_APP_ID,
});

const Login = () => {
  // 替换你的 AppId
  const appId = process.env.NEXT_PUBLIC_AUTHING_APP_ID;

  const onLogin = (userInfo: any) => {
    console.log(userInfo);
    // 在这里处理登录成功的逻辑
  };

  return (
    <Guard appId={appId} onLogin={onLogin} />
  );
};

export default Login;