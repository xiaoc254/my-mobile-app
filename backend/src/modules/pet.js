import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  // 关联用户ID
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // 宠物基本信息
  nickname: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  
  // 宠物类型
  type: { 
    type: String, 
    required: true,
    enum: ['dog', 'cat', 'other']
  },
  
  // 宠物性别
  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female', 'neutered_male', 'neutered_female']
  },
  
  // 宠物头像
  avatar: { 
    type: String,
    default: null
  },
  
  // 开始日期（领养日期）
  startDate: { 
    type: Date, 
    required: true 
  },
  
  // 体重（公斤）
  weight: { 
    type: Number, 
    required: true,
    min: 0.1,
    max: 200
  },
  
  // 创建时间
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // 更新时间
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 更新时间中间件
petSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 索引优化
petSchema.index({ userId: 1 });
petSchema.index({ createdAt: -1 });

export default mongoose.model("Pet", petSchema);
