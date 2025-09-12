// authService.ts - 第三方登录服务
import { generateAuthUrl, qqConfig, getDeviceInfo, createMobileQQLoginUrl, validateQQAppId } from '../config/thirdPartyAuth';

// 第三方登录类型
export type ThirdPartyPlatform = 'qq' | 'wechat' | 'weibo';

// 用户信息接口
export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  platform: ThirdPartyPlatform;
  openid?: string;
  unionid?: string;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  token?: string;
  userInfo?: UserInfo;
  error?: string;
}

class AuthService {

  // 发起第三方登录
  public initiateThirdPartyLogin(platform: ThirdPartyPlatform): void {
    try {
      // 获取设备信息
      const deviceInfo = getDeviceInfo();
      console.log('设备信息:', deviceInfo);
      
      // 保存登录状态到localStorage
      localStorage.setItem('loginPlatform', platform);
      localStorage.setItem('loginTimestamp', Date.now().toString());
      localStorage.setItem('deviceType', deviceInfo.isDesktop ? 'desktop' : 'mobile');
      
      // QQ登录特殊处理
      if (platform === 'qq') {
        this.handleQQLogin(deviceInfo);
        return;
      }
      
      // 其他平台的登录处理
      const authUrl = generateAuthUrl(platform);
      console.log(`生成的${platform}登录URL:`, authUrl);
      
      // 检查URL是否有效
      if (!authUrl || authUrl.includes('你的APP ID')) {
        throw new Error(`${platform}登录配置不完整，请检查APP ID和APP Key`);
      }
      
      // 跳转到第三方登录页面
      console.log(`正在跳转到${platform}登录页面...`);
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('第三方登录跳转失败:', error);
      
      // 如果是开发环境，提供更详细的错误信息
      if (import.meta.env.DEV) {
        alert(`${platform}登录配置错误: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查:\n1. APP ID和APP Key是否正确\n2. 回调地址是否在开放平台配置\n3. 网络连接是否正常`);
      }
      
      throw new Error(`${platform}登录配置错误`);
    }
  }

  // QQ登录处理函数
  private handleQQLogin(deviceInfo: ReturnType<typeof getDeviceInfo>): void {
    console.log('QQ登录设备检测:', {
      isDesktop: deviceInfo.isDesktop,
      isMobile: deviceInfo.isMobile,
      isAndroid: deviceInfo.isAndroid,
      isIOS: deviceInfo.isIOS
    });

    // 验证APP ID
    if (!validateQQAppId(qqConfig.appId)) {
      console.error('QQ APP ID格式不正确:', qqConfig.appId);
      this.showErrorTip('QQ登录配置错误，请检查APP ID');
      return;
    }

    if (deviceInfo.isDesktop) {
      // PC端：直接跳转到QQ网页版登录
      const authUrl = generateAuthUrl('qq');
      console.log('PC端QQ登录URL:', authUrl);
      
      // 显示提示信息
      this.showDesktopLoginTip('正在打开QQ登录页面...');
      
      // 在新窗口打开，避免影响当前页面
      const loginWindow = window.open(authUrl, 'qq_login', 'width=800,height=600,scrollbars=yes,resizable=yes,location=yes,menubar=no,toolbar=no,status=no');
      
      if (!loginWindow) {
        console.error('无法打开登录窗口，可能被浏览器阻止');
        this.showErrorTip('请允许弹出窗口，然后重试');
        return;
      }
      
      // 监听登录窗口关闭
      const checkClosed = setInterval(() => {
        if (loginWindow?.closed) {
          clearInterval(checkClosed);
          console.log('QQ登录窗口已关闭');
          // 检查是否有登录成功的回调
          this.checkLoginStatus();
        }
      }, 1000);
      
      // 监听登录窗口的URL变化（如果可能的话）
      try {
        const checkUrl = setInterval(() => {
          try {
            if (loginWindow?.closed) {
              clearInterval(checkUrl);
              return;
            }
            
            // 检查是否跳转到了回调页面
            if (loginWindow.location.href.includes('/qq-callback')) {
              clearInterval(checkUrl);
              clearInterval(checkClosed);
              console.log('检测到登录成功回调');
              loginWindow.close();
              this.checkLoginStatus();
            }
          } catch (e) {
            // 跨域限制，无法访问其他窗口的URL
            // 这是正常的，我们依赖窗口关闭事件
          }
        }, 500);
      } catch (e) {
        console.log('无法监听窗口URL变化（跨域限制）');
      }
      
    } else {
      // 移动端：直接使用优化的移动端网页版登录
      console.log('移动端QQ登录，使用移动端网页版...');
      
      // 显示提示信息
      this.showMobileLoginTip('正在跳转到QQ移动端登录...');
      
      // 使用专门的移动端登录URL
      const mobileAuthUrl = createMobileQQLoginUrl();
      console.log('移动端QQ登录URL:', mobileAuthUrl);
      
      // 短暂延迟后跳转，让用户看到提示
      setTimeout(() => {
        window.location.href = mobileAuthUrl;
      }, 800);
    }
  }

