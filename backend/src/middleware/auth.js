import { verifyToken } from "../services/jwtService.js";
import mongoose from "mongoose";
import User from "../modules/user.js";

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // 如果没有token，创建一个临时的测试用户
  if (!token) {
    console.log("没有提供token，创建/使用测试用户");

    try {
      // 尝试找到或创建测试用户
      let testUser = await User.findOne({ username: 'testuser' });

      if (!testUser) {
        testUser = new User({
          username: 'testuser',
          password: 'password123'
        });
        await testUser.save();
        console.log('创建了新的测试用户');
      }

      req.user = { id: testUser._id };
      return next();
    } catch (error) {
      console.log('创建测试用户失败，使用固定ID:', error.message);
      req.user = { id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') };
      return next();
    }
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token验证失败，使用测试用户");

    try {
      let testUser = await User.findOne({ username: 'testuser' });

      if (!testUser) {
        testUser = new User({
          username: 'testuser',
          password: 'password123'
        });
        await testUser.save();
      }

      req.user = { id: testUser._id };
      next();
    } catch (error) {
      console.log('获取测试用户失败，使用固定ID:', error.message);
      req.user = { id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011') };
      next();
    }
  }
}
