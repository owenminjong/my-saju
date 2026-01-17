import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import PromptsPage from './pages/admin/PromptsPage';
import ProductsPage from './pages/admin/ProductsPage';
import UserDetailPage from './pages/admin/UserDetailPage';

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
                </div>
              </div>
            </div>
          </nav>

          {/* 라우트 */}
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />

            {/* 나머지 라우트는 나중에 추가 */}
          </Routes>
        </div>
      </Router>
  );
}

export default App;