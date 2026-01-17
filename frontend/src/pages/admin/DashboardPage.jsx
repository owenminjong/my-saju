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
            setStats(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('대시보드 조회 실패:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8">로딩중...</div>;
    }

    if (!stats) {
        return <div className="p-8">데이터를 불러올 수 없습니다.</div>;
    }

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 차트 데이터 변환
    const chartData = stats.dailyUsers.map((item, index) => ({
        date: formatDate(item.date),
        users: item.count,
        revenue: stats.dailyRevenue[index]?.total || 0,
        tokens: stats.dailyTokens[index]?.total || 0,
    }));

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">대시보드</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">전체 회원</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalStats.total_users}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">활성 회원</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalStats.active_users}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">총 매출</h3>
                    <p className="text-3xl font-bold mt-2">
                        {parseInt(stats.totalStats.total_revenue || 0).toLocaleString()}원
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 text-sm">총 주문</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalStats.total_orders}</p>
                </div>
            </div>

            {/* 일별 가입자 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">일별 가입자</h2>
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
            </div>

            {/* 일별 매출 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">일별 매출</h2>
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
            </div>

            {/* AI 토큰 사용량 그래프 */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">AI 토큰 사용량</h2>
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
            </div>
        </div>
    );
}

export default DashboardPage;