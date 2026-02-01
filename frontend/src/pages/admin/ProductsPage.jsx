import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discount_rate: 0,
        promotion_active: false,
        is_active: true,
    });

    // 할인가 자동 계산
    const calculateDiscountPrice = (price, discountRate) => {
        if (!price || !discountRate) return price;
        return Math.floor(price * (1 - discountRate / 100));
    };

    const discountedPrice = calculateDiscountPrice(
        parseInt(formData.price) || 0,
        parseInt(formData.discount_rate) || 0
    );

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getProducts();
            setProducts(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('상품 목록 조회 실패:', error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: parseInt(formData.price),
            discount_rate: parseInt(formData.discount_rate) || 0,
            discount_price: discountedPrice,
        };

        try {
            if (editingProduct) {
                await adminAPI.updateProduct(editingProduct.id, productData);
                alert('상품이 수정되었습니다.');
            } else {
                await adminAPI.createProduct(productData);
                alert('상품이 생성되었습니다.');
            }

            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                discount_rate: 0,
                promotion_active: false,
                is_active: true
            });
            fetchProducts();
        } catch (error) {
            console.error('상품 저장 실패:', error);
            alert('상품 저장에 실패했습니다.');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            discount_rate: product.discount_rate || 0,
            promotion_active: product.promotion_active || false,
            is_active: product.is_active,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 이 상품을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await adminAPI.deleteProduct(id);
            alert('상품이 삭제되었습니다.');
            fetchProducts();
        } catch (error) {
            console.error('상품 삭제 실패:', error);
            alert('상품 삭제에 실패했습니다.');
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            discount_rate: 0,
            promotion_active: false,
            is_active: true
        });
        setShowModal(true);
    };

    if (loading) {
        return <div className="p-8">로딩중...</div>;
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">상품 관리</h1>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    + 새 상품
                </button>
            </div>

            {/* 상품 목록 테이블 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">설명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">프로모션</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{product.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{product.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {product.promotion_active && product.discount_rate > 0 ? (
                                    <div>
                                        <div className="line-through text-gray-400">
                                            {parseInt(product.price).toLocaleString()}원
                                        </div>
                                        <div className="font-bold text-red-600">
                                            {parseInt(product.discount_price).toLocaleString()}원
                                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                {product.discount_rate}% 할인
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="font-semibold">
                                        {parseInt(product.price).toLocaleString()}원
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {product.promotion_active ? (
                                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                                        활성
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                        비활성
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                        product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {product.is_active ? '판매중' : '판매중지'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                    수정
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* 상품 추가/수정 모달 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingProduct ? '상품 수정' : '새 상품'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">상품명 *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">설명</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">정가 (원) *</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    min="0"
                                />
                            </div>

                            {/* 프로모션 섹션 */}
                            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                                <h3 className="font-semibold mb-3 text-red-900">🎁 프로모션 설정</h3>

                                <div className="mb-3">
                                    <label className="block text-sm font-medium mb-2">할인율 (%)</label>
                                    <input
                                        type="number"
                                        value={formData.discount_rate}
                                        onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                {formData.price && formData.discount_rate > 0 && (
                                    <div className="mb-3 p-3 bg-white rounded border">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">정가:</span>
                                            <span className="line-through text-gray-400">
                                                {parseInt(formData.price).toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-bold text-red-600">할인가:</span>
                                            <span className="text-xl font-bold text-red-600">
                                                {discountedPrice.toLocaleString()}원
                                            </span>
                                        </div>
                                        <div className="text-right mt-1 text-xs text-red-600">
                                            {parseInt(formData.discount_rate)}% 할인
                                        </div>
                                    </div>
                                )}

                                <div className="mb-0">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.promotion_active}
                                            onChange={(e) => setFormData({ ...formData, promotion_active: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium text-red-900">프로모션 적용</span>
                                    </label>
                                    <p className="text-xs text-gray-500 ml-6 mt-1">
                                        체크하면 할인가가 고객에게 표시됩니다
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">판매 활성화</span>
                                </label>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductsPage;