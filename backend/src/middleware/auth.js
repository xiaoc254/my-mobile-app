import { verifyToken } from "../services/jwtService.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  // 如果没有token，创建一个临时的测试用户
  if (!token) {
    console.log("没有提供token，使用测试用户");
    req.user = { id: 'test-user-id' };
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Token验证失败，使用测试用户");
    req.user = { id: 'test-user-id' };
    next();
  }
}
