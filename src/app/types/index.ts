export interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  sector: string;
  buyDate: string;
}

export interface Trade {
  id: string;
  type: "buy" | "sell";
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  date: string;
  timestamp: number;
}

// TransactionHistory API DTOs (TBL_TRANSACTION_HISTORY)
export interface TransactionResponse {
  transId: number;
  portfolioId: number;
  stockCd: string;
  transType: "BUY" | "SELL";
  transDt: string;
  qty: number;
  price: number;
  amount: number;
  fee: number;
  tax: number;
  currency: string;
  memo?: string;
  regDt: string;
}

export interface TransactionAddRequest {
  portfolioId: number;
  stockCd: string;
  transType: "BUY" | "SELL";
  transDt: string;
  qty: number;
  price: number;
  amount: number;
  fee?: number;
  tax?: number;
  currency?: string;
  memo?: string;
}

export interface TransactionModRequest {
  transId: number;
  transDt: string;
  qty: number;
  price: number;
  amount: number;
  memo?: string;
}

export interface CompetitionEntry {
  id: string;
  userName: string;
  totalInvested: number;
  totalCurrent: number;
  totalProfit: number;
  profitPercent: number;
  stockCount: number;
  lastUpdated: string;
}

// ========== Survey API DTOs ==========

// TBL_SURVEY - 설문 목록
export interface SurveyResponse {
  surveyId: number;
  surveyName: string;
  description?: string;
  surveyTypeCode?: string;
  questionCount: number;
  useYn: boolean;
  regDt: string;
  updDt: string;
}

// GET /api/v1/surveys/{surveyId} - 설문 상세 (문항 포함)
export interface SurveyDetailResponse {
  surveyId: number;
  surveyName: string;
  description?: string;
  surveyTypeCode?: string;
  useYn: boolean;
  questions: SurveyQuestionResponse[];
  regDt: string;
  updDt: string;
}

// TBL_SURVEY_QUESTION - 문항
export interface SurveyQuestionResponse {
  questionId: number;
  surveyId: number;
  questionNumber: number;
  questionText: string;
  questionTypeCode?: string;
  description?: string;
  sortOrder?: number;
  options: SurveyOptionResponse[];
  regDt: string;
}

// TBL_SURVEY_OPTION - 선택지
export interface SurveyOptionResponse {
  optionId: number;
  questionId: number;
  optionText: string;
  optionValue?: string;
  sortOrder?: number;
  score?: number;
  regDt: string;
}

// TBL_USER_SURVEY_RESPONSE - 사용자 설문 응답
export interface UserSurveyResponseDto {
  responseId: number;
  userId: string;
  surveyId: number;
  surveyName?: string;
  description?: string;
  startAt?: string;
  completedAt?: string;
  statusCode: string;
  totalScore?: number;
  riskProfileCode?: string;
  createdAt: string;
  answers: SurveyAnswerResponse[];
  questions: SurveyQuestionResponse[];
}

// TBL_SURVEY_ANSWER - 개별 문항 응답
export interface SurveyAnswerResponse {
  answerId: number;
  responseId: number;
  questionId: number;
  selectedOptionId: number;
  selectedValue?: string;
  answerScore?: number;
  answeredAt: string;
}

// TBL_SURVEY_RESULT - 설문 결과 분석
export interface SurveyResultResponse {
  resultId: number;
  userId: string;
  surveyId: number;
  riskScore?: number;
  riskLevelCode?: string;
  recommendation?: string;
  portfolioSuggestion?: string;
  analyzedAt: string;
  validUntil?: string;
  useYn: boolean;
}

// POST /api/v1/surveys/submit - 설문 제출 요청
export interface SurveySubmitRequest {
  surveyId: number;
  answers: {
    questionId: number;
    selectedOptionId: number;
    selectedValue?: string;
  }[];
}

// GET /api/v1/surveys/{surveyId}/results - 설문 결과 집계
export interface SurveyResultAggregation {
  surveyId: number;
  surveyName: string;
  totalParticipants: number;
  questions: SurveyQuestionAggregation[];
}

export interface SurveyQuestionAggregation {
  questionId: number;
  questionText: string;
  options: SurveyOptionAggregation[];
}

export interface SurveyOptionAggregation {
  optionId: number;
  optionText: string;
  optionValue?: string;
  count: number;
  percentage: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sector: string;
  impact: "positive" | "negative" | "neutral";
  timestamp: string;
}

