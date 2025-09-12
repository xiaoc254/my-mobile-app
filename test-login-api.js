// 测试登录API的脚本
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试数据
const testUser = {
  username: 'testuser123',
  password: 'testpass123'
};

async function testAuthAPI() {
  console.log('🔍 开始测试认证API...\n');

  try {
    // 1. 测试注册
    console.log('1. 测试用户注册...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ 注册成功:', registerResponse.data);

      if (registerResponse.data.success && registerResponse.data.data.token) {
        console.log('📝 Token:', registerResponse.data.data.token.substring(0, 20) + '...');
        console.log('👤 用户信息:', registerResponse.data.data.user);
      }
    } catch (error) {
      if (error.response?.data?.message === '用户名已存在') {
        console.log('⚠️  用户已存在，继续测试登录...');
      } else {
        console.error('❌ 注册失败:', error.response?.data || error.message);
        return;
      }
    }

    console.log('\n---\n');

    // 2. 测试登录
    console.log('2. 测试用户登录...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
      console.log('✅ 登录成功:', loginResponse.data);

      if (loginResponse.data.success && loginResponse.data.data.token) {
        const token = loginResponse.data.data.token;
        console.log('📝 Token:', token.substring(0, 20) + '...');
        console.log('👤 用户信息:', loginResponse.data.data.user);

        console.log('\n---\n');

        // 3. 测试获取用户信息
        console.log('3. 测试获取用户信息...');
        try {
          const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 获取用户信息成功:', meResponse.data);
        } catch (error) {
          console.error('❌ 获取用户信息失败:', error.response?.data || error.message);
        }

        console.log('\n---\n');

        // 4. 测试获取用户资料
        console.log('4. 测试获取用户资料...');
        try {
          const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 获取用户资料成功:', profileResponse.data);
        } catch (error) {
          console.error('❌ 获取用户资料失败:', error.response?.data || error.message);
        }

        console.log('\n---\n');

        // 5. 测试退出登录
        console.log('5. 测试退出登录...');
        try {
          const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('✅ 退出登录成功:', logoutResponse.data);
        } catch (error) {
          console.error('❌ 退出登录失败:', error.response?.data || error.message);
        }
      }
    } catch (error) {
      console.error('❌ 登录失败:', error.response?.data || error.message);
    }

    console.log('\n---\n');

    // 6. 测试错误的登录信息
    console.log('6. 测试错误的登录信息...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        username: 'wronguser',
        password: 'wrongpass'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ 正确处理了错误的登录信息:', error.response.data.message);
      } else {
        console.error('❌ 错误处理异常:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n🏁 测试完成！');
}

// 运行测试
testAuthAPI();
