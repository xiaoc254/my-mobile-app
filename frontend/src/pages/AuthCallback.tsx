// 第三方登录回调处理页面
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在处理登录信息...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 获取URL参数
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const state = urlParams.get('state');

        console.log('回调参数:', { code, error, errorDescription, state });

        if (error) {
          // 处理错误
          setStatus('error');
          setMessage(`登录失败: ${errorDescription || error}`);
          
          // 3秒后返回登录页
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (code) {
          // 登录成功
          setStatus('success');
          setMessage('登录成功！正在获取用户信息...');
          
          // 保存登录状态
          localStorage.setItem('qq_auth_code', code);
          localStorage.setItem('login_time', new Date().toISOString());
          
          // 处理QQ登录回调
          try {
            const loginResponse = await authService.handleThirdPartyCallback('qq', code, state || '');
            
            if (loginResponse.success) {
              setMessage('登录成功！正在跳转...');
              
              // 保存用户信息
              if (loginResponse.token && loginResponse.userInfo) {
                localStorage.setItem('token', loginResponse.token);
                localStorage.setItem('userInfo', JSON.stringify(loginResponse.userInfo));
                localStorage.setItem('loginPlatform', 'qq');
              }
              
              // 跳转到首页
              setTimeout(() => {
                navigate('/home');
              }, 2000);
            } else {
              throw new Error(loginResponse.error || '登录失败');
            }
          } catch (error) {
            console.error('QQ登录处理失败:', error);
            setStatus('error');
            setMessage(`登录失败: ${error instanceof Error ? error.message : '未知错误'}`);
            
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          }
          
        } else {
          // 没有code也没有error，可能是其他问题
          setStatus('error');
          setMessage('登录回调参数异常');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
        
      } catch (error) {
        console.error('处理登录回调失败:', error);
        setStatus('error');
        setMessage('处理登录信息时发生错误');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [location.search, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return '#1296DB';
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      default:
        return '#1296DB';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          animation: status === 'loading' ? 'spin 2s linear infinite' : 'none'
        }}>
          {getStatusIcon()}
        </div>
        
        <h2 style={{
          color: getStatusColor(),
          marginBottom: '16px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {status === 'loading' && '处理中...'}
          {status === 'success' && '登录成功！'}
          {status === 'error' && '登录失败'}
        </h2>
        
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5',
          marginBottom: '20px'
        }}>
          {message}
        </p>
        
        {status === 'loading' && (
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '30%',
              height: '100%',
              backgroundColor: '#1296DB',
              animation: 'progress 2s ease-in-out infinite'
            }} />
          </div>
        )}
        
        {(status === 'success' || status === 'error') && (
          <button
            onClick={() => navigate(status === 'success' ? '/home' : '/login')}
            style={{
              padding: '12px 24px',
              backgroundColor: getStatusColor(),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {status === 'success' ? '进入应用' : '返回登录'}
          </button>
        )}
      </div>
      
      {/* 添加CSS动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;