import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import PromptsPage from './pages/admin/PromptsPage';
import ProductsPage from './pages/admin/ProductsPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import ApiKeysPage from './pages/admin/ApiKeysPage';
import PaymentTestPage from './pages/PaymentTestPage';

// 사주 서비스 페이지
import SajuInput from './pages/SajuInput';
import SajuResult from './pages/SajuResult';

// 관리자 네비게이션 컴포넌트
function AdminNav() {
  return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link to="/admin" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                대시보드
              </Link>
              <Link to="/admin/users" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                회원 관리
              </Link>
              <Link to="/admin/prompts" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                프롬프트 관리
              </Link>
              <Link to="/admin/products" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                상품 관리
              </Link>
              <Link to="/admin/api-keys" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                API Keys
              </Link>
              <Link to="/admin/payment-test" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                결제 테스트
              </Link>
              <Link to="/" className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 font-semibold">
                🔮 사주 서비스로
              </Link>
            </div>
          </div>
        </div>
      </nav>
  );
}

// 레이아웃 래퍼
function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
      <div className="min-h-screen bg-gray-100">
        {isAdminPage && <AdminNav />}
        {children}
      </div>
  );
}

function App() {
  return (
      <Router>
        <Layout>
          <Routes>
            {/* 🔮 사주 서비스 (메인) */}
            <Route path="/" element={<SajuInput />} />
            <Route path="/result" element={<SajuResult />} />

            {/* 🔧 관리자 페이지 */}
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/users/:id" element={<UserDetailPage />} />
            <Route path="/admin/prompts" element={<PromptsPage />} />
            <Route path="/admin/products" element={<ProductsPage />} />
            <Route path="/admin/api-keys" element={<ApiKeysPage />} />
            <Route path="/admin/payment-test" element={<PaymentTestPage />} />
          </Routes>
        </Layout>
      </Router>
  );
}

export default App;