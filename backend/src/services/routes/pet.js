import express from "express";
import { 
  addPet, 
  getUserPets, 
  getPetById, 
  updatePet, 
  deletePet 
} from "../../controllers/petController.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = express.Router();

// 所有宠物相关路由都需要身份验证
router.use(authenticateToken);

// 添加宠物
router.post("/", addPet);

// 获取用户的所有宠物
router.get("/", getUserPets);

// 获取单个宠物详情
router.get("/:petId", getPetById);

// 更新宠物信息
router.put("/:petId", updatePet);

// 删除宠物
router.delete("/:petId", deletePet);

export default router;
