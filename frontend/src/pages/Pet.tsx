import petImage from '../image/1.png'
import catImage from '../image/cat.jpg'
import dogImage from '../image/dog.jpg'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
// @ts-ignore
import { petAPI } from '../services/api'

interface Pet {
  id: string
  nickname: string
  type: string
  gender: string
  avatar: string | null
  startDate: string
  weight: number
  createdAt: string
}

export default function Pet() {
  const navigate = useNavigate()
<<<<<<< HEAD
  
=======
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  
  // 任务完成状态管理
  const [taskCompletionStatus, setTaskCompletionStatus] = useState<Record<string, boolean>>({
    'exercise': false,
    'feeding': false,
    'log': false,
    'temperature': false
  })
  
  // 创建包含静态宠物的完整宠物列表
  const getAllPets = () => {
    const staticPets = [
      { id: 'buding', nickname: '布丁', type: 'cat', avatar: catImage },
      { id: 'xueqiu', nickname: '雪球', type: 'dog', avatar: dogImage }
    ]
    const dynamicPets = pets.filter(pet => pet.nickname !== '11')
    return [...staticPets, ...dynamicPets]
  }

  // 获取宠物列表
  const fetchPets = async () => {
    try {
      const response = await petAPI.getPets()
      if (response.success) {
        setPets(response.data)
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  // 监听页面可见性变化，当从其他页面返回时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPets()
        // 检查是否有任务需要标记为已完成
        const lastVisitedTask = localStorage.getItem('lastVisitedTask')
        if (lastVisitedTask) {
          setTaskCompletionStatus(prev => ({
            ...prev,
            [lastVisitedTask]: true
          }))
          localStorage.removeItem('lastVisitedTask')
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  
  const handleAddPet = () => {
    navigate('/pet-type-select')
  }

  // 处理任务完成
  const handleTaskComplete = (taskType: string) => {
    // 保存当前任务类型到localStorage
    localStorage.setItem('lastVisitedTask', taskType)
    navigate('/pet-detail', { state: { selectedPetId: selectedPetId || 'buding' } })
  }

  // 处理其他任务完成（不跳转）
  const handleOtherTaskComplete = (taskType: string) => {
    setTaskCompletionStatus(prev => ({
      ...prev,
      [taskType]: true
    }))
  }

  // 处理宠物点击事件
  const handlePetClick = (petId: string) => {
    setSelectedPetId(petId)
  }

  // 获取宠物头像
  const getPetAvatar = (pet: Pet) => {
    if (pet.avatar) {
      return pet.avatar
    }
    // 根据宠物类型返回默认头像
    switch (pet.type) {
      case 'cat':
        return catImage
      case 'dog':
        return dogImage
      default:
        return catImage
    }
  }


  // 获取当前选中的宠物
  const getSelectedPet = () => {
    if (!selectedPetId) return null
    return pets.find(pet => pet.id === selectedPetId)
  }

  // 获取选中宠物的头像
  const getSelectedPetAvatar = () => {
    if (!selectedPetId) return catImage
    
    // 处理静态宠物
    if (selectedPetId === 'buding') return catImage
    if (selectedPetId === 'xueqiu') return dogImage
    
    // 处理动态宠物
    const selectedPet = pets.find(pet => pet.id === selectedPetId)
    if (selectedPet) {
      return getPetAvatar(selectedPet)
    }
    
    return catImage
  }

  // 获取排序后的宠物列表（点击的宠物在第一位）
  const getOrderedPets = () => {
    const allPets = getAllPets()
    if (!selectedPetId) return allPets
    
    const selectedPet = allPets.find(pet => pet.id === selectedPetId)
    if (!selectedPet) return allPets
    
    const otherPets = allPets.filter(pet => pet.id !== selectedPetId)
    return [selectedPet, ...otherPets]
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
                     alignItems: 'center',
                     flexWrap: 'wrap'
                   }}>
                     {/* 统一的宠物列表 */}
                     {loading ? (
                       <div style={{
                         fontSize: '10px',
                         color: '#666',
                         padding: '10px'
                       }}>
                         加载中...
                       </div>
                     ) : (
                       getOrderedPets().map((pet) => (
                         <div 
                           key={pet.id} 
                           onClick={() => handlePetClick(pet.id)}
                           style={{
                             display: 'flex',
                             flexDirection: 'column',
                             alignItems: 'center',
                             gap: '4px',
                             cursor: 'pointer',
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
                             width: '50px',
                             height: '50px',
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
                               src={pet.avatar || (pet.type === 'cat' ? catImage : dogImage)}
                               alt={pet.nickname}
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
                             {pet.nickname}
                           </span>
                         </div>
                       ))
                     )}
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
                width: '50px',
                height: '50px',
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
                src={getSelectedPetAvatar()} 
                alt={selectedPetId === 'buding' ? '布丁' : selectedPetId === 'xueqiu' ? '雪球' : getSelectedPet()?.nickname || "默认头像"} 
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
              <button 
                onClick={() => handleTaskComplete('exercise')}
                style={{
                  background: taskCompletionStatus.exercise ? '#28a745' : '#FFBF6B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                {taskCompletionStatus.exercise ? '已完成' : '去完成'}
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
              <button 
                onClick={() => handleOtherTaskComplete('feeding')}
                style={{
                  background: taskCompletionStatus.feeding ? '#28a745' : '#FFBF6B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                {taskCompletionStatus.feeding ? '已完成' : '去完成'}
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
              <button 
<<<<<<< HEAD
              
              style={{
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
=======
                onClick={() => handleOtherTaskComplete('log')}
                style={{
                  background: taskCompletionStatus.log ? '#28a745' : '#FFBF6B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                {taskCompletionStatus.log ? '已完成' : '去完成'}
>>>>>>> 9a43d079ef0be7a9494319d77fbbb6a14df867a3
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
              <button 
                onClick={() => handleOtherTaskComplete('temperature')}
                style={{
                  background: taskCompletionStatus.temperature ? '#28a745' : '#FFBF6B',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                {taskCompletionStatus.temperature ? '已完成' : '去完成'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
