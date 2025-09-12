// import React from 'react';

// interface WechatLoginProps {
//   onLoginSuccess?: (userInfo: any) => void;
//   onLoginError?: (error: string) => void;
// }

// const WechatLogin: React.FC<WechatLoginProps> = ({ onLoginSuccess, onLoginError }) => {
//   // 监听微信登录回调消息
//   React.useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       if (event.data.type === 'WX_LOGIN_CODE') {
//         handleWXCallback(event.data.code);
//       }
//     };

//     window.addEventListener('message', handleMessage);
//     return () => window.removeEventListener('message', handleMessage);
//   }, []);

//   // 处理微信登录回调 - 使用您原始文件中的逻辑
//   const handleWXCallback = async (code: string) => {
//     try {
//       // 1. 获取access_token - 使用您提供的新配置
//       const appid = "3822";
//       const secret = "93154ff118b16b5371aa260e35ba49cd";
//       const tokenResponse = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`);
//       const tokenData = await tokenResponse.json();
//       const { access_token, openid } = tokenData;

//       // 2. 获取用户信息
//       const userInfoResponse = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`);
//       const userInfo = await userInfoResponse.json();

//       if (userInfo.openid) {
//         // 登录成功，保存用户信息并跳转
//         const userData = {
//           nickname: userInfo.nickname,
//           avatar: userInfo.headimgurl,
//           openId: userInfo.openid
//         };
        
//         localStorage.setItem('userInfo', JSON.stringify(userData));
//         localStorage.setItem('token', 'wechat_' + openid); // 简单的token生成

//         onLoginSuccess?.(userData);
//       } else {
//         throw new Error(userInfo.errmsg || '获取用户信息失败');
//       }
//     } catch (error) {
//       console.error('微信登录错误:', error);
//       onLoginError?.('微信登录失败，请重试');
//     }
//   };

//   const handleWechatLogin = async () => {
//     console.log('微信登录按钮被点击了！');
//     alert('微信登录按钮被点击了！');
    
//     try {
//       // 使用您提供的新配置跳转到微信登录页面
//       const appId = "3822"; // 使用您提供的正确APPID
//       const loginUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${appId}&redirect_uri=${encodeURIComponent('http://127.0.0.1:5173/wx-callback')}&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect`;
      
//       console.log('准备跳转到微信登录页面:', loginUrl);
//       alert('准备跳转到微信登录页面');
      
//       // 直接跳转到微信登录页面
//       window.location.href = loginUrl;
      
//     } catch (error) {
//       console.error('微信登录启动失败:', error);
//       alert('微信登录启动失败: ' + (error as Error).message);
//       onLoginError?.('微信登录启动失败，请重试');
//     }
//   };

//   return (
//     <button
//       onClick={handleWechatLogin}
//       style={{
//         width: '50px',
//         height: '50px',
//         borderRadius: '50%',
//         background: 'linear-gradient(135deg, #07C160 0%, #05A050 100%)',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         cursor: 'pointer',
//         border: 'none',
//         boxShadow: `
//           0 8px 25px rgba(7, 193, 96, 0.4),
//           0 4px 15px rgba(7, 193, 96, 0.2),
//           inset 0 1px 0 rgba(255, 255, 255, 0.2)
//         `,
//         transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
//         position: 'relative',
//         overflow: 'hidden',
//         fontSize: '24px'
//       }}
//       onMouseOver={(e) => {
//         const target = e.target as HTMLButtonElement;
//         target.style.transform = 'scale(1.15) translateY(-2px)';
//         target.style.background = 'linear-gradient(135deg, #08D170 0%, #06B060 100%)';
//         target.style.boxShadow = `
//           0 12px 35px rgba(7, 193, 96, 0.5),
//           0 6px 25px rgba(7, 193, 96, 0.3),
//           inset 0 1px 0 rgba(255, 255, 255, 0.3)
//         `;
//       }}
//       onMouseOut={(e) => {
//         const target = e.target as HTMLButtonElement;
//         target.style.transform = 'scale(1) translateY(0)';
//         target.style.background = 'linear-gradient(135deg, #07C160 0%, #05A050 100%)';
//         target.style.boxShadow = `
//           0 8px 25px rgba(7, 193, 96, 0.4),
//           0 4px 15px rgba(7, 193, 96, 0.2),
//           inset 0 1px 0 rgba(255, 255, 255, 0.2)
//         `;
//       }}
//     >
//       💬
//     </button>
//   );
// };

// export default WechatLogin;