  // 显示移动端登录提示
  private showMobileLoginTip(message: string = '🐧 正在尝试打开QQ客户端...'): void {
    this.showTip(message, 'info');
  }

  // 显示桌面端登录提示
  private showDesktopLoginTip(message: string = '💻 正在打开QQ登录页面...'): void {
    this.showTip(message, 'info');
  }

  // 检查登录状态
  private checkLoginStatus(): void {
    // 检查localStorage中是否有登录信息
    const token = localStorage.getItem('token');
    const userInfo = this.getSavedUserInfo();
    
    if (token && userInfo) {
      console.log('检测到登录成功:', userInfo);
      this.showTip('🎉 登录成功！欢迎回来', 'info');
      // 可以在这里触发页面刷新或跳转
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      console.log('未检测到登录信息');
      this.showTip('登录未完成，请重试', 'error');
    }
  }

  // 显示错误提示
  private showErrorTip(message: string): void {
    this.showTip(message, 'error');
  }

  // 通用提示函数
  private showTip(message: string, type: 'info' | 'error' = 'info'): void {
    // 创建提示框
    const tipDiv = document.createElement('div');
    const isError = type === 'error';
    
    tipDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, ${isError ? '#ff6b6b, #ee5a52' : '#1296DB, #0E7BB8'});
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(${isError ? '255, 107, 107' : '18, 150, 219'}, 0.3);
      animation: slideDown 0.3s ease-out;
      max-width: 300px;
      text-align: center;
      word-wrap: break-word;
    `;
    
    tipDiv.innerHTML = isError ? `❌ ${message}` : message;
    document.body.appendChild(tipDiv);
    
    // 错误提示显示更长时间
    const duration = isError ? 5000 : 3000;
    setTimeout(() => {
      if (tipDiv.parentNode) {
        tipDiv.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
          if (tipDiv.parentNode) {
            tipDiv.parentNode.removeChild(tipDiv);
          }
        }, 300);
      }
    }, duration);
    
    // 添加动画样式
    if (!document.getElementById('mobile-tip-styles')) {
      const style = document.createElement('style');
      style.id = 'mobile-tip-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // 处理第三方登录回调
  public async handleThirdPartyCallback(
    platform: ThirdPartyPlatform, 
    code: string, 
    state: string
  ): Promise<LoginResponse> {
    try {
      // 验证state参数防止CSRF攻击
      if (!this.validateState(state)) {
        throw new Error('状态验证失败');
      }

      // 根据平台处理不同的回调逻辑
      switch (platform) {
        case 'qq':
          return await this.handleQQCallback(code);
        case 'wechat':
          return await this.handleWechatCallback(code);
        case 'weibo':
          return await this.handleWeiboCallback(code);
        default:
          throw new Error('不支持的登录平台');
      }
    } catch (error) {
      console.error('第三方登录回调处理失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      };
    }
  }

  // QQ登录回调处理
  private async handleQQCallback(code: string): Promise<LoginResponse> {
    try {
      // 1. 通过code获取access_token
      const tokenResponse = await fetch(`https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${qqConfig.appId}&client_secret=${qqConfig.appKey}&code=${code}&redirect_uri=${encodeURIComponent(qqConfig.redirectUri)}`);
      
      if (!tokenResponse.ok) {
        throw new Error('获取access_token失败');
      }

      const tokenData = await tokenResponse.text();
      const accessToken = new URLSearchParams(tokenData).get('access_token');

      if (!accessToken) {
        throw new Error('access_token为空');
      }

      // 2. 获取用户OpenID
      const openIdResponse = await fetch(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`);
      const openIdText = await openIdResponse.text();
      
      // 解析JSONP响应
      const openIdMatch = openIdText.match(/openid":"([^"]+)"/);
      const openid = openIdMatch ? openIdMatch[1] : null;

      if (!openid) {
        throw new Error('获取OpenID失败');
      }

      // 3. 获取用户信息
      const userInfoResponse = await fetch(`https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${qqConfig.appId}&openid=${openid}`);
      const userInfo = await userInfoResponse.json();

      if (userInfo.ret !== 0) {
        throw new Error('获取用户信息失败');
      }

      // 4. 构造登录响应
      const loginResponse: LoginResponse = {
        success: true,
        token: `qq_${accessToken}`, // 这里应该是你的后端返回的JWT token
        userInfo: {
          id: openid,
          nickname: userInfo.nickname,
          avatar: userInfo.figureurl_qq_1 || userInfo.figureurl_1,
          platform: 'qq',
          openid: openid
        }
      };

      // 保存登录信息
      this.saveLoginInfo(loginResponse);
      
      return loginResponse;
    } catch (error) {
      console.error('QQ登录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QQ登录失败'
      };
    }
  }

  // 微信登录回调处理
  private async handleWechatCallback(code: string): Promise<LoginResponse> {
    // 微信登录逻辑实现
    console.log('处理微信登录回调:', code);
    
    // 这里应该调用你的后端API
    // const response = await api.post('/auth/wechat-login', { code });
    
    return {
      success: true,
      token: 'wechat_mock_token',
      userInfo: {
        id: 'wechat_user_id',
        nickname: '微信用户',
        avatar: 'https://via.placeholder.com/100',
        platform: 'wechat'
      }
    };
  }

  // 微博登录回调处理
  private async handleWeiboCallback(code: string): Promise<LoginResponse> {
    // 微博登录逻辑实现
    console.log('处理微博登录回调:', code);
    
    // 这里应该调用你的后端API
    // const response = await api.post('/auth/weibo-login', { code });
    
    return {
      success: true,
      token: 'weibo_mock_token',
      userInfo: {
        id: 'weibo_user_id',
        nickname: '微博用户',
        avatar: 'https://via.placeholder.com/100',
        platform: 'weibo'
      }
    };
  }

  // 验证state参数
  private validateState(state: string): boolean {
    // 这里应该验证state参数是否与发起登录时的state一致
    // 简单示例，实际项目中应该使用更安全的验证方式
    return state === 'random_state_string';
  }

  // 保存登录信息
  private saveLoginInfo(loginResponse: LoginResponse): void {
    if (loginResponse.success && loginResponse.token && loginResponse.userInfo) {
      localStorage.setItem('token', loginResponse.token);
      localStorage.setItem('userInfo', JSON.stringify(loginResponse.userInfo));
      localStorage.setItem('loginTime', Date.now().toString());
    }
  }

  // 获取保存的用户信息
  public getSavedUserInfo(): UserInfo | null {
    try {
      const userInfoStr = localStorage.getItem('userInfo');
      return userInfoStr ? JSON.parse(userInfoStr) : null;
    } catch {
      return null;
    }
  }

  // 检查登录状态
  public isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    const userInfo = this.getSavedUserInfo();
    return !!(token && userInfo);
  }

  // 退出登录
  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('loginPlatform');
    localStorage.removeItem('loginTimestamp');
  }
}

// 导出单例
export const authService = new AuthService();
export default authService;
