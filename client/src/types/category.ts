/**
 * 소분류 카테고리 타입
 */
export interface MinorCategory {
  id: string;
  name: string;
}

/**
 * 대분류 카테고리 타입 (소분류 목록 포함)
 */
export interface MajorCategory {
  id: string;
  name: string;
  minorCategories: MinorCategory[];
}

// ... 기존 타입들

/**
 * POST /api/v1/categories/ 요청 타입
 */
export interface CreateCategoryRequest {
  name: string;
  type: 'expense' | 'income';
  parentCategory?: string;
}

// --- 사용자 카테고리 목록 관련 타입 (실제 API 응답 기준) ---

/**
 * 사용자 소분류 카테고리 타입 (GET /api/v1/categories/ 응답 기준)
 */
export interface UserMinorCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

/**
 * 사용자 대분류 카테고리 타입 (GET /api/v1/categories/ 응답 기준)
 */
export interface UserMajorCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
  subcategories: UserMinorCategory[]; // 'subCategories'에서 'subcategories'로 수정
}