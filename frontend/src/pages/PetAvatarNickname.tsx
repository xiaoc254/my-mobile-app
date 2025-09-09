import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import catImage from '../image/cat.jpg'

export default function PetAvatarNickname() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)

  const handleBack = () => {
    navigate(-1)
  }

  const handleNext = () => {
    if (!nickname.trim()) {
      setError('请输入昵称')
      return
    }
    if (nickname.trim().length < 2) {
      setError('昵称至少需要2个字符')
      return
    }
    setError('')
    console.log('昵称:', nickname)
    // 这里可以跳转到下一步或处理逻辑
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
    if (error) {
      setError('')
    }
  }

  const handleAvatarClick = () => {
    setShowAvatarModal(true)
  }

  const handleModalClose = () => {
    setShowAvatarModal(false)
  }

  const handleLocalUpload = () => {
    // 创建文件输入元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.style.display = 'none'
    
    // 添加文件选择事件监听
    input.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // 创建文件读取器
        const reader = new FileReader()
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          console.log('选择的图片:', file.name)
          console.log('图片URL:', imageUrl)
          // 更新选择的头像
          setSelectedAvatar(imageUrl)
        }
        reader.readAsDataURL(file)
      }
    })
    
    // 触发文件选择
    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
    
    setShowAvatarModal(false)
  }

  const handleCameraUpload = () => {
    console.log('拍照上传')
    // 这里可以处理拍照上传逻辑
    setShowAvatarModal(false)
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#fff',
      padding: '0',
      fontFamily: 'PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
      {/* 顶部导航栏 */}
      <div style={{
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 20px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {/* 第一行：返回按钮和占位符 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          {/* 返回按钮 */}
          <div 
            onClick={handleBack}
            style={{
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderLeft: '2px solid #000',
              borderBottom: '2px solid #000',
              transform: 'rotate(45deg)'
            }}></div>
          </div>

          {/* 占位符 */}
          <div style={{ width: '24px' }}></div>
        </div>

        {/* 第二行：进度条 */}
        <div style={{
          width: '100%',
          height: '12px',
          background: '#fff',
          border: '1px solid #007AFF',
          borderRadius: '6px',
          display: 'flex',
          overflow: 'hidden'
        }}>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#007AFF'
          }}></div>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#007AFF'
          }}></div>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#007AFF'
          }}></div>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#fff'
          }}></div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div style={{
        padding: '40px 20px',
        height: 'calc(100vh - 80px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* 上半部分：标题和头像 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: '1',
          justifyContent: 'center'
        }}>
          {/* 标题 */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#000',
            margin: '0 0 60px 0',
            textAlign: 'center'
          }}>
            头像和昵称
          </h1>

          {/* 头像区域 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '60px'
          }}>
            {/* 头像图片 */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '60px',
              overflow: 'hidden',
              marginBottom: '16px',
              border: '3px solid #f0f0f0'
            }}>
              <img 
                src={selectedAvatar || catImage} 
                alt="宠物头像" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            
            {/* 自定义头像文字 */}
            <span 
              onClick={handleAvatarClick}
              style={{
                fontSize: '16px',
                color: '#000',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              自定义头像
            </span>
          </div>

          {/* 昵称输入区域 */}
          <div style={{
            width: '100%',
            maxWidth: '320px'
          }}>
            <div style={{
              background: '#f5f5f5',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: error ? '2px solid #ff4757' : '2px solid transparent',
              transition: 'border-color 0.3s ease'
            }}>
              <span style={{
                fontSize: '16px',
                color: '#000',
                fontWeight: '500'
              }}>
                昵称
              </span>
              <input
                type="text"
                value={nickname}
                onChange={handleNicknameChange}
                placeholder="请输入"
                style={{
                  flex: '1',
                  border: 'none',
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  outline: 'none',
                  color: '#000'
                }}
              />
            </div>
            
            {/* 错误提示 */}
            {error && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#ff4757',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
                textAlign: 'center',
                animation: 'fadeIn 0.3s ease'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 下一步按钮 */}
        <div style={{
          width: '100%',
          maxWidth: '320px',
          marginTop: '40px'
        }}>
          <button
            onClick={handleNext}
            disabled={!nickname.trim()}
            style={{
              width: '100%',
              height: '55px',
              background: nickname.trim() ? '#DAA520' : '#ccc',
              border: 'none',
              borderRadius: '25px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: nickname.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: nickname.trim() ? '0 4px 12px rgba(218, 165, 32, 0.3)' : '0 2px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              opacity: nickname.trim() ? 1 : 0.6
            }}
            onMouseDown={(e) => {
              if (nickname.trim()) {
                e.currentTarget.style.transform = 'scale(0.95)'
              }
            }}
            onMouseUp={(e) => {
              if (nickname.trim()) {
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
            onMouseLeave={(e) => {
              if (nickname.trim()) {
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            下一步
          </button>
        </div>
      </div>

      {/* 头像选择模态框 */}
      {showAvatarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '280px',
            background: 'rgba(139, 115, 85, 0.6)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            // boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            animation: 'modalSlideIn 0.3s ease'
          }}>
            {/* 标题 */}
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#fff',
              margin: '0',
              textAlign: 'center'
            }}>
              自定义头像
            </h3>

            {/* 选项按钮 */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* 本地上传 */}
              <button
                onClick={handleLocalUpload}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  padding: '12px 0',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                本地上传
              </button>

              {/* 拍照上传 */}
              <button
                onClick={handleCameraUpload}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  padding: '12px 0',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                拍照上传
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
