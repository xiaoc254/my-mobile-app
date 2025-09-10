// API类型声明
export interface PetData {
  nickname: string;
  type: string;
  gender: string;
  avatar?: string | null;
  startDate: string;
  weight: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PetAPI {
  addPet: (petData: PetData) => Promise<ApiResponse>;
  getPets: () => Promise<ApiResponse<PetData[]>>;
  getPetById: (petId: string) => Promise<ApiResponse<PetData>>;
  updatePet: (petId: string, updateData: Partial<PetData>) => Promise<ApiResponse<PetData>>;
  deletePet: (petId: string) => Promise<ApiResponse>;
}

export interface AuthAPI {
  login: (credentials: { email: string; password: string }) => Promise<ApiResponse>;
  register: (userData: { email: string; password: string; name: string }) => Promise<ApiResponse>;
}

declare const petAPI: PetAPI;
declare const authAPI: AuthAPI;

export { petAPI, authAPI };

