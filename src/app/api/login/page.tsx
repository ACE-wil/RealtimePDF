import ReactDOM from "react-dom";
import { Guard } from "@authing/react-ui-components";
// 引入 css 文件
import "@authing/react-ui-components/lib/index.min.css";

// React 18
// import { createRoot } from 'react-dom/client'
// import { Guard } from "@authing/react18-ui-components";
// import "@authing/react18-ui-components/lib/index.min.css";

import React from "react";

const login = () => {
  // 替换你的 AppId
  const appId = "66d468f0e3ca1ba817c77bb7";

  const onLogin = (userInfo: any) => {
    console.log(userInfo);
  };

  return <Guard appId={appId} onLogin={onLogin} />;
};

// React 16/17
export default login