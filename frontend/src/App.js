// frontend/src/App.js

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home } from 'lucide-react';
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

// 🏠 메인 & 사주 서비스 페이지
import MainPage from './pages/MainPage';
import LoginPage from './pages/login/LoginPage';
import AuthSuccess from './pages/login/AuthSuccess';
import AuthFail from './pages/login/AuthFail';
import SajuInput from './pages/SajuInput';
import SajuResult from './pages/SajuResult';
import SampleResult from './pages/SampleResult';
import SharedResult from './pages/SharedResult';
import OrdersPage from "./pages/admin/OrdersPage";
import FreeGeneratePage from './pages/FreeGeneratePage';
import PremiumGeneratePage from './pages/PremiumGeneratePage';

// 관리자 네비게이션 컴포넌트
function AdminNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: '대시보드' },
    { path: '/admin/users', label: '회원 관리' },
    { path: '/admin/orders', label: '주문/결제' },
    { path: '/admin/prompts', label: '프롬프트' },
    { path: '/admin/products', label: '상품 관리' },
    { path: '/admin/api-keys', label: 'API Keys' },
    { path: '/admin/payment-test', label: '결제 테스트' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-14 sm:h-16">
            {/* 로고 & 데스크톱 메뉴 */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto">
              <Link
                  to="/"
                  className="flex items-center px-2 sm:px-3 py-2 text-blue-600 hover:text-blue-800 font-semibold flex-shrink-0"
              >
                <Home size={18} className="sm:hidden" />
                <span className="hidden sm:inline">🏠 메인으로</span>
              </Link>

              {/* 데스크톱 메뉴 (lg 이상) */}
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

              {/* 태블릿 메뉴 (sm-lg) */}
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

            {/* 모바일 햄버거 메뉴 버튼 */}
            <div className="flex items-center sm:hidden">
              <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-gray-900"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* 모바일 드롭다운 메뉴 */}
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
                </div>
              </div>
          )}
        </div>
      </nav>
  );
}

// 레이아웃 래퍼
function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
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

            {/* 🔗 공유 링크 */}
            <Route path="/r/:encodedData" element={<SharedResult />} />
            <Route path="/result/:encodedData" element={<SharedResult />} />

            <Route path="/ex-result" element={<SampleResult />} />

            {/* 🔧 관리자 페이지 */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/:id" element={<UserDetailPage />} />
            <Route path="/admin/prompts" element={<PromptsPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/api-keys" element={<ApiKeysPage />} />
            <Route path="/admin/payment-test" element={<PaymentTestPage />} />
            <Route path="/admin/orders" element={<OrdersPage />} />

            <Route path="/payment/premium" element={<PremiumPaymentPage />} />
            <Route path="/payment/premium/success" element={<PremiumPaymentSuccess />} />
            <Route path="/payment/fail" element={<PaymentFail />} />
            <Route path="/free/generate" element={<FreeGeneratePage />} />
            <Route path="/premium/generate" element={<PremiumGeneratePage />} />

          </Routes>
        </Layout>
      </Router>
  );
}

export default App;
