// 测试购物车功能的简单脚本
async function testCartFunctionality() {
  const API_BASE = 'http://localhost:3000/api';

  console.log('🚀 开始测试购物车功能...\n');

  try {
    // 1. 登录获取token
    console.log('1. 用户登录...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: '123456'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error('登录失败: ' + loginData.message);
    }

    const token = loginData.data.token;
    console.log('✅ 登录成功');

    // 2. 获取商品列表
    console.log('\n2. 获取商品列表...');
    const productsResponse = await fetch(`${API_BASE}/products`);
    const productsData = await productsResponse.json();

    if (!productsData.success || !productsData.data.products.length) {
      throw new Error('获取商品列表失败');
    }

    const firstProduct = productsData.data.products[0];
    console.log(`✅ 获取到 ${productsData.data.products.length} 个商品`);
    console.log(`   第一个商品: ${firstProduct.name} (ID: ${firstProduct.id})`);

    // 3. 添加商品到购物车
    console.log('\n3. 添加商品到购物车...');
    const addToCartResponse = await fetch(`${API_BASE}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: firstProduct.id,
        quantity: 2,
        spec: '默认规格'
      })
    });

    const addToCartData = await addToCartResponse.json();
    if (!addToCartData.success) {
      throw new Error('添加到购物车失败: ' + addToCartData.message);
    }

    console.log('✅ 成功添加商品到购物车');
    console.log(`   购物车中有 ${addToCartData.data.totalItems} 件商品`);

    // 4. 获取购物车内容
    console.log('\n4. 获取购物车内容...');
    const cartResponse = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const cartData = await cartResponse.json();
    if (!cartData.success) {
      throw new Error('获取购物车失败: ' + cartData.message);
    }

    console.log('✅ 成功获取购物车内容');
    console.log(`   总商品数: ${cartData.data.totalItems}`);
    console.log(`   总金额: ¥${cartData.data.totalAmount}`);
    console.log(`   已选金额: ¥${cartData.data.selectedAmount}`);

    cartData.data.items.forEach((item, index) => {
      console.log(`   商品 ${index + 1}: ${item.productName} x${item.quantity} = ¥${item.price * item.quantity}`);
    });

    // 5. 更新商品数量
    if (cartData.data.items.length > 0) {
      console.log('\n5. 更新商品数量...');
      const firstItem = cartData.data.items[0];
      const updateResponse = await fetch(`${API_BASE}/cart/items/${firstItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: 3 })
      });

      const updateData = await updateResponse.json();
      if (!updateData.success) {
        throw new Error('更新数量失败: ' + updateData.message);
      }

      console.log('✅ 成功更新商品数量');
      console.log(`   新的总金额: ¥${updateData.data.totalAmount}`);
    }

    console.log('\n🎉 购物车功能测试完成！所有功能正常工作。');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testCartFunctionality();
