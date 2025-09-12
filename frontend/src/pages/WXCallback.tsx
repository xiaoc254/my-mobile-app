import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 定义postMessage的消息类型接口
interface WxLoginMessage {
  type: 'WX_LOGIN_CODE';
  code: string;
}

const WXCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      // 类型断言确保消息格式正确
      const message: WxLoginMessage = { 
        type: 'WX_LOGIN_CODE', 
        code 
      };
      // 对window.opener进行类型检查
      if (window.opener) {
        window.opener.postMessage(message, '*');
      } else {
        console.error('未找到父窗口');
      }
      window.close();
    } else {
      console.error('未获取到授权码');
      window.close();
    }
  }, [location]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '16px' as const
    }}>
      正在处理微信登录...
    </div>
  );
};

export default WXCallback;