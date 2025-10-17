import axiosInstance from './axiosInstance';
import type {
  RecommendedCategory,
  CreateCategoryRequest,
  UserMajorCategory,
} from '../types/api';

// API 응답 데이터 형태에 _id가 포함되도록 내부 타입을 정의합니다.
interface ApiResponseCategory {
  _id: string;
  name: string;
  type: 'expense' | 'income';
}

/**
 * GET /categories/default/parent/
 * 대분류 기본(추천) 카테고리 목록을 조회합니다.
 */
export const fetchDefaultMajorCategories = async (): Promise<RecommendedCategory[]> => {
  const response = await axiosInstance.get<{ major: ApiResponseCategory[] }>('/categories/default/parent/');
  
  // 서버에서 받은 _id를 id로 변환하여 반환합니다.
  return response.data.major.map(category => ({
    id: category._id,
    name: category.name,
    type: category.type,
  }));
};

/**
 * GET /categories/default/child/
 * 소분류 기본(추천) 카테고리 목록을 조회합니다.
 * @param parentId - 조회할 소분류의 부모 카테고리 ID
 */
export const fetchDefaultMinorCategories = async (parentId: string): Promise<RecommendedCategory[]> => {
  const response = await axiosInstance.get<{ sub: ApiResponseCategory[] }>('/categories/default/child/', {
    params: { parentId },
  });

  // 서버에서 받은 _id를 id로 변환하여 반환합니다.
  return response.data.sub.map(category => ({
    id: category._id,
    name: category.name,
    type: category.type,
  }));
};

/**
 * POST /api/v1/categories/
 * 사용자의 새 카테고리를 생성합니다.
 */
export const createUserCategory = async (data: CreateCategoryRequest): Promise<void> => {
  await axiosInstance.post('/categories/', data);
};

/**
 * GET /api/v1/categories/
 * 현재 로그인된 사용자의 모든 카테고리 목록을 조회합니다.
 */
export const fetchUserCategories = async (): Promise<UserMajorCategory[]> => {
  const response = await axiosInstance.get<UserMajorCategory[]>('/categories/');
  return response.data;
};

/**
 * DELETE /api/v1/categories/:id
 * 특정 카테고리를 삭제합니다.
 */
export const deleteUserCategory = async (categoryId: string): Promise<void> => {
  await axiosInstance.delete(`/categories/${categoryId}`);
};
