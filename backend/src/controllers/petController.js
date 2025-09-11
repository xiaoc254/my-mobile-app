import Pet from "../modules/pet.js";
import User from "../modules/user.js";
import { memoryPetAPI } from "../services/memoryPetAPI.js";
import mongoose from "mongoose";

// 检查MongoDB连接状态
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// 添加宠物
export const addPet = async (req, res) => {
  try {
    const { 
      nickname, 
      type, 
      gender, 
      avatar, 
      startDate, 
      weight 
    } = req.body;

    // 验证必填字段
    if (!nickname || !type || !gender || !startDate || !weight) {
      return res.status(400).json({
        success: false,
        message: "请填写所有必填字段"
      });
    }

    // 验证昵称长度
    if (nickname.length < 2) {
      return res.status(400).json({
        success: false,
        message: "昵称至少需要2个字符"
      });
    }

    // 验证体重范围
    if (weight < 0.1 || weight > 200) {
      return res.status(400).json({
        success: false,
        message: "体重必须在0.1-200公斤之间"
      });
    }

    // 验证日期格式
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "开始日期格式不正确"
      });
    }

    // 如果MongoDB连接正常，使用MongoDB
    if (isMongoConnected()) {
      // 获取用户ID（从JWT token中解析）
      const userId = req.user.id;

      // 检查用户是否存在
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "用户不存在"
        });
      }

      // 检查用户是否已有同名宠物
      const existingPet = await Pet.findOne({ 
        userId: userId, 
        nickname: nickname 
      });
      
      if (existingPet) {
        return res.status(400).json({
          success: false,
          message: "您已有一只同名的宠物"
        });
      }

      // 创建新宠物
      const newPet = new Pet({
        userId,
        nickname: nickname.trim(),
        type,
        gender,
        avatar: avatar || null,
        startDate: parsedStartDate,
        weight: parseFloat(weight)
      });

      const savedPet = await newPet.save();

      // 返回成功响应
      return res.status(201).json({
        success: true,
        message: "宠物添加成功",
        data: {
          id: savedPet._id,
          nickname: savedPet.nickname,
          type: savedPet.type,
          gender: savedPet.gender,
          avatar: savedPet.avatar,
          startDate: savedPet.startDate,
          weight: savedPet.weight,
          createdAt: savedPet.createdAt
        }
      });
    } else {
      // MongoDB不可用，使用内存存储
      console.log("MongoDB不可用，使用内存存储");
      
      const petData = {
        nickname: nickname.trim(),
        type,
        gender,
        avatar: avatar || null,
        startDate: parsedStartDate,
        weight: parseFloat(weight)
      };

      const result = await memoryPetAPI.addPet(petData);
      return res.status(201).json(result);
    }

  } catch (error) {
    console.error("添加宠物错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取用户的所有宠物
export const getUserPets = async (req, res) => {
  try {
    // 如果MongoDB连接正常，使用MongoDB
    if (isMongoConnected()) {
      const userId = req.user.id;

      const pets = await Pet.find({ userId })
        .sort({ createdAt: -1 })
        .select('-userId -__v');

      res.status(200).json({
        success: true,
        message: "获取宠物列表成功",
        data: pets
      });
    } else {
      // MongoDB不可用，使用内存存储
      console.log("MongoDB不可用，使用内存存储获取宠物列表");
      
      const result = await memoryPetAPI.getPets();
      res.status(200).json(result);
    }

  } catch (error) {
    console.error("获取宠物列表错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取单个宠物详情
export const getPetById = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const pet = await Pet.findOne({ 
      _id: petId, 
      userId 
    }).select('-userId -__v');

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "宠物不存在"
      });
    }

    res.status(200).json({
      success: true,
      message: "获取宠物详情成功",
      data: pet
    });

  } catch (error) {
    console.error("获取宠物详情错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新宠物信息
export const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // 验证宠物是否存在且属于当前用户
    const pet = await Pet.findOne({ 
      _id: petId, 
      userId 
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "宠物不存在"
      });
    }

    // 如果更新昵称，检查是否重复
    if (updateData.nickname && updateData.nickname !== pet.nickname) {
      const existingPet = await Pet.findOne({ 
        userId: userId, 
        nickname: updateData.nickname,
        _id: { $ne: petId }
      });
      
      if (existingPet) {
        return res.status(400).json({
          success: false,
          message: "您已有一只同名的宠物"
        });
      }
    }

    // 更新宠物信息
    const updatedPet = await Pet.findByIdAndUpdate(
      petId,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-userId -__v');

    res.status(200).json({
      success: true,
      message: "宠物信息更新成功",
      data: updatedPet
    });

  } catch (error) {
    console.error("更新宠物信息错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除宠物
export const deletePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const pet = await Pet.findOneAndDelete({ 
      _id: petId, 
      userId 
    });

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "宠物不存在"
      });
    }

    res.status(200).json({
      success: true,
      message: "宠物删除成功"
    });

  } catch (error) {
    console.error("删除宠物错误:", error);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
