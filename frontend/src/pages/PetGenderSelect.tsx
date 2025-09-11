import { useNavigate } from 'react-router-dom'
import { usePetForm } from '../contexts/PetFormContext'

export default function PetGenderSelect() {
  const navigate = useNavigate()
  const { updatePetData } = usePetForm()

  const handleBack = () => {
    navigate(-1)
  }

  const handleGenderSelect = (gender: string) => {
    console.log('选择宠物性别:', gender)
    // 保存选择的宠物性别
    updatePetData({ gender: gender })
    navigate('/pet-avatar-nickname')
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
          background: '#E5E5E7',
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
            background: '#E5E5E7'
          }}></div>
          <div style={{
            width: '25%',
            height: '100%',
            background: '#E5E5E7'
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
          宠物性别
        </h1>

        {/* 提示文字 */}
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 60px 0',
          textAlign: 'center'
        }}>
          请选择您的宠物性别
        </p>

        {/* 性别选择按钮 */}
        <div style={{
          width: '100%',
          maxWidth: '320px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          {/* 弟弟 */}
          <div 
            onClick={() => handleGenderSelect('male')}
            style={{
              height: '120px',
              background: '#007AFF',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
              transition: 'transform 0.2s ease',
              position: 'relative'
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
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff'
            }}>
              弟弟
            </span>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '20px',
              color: '#fff'
            }}>
              👔
            </div>
          </div>

          {/* 妹妹 */}
          <div 
            onClick={() => handleGenderSelect('female')}
            style={{
              height: '120px',
              background: '#FF69B4',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 105, 180, 0.3)',
              transition: 'transform 0.2s ease',
              position: 'relative'
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
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff'
            }}>
              妹妹
            </span>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '20px',
              color: '#fff'
            }}>
              🎀
            </div>
          </div>

          {/* 绝育弟弟 */}
          <div 
            onClick={() => handleGenderSelect('neutered_male')}
            style={{
              height: '120px',
              background: '#DAA520',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(218, 165, 32, 0.3)',
              transition: 'transform 0.2s ease',
              position: 'relative'
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
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff'
            }}>
              绝育弟弟
            </span>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '20px',
              color: '#fff'
            }}>
              👕
            </div>
          </div>

          {/* 绝育妹妹 */}
          <div 
            onClick={() => handleGenderSelect('spayed_female')}
            style={{
              height: '120px',
              background: '#FFD700',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
              transition: 'transform 0.2s ease',
              position: 'relative'
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
            <span style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff'
            }}>
              绝育妹妹
            </span>
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '20px',
              color: '#fff'
            }}>
              👗
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
