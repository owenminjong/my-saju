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

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await adminAPI.getDashboard();
            console.log('대시보드 데이터:', response.data);
            setStats(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('대시보드 조회 실패:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4 sm:p-6 lg:p-8 text-gray-900">로딩중...</div>;
    }

    if (!stats) {
        return <div className="p-4 sm:p-6 lg:p-8 text-gray-900">데이터를 불러올 수 없습니다.</div>;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const allDates = new Set();
    stats.dailyUsers.forEach(item => allDates.add(item.date));
    stats.dailyRevenue.forEach(item => allDates.add(item.date));
    stats.dailyTokens.forEach(item => allDates.add(item.date));

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));

    const chartData = sortedDates.map(date => {
        const userItem = stats.dailyUsers.find(item => item.date === date);
        const revenueItem = stats.dailyRevenue.find(item => item.date === date);
        const tokenItem = stats.dailyTokens.find(item => item.date === date);

        return {
            date: formatDate(date),
            users: parseInt(userItem?.count) || 0,
            revenue: parseFloat(revenueItem?.total) || 0,
            tokens: parseInt(tokenItem?.total) || 0,
        };
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">전체 회원</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.total_users || 0}
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">활성 회원</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.active_users || 0}
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm truncate">총 매출</h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2 text-gray-900 truncate">
                        {parseInt(stats.totalStats.total_revenue || 0).toLocaleString()}
                        <span className="text-sm sm:text-base">원</span>
                    </p>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-xs sm:text-sm">총 주문</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.total_orders || 0}
                    </p>
                </div>
            </div>

            {/* 일별 가입자 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">일별 가입자</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Line type="monotone" dataKey="users" stroke="#8884d8" name="가입자 수" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* 일별 매출 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">일별 매출</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Bar dataKey="revenue" fill="#82ca9d" name="매출액 (원)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* AI 토큰 사용량 그래프 */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-900">AI 토큰 사용량</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '14px' }} />
                            <Line type="monotone" dataKey="tokens" stroke="#ffc658" name="토큰 사용량" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default DashboardPage;
