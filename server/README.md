# 💰 씀씀(sseumsseum) - 개인 금융 관리 서비스 백엔드 API

개인의 수입/지출 내역을 관리하고, 예산과 카테고리를 기반으로 대시보드·리포트를 제공하는 **Node.js(Express) 기반 RESTful API 서버**입니다.
MongoDB Aggregation을 활용해 대시보드·재무 리포트를 계산하며, Swagger로 API 명세를 자동 문서화합니다.

---

## 목차

1. [핵심 기능](#핵심-기능)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [데이터 모델](#데이터-모델)
5. [개발 환경 설정](#개발-환경-설정)
6. [실행 스크립트](#실행-스크립트)
7. [API 개요](#api-개요)
8. [배포 (CI/CD)](#배포-cicd)
9. [보안 관련 안내](#보안-관련-안내)

---

## 핵심 기능

- **인증 / 계정 관리**
  - JWT(Access/Refresh) 기반 인증, 이메일 인증(회원가입 시 인증 메일 발송·재전송)
  - 비밀번호 재확인 후 발급되는 별도 토큰(`X-password-token`)을 통한 비밀번호 변경, 회원 탈퇴(하드 삭제)
- **거래 내역 관리**
  - 수입/지출 거래 내역 CRUD, 페이지네이션·검색어·기간·유형(수입/지출) 필터링 조회
  - CSV 파일 일괄 업로드 및 업로드용 템플릿 CSV 다운로드
- **카테고리 관리**
  - 대분류(parent)-소분류(child) 계층 구조의 카테고리
  - 기본 제공 카테고리 조회, 사용자 지정 카테고리 생성/삭제
- **예산 관리**
  - 월별 예산 생성/조회/수정/삭제
  - 예산 대비 실제 지출을 비교하는 예산 리포트 제공
- **대시보드**
  - 이번 달/저번 달 지출 비교, 일자별 지출 추이, 카테고리별 지출 Top N, 지출 조언 메시지 제공
- **재무 리포트**
  - 월간/연간 단위 수입·지출·순이익 추이 및 카테고리별 집계
  - 기간 내 상위 지출 항목(Top N) 분석
  - 특정 대분류의 소분류별 상세 지출 분석
- **API 문서화**
  - Swagger(JSDoc 기반) 문서를 `/api-docs` 경로에서 제공하며 Basic Auth로 보호

---

## 기술 스택

| 분류 | 기술 |
| --- | --- |
| 런타임/프레임워크 | Node.js, Express 5 |
| 데이터베이스 | MongoDB (Mongoose) |
| 인증 | JSON Web Token (jsonwebtoken), bcryptjs |
| 검증 | express-validator |
| 파일 업로드/파싱 | multer, csv-parser |
| 메일 발송 | nodemailer |
| 문서화 | swagger-jsdoc, swagger-ui-express |
| 요청 제한/보안 | express-rate-limit, express-basic-auth, cors, cookie-parser |
| 프로세스 관리 | PM2 (ecosystem.config.js) |
| 배포 | GitHub Actions → OCI(Oracle Cloud Infrastructure) 인스턴스 SSH 배포 |

---

## 프로젝트 구조

```
sseumsseum/
├── server.js                  # 앱 진입점 (express 초기화, 라우터/미들웨어 등록)
├── ecosystem.config.js        # PM2 배포 설정
├── src/
│   ├── config/
│   │   ├── index.js           # 환경 변수 로드
│   │   ├── db.js              # MongoDB 연결
│   │   └── swagger.js         # Swagger 설정
│   ├── controllers/           # 라우트별 비즈니스 로직
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── models/                 # Mongoose 스키마
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── UserCategory.js
│   │   ├── Transaction.js
│   │   ├── Budget.js
│   │   ├── RefreshToken.js
│   │   └── VerificationToken.js
│   ├── routes/                 # 라우터 (Swagger 명세 포함)
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT 검증 (Access/Password 토큰)
│   │   ├── basicAuthMiddlware.js   # /api-docs 보호용 Basic Auth
│   │   ├── errorHandler.js
│   │   ├── rateLimit.js            # 메일 재전송/CSV 다운로드 제한
│   │   └── validator/              # 요청별 유효성 검증 (express-validator)
│   ├── data/TransactionKeywords.js # CSV 업로드 시 사용되는 키워드 매핑 데이터
│   └── utils/
│       ├── jwt.js
│       ├── password.js
│       ├── mailer.js
│       ├── multer.js
│       └── csvParsing.js
├── uploads/insertDefaultCategory.js  # 기본 카테고리 시드 스크립트
└── public/template.csv               # 거래내역 업로드 템플릿
```

---

## 데이터 모델

| 모델 | 주요 필드 | 설명 |
| --- | --- | --- |
| **User** | email, password_hash, role, nickname, birth, gender, verified | 사용자 계정. `role`은 `user`/`admin` |
| **Category** | name, type, isDefault, parentCategory | `parentCategory`로 대분류-소분류 계층 구현 (null이면 대분류) |
| **UserCategory** | userId, categoryId | 사용자가 선택/사용 중인 카테고리 매핑 (userId+categoryId 유니크 인덱스) |
| **Transaction** | userId, categoryId, amount, method, type(income/expense), description, transactionDate | 개별 거래 내역 |
| **Budget** | userId, month, categories[{categoryId, amount}] | 월 단위 카테고리별 예산 |
| **RefreshToken** | userId, token, expiresAt, isActive | 리프레시 토큰 관리(로그아웃/비밀번호 변경 시 비활성화) |
| **VerificationToken** | (이메일 인증/토큰 관련) | 이메일 인증용 토큰 |

---

## 개발 환경 설정

### 1. 프로젝트 클론 및 설치

```bash
git clone https://github.com/BJZJZJZJ/sseumsseum
cd sseumsseum
npm install
```

### 2. 환경 변수 설정

`NODE_ENV` 값에 따라 `.env.development` 또는 `.env.production` 파일을 프로젝트 루트에 생성합니다.
(`src/config/index.js`가 `../../.env.${NODE_ENV}` 경로를 읽습니다.)

```env
# CORS
CORS_ALLOWED_ORIGIN="http://localhost:3000"

# 서버
SERVER_URL="http://localhost:44445"
PORT="44445"

# MongoDB
DATABASE_URL="mongodb://<user>:<password>@<host>:27017/<db>?authSource=admin"

# JWT
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="15d"
JWT_ACCESS_TOKEN_SECRET=<access token secret>
JWT_REFRESH_TOKEN_SECRET=<refresh token secret>
JWT_PASSWORD_TOKEN_SECRET=<password token secret>

# 이메일 (SMTP)
SMTP_HOST=<smtp host>
SMTP_PORT=<smtp port>
SMTP_USER=<smtp user>
SMTP_PASS=<smtp password>
EMAIL_FROM="No-Reply <no-reply@yourdomain.com>"
TOKEN_EXPIRES_MIN=30

# API 문서 보호용 Basic Auth
AUTH_USER=<api docs user>
AUTH_PASSWORD=<api docs password>
```

> ⚠️ 위 값은 예시이며 실제 비밀번호/시크릿 값은 반드시 본인 환경에 맞게 새로 발급해서 사용하세요. (자세한 내용은 하단 [보안 관련 안내](#보안-관련-안내) 참고)

### 3. 서버 실행

```bash
npm run dev        # 개발 모드 (NODE_ENV=development)
npm run dev:prod    # 프로덕션 환경 변수로 로컬 실행
npm start           # PM2로 프로덕션 실행 (ecosystem.config.js)
```

---

## 실행 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 환경으로 서버 실행 (`node server.js`) |
| `npm run dev:prod` | 프로덕션 환경 변수로 서버 실행 |
| `npm start` | PM2로 `sseumsseum` 프로세스 시작 (`ecosystem.config.js`, production) |
| `npm stop` | PM2 프로세스 중지 |
| `npm restart` | PM2 프로세스 재시작 |

---

## API 개요

서버 실행 후 아래 주소에서 전체 API 명세(Swagger)를 확인할 수 있습니다. (Basic Auth로 보호됨)

```
http://localhost:{PORT}/api-docs
```

모든 API는 `/api/v1` 하위 경로를 기준으로 합니다.

| 리소스 | Base Path | 주요 엔드포인트 |
| --- | --- | --- |
| 인증 | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /logout`, `POST /refresh`, `POST /resend`, `GET /verify` |
| 사용자 | `/api/v1/users` | `GET /me`, `PUT /me`, `POST /me/password`, `PUT /me/password`, `DELETE /me` |
| 카테고리 | `/api/v1/categories` | `GET /`, `GET /default/parent`, `GET /default/child`, `POST /`, `DELETE /:id` |
| 거래 내역 | `/api/v1/transactions` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `POST /upload`, `GET /template` |
| 예산 | `/api/v1/budgets` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id`, `GET /report` |
| 대시보드 | `/api/v1/dashboard` | `GET /` |
| 리포트 | `/api/v1/reports` | `GET /` (재무 추이), `GET /top-spending`, `GET /category-detail` |

인증이 필요한 엔드포인트는 `Authorization: Bearer {accessToken}` 헤더가 필요합니다.
비밀번호 변경/회원 탈퇴는 `POST /users/me/password`로 발급받은 별도의 Password Token이 필요합니다.

---

## 배포 (CI/CD)

`main` 브랜치에 push되면 GitHub Actions(`.github/workflows/OCI-Deploy.yaml`)가 동작하여, SSH로 OCI(Oracle Cloud Infrastructure) 인스턴스에 접속해 `git pull` → `npm install` → PM2 재시작(`npm restart`)을 수행합니다.

---

## 보안 관련 안내

업로드해주신 프로젝트에 **`.env.development`, `.env.production` 파일에 실제 DB 비밀번호, JWT 시크릿, SMTP 비밀번호, Basic Auth 계정 정보가 평문으로 포함**되어 있었습니다. 이 README에는 해당 값들을 예시(placeholder)로만 표기했고 실제 값은 옮기지 않았습니다.

혹시 이 값들이 이미 GitHub 등 공개 저장소에 커밋되어 있다면:

- `.env.*` 파일이 `.gitignore`에 포함되어 있는지 확인하고(현재 `.gitignore`는 있으나 실제로 추적 제외되고 있는지 `git status`로 재확인 권장)
- 이미 커밋된 이력이 있다면 **DB 비밀번호, JWT 시크릿, SMTP 비밀번호, Basic Auth 계정** 정보를 모두 새로 발급/변경하시는 것을 권장드립니다.

---

## 기술적 포인트 (참고)

- **대시보드/리포트 집계:** MongoDB Aggregation(`$lookup`, `$group`, `$facet` 등)을 활용해 다수의 통계를 최소한의 쿼리로 계산하도록 설계되어 있습니다.
- **계층형 카테고리:** `Category.parentCategory` 필드로 대분류-소분류 관계를 표현하며, 리포트에서는 소분류 지출을 대분류 기준으로 재그룹화합니다.
- **CSV 일괄 업로드:** `multer`로 파일을 받아 `csv-parser`로 파싱 후, 행 단위 유효성 검증과 함께 실패한 행에 대한 에러 목록을 응답에 포함합니다.
