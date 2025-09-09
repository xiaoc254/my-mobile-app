import petImage from '../image/1.png'
import catImage from '../image/cat.jpg'
import dogImage from '../image/dog.jpg'
import { useNavigate } from 'react-router-dom'

export default function Pet() {
  const navigate = useNavigate()

  const handleAddPet = () => {
    navigate('/pet-type-select')
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
      {/* 顶部头部图片区域 - 100%宽度，浅橙色背景 */}
      <div style={{
        width: '100%',
        height: '280px',
        background: '#FEEADF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <img 
          src={petImage} 
          alt="猫咪爪子和手指互动" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </div>

      {/* 添加宠物按钮 - 金色渐变背景 */}
      <div style={{
        padding: '20px',
        paddingTop: '15px',
        paddingBottom: '15px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          onClick={handleAddPet}
          style={{
            width: '40%',
            height: '55px',
            background: '#CBA43F',
            border: 'none',
            borderRadius: '25px',
            color: '#fff',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(253, 216, 53, 0.3)',
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
          添加宠物
        </button>
      </div>

      {/* 主要内容区域 */}
      <div style={{
        padding: '0 20px',
        paddingBottom: '65px',
        height: 'calc(100vh - 380px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        overflow: 'hidden'
      }}>
        {/* 我的宠物卡片 - 橙色背景 */}
        <div style={{
          background: '#FFBF6B',
          borderRadius: '20px',
          padding: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          flex: '0 0 auto'
        }}>
          {/* 标题 */}
          <div style={{
            marginBottom: '8px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
              textAlign: 'left'
            }}>
              我的宠物
            </h3>
          </div>

          {/* 宠物列表 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* 左侧宠物区域 */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* 布丁 - 猫咪 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #FFBF6B',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={catImage} 
                    alt="布丁" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#000'
                }}>
                  布丁
                </span>
              </div>

              {/* 雪球 - 狗狗 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '2px solid #FFBF6B',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={dogImage} 
                    alt="雪球" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#000'
                }}>
                  雪球
                </span>
              </div>
            </div>
            
            {/* 右侧添加宠物按钮 */}
            <div 
              onClick={handleAddPet}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                borderLeft: '2px solid #fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '35px',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '2px solid #FFBF6B',
                marginRight: '20px'
              }}>
                +
              </div>
              <span style={{
                fontSize: '8px',
                fontWeight: '500',
                color: '#fff',
                marginRight: '20px'
              }}>
                添加宠物
              </span>
            </div>
          </div>
        </div>

        {/* 今日计划提醒卡片 - 橙色背景 */}
        <div style={{
          background: '#FFBF6B',
          borderRadius: '20px',
          padding: '10px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '0'
        }}>
          {/* 标题和头像 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#fff',
              textAlign: 'left'
            }}>
              今日计划提醒
            </h3>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <img 
                src={catImage} 
                alt="猫咪头像" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>

          {/* 计划列表 */}
          <div style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            overflow: 'hidden'
          }}>
            {/* 运动计划 */}
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              flex: '1'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  ⚾
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  运动计划
                </span>
              </div>
              <button style={{
                background: '#FFBF6B',
                border: 'none',
                borderRadius: '12px',
                padding: '5px 10px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                去完成
              </button>
            </div>

            {/* 喂食计划 */}
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              flex: '1'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  🍴
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  喂食计划
                </span>
              </div>
              <button style={{
                background: '#FFBF6B',
                border: 'none',
                borderRadius: '12px',
                padding: '5px 10px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                去完成
              </button>
            </div>

            {/* 每日日志 */}
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              flex: '1'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  📋
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  每日日志
                </span>
              </div>
              <button style={{
                background: '#FFBF6B',
                border: 'none',
                borderRadius: '12px',
                padding: '5px 10px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                去完成
              </button>
            </div>

            {/* 体温记录 */}
            <div style={{
              background: '#fff',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              flex: '1'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#666'
                }}>
                  🌡️
                </div>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  体温记录
                </span>
              </div>
              <button style={{
                background: '#FFBF6B',
                border: 'none',
                borderRadius: '12px',
                padding: '5px 10px',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                去完成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
