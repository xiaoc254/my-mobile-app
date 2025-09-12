import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  mobile: { type: String, unique: true, sparse: true }, // 手机号，稀疏索引允许多个null值
  email: { type: String, unique: true, sparse: true }, // 邮箱，稀疏索引允许多个null值
  avatar: { type: String }, // 用户头像
  nickname: { type: String }, // 用户昵称
  loginType: {
    type: String,
    enum: ['username', 'mobile', 'email', 'qq', 'wechat'],
    default: 'username'
  }, // 登录方式
  isVerified: { type: Boolean, default: false }, // 是否已验证
  lastLoginAt: { type: Date }, // 最后登录时间
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 密码加密
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 密码验证
userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
