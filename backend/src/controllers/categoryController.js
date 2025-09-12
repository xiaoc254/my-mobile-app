import { Category } from "../modules/category.js";

// 获取所有分类
export const getCategories = async (req, res) => {
  try {
    const { parentId, level } = req.query;

    // 构建查询条件
    let query = { isActive: true };

    if (parentId !== undefined) {
      if (parentId === 'null' || parentId === '') {
        query.parentId = null;
      } else {
        query.parentId = parentId;
      }
    }

    if (level !== undefined) {
      query.level = parseInt(level);
    }

    const categories = await Category.find(query)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    // 将 _id 字段映射为 id 字段
    const categoriesWithId = categories.map(category => ({
      ...category,
      id: category._id.toString()
    }));

    res.json({
      success: true,
      data: categoriesWithId
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
};

// 根据ID获取分类详情
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // 验证 ID 是否有效
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: '无效的分类ID'
      });
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    // 将 _id 字段映射为 id 字段
    const categoryWithId = {
      ...category,
      id: category._id.toString()
    };

    res.json({
      success: true,
      data: categoryWithId
    });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类详情失败',
      error: error.message
    });
  }
};

// 创建分类（管理员功能）
export const createCategory = async (req, res) => {
  try {
    const categoryData = req.body;

    const category = new Category(categoryData);
    await category.save();

    const categoryWithId = {
      ...category.toObject(),
      id: category._id.toString()
    };

    res.status(201).json({
      success: true,
      data: categoryWithId,
      message: '分类创建成功'
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
};

// 更新分类（管理员功能）
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    const categoryWithId = {
      ...category.toObject(),
      id: category._id.toString()
    };

    res.json({
      success: true,
      data: categoryWithId,
      message: '分类更新成功'
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '更新分类失败',
      error: error.message
    });
  }
};

// 删除分类（管理员功能）
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      message: '分类删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '删除分类失败',
      error: error.message
    });
  }
};
