import Product from "../modules/product.js";

// 获取所有商品
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;

        const filter = { isActive: true };

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const products = await Product.find(filter)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "获取商品列表失败",
            error: error.message
        });
    }
};

// 根据ID获取单个商品
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "商品不存在"
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "获取商品详情失败",
            error: error.message
        });
    }
};

// 创建商品（管理员功能）
export const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: "商品创建成功",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "创建商品失败",
            error: error.message
        });
    }
};

// 更新商品（管理员功能）
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
                message: "商品不存在"
            });
        }

        res.json({
            success: true,
            message: "商品更新成功",
            data: product
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "更新商品失败",
            error: error.message
        });
    }
};

// 删除商品（管理员功能 - 软删除）
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "商品不存在"
            });
        }

        res.json({
            success: true,
            message: "商品删除成功"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "删除商品失败",
            error: error.message
        });
    }
};
