import { Product } from "../modules/product.js";

// 获取所有商品
export const getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    // 构建查询条件
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 分页参数
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 查询商品
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总数
    const total = await Product.countDocuments(query);

    // 将 _id 字段映射为 id 字段
    const productsWithId = products.map(product => ({
      ...product.toObject(),
      id: product._id.toString()
    }));

    res.json({
      success: true,
      data: productsWithId,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败',
      error: error.message
    });
  }
};

// 根据ID获取商品
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 将 _id 字段映射为 id 字段
    const productWithId = {
      ...product.toObject(),
      id: product._id.toString()
    };

    res.json({
      success: true,
      data: productWithId
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败',
      error: error.message
    });
  }
};

// 创建商品
export const createProduct = async (req, res) => {
  try {
    const productData = req.body;

    // 验证必要字段
    const requiredFields = ['name', 'brand', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !productData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `缺少必要字段: ${missingFields.join(', ')}`
      });
    }

    const product = new Product(productData);
    await product.save();

    // 将 _id 字段映射为 id 字段
    const productWithId = {
      ...product.toObject(),
      id: product._id.toString()
    };

    res.status(201).json({
      success: true,
      data: productWithId,
      message: '商品创建成功'
    });
  } catch (error) {
    console.error('创建商品错误:', error);
    res.status(500).json({
      success: false,
      message: '创建商品失败',
      error: error.message
    });
  }
};

// 更新商品
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 将 _id 字段映射为 id 字段
    const productWithId = {
      ...product.toObject(),
      id: product._id.toString()
    };

    res.json({
      success: true,
      data: productWithId,
      message: '商品更新成功'
    });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({
      success: false,
      message: '更新商品失败',
      error: error.message
    });
  }
};

// 删除商品
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    res.json({
      success: true,
      message: '商品删除成功'
    });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({
      success: false,
      message: '删除商品失败',
      error: error.message
    });
  }
};
