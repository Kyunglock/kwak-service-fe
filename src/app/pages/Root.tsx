import { Outlet, Link, useLocation } from "react-router";
import { ScrollToTop } from "@/app/pages/components/ScrollToTop";

export default function Root() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      <div className="max-w-5xl mx-auto p-6 md:p-12">
        {/* Navigation Tabs */}
        <div className="mb-6 flex gap-4 justify-center">
          <Link
            to="/resume"
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
              location.pathname === "/resume"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            이력서
          </Link>
          <Link
            to="/resume/career"
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
              location.pathname === "/resume/career"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            경력기술서
          </Link>
          <Link
            to="/resume/portfolio"
            className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md ${
              location.pathname === "/resume/portfolio"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
          >
            사이드 프로젝트
          </Link>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-green-100">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2026 곽경록. All rights reserved.</p>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
