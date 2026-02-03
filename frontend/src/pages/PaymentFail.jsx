import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentFail() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const message = searchParams.get('message') || '알 수 없는 오류';
        alert(`❌ 결제에 실패했습니다.\n사유: ${message}`);
        navigate('/');
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <p className="text-lg">결제 실패 처리 중...</p>
            </div>
        </div>
    );
}

export default PaymentFail;