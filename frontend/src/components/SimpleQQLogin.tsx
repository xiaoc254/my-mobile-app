// 简化的QQ登录测试组件
import React from 'react';
import { startQQLogin, getDeviceInfo, qqConfig } from '../config/thirdPartyAuth';

const SimpleQQLogin: React.FC = () => {
  const deviceInfo = getDeviceInfo();

  const handleLogin = () => {
    console.log('开始QQ登录测试...');
    try {
      startQQLogin();
    } catch (error) {
      console.error('QQ登录失败:', error);
      alert('QQ登录失败，请查看控制台了解详情');
    }
  };

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '2px solid #1296DB',
      borderRadius: '10px',
      backgroundColor: '#f8f9fa',
      maxWidth: '600px'
    }}>
      <h2 style={{ color: '#1296DB', marginBottom: '20px' }}>🔧 QQ登录测试</h2>
      
      {/* 当前配置显示 */}
      <div style={{
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3>📋 当前配置</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>APP ID:</strong> {qqConfig.appId}</p>
          <p><strong>回调地址:</strong> {qqConfig.redirectUri}</p>
          <p><strong>设备类型:</strong> {deviceInfo.isDesktop ? '桌面端' : '移动端'}</p>
          <p><strong>登录方式:</strong> {deviceInfo.isDesktop ? '新窗口打开' : '页面跳转'}</p>
        </div>
      </div>

      {/* 登录按钮 */}
      <button
        onClick={handleLogin}
        style={{
          padding: '15px 30px',
          backgroundColor: '#1296DB',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#0E7BB8';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#1296DB';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span>🐧</span>
        <span>测试QQ登录</span>
      </button>

      {/* 说明信息 */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#0066cc'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>💡 使用说明</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>点击按钮将跳转到QQ登录页面</li>
          <li>使用的是QQ互联官方测试APP ID</li>
          <li>登录成功后会跳转回 /auth-callback 页面</li>
          <li>如果登录失败，请检查浏览器控制台的错误信息</li>
        </ul>
      </div>

      {/* 调试信息 */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          border: '1px solid #ddd'
        }}>
          🔍 查看调试信息
        </summary>
        <div style={{
          marginTop: '10px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          {JSON.stringify({
            appId: qqConfig.appId,
            redirectUri: qqConfig.redirectUri,
            scope: qqConfig.scope,
            deviceInfo: {
              isDesktop: deviceInfo.isDesktop,
              isMobile: deviceInfo.isMobile,
              isAndroid: deviceInfo.isAndroid,
              isIOS: deviceInfo.isIOS,
              userAgent: deviceInfo.userAgent.substring(0, 100) + '...'
            }
          }, null, 2)}
        </div>
      </details>
    </div>
  );
};

export default SimpleQQLogin;

