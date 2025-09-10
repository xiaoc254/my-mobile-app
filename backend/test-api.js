// 测试API脚本
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

async function testPetAPI() {
  console.log('开始测试宠物API...');
  
  try {
    // 测试添加宠物
    const petData = {
      nickname: '测试宠物',
      type: 'cat',
      gender: 'female',
      avatar: null,
      startDate: '2024/01/15 10:30',
      weight: 3.5
    };

    console.log('1. 测试添加宠物...');
    const addResponse = await fetch(`${API_BASE_URL}/pets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(petData)
    });

    const addResult = await addResponse.json();
    console.log('添加宠物结果:', addResult);

    if (addResult.success) {
      console.log('✅ 添加宠物成功');
    } else {
      console.log('❌ 添加宠物失败:', addResult.message);
    }

    // 测试获取宠物列表
    console.log('\n2. 测试获取宠物列表...');
    const getResponse = await fetch(`${API_BASE_URL}/pets`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const getResult = await getResponse.json();
    console.log('获取宠物列表结果:', getResult);

    if (getResult.success) {
      console.log('✅ 获取宠物列表成功，宠物数量:', getResult.data.length);
    } else {
      console.log('❌ 获取宠物列表失败:', getResult.message);
    }

  } catch (error) {
    console.error('❌ API测试失败:', error.message);
  }
}

// 运行测试
testPetAPI();
