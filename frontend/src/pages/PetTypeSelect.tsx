import { useNavigate } from 'react-router-dom'

export default function PetTypeSelect() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  const handlePetTypeSelect = (petType: string) => {
    console.log('选择宠物类型:', petType)
    

    // 这里可以跳转到下一步或处理选择逻辑
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
            background: '#fff',
            borderRight: '1px solid #007AFF'
          }}></div>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#fff',
            borderRight: '1px solid #007AFF'
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
        alignItems: 'center'
      }}>
        {/* 标题 */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#000',
          margin: '0 0 16px 0',
          textAlign: 'center'
        }}>
          宠物类型
        </h1>

        {/* 提示文字 */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 60px 0',
          textAlign: 'center'
        }}>
          请选择您的宠物类型
        </p>

        {/* 宠物类型选择按钮 */}
        <div style={{
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 第一行：汪星人和喵星人 */}
          <div style={{
            display: 'flex',
            gap: '20px'
          }}>
            {/* 汪星人按钮 */}
            <div
              onClick={() => handlePetTypeSelect('dog')}
              style={{
                flex: '1',
                height: '120px',
                background: '#007AFF',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                fontSize: '40px',
                color: '#fff',
                marginBottom: '8px'
              }}>
                🐕
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#fff'
              }}>
                汪星人
              </span>
            </div>

            {/* 喵星人按钮 */}
            <div
              onClick={() => handlePetTypeSelect('cat')}
              style={{
                flex: '1',
                height: '120px',
                background: '#FF9500',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 149, 0, 0.3)',
                transition: 'transform 0.2s ease'
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)'
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div style={{
                fontSize: '40px',
                color: '#fff',
                marginBottom: '8px'
              }}>
                🐱
              </div>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#fff'
              }}>
                喵星人
              </span>
            </div>
          </div>

          {/* 其它星人按钮 */}
          <div
            onClick={() => handlePetTypeSelect('other')}
            style={{
              width: '100%',
              height: '120px',
              background: '#AF52DE',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(175, 82, 222, 0.3)',
              transition: 'transform 0.2s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <div style={{
                fontSize: '32px',
                color: '#fff'
              }}>
                🦉
              </div>
              <div style={{
                fontSize: '32px',
                color: '#fff'
              }}>
                🐿️
              </div>
              <div style={{
                fontSize: '32px',
                color: '#fff'
              }}>
                🐰
              </div>
              <div style={{
                fontSize: '32px',
                color: '#fff'
              }}>
                🐍
              </div>
            </div>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#fff'
            }}>
              其它星人
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
