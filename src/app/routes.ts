import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/app/components/layout/MainLayout";
import { LoginPage } from "@/app/components/auth/LoginPage";
import { OAuthCallback } from "@/app/components/auth/OAuthCallback";
import { ProtectedRoute } from "@/app/components/auth/ProtectedRoute";
import { ErrorPage } from "@/app/components/error/ErrorPage";
import Root from "@/app/pages/Root";
import Resume from "@/app/pages/Resume";
import Career from "@/app/pages/Career";
import Portfolio from "@/app/pages/Portfolio";

export const router = createBrowserRouter([
  {
    // 최상위 에러 바운더리 - 렌더링 에러 시 커스텀 에러 페이지 표시
    ErrorBoundary: ErrorPage,
    children: [
      {
        // 이력서 라우트 (인증 불필요)
        path: "/resume",
        Component: Root,
        children: [
          {
            index: true,
            Component: Resume,
          },
          {
            path: "career",
            Component: Career,
          },
          {
            path: "portfolio",
            Component: Portfolio,
          },
        ],
      },
      {
        // 인증이 필요한 라우트
        Component: ProtectedRoute,
        children: [
          {
            path: "/",
            Component: MainLayout,
          },
        ],
      },
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/oauth/callback",
        Component: OAuthCallback,
      },
      {
        path: "/error",
        Component: ErrorPage,
      },
      {
        path: "*",
        Component: ErrorPage,
      },
    ],
  },
]);
