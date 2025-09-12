// thirdPartyAuth.ts - 第三方登录配置文件

// 设备检测工具函数
const detectDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile: isMobile && !isTablet,
    isTablet,
    isDesktop,
    isIOS: /iphone|ipad|ipod/i.test(userAgent),
    isAndroid: /android/i.test(userAgent),
    userAgent
  };
};

// 获取环境变量配置
const getEnvConfig = () => {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';

  return {
    baseUrl,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mockLogin: import.meta.env.VITE_MOCK_LOGIN === 'true',
    device: detectDevice()
  };
};

const envConfig = getEnvConfig();

// QQ登录配置
export const qqConfig = {
  // 使用您提供的QQ机器人配置
  appId: '102807541', // QQ机器人ID (从您提供的配置中获取)
  appKey: 'JtBzalUdIXvEeBNE4xfds9Hwb8vW0xcX', // QQ机器人令牌 (从您提供的配置中获取)
  appSecret: '', // QQ机器人密钥（需要您提供完整的密钥）
  redirectUri: `${envConfig.baseUrl}/qq-callback`, // 回调地址，需与开放平台配置一致
  scope: 'get_user_info', // 申请的权限范围
  responseType: 'code',
  state: 'random_state_string', // 防CSRF攻击的随机字符串

  // PC端配置
  pc: {
    authUrl: 'https://graph.qq.com/oauth2.0/authorize', // PC端网页授权
    loginUrl: 'https://graph.qq.com/oauth2.0/show?which=Login&display=pc' // PC端登录页面
  },

  // 移动端配置
  mobile: {
    // 移动端网页授权URL
    authUrl: 'https://graph.qq.com/oauth2.0/authorize',
    // 移动端专用的登录页面
    mobileLoginUrl: 'https://graph.qq.com/oauth2.0/show?which=Login&display=mobile',
    // QQ手机客户端URL Scheme（Android）
    androidScheme: 'mqqopensdkapi://bizAgent/qm/qr',
    // QQ手机客户端URL Scheme（iOS）
    iosScheme: 'mqq://card/show_pslcard'
  }
};

// 微信登录配置
export const wechatConfig = {
  appId: import.meta.env.VITE_WECHAT_APP_ID || '3822', // 使用您提供的正确APPID
  redirectUri: `${envConfig.baseUrl}/wechat-callback`,
  scope: 'snsapi_login',
  state: 'random_state_string'
};

// 微博登录配置
export const weiboConfig = {
  appKey: import.meta.env.VITE_WEIBO_APP_KEY || '你的微博APP Key',
  redirectUri: `${envConfig.baseUrl}/weibo-callback`,
  scope: 'all',
  state: 'random_state_string'
};

// QQ登录URL生成器（根据设备类型）
const generateQQAuthUrl = () => {
  const device = detectDevice();
  const baseParams = `response_type=${qqConfig.responseType}&client_id=${qqConfig.appId}&redirect_uri=${encodeURIComponent(qqConfig.redirectUri)}&scope=${qqConfig.scope}&state=${qqConfig.state}`;

  if (device.isDesktop) {
    // PC端：使用标准的网页授权
    return `${qqConfig.pc.authUrl}?${baseParams}&display=pc`;
  } else {
    // 移动端：使用移动端优化的授权页面，添加mobile显示模式
    return `${qqConfig.mobile.authUrl}?${baseParams}&display=mobile&g_tk=5381`;
  }
};

// 检查是否可以唤起QQ手机客户端
const canOpenQQApp = () => {
  const device = detectDevice();
  return device.isMobile && (device.isAndroid || device.isIOS);
};

