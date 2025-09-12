import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import catImage from '../image/cat.jpg'
import dogImage from '../image/dog.jpg'

interface TemperatureRecord {
  id: string
  date: string
  time: string
  temperature: number
  condition: 'normal' | 'fever' | 'low' | 'high'
  notes: string
  createdAt: string
}

export default function TemperatureRecord() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedPetId = location.state?.selectedPetId || 'buding'
  
  // 获取宠物信息
  const getPetInfo = () => {
    if (selectedPetId === 'buding') {
      return { name: '布丁', type: 'cat', avatar: catImage }
    } else if (selectedPetId === 'xueqiu') {
      return { name: '雪球', type: 'dog', avatar: dogImage }
    }
    return { name: '布丁', type: 'cat', avatar: catImage }
  }
  
  const petInfo = getPetInfo()
  
  // 体温记录状态
  const [records, setRecords] = useState<TemperatureRecord[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      temperature: 38.5,
      condition: 'normal',
      notes: '晨间测量，体温正常',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: '14:30',
      temperature: 38.2,
      condition: 'normal',
      notes: '午间测量，状态良好',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      time: '20:00',
      temperature: 39.1,
      condition: 'fever',
      notes: '晚间测量，体温偏高，需要观察',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ])
  
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<TemperatureRecord | null>(null)
  const [newRecord, setNewRecord] = useState({
    temperature: 38.5,
    notes: '',
    time: new Date().toTimeString().slice(0, 5)
  })
  
  // 处理返回
  const handleBack = () => {
    navigate('/pet')
  }
  
  // 添加新记录
  const handleAddRecord = () => {
    if (newRecord.temperature > 0) {
      const condition = getTemperatureCondition(newRecord.temperature)
      const record: TemperatureRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        time: newRecord.time,
        temperature: newRecord.temperature,
        condition,
        notes: newRecord.notes,
        createdAt: new Date().toISOString()
      }
      setRecords(prev => [record, ...prev])
      setNewRecord({
        temperature: 38.5,
        notes: '',
        time: new Date().toTimeString().slice(0, 5)
      })
      setShowAddRecord(false)
    }
  }
  
  // 编辑记录
  const handleEditRecord = (record: TemperatureRecord) => {
    setEditingRecord(record)
    setNewRecord({
      temperature: record.temperature,
      notes: record.notes,
      time: record.time
    })
    setShowAddRecord(true)
  }
  
  // 更新记录
  const handleUpdateRecord = () => {
    if (editingRecord && newRecord.temperature > 0) {
      const condition = getTemperatureCondition(newRecord.temperature)
      setRecords(prev => prev.map(record => 
        record.id === editingRecord.id 
          ? { 
              ...record, 
              temperature: newRecord.temperature,
              notes: newRecord.notes,
              time: newRecord.time,
              condition
            }
          : record
      ))
      setNewRecord({
        temperature: 38.5,
        notes: '',
        time: new Date().toTimeString().slice(0, 5)
      })
      setEditingRecord(null)
      setShowAddRecord(false)
    }
  }
  
  // 删除记录
  const handleDeleteRecord = (recordId: string) => {
    setRecords(prev => prev.filter(record => record.id !== recordId))
  }
  
  // 根据体温判断状况
  const getTemperatureCondition = (temp: number): TemperatureRecord['condition'] => {
    if (temp < 37.5) return 'low'
    if (temp > 39.5) return 'high'
    if (temp > 39.0) return 'fever'
    return 'normal'
  }
  
  // 获取状况图标和颜色
  const getConditionInfo = (condition: TemperatureRecord['condition']) => {
    switch (condition) {
      case 'normal':
        return { icon: '✅', color: '#28a745', text: '正常' }
      case 'fever':
        return { icon: '🤒', color: '#ffc107', text: '发热' }
      case 'low':
        return { icon: '❄️', color: '#17a2b8', text: '偏低' }
      case 'high':
        return { icon: '🔥', color: '#dc3545', text: '过高' }
      default:
        return { icon: '✅', color: '#28a745', text: '正常' }
    }
  }
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 86400000)
    
    if (dateString === today.toISOString().split('T')[0]) {
      return '今天'
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return '昨天'
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }
  
  // 计算平均体温
  const getAverageTemperature = () => {
    if (records.length === 0) return 0
    const sum = records.reduce((total, record) => total + record.temperature, 0)
    return Math.round((sum / records.length) * 10) / 10
  }
  
  // 获取最新记录
  const getLatestRecord = () => {
    return records.length > 0 ? records[0] : null
  }
  
  const latestRecord = getLatestRecord()
  const averageTemp = getAverageTemperature()
  
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
        height: '60px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid #f0f0f0',
        position: 'relative',
        zIndex: 10
      }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#333',
            padding: '8px'
          }}
        >
          ←
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          体温记录
        </h1>
        <div style={{ width: '34px' }}></div>
      </div>
      
      {/* 主要内容区域 */}
      <div style={{
        height: 'calc(100vh - 60px)',
        overflow: 'auto',
        padding: '20px'
      }}>
        {/* 宠物信息卡片 */}
        <div style={{
          background: '#FFBF6B',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <img 
              src={petInfo.avatar} 
              alt={petInfo.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '5px'
            }}>
              {petInfo.name}
            </h2>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#fff',
              opacity: 0.9
            }}>
              {petInfo.type === 'cat' ? '喵星人' : '汪星人'} · 体温监测
            </p>
          </div>
        </div>
        
        {/* 当前体温状态 */}
        {latestRecord && (
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${getConditionInfo(latestRecord.condition).color}`
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              当前体温状态
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: getConditionInfo(latestRecord.condition).color }}>
                  {latestRecord.temperature}°C
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                  {formatDate(latestRecord.date)} {latestRecord.time}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '5px' }}>
                  {getConditionInfo(latestRecord.condition).icon}
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: getConditionInfo(latestRecord.condition).color 
                }}>
                  {getConditionInfo(latestRecord.condition).text}
                </div>
              </div>
            </div>
            
            {latestRecord.notes && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#555'
              }}>
                {latestRecord.notes}
              </div>
            )}
          </div>
        )}
        
        {/* 添加记录按钮 */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => {
              setEditingRecord(null)
              setNewRecord({
                temperature: 38.5,
                notes: '',
                time: new Date().toTimeString().slice(0, 5)
              })
              setShowAddRecord(true)
            }}
            style={{
              width: '100%',
              height: '50px',
              background: '#CBA43F',
              border: 'none',
              borderRadius: '25px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(203, 164, 63, 0.3)',
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
            + 记录体温
          </button>
        </div>
        
        {/* 记录列表 */}
        <div style={{
          background: '#fff',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            体温记录
          </h3>
          
          {records.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🌡️</div>
              <p>还没有体温记录</p>
              <p style={{ fontSize: '12px', marginTop: '5px' }}>点击上方按钮开始记录</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {records.map((record) => {
                const conditionInfo = getConditionInfo(record.condition)
                return (
                  <div 
                    key={record.id}
                    style={{
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '15px',
                      border: `1px solid ${conditionInfo.color}20`,
                      borderLeft: `4px solid ${conditionInfo.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: conditionInfo.color,
                          marginBottom: '4px'
                        }}>
                          {record.temperature}°C
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>{formatDate(record.date)}</span>
                          <span>·</span>
                          <span>{record.time}</span>
                          <span>·</span>
                          <span>{conditionInfo.icon} {conditionInfo.text}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleEditRecord(record)}
                          style={{
                            background: '#007bff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDeleteRecord(record.id)}
                          style={{
                            background: '#dc3545',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            color: '#fff',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    
                    {record.notes && (
                      <div style={{
                        fontSize: '14px',
                        color: '#555',
                        lineHeight: '1.4'
                      }}>
                        {record.notes}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* 统计信息 */}
        <div style={{
          background: '#fff',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            体温统计
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FFBF6B' }}>
                {records.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>总记录数</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {averageTemp}°C
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>平均体温</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {records.filter(record => record.condition === 'fever' || record.condition === 'high').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>异常记录</div>
            </div>
          </div>
          
          {/* 体温范围说明 */}
          <div style={{
            marginTop: '15px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ fontWeight: '500', marginBottom: '5px' }}>正常体温范围：</div>
            <div>• 正常：37.5°C - 39.0°C</div>
            <div>• 发热：39.0°C - 39.5°C</div>
            <div>• 过高：&gt; 39.5°C</div>
            <div>• 偏低：&lt; 37.5°C</div>
          </div>
        </div>
      </div>
      
      {/* 添加/编辑记录弹窗 */}
      {showAddRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '15px',
            padding: '25px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              textAlign: 'center'
            }}>
              {editingRecord ? '编辑体温记录' : '添加体温记录'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px', display: 'block' }}>
                  体温 (°C)
                </label>
                <input 
                  type="number"
                  step="0.1"
                  min="30"
                  max="45"
                  value={newRecord.temperature}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 38.5 }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px', display: 'block' }}>
                  测量时间
                </label>
                <input 
                  type="time"
                  value={newRecord.time}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, time: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px', display: 'block' }}>
                  备注
                </label>
                <textarea 
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="记录测量时的状况或备注..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              {/* 体温状况预览 */}
              {newRecord.temperature > 0 && (
                <div style={{
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '5px' }}>体温状况：</div>
                  <div style={{ color: getConditionInfo(getTemperatureCondition(newRecord.temperature)).color }}>
                    {getConditionInfo(getTemperatureCondition(newRecord.temperature)).icon} {getConditionInfo(getTemperatureCondition(newRecord.temperature)).text}
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
              <button 
                onClick={() => {
                  setShowAddRecord(false)
                  setEditingRecord(null)
                  setNewRecord({
                    temperature: 38.5,
                    notes: '',
                    time: new Date().toTimeString().slice(0, 5)
                  })
                }}
                style={{
                  flex: 1,
                  height: '45px',
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  color: '#666',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                取消
              </button>
              <button 
                onClick={editingRecord ? handleUpdateRecord : handleAddRecord}
                style={{
                  flex: 1,
                  height: '45px',
                  background: '#FFBF6B',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {editingRecord ? '更新' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
