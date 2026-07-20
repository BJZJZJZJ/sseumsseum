# 💰 씀씀(sseumsseum) - Frontend

> ⚠️ 이 프로젝트는 2024년~2025년경 진행된 팀 프로젝트로, 현재 실제 서비스(백엔드 서버, Firebase Hosting 등)는 운영되지 않습니다. 포트폴리오 아카이브 용도로 정리된 문서입니다.

개인 금융(가계부) 관리 서비스 **씀씀**의 프론트엔드입니다. React + TypeScript + Vite 기반 SPA로, 거래 내역 관리·예산 설정·대시보드·리포트 등 [백엔드 API](../server/README.md)와 연동되는 기능을 제공합니다.

---

## 📌 목차

1. [기술 스택](#-기술-스택)
2. [주요 기능 / 페이지](#-주요-기능--페이지)
3. [프로젝트 구조](#-프로젝트-구조)
4. [상태 관리](#-상태-관리)
5. [개발 환경 설정](#-개발-환경-설정)
6. [빌드 및 배포](#-빌드-및-배포)

---

## 🛠 기술 스택

| 분류 | 기술 |
| --- | --- |
| 코어 | React 19, TypeScript, Vite 7 |
| 라우팅 | react-router-dom v7 |
| 상태 관리 | Zustand (persist 미들웨어로 로그인 상태 로컬 저장) |
| 스타일 | Tailwind CSS v4 |
| HTTP 클라이언트 | axios (Access Token 자동 첨부 + 401 시 자동 refresh 인터셉터) |
| 폼 | react-hook-form |
| 차트 | Chart.js, react-chartjs-2 |
| UI 유틸 | @headlessui/react, lucide-react (아이콘), react-datepicker, date-fns / dayjs |
| 배포 | Firebase Hosting + Cloud Functions (API 프록시) |

---

## ✨ 주요 기능 / 페이지

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | LandingPage | 서비스 소개 랜딩 페이지 |
| `/login`, `/signup` | LoginPage, SignupPage | 로그인 / 회원가입 |
| `/verification-success`, `/verification-failure` | 이메일 인증 결과 페이지 | 회원가입 이메일 인증 콜백 처리 |
| `/dashboard` | DashboardPage | 이번 달/저번 달 지출 비교, 카테고리별 지출, 지출 조언 |
| `/transactions` | TransactionPage | 거래 내역 목록/검색/필터, 등록·수정·삭제, CSV 업로드 |
| `/categories` | CategoryPage | 대분류/소분류 카테고리 관리 |
| `/budget` | BudgetPage | 월별 예산 설정 및 예산 대비 지출 비교 |
| `/report` | ReportPage | 기간별 재무 추이, 상위 지출 항목, 카테고리 상세 분석 |
| `/mypage` | MyPage | 회원 정보 조회/수정, 비밀번호 변경, 회원 탈퇴 |

`/dashboard` 이하 경로는 `ProtectedRoute`로 보호되어, 로그인하지 않은 사용자는 접근할 수 없습니다.
모든 페이지는 `React.lazy` + `Suspense`로 동적 임포트되어 초기 번들 크기를 줄입니다.

---

## 📁 프로젝트 구조

```
client/
├── index.html
├── vite.config.ts          # dev 서버 프록시(/api/v1 → 백엔드), Tailwind 플러그인
├── firebase.json           # Firebase Hosting + Functions 배포 설정
├── src/
│   ├── main.tsx             # 앱 진입점
│   ├── App.tsx              # 라우팅 정의
│   ├── api/                 # axios 기반 API 클라이언트 (도메인별 분리)
│   │   ├── axiosInstance.ts   # 공통 인스턴스, 토큰 첨부/자동 갱신 인터셉터
│   │   ├── authApi.ts, userApi.ts, categoryApi.ts
│   │   ├── transactionApi.ts, budgetApi.ts, dashboardApi.ts, reportApi.ts
│   ├── store/                # Zustand 스토어 (도메인별)
│   │   ├── authStore.ts       # accessToken, 로그인 상태 (localStorage persist)
│   │   ├── userStore.ts, categoryStore.ts, transactionStore.ts
│   │   ├── budgetStore.ts, dashboardStore.ts, reportStore.ts
│   │   └── mockData.ts        # 개발용 목업 데이터
│   ├── pages/                 # 라우트 단위 페이지 컴포넌트
│   │   └── dashboard/          # 로그인 후 접근하는 대시보드 하위 페이지들
│   ├── components/
│   │   ├── auth/ProtectedRoute.tsx   # 인증 가드
│   │   ├── layout/MainLayout.tsx     # 공통 레이아웃(사이드바 등)
│   │   ├── dashboard/                 # 차트, 모달 등 대시보드 전용 컴포넌트
│   │   ├── transactions/              # 거래내역 테이블/페이지네이션/모달
│   │   └── icons/, Navbar.tsx, ServiceFeatures.tsx, ImageSlider.tsx
│   ├── types/                # 공용 TypeScript 타입 정의
│   └── utils/colors.ts
└── functions/                # Firebase Cloud Functions (백엔드 API 프록시용)
```

---

## 🗃 상태 관리

Zustand로 도메인별 스토어를 분리해서 사용합니다.

- **authStore**: `accessToken`, `isLoggedIn`을 관리하며 `persist` 미들웨어로 localStorage에 저장(새로고침 시에도 로그인 유지).
- **userStore / categoryStore / transactionStore / budgetStore / dashboardStore / reportStore**: 각 도메인의 서버 데이터 및 로딩 상태를 관리.

### 인증 토큰 흐름 (axiosInstance)

- 요청 시 `authStore`에 저장된 Access Token을 `Authorization: Bearer` 헤더에 자동 첨부합니다.
- 응답이 `401`이고 refresh 요청이 아닌 경우, `/auth/refresh`를 호출해 토큰을 갱신한 뒤 원래 요청을 재시도합니다. (동시에 여러 요청이 401을 받는 경우를 대비한 요청 큐잉 처리 포함)
- refresh마저 실패하면 로그인/유저 상태를 초기화하고 `/login`으로 리다이렉트합니다.

---

## ⚙️ 개발 환경 설정

```bash
cd client
npm install
npm run dev
```

개발 서버 실행 시 `/api/v1`로 시작하는 요청은 `vite.config.ts`의 프록시 설정을 통해 백엔드 서버로 전달됩니다. 현재 프록시 대상은 과거 운영 중이던 인스턴스 주소로 설정되어 있어, 로컬에서 붙여 쓰려면 본인의 [백엔드 서버](../server/README.md)를 실행한 뒤 `vite.config.ts`의 `target` 값을 로컬 주소로 바꿔야 합니다.

```ts
// vite.config.ts
server: {
  proxy: {
    '/api/v1': {
      target: 'http://localhost:44445', // 로컬 백엔드 주소로 변경
      changeOrigin: true,
      cookieDomainRewrite: 'localhost',
    },
  },
},
```

---

## 📦 빌드 및 배포

```bash
npm run build     # tsc -b && vite build → dist/ 생성
npm run preview   # 빌드 결과 로컬 미리보기
npm run lint       # ESLint 검사
```

배포는 **Firebase Hosting**을 사용했으며, `/api/v1/**` 요청은 Firebase Cloud Functions(`functions/`)를 통해 백엔드로 라우팅되도록 구성되어 있었습니다. (`firebase.json` 참고)

> 현재는 연동되어 있던 백엔드 인스턴스가 종료되어 실제 배포본은 정상 동작하지 않습니다.
