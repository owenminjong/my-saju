// frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, X, Home } from 'lucide-react';
import { HelmetProvider } from 'react-helmet-async';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import PromptsPage from './pages/admin/PromptsPage';
import ProductsPage from './pages/admin/ProductsPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import ApiKeysPage from './pages/admin/ApiKeysPage';
import PaymentTestPage from './pages/PaymentTestPage';
import PremiumPaymentPage from './pages/PremiumPaymentPage';
import PremiumPaymentSuccess from './pages/PremiumPaymentSuccess';
import PaymentFail from './pages/PaymentFail';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import TokenUsagePage from './pages/admin/TokenUsagePage';
import PromptTestPage from './pages/admin/PromptTestPage';

// 🏠 메인 & 사주 서비스 페이지
import MainPage from './pages/MainPage';
import LoginPage from './pages/login/LoginPage';
import AuthSuccess from './pages/login/AuthSuccess';
import AuthFail from './pages/login/AuthFail';
import SajuInput from './pages/SajuInput';
import SajuResult from './pages/SajuResult';
import PremiumResult from './pages/PremiumResult';
import SampleResult from './pages/SampleResult';
import SharedResult from './pages/SharedResult';
import OrdersPage from "./pages/admin/OrdersPage";
import FreeGeneratePage from './pages/FreeGeneratePage';
import PremiumGeneratePage from './pages/PremiumGeneratePage';
import MyResults from './pages/MyResults';

// ⭐ 관리자 라우트 보호 컴포넌트
function AdminRoute({ children }) {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

// 관리자 네비게이션 컴포넌트
function AdminNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: '대시보드' },
    { path: '/admin/users', label: '회원 관리' },
    { path: '/admin/orders', label: '주문/결제' },
    { path: '/admin/token-usage', label: '토큰 사용량' },
    { path: '/admin/prompts', label: '프롬프트' },
    { path: '/admin/products', label: '상품 관리' },
    { path: '/admin/api-keys', label: 'API Keys' },
    { path: '/admin/prompt-test', label: '프롬프트 테스트' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin/login';
  };

  return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
              <Link
                  to="/"
                  className="flex items-center px-2 sm:px-3 py-2 text-blue-600 hover:text-blue-800 font-semibold flex-shrink-0"
              >
                <Home size={18} className="sm:hidden" />
                <span className="hidden sm:inline">🏠 메인으로</span>
              </Link>

              <div className="hidden lg:flex space-x-6">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                            isActive(item.path)
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-700 hover:text-gray-900'
                        }`}
                    >
                      {item.label}
                    </Link>
                ))}
              </div>

              <div className="hidden sm:flex lg:hidden space-x-2 overflow-x-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors rounded ${
                            isActive(item.path)
                                ? 'bg-blue-100 text-blue-600'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {item.label}
                    </Link>
                ))}
              </div>
            </div>

            <div className="hidden sm:flex items-center">
              <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                로그아웃
              </button>
            </div>

            <div className="flex items-center sm:hidden">
              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
              <div className="sm:hidden border-t border-gray-200">
                <div className="py-2 space-y-1">
                  {navItems.map((item) => (
                      <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-4 py-3 text-sm font-medium transition-colors ${
                              isActive(item.path)
                                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {item.label}
                      </Link>
                  ))}
                  <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
          )}
        </div>
      </nav>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isMainPage = location.pathname === '/';

  return (
      <div className={`min-h-screen ${isMainPage ? '' : 'bg-gray-50'}`}>
        {isAdminPage && <AdminNav />}
        <main className="w-full">
          {children}
        </main>
      </div>
  );
}

function App() {
  return (
      <HelmetProvider>
        <Router>
          <Layout>
            <Routes>
              {/* 🏠 메인 페이지 */}
              <Route path="/" element={<MainPage />} />

              {/* 로그인 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
              <Route path="/auth/fail" element={<AuthFail />} />

              {/* 🔮 사주 서비스 */}
              <Route path="/saju-input" element={<SajuInput />} />
              <Route path="/result" element={<SajuResult />} />
              <Route path="/premium/result/:diagnosisId" element={<PremiumResult />} />

              {/* ✅ 내 사주 결과 목록 */}
              <Route path="/my-results" element={<MyResults />} />

              {/* 🔗 공유 링크 */}
              <Route path="/r/:encodedData" element={<SharedResult />} />
              <Route path="/result/:encodedData" element={<SharedResult />} />

              <Route path="/ex-result" element={<SampleResult />} />

              {/* ⭐ 관리자 로그인 (보호 안됨) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* 🔧 관리자 페이지 (보호됨) */}
              <Route path="/admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
              <Route path="/admin/users/:id" element={<AdminRoute><UserDetailPage /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><OrdersPage /></AdminRoute>} />
              <Route path="/admin/token-usage" element={<AdminRoute><TokenUsagePage /></AdminRoute>} />
              <Route path="/admin/prompts" element={<AdminRoute><PromptsPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><ProductsPage /></AdminRoute>} />
              <Route path="/admin/api-keys" element={<AdminRoute><ApiKeysPage /></AdminRoute>} />
              <Route path="/admin/payment-test" element={<AdminRoute><PaymentTestPage /></AdminRoute>} />
              <Route path="/admin/prompt-test" element={<AdminRoute><PromptTestPage /></AdminRoute>} />

              {/* 결제 페이지 */}
              <Route path="/payment/premium" element={<PremiumPaymentPage />} />
              <Route path="/payment/premium/success" element={<PremiumPaymentSuccess />} />
              <Route path="/payment/fail" element={<PaymentFail />} />

              {/* 생성 페이지 */}
              <Route path="/free/generate" element={<FreeGeneratePage />} />
              <Route path="/premium/generate" element={<PremiumGeneratePage />} />
            </Routes>
          </Layout>
        </Router>
      </HelmetProvider>
  );
}

export default App;