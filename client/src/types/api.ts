import type { Transaction } from "./transaction";

/**
 * 회원가입 폼 데이터 타입
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword?: string; // 폼에서만 사용
  nickname: string;
  birthdate: string;
  gender: '남' | '여';
}

/**
 * POST /auth/register 요청 타입
 */
export interface RegisterRequestData {
  email: string;
  password: string;
  nickname: string;
  birth: string;
  gender: '남' | '여';
}

/**
 * POST /auth/register 응답 타입
 */
export interface RegisterResponse {
  message: string;
}

/**
 * POST /auth/login 요청 타입
 */
export interface LoginRequestData {
  email: string;
  password: string;
}

/**
 * POST /auth/login 응답 타입
 */
export interface LoginResponse {
  message: string;
  accessToken: string;
}

/**
 * POST /auth/refresh 응답 타입 (서버 응답에 맞춰 수정)
 */
export interface RefreshResponse {
  message: string;
  newAccesesToken: string; // 'accessToken'에서 'newAccesesToken'으로 수정
}


/**
 * POST /auth/resend 요청 타입 (인증 메일 재전송)
 */
export interface ResendRequestData {
  email: string;
}

/**
 * POST /auth/resend 응답 타입 (인증 메일 재전송)
 */
export interface ResendResponse {
  message: string;
}

/**
 * 이메일 인증 성공 응답
 */
export interface VerifyEmailResponse {
  message: string;
}


// --- 사용자 정보 관련 타입 ---

/**
 * 사용자 정보 객체 타입
 */
export interface User {
  email: string;
  nickname: string;
  birth: string;
  gender: '남' | '여';
}

/**
 * GET /users/me API의 실제 응답 타입 (user 객체로 감싸져 있음)
 */
export interface UserProfileResponse {
  user: User;
}

/**
 * POST /users/me/password 요청 타입 (비밀번호 체크)
 */
export interface PasswordVerifyRequest {
  currentPassword: string;
}

/**
 * POST /users/me/password 응답 타입 (비밀번호 체크)
 */
export interface PasswordVerifyResponse {
  message: string;
  passwordToken?: string;
}

/**
 * PUT /users/me 요청 타입 (프로필 정보 수정)
 */
export interface ProfileUpdateRequest {
  nickname: string;
  birth: string;
  gender: '남' | '여';
}

/**
 * PUT /users/me/password 요청 타입 (비밀번호 변경)
 */
export interface PasswordChangeRequest {
  newPassword: string;
  confirmNewPassword: string;
}

/**
 * PUT /users/me/password 응답 타입 (비밀번호 변경)
 */
export interface PasswordChangeResponse {
  message: string;
  accessToken: string;
}


// --- 카테고리 추천 관련 타입 ---

/**
 * 추천 카테고리의 기본 형태
 */
export interface RecommendedCategory {
  id: string;
  name: string;
  type: 'expense' | 'income';
}

/**
 * GET /categories/default/parent/ API 응답 타입
 */
export interface FetchMajorRecommendationsResponse {
  major: RecommendedCategory[];
}

/**
 * GET /categories/default/child/ API 응답 타입
 */
export interface FetchMinorRecommendationsResponse {
  sub: RecommendedCategory[];
}

// --- 사용자 카테고리 생성 및 조회 관련 타입 ---

/**
 * POST /api/v1/categories/ 요청 타입
 */
export interface CreateCategoryRequest {
  name: string;
  type: 'expense' | 'income';
  parentCategory?: string; // 소분류 생성 시에만 필요
}

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
  subcategories: UserMinorCategory[];
}

/**
 * 페이지네이션 정보 타입
 */
export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

/**
 * GET /api/v1/transactions/ API 응답 타입
 */
export interface FetchTransactionsResponse {
  data: Transaction[];
  pagination: PaginationInfo;
}

/**
 * POST /api/v1/transactions/ 요청 타입
 */
export interface CreateTransactionRequest {
  categoryId: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  transactionDate: string; // "YYYY-MM-DD"
  method: string;
}

/**
 * POST /api/v1/transactions/ 응답 타입
 */
export interface CreateTransactionResponse {
  message: string;
  data: Transaction;
}

/**
 * CSV 업로드 시 발생하는 오류 상세 정보
 */
export interface UploadErrorDetail {
  row: number;
  errors: string[];
}

/**
 * POST /transactions/upload/ API 응답 타입
 */
export interface UploadTransactionsResponse {
  message: string;
  error?: UploadErrorDetail[]; // 오류가 있을 경우에만 포함됨
}

// --- 대시보드 관련 타입 ---

export interface DashboardSummary {
  currentMonthSpent: number;
  previousMonthSpent: number;
  comparison: number;
}

export interface DailySpentData {
  date: string;
  amount: number;
}

export interface DailySpent {
  currentMonth: DailySpentData[];
  previousMonth: DailySpentData[];
}

export interface CategorySpent {
  categoryName: string;
  totalSpent: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  dailySpent: DailySpent;
  categorySpent: CategorySpent[];
  advice: string;
}

export interface FetchDashboardResponse {
  message: string;
  data: DashboardData;
}

/**
 * 예산에 포함된 개별 카테고리 정보
 */
export interface BudgetCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
}

/**
 * GET /budgets API 응답의 data 객체 내부 타입
 */
export interface BudgetData {
  id: string;
  month: string;
  categories: BudgetCategory[];
}

/**
 * GET /budgets API의 실제 응답 타입 (배열이 아닌 단일 객체로 수정)
 */
export interface FetchBudgetResponse {
  message: string;
  data: BudgetData;
}

export interface CreateBudgetCategory {
  categoryId: string;
  amount: number;
}

export interface CreateBudgetRequest {
  month: string;
  categories: CreateBudgetCategory[];
}

export type UpdateBudgetRequest = CreateBudgetRequest;

export interface BudgetReportCategory {
  categoryId: string;
  categoryName: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
}

export interface FetchBudgetReportResponse {
  message: string;
  id: string;
  month: string;
  data: BudgetReportCategory[];
}

export interface ReportCategoryBreakdown {
  period: string;
  categoryId: string;
  categoryName: string;
  type: 'expense' | 'income';
  amount: number;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface FinancialTrendData {
  summary: ReportSummary;
  categoryBreakdown: ReportCategoryBreakdown[];
}

export interface FetchFinancialTrendResponse {
  message: string;
  startDate: string;
  endDate: string;
  data: FinancialTrendData;
}

export interface TopSpendingItem {
  description: string;
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  count: number;
}

export interface FetchTopSpendingResponse {
  message: string;
  startDate: string;
  endDate: string;
  data: TopSpendingItem[];
}

export interface CategoryDetailItem {
  subCategoryId: string;
  subCategoryName: string;
  totalSpent: number;
}

export interface FetchCategoryDetailResponse {
  message: string;
  startDate: string;
  endDate: string;
  data: CategoryDetailItem[];
}
