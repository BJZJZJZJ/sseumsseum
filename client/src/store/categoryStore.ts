import { create } from 'zustand';
import {
  fetchUserCategories,
  createUserCategory,
  deleteUserCategory,
} from '../api/categoryApi';
import type { UserMajorCategory } from '../types/api';

// ✅ MinorCategory와 MajorCategory 인터페이스에 'type' 속성 추가
export interface MinorCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
}
export interface MajorCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  minorCategories: MinorCategory[];
}

interface CategoryState {
  majorCategories: MajorCategory[];
  isLoading: boolean;
  error: string | null;
  loadUserCategories: () => Promise<MajorCategory[]>; // ✅ 반환 타입 수정
  addUserMajorCategory: (name: string, type?: 'expense' | 'income') => Promise<void>;
  addUserMinorCategory: (parentId: string, name: string, type?: 'expense' | 'income') => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
}

// ✅ API 응답을 변환할 때 'type' 정보를 포함하도록 수정
const transformCategories = (categories: UserMajorCategory[]): MajorCategory[] => {
  return categories.map(major => ({
    id: major.id,
    name: major.name,
    type: major.type,
    minorCategories: major.subcategories.map(minor => ({
      id: minor.id,
      name: minor.name,
      type: minor.type,
    })),
  }));
};

const useCategoryStore = create<CategoryState>((set, get) => ({
  majorCategories: [],
  isLoading: false,
  error: null,

  loadUserCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const userCategories = await fetchUserCategories();
      const transformed = transformCategories(userCategories);
      set({ majorCategories: transformed, isLoading: false });
      return transformed; // ✅ 변환된 데이터 반환
    } catch (err) {
      set({ error: '카테고리 목록을 불러오는데 실패했습니다.', isLoading: false });
      return []; // 실패 시 빈 배열 반환
    }
  },

  addUserMajorCategory: async (name, type = 'expense') => {
    try {
      await createUserCategory({ name, type });
      await get().loadUserCategories();
    } catch (err) {
      console.error("대분류 추가 실패:", err);
      throw err;
    }
  },

  addUserMinorCategory: async (parentId, name, type = 'expense') => {
    try {
      await createUserCategory({ name, type, parentCategory: parentId });
      await get().loadUserCategories();
    } catch (err) {
      console.error("소분류 추가 실패:", err);
      throw err;
    }
  },

  deleteCategory: async (categoryId: string) => {
    try {
      await deleteUserCategory(categoryId);
      await get().loadUserCategories();
    } catch (err) {
      console.error("카테고리 삭제 실패:", err);
      throw err;
    }
  },
}));

export default useCategoryStore;

