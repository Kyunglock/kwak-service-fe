# inv-fe

S&P 500 기반 포트폴리오 관리 및 투자 인사이트 대시보드 프론트엔드

## 소개

투자자의 포트폴리오를 실시간으로 추적하고, AI 기반 시장 분석, 전문 투자자 포트폴리오 비교, 투자 성향 설문 등의 기능을 제공하는 모바일 최적화 웹 애플리케이션입니다.

## 기술 스택

| 분류            | 기술                                |
| --------------- | ----------------------------------- |
| UI 프레임워크   | React 18, TypeScript                |
| 빌드 도구       | Vite 6                              |
| 라우팅          | React Router 7                      |
| 스타일링        | Tailwind CSS 4, Shadcn UI, Radix UI |
| 상태 관리       | React Context (Auth, Currency)      |
| HTTP 클라이언트 | Axios                               |
| 실시간 통신     | Server-Sent Events (SSE)            |
| 차트            | Recharts                            |
| 애니메이션      | Motion                              |
| 폼 관리         | React Hook Form                     |
| 컨테이너        | Docker, Nginx                       |

## 주요 기능

### 포트폴리오 관리

- 보유 종목 현황 및 손익 실시간 조회
- 매수/매도 거래 내역 관리
- 복수 포트폴리오 생성 및 관리

### 포트폴리오 분석

- 성과 차트 및 섹터 분포 시각화

### 배당 대시보드

- 배당 수입 추적 및 배당 이력 조회

### 투자 성향 설문

- 단계별 설문 응답 및 결과 확인
- 설문 기반 주식 추천

### 시장 인사이트

- AI 생성 시장 분석 리포트
- 전문 투자자 포트폴리오 비교 (Guru Match)
- 섹터 분석, 감성 트렌드, 가격 괴리 알림

### 전문가 포트폴리오 (Guru)

- 유명 투자자 보유 종목 추적
- 분기별 포지션 변화 비교

## 프로젝트 구조

```
src/
├── app/
│   ├── components/
│   │   ├── auth/          # 로그인, 보호 라우트, OAuth 콜백
│   │   ├── competition/   # 경쟁/구루 포트폴리오
│   │   ├── guru/          # 전문 투자자 포트폴리오
│   │   ├── layout/        # MainLayout, SideMenu
│   │   ├── market/        # 시장 인사이트, 뉴스, 배당
│   │   ├── portfolio/     # 포트폴리오 CRUD, 거래
│   │   ├── survey/        # 설문 및 통계
│   │   └── ui/            # Shadcn UI 컴포넌트 (50+)
│   ├── contexts/          # AuthContext, CurrencyContext
│   ├── hooks/             # useStockPrice (SSE), use-mobile
│   ├── services/          # API 클라이언트 (14개 모듈)
│   ├── types/             # TypeScript 인터페이스
│   ├── utils/             # apiClient, JWT, 알림 유틸
│   ├── constants/         # S&P 500 종목 데이터
│   ├── pages/             # Resume, Career, Portfolio 페이지
│   ├── App.tsx
│   └── routes.ts
├── styles/
└── main.tsx
```

## 백엔드 마이크로서비스 연동

| 서비스          | 포트 | 담당 기능                    |
| --------------- | ---- | ---------------------------- |
| Portal          | 8080 | 인증, 주식, 알림             |
| Survey          | 8081 | 투자 설문, 코드 관리         |
| Stock Advisor   | 8082 | 전문가 포트폴리오, 종목 추천 |
| Market Analyzer | 8083 | 시장 분석, AI 인사이트       |

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm

### 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 설정하세요.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SURVEY_API_BASE_URL=http://localhost:8081
VITE_STOCK_ADVISOR_API_BASE_URL=http://localhost:8082
VITE_GURU_API_BASE_URL=http://localhost:8082
VITE_MARKET_ANALYSIS_BASE_URL=http://localhost:8083
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

개발 서버는 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과물은 `/dist` 디렉토리에 생성됩니다.

### Docker로 실행

```bash
# 개발 환경
docker compose up

# 프로덕션 이미지 빌드
docker build -t inv-fe .
docker run -p 80:80 inv-fe
```

## 라우팅 구조

```
/resume                   # 이력서 (공개)
  /career                 # 경력
  /portfolio              # 프로젝트 포트폴리오
/login                    # 로그인
/oauth/callback           # Kakao OAuth 콜백
/                         # 대시보드 (인증 필요)
  ?tab=portfolio          # 포트폴리오
  ?tab=analysis           # 분석
  ?tab=dividend           # 배당
  ?tab=survey             # 설문
  ?tab=statistics         # 설문 통계
  ?tab=recommendations    # 종목 추천
  ?tab=insights           # 시장 인사이트
  ?tab=competition        # 전문가 포트폴리오
```

## 인증

- Kakao OAuth 2.0 소셜 로그인
- JWT 쿠키 기반 세션 관리
- 토큰 자동 갱신
- 게스트 로그인 지원 (미리보기 용도)

## CI/CD

`main` 브랜치 푸시 시 자동 배포:

1. Self-hosted runner에서 Docker 이미지 빌드
2. 기존 컨테이너 중지 및 새 컨테이너 시작 (포트 80)
3. 미사용 Docker 이미지 정리