export interface StockPrice {
  stockCd: string;
  currentPrice: number;
  previousClose: number;
  changePercent: number;
  updatedAt: string;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  dividend?: number;
  reason: string;
  matchScore: number;
}

// API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// PortfolioItem API DTOs (TBL_PORTFOLIO_ITEM)
export interface PortfolioItemResponse {
  itemId: number;
  portfolioId: number;
  stockCd: string;
  holdQty: number;
  buyPrice: number;
  buyDt: string;
  buyAmount: number;
  currency: string;
  memo?: string;
  useYn: string;
  regDt: string;
  updDt: string;
  // dashboard / detail 엔드포인트에서 embed (기존 엔드포인트에선 undefined)
  stockNm?: string;
  stockNmKo?: string;
  sector?: string;
  sectorKo?: string;
}

export interface PortfolioItemAddRequest {
  portfolioId: number;
  stockCd: string;
  holdQty: number;
  buyPrice: number;
  buyDt: string;
  currency?: string;
  memo?: string;
}

export interface PortfolioItemModRequest {
  itemId: number;
  holdQty: number;
  memo?: string;
}

export interface PortfolioItemSearchRequest {
  stockCd?: string;
  portfolioId?: number;
}

// Portfolio API DTOs (TBL_PORTFOLIO)
export interface PortfolioResponse {
  portfolioId: number;
  userId: string;
  portfolioNm: string;
  portfolioDesc?: string;
  baseCurrency: string;
  useYn: string;
  regDt: string;
  updDt: string;
}

export interface PortfolioAddRequest {
  userId: string;
  portfolioNm: string;
  portfolioDesc?: string;
  baseCurrency?: string;
}

export interface PortfolioModRequest {
  portfolioId: number;
  portfolioNm?: string;
  portfolioDesc?: string;
  baseCurrency?: string;
}

// Dividend API DTOs (예상 배당금 - 포트폴리오 기반)
export interface DividendResponse {
  portfolioId: number;
  stockCd: string;
  holdQty: number;
  dividendPerShare: number;
  annualDividend: number;
  dividendYield: number;
  paymentCycle: string;
  exDividendDt?: string;
  paymentDt?: string;
  currency: string;
}

export interface DividendSummaryResponse {
  portfolioId: number;
  totalAnnualDividend: number;
  averageYield: number;
  stocks: DividendResponse[];
}

// Market Dividend History (tbl_dividend_history)
export interface DividendHistoryRecord {
  stockCd: string;
  exDate: string;
  dividend: number;
  paymentDt?: string | null;
}

// Sector API DTOs (섹터별 비중)
export interface SectorAllocationResponse {
  portfolioId: number;
  sectorNm: string;
  stockCount: number;
  totalValue: number;
  weight: number;
}

export interface SectorSummaryResponse {
  portfolioId: number;
  sectors: SectorAllocationResponse[];
}

export interface SurveyStatsResponse {
  surveyId: number;
  surveyName: string;
  regDt: string;
  totalParticipants: number;
  statusCode: string;
  answers: SurveyAnswerResponse[];
}

export interface SurveyOptionsStatsResponse {
  surveyId: number;
  responseId: number;
  surveyName: string;
  regDt: string;
  totalParticipants: number;
  statusCode: string;
  answers: SurveyAnswerResponse[];
}

export interface SurveyStatsDetailResponse {
  surveyId: number;
  surveyName: string;
  description?: string;
  surveyTypeCode?: string;
  useYn: boolean;
  questions: SurveyQuestionStatsResponse[];
  regDt: string;
  updDt: string;
}

// TBL_SURVEY_QUESTION - 문항
export interface SurveyQuestionStatsResponse {
  questionId: number;
  surveyId: number;
  questionNumber: number;
  questionText: string;
  questionTypeCode?: string;
  description?: string;
  sortOrder?: number;
  options: SurveyOptionStatsResponse[];
  regDt: string;
  selectedValue: string | null;
  selectedOptionId: number | null;
}

// TBL_SURVEY_OPTION - 선택지
export interface SurveyOptionStatsResponse {
  optionId: number;
  questionId: number;
  optionText: string;
  optionValue?: string;
  sortOrder?: number;
  score?: number;
  regDt: string;
  selectedCount: number;
}

