// SMSTest.tsx - 短信功能测试页面
import React, { useState } from 'react';
import { Button, Input, Toast } from 'antd-mobile';
import { useResponsive, createResponsiveStyles } from '../hooks/useResponsive';
import smsService from '../services/smsService';

export default function SMSTest() {
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);
  
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!smsService.validateMobile(mobile)) {
      Toast.show('请输入有效的手机号');
      return;
    }

    setLoading(true);
    try {
      console.log('发送验证码到:', mobile);
      const result = await smsService.sendVerificationCode(mobile);
      console.log('发送结果:', result);
      
      if (result.success) {
        Toast.show('验证码发送成功，请查收短信');
        setCountdown(60);
      } else {
        Toast.show(result.message || '发送失败');
      }
    } catch (error) {
      console.error('发送失败:', error);
      Toast.show('发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Toast.show('请输入验证码');
      return;
    }

    setLoading(true);
    try {
      console.log('验证验证码:', mobile, code);
      const result = await smsService.verifyCode(mobile, code);
      console.log('验证结果:', result);
      
      if (result.success) {
        Toast.show('验证成功');
      } else {
        Toast.show(result.message || '验证失败');
      }
    } catch (error) {
      console.error('验证失败:', error);
      Toast.show('验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      ...styles.pageContainer,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: responsive.isMobile ? '90%' : '500px',
        padding: responsive.isMobile ? '20px' : '30px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: responsive.isMobile ? '30px 20px' : '40px 30px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{
            textAlign: 'center',
            fontSize: responsive.isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: '#333',
            marginBottom: '30px'
          }}>
            📱 短信功能测试
          </h1>

          {/* 手机号输入 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333'
            }}>
              手机号
            </label>
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={mobile}
              onChange={setMobile}
              maxLength={11}
              style={{
                fontSize: responsive.isMobile ? '16px' : '18px',
                height: responsive.isMobile ? '48px' : '52px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0'
              }}
            />
          </div>

          {/* 发送验证码按钮 */}
          <div style={{ marginBottom: '20px' }}>
            <Button
              color="primary"
              block
              loading={loading}
              onClick={handleSendCode}
              disabled={!smsService.validateMobile(mobile) || countdown > 0}
              style={{
                height: responsive.isMobile ? '48px' : '52px',
                fontSize: responsive.isMobile ? '16px' : '18px',
                fontWeight: '600',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                opacity: countdown > 0 ? 0.6 : 1
              }}
            >
              {countdown > 0 ? `${countdown}s后重发` : '发送验证码'}
            </Button>
          </div>

          {/* 验证码输入 */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#333'
            }}>
              验证码
            </label>
            <Input
              type="text"
              placeholder="请输入6位验证码"
              value={code}
              onChange={setCode}
              maxLength={6}
              style={{
                fontSize: responsive.isMobile ? '16px' : '18px',
                height: responsive.isMobile ? '48px' : '52px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                textAlign: 'center',
                letterSpacing: '2px'
              }}
            />
          </div>

          {/* 验证按钮 */}
          <div style={{ marginBottom: '30px' }}>
            <Button
              color="default"
              block
              loading={loading}
              onClick={handleVerifyCode}
              disabled={!code.trim()}
              style={{
                height: responsive.isMobile ? '48px' : '52px',
                fontSize: responsive.isMobile ? '16px' : '18px',
                fontWeight: '600',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none'
              }}
            >
              验证验证码
            </Button>
          </div>

          {/* 说明信息 */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#0369a1',
              margin: '0 0 8px 0'
            }}>
              📋 测试说明
            </h3>
            <div style={{
              fontSize: '12px',
              color: '#0369a1',
              lineHeight: '1.5'
            }}>
              <div>1. 输入有效的手机号（11位数字）</div>
              <div>2. 点击"发送验证码"按钮</div>
              <div>3. 查看控制台日志了解发送过程</div>
              <div>4. 输入收到的验证码进行验证</div>
              <div>5. 验证码60秒内有效</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
