import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Interaction {
  date: string;
  description: string;
}

export default function PetInteractionLogger() {
  const navigate = useNavigate()

  const PetTyperQx = () => {
    navigate('/pet-type-qx')
  }

  const [interactions, setInteractions] = useState<Interaction[]>([
    { date: '25-04-16', description: '更换食盆位置后雪球24小时未进食' },
    { date: '25-04-18', description: '雪球每日多次舔毛，导致前爪内侧出现局部脱毛' },
    { date: '25-04-23', description: '雪球这几天每天17:30准时蹲守厨房门口' },
    { date: '25-04-30', description: '抛出玩具给雪球后它立即呈现后退的姿势' },
    { date: '25-05-01', description: '狗狗雪球闪着玩具在我面前来回走动发出哼鸣声' },
    { date: '25-05-03', description: '雪球快速伸舌舔鼻然后突然静止' },
    { date: '25-05-10', description: '狗狗雪球用身体1/3重量靠在我腿上' },
  ]);

  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const addInteraction = () => {
    if (newDate && newDescription) {
      setInteractions([...interactions, { date: newDate, description: newDescription }]);
      setNewDate('');
      setNewDescription('');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      {/* 居中标题 */}
      <h1 style={{ 
        textAlign: 'center', 
        width: '100%',
        marginBottom: '30px'
      }}>
        互动行为日志
      </h1>
      
      {/* 表格容器 */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px',
        marginBottom: '30px'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '30px' 
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                textAlign: 'center' // 改为居中
              }}>
                记录日期
              </th>
              <th style={{ 
                padding: '12px', 
                border: '1px solid #ddd', 
                textAlign: 'center' // 改为居中
              }}>
                宠物互动行为描述
              </th>
            </tr>
          </thead>
          <tbody>
            {interactions.map((interaction, index) => (
              <tr key={index}>
                <td style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd',
                  textAlign: 'center' // 改为居中
                }}>
                  {interaction.date}
                </td>
                <td style={{ 
                  padding: '12px', 
                  border: '1px solid #ddd',
                  textAlign: 'center' // 改为居中
                }}>
                  {interaction.description}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ 
                padding: '12px', 
                border: '1px solid #ddd',
                textAlign: 'center' // 改为居中
              }}>
                <input
                  type="text"
                  placeholder="请输入日期"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  style={{ 
                    width: '90%', 
                    padding: '8px', 
                    boxSizing: 'border-box',
                    textAlign: 'center' // 输入框文字居中
                  }}
                />
              </td>
              <td style={{ 
                padding: '12px', 
                border: '1px solid #ddd',
                textAlign: 'center' // 改为居中
              }}>
                <input
                  type="text"
                  placeholder="添加宠物行为"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  style={{ 
                    width: '90%', 
                    padding: '8px', 
                    boxSizing: 'border-box',
                    textAlign: 'center' // 输入框文字居中
                  }}
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* 按钮容器 - 居中显示 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          <button 
            onClick={addInteraction}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e6b412ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            确认添加
          </button>
          
          <button 
            onClick={PetTyperQx}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dcac0cff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            情绪日记
          </button>
        </div>
      </div>
    </div>
  );
}