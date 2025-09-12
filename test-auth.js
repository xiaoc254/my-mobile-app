// 测试认证功能
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function testAuth() {
  console.log('🚀 开始测试认证功能...\n');

  try {
    // 1. 测试注册
    console.log('1. 测试注册功能...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: 'testuser',
        password: 'password123'
      });

      if (registerResponse.data.success) {
        console.log('✅ 注册成功');
        console.log(`   - 用户名: ${registerResponse.data.data.user.username}`);
        console.log(`   - Token: ${registerResponse.data.data.token.substring(0, 20)}...`);
      }
    } catch (error) {
      if (error.response?.data?.message === '用户名已存在') {
        console.log('ℹ️  用户已存在，跳过注册');
      } else {
        console.log('❌ 注册失败:', error.response?.data?.message || error.message);
      }
    }

    // 2. 测试登录
    console.log('\n2. 测试登录功能...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'testuser',
        password: 'password123'
      });

      if (loginResponse.data.success) {
        console.log('✅ 登录成功');
        console.log(`   - 用户名: ${loginResponse.data.data.user.username}`);
        console.log(`   - Token: ${loginResponse.data.data.token.substring(0, 20)}...`);

        // 3. 测试受保护的API
        console.log('\n3. 测试受保护的API...');
        const token = loginResponse.data.data.token;

        const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ 获取用户信息成功');
        console.log(`   - 用户名: ${profileResponse.data.username}`);

        return true;
      }
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data?.message || error.message);
      return false;
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:', error.message);
    return false;
  }
}

// 测试错误的登录信息
async function testWrongCredentials() {
  console.log('\n4. 测试错误的登录信息...');

  try {
    await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'wronguser',
      password: 'wrongpassword'
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ 正确拒绝了错误的登录信息');
      console.log(`   - 错误消息: ${error.response.data.message}`);
    } else {
      console.log('❌ 错误处理异常:', error.response?.data?.message || error.message);
    }
  }
}

// 运行测试
async function runAllTests() {
  const authResult = await testAuth();
  await testWrongCredentials();

  console.log('\n📊 测试结果总结:');
  if (authResult) {
    console.log('✅ 认证功能正常工作');
    console.log('💡 可以使用以下测试账户登录:');
    console.log('   - 用户名: testuser');
    console.log('   - 密码: password123');
  } else {
    console.log('❌ 认证功能存在问题，需要检查服务器');
  }
}

runAllTests();
