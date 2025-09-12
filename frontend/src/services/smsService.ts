// smsService.ts - 前端短信服务
import api from './api';

export interface SMSResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VerificationCodeResponse extends SMSResponse {
  data?: {
    mobile: string;
    expireTime: number;
  };
}

export interface VerifyCodeResponse extends SMSResponse {
  remainingAttempts?: number;
}

class SMSService {
  /**
   * 发送验证码
   * @param mobile 手机号
   * @returns Promise<VerificationCodeResponse>
   */
  async sendVerificationCode(mobile: string): Promise<VerificationCodeResponse> {
    try {
      const response = await api.post('/sms/send-code', { mobile });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '发送验证码失败'
      };
    }
  }

  /**
   * 验证验证码
   * @param mobile 手机号
   * @param code 验证码
   * @returns Promise<VerifyCodeResponse>
   */
  async verifyCode(mobile: string, code: string): Promise<VerifyCodeResponse> {
    try {
      const response = await api.post('/sms/verify-code', { mobile, code });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '验证码验证失败',
        remainingAttempts: error.response?.data?.remainingAttempts
      };
    }
  }

  /**
   * 发送通知短信
   * @param mobile 手机号
   * @param message 消息内容
   * @returns Promise<SMSResponse>
   */
  async sendNotification(mobile: string, message: string): Promise<SMSResponse> {
    try {
      const response = await api.post('/sms/send-notification', { mobile, message });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '发送通知短信失败'
      };
    }
  }

  /**
   * 查询账户余额
   * @returns Promise<SMSResponse>
   */
  async getBalance(): Promise<SMSResponse> {
    try {
      const response = await api.get('/sms/balance');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || '查询余额失败'
      };
    }
  }

  /**
   * 验证手机号格式
   * @param mobile 手机号
   * @returns boolean
   */
  validateMobile(mobile: string): boolean {
    const mobileRegex = /^1[3-9]\d{9}$/;
    return mobileRegex.test(mobile);
  }

  /**
   * 格式化手机号显示
   * @param mobile 手机号
   * @returns string
   */
  formatMobile(mobile: string): string {
    if (mobile.length === 11) {
      return mobile.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
    }
    return mobile;
  }
}

// 创建单例实例
const smsService = new SMSService();

export default smsService;
