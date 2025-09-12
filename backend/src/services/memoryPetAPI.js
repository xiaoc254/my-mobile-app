// 临时内存存储，用于测试API功能
// 当MongoDB不可用时使用

let pets = []; // 内存中的宠物数据
let nextId = 1;

export const memoryPetAPI = {
  // 添加宠物
  addPet: async (petData) => {
    const newPet = {
      id: nextId.toString(),
      nickname: petData.nickname,
      type: petData.type,
      gender: petData.gender,
      avatar: petData.avatar,
      startDate: petData.startDate,
      weight: petData.weight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    nextId++;
    pets.push(newPet);
    return {
      success: true,
      message: "宠物添加成功",
      data: newPet
    };
  },

  // 获取所有宠物
  getPets: async () => {
    return {
      success: true,
      message: "获取宠物列表成功",
      data: pets
    };
  },

  // 根据ID获取宠物
  getPetById: async (petId) => {
    const pet = pets.find(p => p.id === petId);
    if (!pet) {
      throw new Error("宠物不存在");
    }
    return {
      success: true,
      message: "获取宠物详情成功",
      data: pet
    };
  },

  // 更新宠物
  updatePet: async (petId, updateData) => {
    const petIndex = pets.findIndex(p => p.id === petId);
    if (petIndex === -1) {
      throw new Error("宠物不存在");
    }
    pets[petIndex] = {
      ...pets[petIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      message: "宠物信息更新成功",
      data: pets[petIndex]
    };
  },

  // 删除宠物
  deletePet: async (petId) => {
    const petIndex = pets.findIndex(p => p.id === petId);
    if (petIndex === -1) {
      throw new Error("宠物不存在");
    }
    pets.splice(petIndex, 1);
    return {
      success: true,
      message: "宠物删除成功"
    };
  }
};