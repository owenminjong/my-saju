import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import PromptsPage from './pages/admin/PromptsPage';
import ProductsPage from './pages/admin/ProductsPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import ApiKeysPage from './pages/admin/ApiKeysPage';
import PaymentTestPage from './pages/PaymentTestPage';

function App() {
  return (
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* 네비게이션 */}
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex space-x-8">
                  <Link to="/" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    대시보드
                  </Link>
                  <Link to="/users" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    회원 관리
                  </Link>
                  <Link to="/prompts" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    프롬프트 관리
                  </Link>
                  <Link to="/products" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    상품 관리
                  </Link>
                  <Link to="/api-keys" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    API Keys
                  </Link>
                  <Link to="/payment-test" className="flex items-center px-3 py-2 text-gray-700 hover:text-gray-900">
                    결제 테스트
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* 라우트 */}
          <Routes>
            {/* 관리자 페이지 */}
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />

            {/* 결제 테스트 페이지 */}
            <Route path="/payment-test" element={<PaymentTestPage />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;