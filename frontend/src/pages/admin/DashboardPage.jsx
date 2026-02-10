import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            // ⭐ getDashboardStats로 수정
            const response = await adminAPI.getDashboardStats();
            console.log('대시보드 데이터:', response.data);

            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('대시보드 조회 실패:', error);
            setError('데이터를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-gray-900 flex justify-center items-center min-h-screen">
                <div className="text-xl">로딩중...</div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-gray-900 flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">{error || '데이터를 불러올 수 없습니다.'}</div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

// ⭐ 최근 7일 날짜 배열 생성
    const getLast7Days = () => {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const last7Days = getLast7Days();

    // ⭐ 모든 날짜에 대한 데이터 생성
    const chartData = last7Days.map(date => {
        const userItem = stats.dailyUsers?.find(item => item.date === date);
        const revenueItem = stats.dailyRevenue?.find(item => item.date === date);
        const orderItem = stats.dailyOrders?.find(item => item.date === date);
        const tokenItem = stats.dailyTokens?.find(item => item.date === date); // ⭐ 추가

        return {
            date: formatDate(date),
            users: parseInt(userItem?.count) || 0,
            revenue: parseFloat(revenueItem?.total) || 0,
            orders: parseInt(orderItem?.count) || 0,
            tokens: parseInt(tokenItem?.total) || 0, // ⭐ 추가
        };
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">📊 대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">전체 회원</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600">
                        {stats.totalStats.total_users || 0}
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">총 사용 토큰</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-green-600">
                        {(stats.totalStats.total_tokens || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">AI 토큰</p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm truncate">총 매출</h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2 text-purple-600 truncate">
                        {parseInt(stats.totalStats.total_revenue || 0).toLocaleString()}
                        <span className="text-sm sm:text-base">원</span>
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">총 주문</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-orange-600">
                        {stats.totalStats.total_orders || 0}
                    </p>
                </div>
            </div>

            {/* 일별 가입자 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">📈 일별 가입자 (최근 7일)</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="가입자 수" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* 일별 매출 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">💰 일별 매출 (최근 7일)</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="revenue" fill="#8B5CF6" name="매출액 (원)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* 일별 주문 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">🛒 일별 주문 (최근 7일)</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Line type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={2} name="주문 수" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>
            {/* AI 토큰 사용량 그래프 - 4번째 그래프로 추가 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">🤖 일별 AI 토큰 사용량 (최근 7일)</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="tokens" fill="#10B981" name="토큰 사용량" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;