export interface SurveyWithMyResponse {
    surveyId: number;
    responseId: number | null;
    statusCode: string | null;
    completedAt: string | null;
    surveyName: string;
    description: string;
    surveyTypeCode: string;
    totalParticipants: number;
    regDt: string;
}

// 페이지네이션 공통 래퍼
export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ========== Guru API DTOs ==========

// TBL_GURU_PORTFOLIOS - 구루 포트폴리오 보유 현황
export interface GuruPortfolioResponse {
  id: number;
  guruCd?: string;
  investorNm: string;
  investorKoNm?: string;
  investorNickname?: string;
  issuerNm: string;
  ticker?: string;
  rankNo?: number;
  portfolioPct?: number;
  reportDate?: string;
  investPhilosophy?: string;
  famousQuote?: string;
  activityDate?: string | null;
  activityYear?: number | null;
  activityQtr?: number | null;
  changePct?: number | null;
  regDt?: string | null;
}

// TBL_GURU_RECENT_ACTIVITY - 구루 최근 매매 활동
export interface GuruActivityResponse {
  id: number;
  investorNm: string;
  activityType: 'BUY' | 'SELL' | 'ADD' | 'TRIM' | 'REDUCE';
  issuerNm: string;
  ticker?: string;
  activityDate?: string;
  changePct?: number;
  notes?: string;
  regDt?: string;
}

// GET /api/v1/users/risk-profile - 사용자 투자 성향 설문 결과 항목
export interface RiskProfileItem {
  description: string;
  score: number;
}

// GET /api/v1/users/preferred-sectors - 사용자 선호 섹터 항목
export interface PreferredSectorItem {
  sector: string;
  sectorKo: string;
  sectorPct: number;
}

// GET /api/v1/users/market-risk-comparison - 나 vs 전체 투자자 시장 리스크 설문 비교
export interface MarketRiskComparisonItem {
  sortOrder: number;
  questionText: string;
  myOptionText: string;
  majorityOptionText: string;
  matchYn: "Y" | "N";
  myChoicePct: number;
}

// /api/v1/guru/portfolios/latest-activities 응답
export interface GuruLatestActivityResponse {
  activityId: number;
  guruCd: string;
  investorNm: string;
  investorKoNm?: string;
  investorNickname?: string;
  activityType: 'BUY' | 'SELL' | 'ADD' | 'TRIM' | 'REDUCE';
  issuerNm: string;
  ticker: string;
  activityDate?: string;
  activityYear?: number;
  activityQtr?: number;
  changePct?: number | null;
  notes?: string | null;
  regDt?: string;
}

// ========== Insight API DTOs ==========

// TBL_INSIGHT_RESULT - RAG 인사이트 결과 (타입별 행 분리)
export type InsightResultTypeCd =
  | "KEY_FINDINGS"
  | "INVESTMENT_STYLE"
  | "RISK_ASSESSMENT"
  | "PORTFOLIO_ALIGNMENT"
  | "INVESTMENT_RECOMMENDATION"
  | "STOCK_MBTI"
  | "PROFILE_FIT";

export interface InsightResultResponse {
  resultId: number;
  userId: string;
  resultTypeCd: InsightResultTypeCd;
  title: string;
  content: string;
  regDt: string;
  updDt: string | null;
}

// 빌드 상태 (비동기 폴링)
export type BuildStatus = "IDLE" | "PROCESSING" | "DONE" | "FAILED";

// PROFILE_FIT content(JSON) 구조
export interface ProfileFitItem {
  ticker: string;
  level: string; // "높음" | "보통" | "낮음"
  reason: string;
}
export interface ProfileFitContent {
  fit: ProfileFitItem[];
  rebalance: string[];
}

// ========== Divergence API DTOs ==========

export interface DivergenceResultResponse {
  id: number;
  stockCd: string;
  fiscalYear: number;
  fiscalQuarter: number;
  divergenceType: string;
  severity: number;
  evidence: string;
  detectedAt: string;
  batchRunDt: string;
}

export interface DivergenceInterpretationResponse {
  stockCd: string;
  divergenceType: string;
  fiscalYear: number;
  fiscalQuarter: number;
  summary: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  keyDrivers: string[];
  watchPoints: string[];
  cached: boolean;
}
