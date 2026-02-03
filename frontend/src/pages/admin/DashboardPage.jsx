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
        return <div className="p-8 text-gray-900">로딩중...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-gray-900">데이터를 불러올 수 없습니다.</div>;
    }

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 모든 날짜 수집 (dailyUsers, dailyRevenue, dailyTokens에서)
    const allDates = new Set();
    stats.dailyUsers.forEach(item => allDates.add(item.date));
    stats.dailyRevenue.forEach(item => allDates.add(item.date));
    stats.dailyTokens.forEach(item => allDates.add(item.date));

    // 날짜별로 정렬된 배열
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(b) - new Date(a));

    // 차트 데이터 변환 - 모든 데이터 소스를 고려
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
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">전체 회원</h3>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.total_users || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">활성 회원</h3>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.active_users || 0}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">총 매출</h3>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                        {parseInt(stats.totalStats.total_revenue || 0).toLocaleString()}원
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">총 주문</h3>
                    <p className="text-3xl font-bold mt-2 text-gray-900">
                        {stats.totalStats.total_orders || 0}
                    </p>
                </div>
            </div>

            {/* 일별 가입자 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">일별 가입자</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#8884d8" name="가입자 수" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* 일별 매출 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-gray-900">일별 매출</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="revenue" fill="#82ca9d" name="매출액 (원)" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-gray-500 text-center py-8">데이터가 없습니다.</p>
                )}
            </div>

            {/* AI 토큰 사용량 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-900">AI 토큰 사용량</h2>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
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
