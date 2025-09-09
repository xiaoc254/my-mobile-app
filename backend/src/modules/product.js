import mongoose from "mongoose";

const productSpecSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    images: [{ type: String }],
    description: { type: String, required: true },
    specs: [productSpecSchema],
    features: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;