// 尝试唤起QQ手机客户端
export const tryOpenQQApp = () => {
  if (!canOpenQQApp()) {
    return false;
  }

  const device = detectDevice();
  console.log('尝试唤起QQ客户端，设备信息:', device);

  // 对于移动端，我们直接跳转到移动端网页版，避免客户端唤起的复杂性
  console.log('移动端检测到，直接跳转到移动端网页版QQ登录');
  const mobileAuthUrl = generateQQAuthUrl();
  console.log('移动端QQ登录URL:', mobileAuthUrl);

  // 直接跳转到移动端网页版，这样更稳定
  window.location.href = mobileAuthUrl;
  return true;

  // 注释掉客户端唤起逻辑，因为它经常导致问题
  /*
  if (device.isAndroid) {
    // Android QQ客户端URL Scheme
    const qqAppUrl = `${qqConfig.mobile.androidScheme}?url=${encodeURIComponent(generateQQAuthUrl())}&style=1`;
    console.log('Android QQ客户端URL:', qqAppUrl);

    try {
      window.location.href = qqAppUrl;
    } catch (error) {
      console.error('唤起Android QQ客户端失败:', error);
      window.location.href = generateQQAuthUrl();
      return true;
    }

    // 设置超时，如果没有成功唤起客户端，则跳转到网页版
    setTimeout(() => {
      if (!document.hidden) {
        console.log('Android QQ客户端唤起超时，跳转到网页版');
        window.location.href = generateQQAuthUrl();
      }
    }, 1500);

    return true;
  } else if (device.isIOS) {
    // iOS QQ客户端URL Scheme
    const qqAppUrl = `${qqConfig.mobile.iosScheme}?src_type=internal&version=1`;
    console.log('iOS QQ客户端URL:', qqAppUrl);

    try {
      window.location.href = qqAppUrl;
    } catch (error) {
      console.error('唤起iOS QQ客户端失败:', error);
      window.location.href = generateQQAuthUrl();
      return true;
    }

    // 设置超时，如果没有成功唤起客户端，则跳转到网页版
    setTimeout(() => {
      if (!document.hidden) {
        console.log('iOS QQ客户端唤起超时，跳转到网页版');
        window.location.href = generateQQAuthUrl();
      }
    }, 1500);

    return true;
  }
  */
};

// 第三方登录URL生成器
export const generateAuthUrl = (platform: 'qq' | 'wechat' | 'weibo') => {
  switch (platform) {
    case 'qq':
      return generateQQAuthUrl();

    case 'wechat':
      return `https://open.weixin.qq.com/connect/qrconnect?appid=${wechatConfig.appId}&redirect_uri=${encodeURIComponent(wechatConfig.redirectUri)}&response_type=code&scope=${wechatConfig.scope}&state=${wechatConfig.state}`;

    case 'weibo':
      return `https://api.weibo.com/oauth2/authorize?client_id=${weiboConfig.appKey}&redirect_uri=${encodeURIComponent(weiboConfig.redirectUri)}&scope=${weiboConfig.scope}&state=${weiboConfig.state}`;

    default:
      throw new Error('不支持的登录平台');
  }
};

// 环境配置
export const getEnvironmentConfig = () => {
  return {
    ...envConfig,
    apiUrl: import.meta.env.VITE_API_BASE_URL || (envConfig.isDevelopment ? 'http://localhost:5000' : 'https://your-api-domain.com')
  };
};

// 导出设备检测函数
export const getDeviceInfo = detectDevice;

// 创建移动端友好的QQ登录URL
export const createMobileQQLoginUrl = () => {
  // 使用QQ互联官方的移动端登录页面
  const params = new URLSearchParams({
    response_type: qqConfig.responseType,
    client_id: qqConfig.appId,
    redirect_uri: qqConfig.redirectUri,
    scope: qqConfig.scope,
    state: qqConfig.state,
    display: 'mobile', // 强制移动端显示
    // 添加移动端特定参数
    src: 'mobile_web',
    theme: 'mobile'
  });

  return `${qqConfig.mobile.authUrl}?${params.toString()}`;
};

// 验证APP ID是否有效
export const validateQQAppId = (appId: string): boolean => {
  // QQ互联的APP ID通常是9位数字
  const appIdPattern = /^\d{9}$/;
  return appIdPattern.test(appId);
};

// QQ登录启动函数
export const startQQLogin = () => {
  const device = detectDevice();
  console.log('启动QQ登录，设备信息:', device);

  if (device.isMobile) {
    // 移动端：直接跳转到移动端优化的QQ登录页面
    const mobileUrl = createMobileQQLoginUrl();
    console.log('移动端QQ登录URL:', mobileUrl);
    window.location.href = mobileUrl;
  } else {
    // 桌面端：在新窗口打开QQ登录页面
    const desktopUrl = generateQQAuthUrl();
    console.log('桌面端QQ登录URL:', desktopUrl);

    const popup = window.open(
      desktopUrl,
      'qqLogin',
      'width=600,height=500,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      console.warn('弹窗被阻止，改为页面跳转');
      window.location.href = desktopUrl;
    }
  }
};

// 第三方登录平台信息
export const platformInfo = {
  qq: {
    name: 'QQ',
    color: '#1296DB',
    icon: '🐧',
    description: 'QQ账号快速登录'
  },
  wechat: {
    name: '微信',
    color: '#07C160',
    icon: '💬',
    description: '微信账号快速登录'
  },
  weibo: {
    name: '微博',
    color: '#E6162D',
    icon: '📺',
    description: '微博账号快速登录'
  }
};
