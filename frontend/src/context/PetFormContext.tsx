import React, { createContext, useContext, useState } from "react";

// 宠物数据接口
export interface PetFormData {
  type: string; // 宠物类型: dog, cat, other
  gender: string; // 宠物性别: male, female, neutered_male, neutered_female
  nickname: string; // 宠物昵称
  avatar: string | null; // 宠物头像
  startDate: string; // 开始日期
  weight: string; // 体重
}

// 上下文接口
interface PetFormContextType {
  petData: PetFormData;
  updatePetData: (data: Partial<PetFormData>) => void;
  resetPetData: () => void;
  isFormComplete: () => boolean;
}

// 创建上下文
const PetFormContext = createContext<PetFormContextType | undefined>(undefined);

// 初始数据
const initialPetData: PetFormData = {
  type: "",
  gender: "",
  nickname: "",
  avatar: null,
  startDate: "",
  weight: "",
};

// 提供者组件
export const PetFormProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [petData, setPetData] = useState<PetFormData>(initialPetData);

  // 更新宠物数据
  const updatePetData = (data: Partial<PetFormData>) => {
    setPetData((prev) => ({ ...prev, ...data }));
  };

  // 重置宠物数据
  const resetPetData = () => {
    setPetData(initialPetData);
  };

  // 检查表单是否完整
  const isFormComplete = () => {
    return !!(
      petData.type &&
      petData.gender &&
      petData.nickname &&
      petData.nickname.length >= 2 &&
      petData.startDate &&
      petData.weight
    );
  };

  const value: PetFormContextType = {
    petData,
    updatePetData,
    resetPetData,
    isFormComplete,
  };

  return (
    <PetFormContext.Provider value={value}>{children}</PetFormContext.Provider>
  );
};

// 自定义Hook
export const usePetForm = () => {
  const context = useContext(PetFormContext);
  if (context === undefined) {
    throw new Error("usePetForm must be used within a PetFormProvider");
  }
  return context;
};
