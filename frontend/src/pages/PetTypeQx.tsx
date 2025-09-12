import  { useState } from 'react'

interface EmotionRecord {
  date: string;
  emotionType: 'normal' | 'urgent' | 'general';
  notes: string;
}

export default function EmotionDiary() {
  const [selectedEmotion, setSelectedEmotion] = useState<'normal' | 'urgent' | 'general' | null>(null);
  const [emotionRecords, setEmotionRecords] = useState<EmotionRecord[]>([
    { date: '25-04-16', emotionType: 'normal', notes: '进食正常，行为活跃' },
    { date: '25-04-18', emotionType: 'urgent', notes: '频繁舔毛导致局部脱毛，需关注' },
    { date: '25-04-23', emotionType: 'general', notes: '按时蹲守厨房，行为规律' },
  ]);
  const [currentDate, setCurrentDate] = useState('25-05-15');
  const [notes, setNotes] = useState('');

  const addEmotionRecord = () => {
    if (selectedEmotion) {
      const newRecord: EmotionRecord = {
        date: currentDate,
        emotionType: selectedEmotion,
        notes: notes || '无备注'
      };
      setEmotionRecords([...emotionRecords, newRecord]);
      setSelectedEmotion(null);
      setNotes('');
    }
  };

  const getEmotionText = (type: 'normal' | 'urgent' | 'general') => {
    switch (type) {
      case 'normal': return '正常';
      case 'urgent': return '紧急';
      case 'general': return '一般';
      default: return '';
    }
  };

  const getEmotionColor = (type: 'normal' | 'urgent' | 'general') => {
    switch (type) {
      case 'normal': return '#4caf50';
      case 'urgent': return '#f44336';
      case 'general': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', textAlign: 'center', marginBottom: '30px' }}>情绪日记</h1>

      <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>雪球情绪分析表</h2>

        <div style={{ margin: '20px 0' }}>
          <h3 style={{ marginBottom: '15px' }}>选择今日情绪状态：</h3>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            {(['normal', 'urgent', 'general'] as const).map((emotion) => (
              <div
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                style={{
                  flex: 1,
                  padding: '20px',
                  backgroundColor: selectedEmotion === emotion ? getEmotionColor(emotion) : '#f9f9f9',
                  color: selectedEmotion === emotion ? 'white' : '#333',
                  border: `2px solid ${getEmotionColor(emotion)}`,
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontWeight: 'bold'
                }}
              >
                {getEmotionText(emotion)}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              记录日期：
            </label>
            <input
              type="text"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="请输入日期"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              备注信息：
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
              placeholder="记录详细情况..."
            />
          </div>

          <button
            onClick={addEmotionRecord}
            disabled={!selectedEmotion}
            style={{
              padding: '12px 25px',
              backgroundColor: selectedEmotion ? getEmotionColor(selectedEmotion) : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedEmotion ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            保存情绪记录
          </button>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '15px' }}>历史情绪记录：</h3>
          <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
            {emotionRecords.length > 0 ? (
              emotionRecords.map((record, index) => (
                <div
                  key={index}
                  style={{
                    padding: '15px',
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                    borderBottom: index < emotionRecords.length - 1 ? '1px solid #eee' : 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getEmotionColor(record.emotionType),
                      marginRight: '15px'
                    }}
                  ></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {record.date} - {getEmotionText(record.emotionType)}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>{record.notes}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                暂无情绪记录
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e3f2fd',
        border: '1px dashed #2196f3',
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>AI生成注意事项</h4>
        <p style={{ margin: 0, color: '#0d47a1', fontSize: '14px' }}>
          情绪分析基于AI算法，仅供参考。宠物情绪可能受环境、健康等多种因素影响，
          如有紧急情况或持续异常行为，请及时咨询专业兽医。
        </p>
      </div>
    </div>
  );
}
