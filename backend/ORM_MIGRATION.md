# Backend - Sequelize ORM 마이그레이션 완료

## 📋 개요

기존 MySQL2 직접 쿼리 방식에서 **Sequelize ORM**으로 마이그레이션되었습니다.

## 🚀 주요 변경사항

### 1. Sequelize 설치 및 설정
- `sequelize`, `sequelize-cli` 패키지 설치
- `.sequelizerc` 설정 파일 생성
- `src/config/config.js` Sequelize 연결 설정 추가

### 2. 모델(Models) 생성
다음 모델들이 생성되었습니다:

- **User** (`src/models/User.js`) - 사용자 정보
- **Product** (`src/models/Product.js`) - 상품 정보
- **ApiKey** (`src/models/ApiKey.js`) - API 키 관리
- **Order** (`src/models/Order.js`) - 주문 정보
- **Prompt** (`src/models/Prompt.js`) - 프롬프트 관리
- **TokenUsage** (`src/models/TokenUsage.js`) - 토큰 사용 내역

### 3. 컨트롤러 리팩토링
모든 컨트롤러가 Sequelize ORM 방식으로 변경되었습니다:

#### 기존 방식 (MySQL2 직접 쿼리)
```javascript
const [users] = await connection.query(
    'SELECT * FROM users WHERE id = ?',
    [id]
);
```

#### 새로운 방식 (Sequelize ORM)
```javascript
const user = await User.findByPk(id);
```

### 4. 리팩토링된 컨트롤러 목록
- ✅ `controllers/admin/usersController.js`
- ✅ `controllers/admin/productsController.js`
- ✅ `controllers/admin/apiKeysController.js`
- ✅ `controllers/admin/promptsController.js`
- ✅ `controllers/admin/dashboardController.js`
- ✅ `controllers/auth-controller.js`

## 📁 프로젝트 구조

```
backend/
├── .sequelizerc                 # Sequelize 설정 파일
├── src/
│   ├── config/
│   │   ├── config.js           # Sequelize 연결 설정
│   │   └── database.js.backup  # 기존 MySQL2 연결 (백업)
│   ├── models/
│   │   ├── index.js           # 모델 통합 및 관계 설정
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── ApiKey.js
│   │   ├── Order.js
│   │   ├── Prompt.js
│   │   └── TokenUsage.js
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── usersController.js
│   │   │   ├── productsController.js
│   │   │   ├── apiKeysController.js
│   │   │   ├── promptsController.js
│   │   │   └── dashboardController.js
│   │   └── auth-controller.js
│   └── server.js              # Sequelize 연결 사용
```

## 🔧 사용 방법

### 서버 실행
```bash
cd backend
npm start        # 프로덕션
npm run dev      # 개발 (nodemon)
```

### 환경 변수 설정 (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mysaju_db
DB_PORT=3306
NODE_ENV=development
```

## 💡 Sequelize 주요 기능 사용법

### 1. 조회 (Read)
```javascript
// 전체 조회
const users = await User.findAll();

// 조건부 조회
const activeUsers = await User.findAll({
    where: { status: 'active' }
});

// ID로 조회
const user = await User.findByPk(id);

// 검색 (LIKE)
const users = await User.findAll({
    where: {
        name: { [Op.like]: `%${search}%` }
    }
});
```

### 2. 생성 (Create)
```javascript
const user = await User.create({
    name: 'John',
    email: 'john@example.com'
});
```

### 3. 수정 (Update)
```javascript
const [affectedRows] = await User.update(
    { status: 'inactive' },
    { where: { id: userId } }
);
```

### 4. 삭제 (Delete)
```javascript
const affectedRows = await User.destroy({
    where: { id: userId }
});
```

### 5. 관계 조회 (Include)
```javascript
const user = await User.findByPk(id, {
    include: [
        {
            model: Order,
            as: 'orders',
            include: [{ model: Product, as: 'product' }]
        }
    ]
});
```

### 6. 집계 함수
```javascript
// COUNT
const count = await User.count({ where: { status: 'active' } });

// SUM
const totalRevenue = await Order.sum('amount', { 
    where: { status: 'completed' } 
});

// 그룹화
const dailyStats = await User.findAll({
    attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', '*'), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('created_at'))]
});
```

## 🎯 장점

1. **코드 가독성 향상**: SQL 쿼리 대신 JavaScript 메서드 사용
2. **타입 안정성**: 모델 정의로 데이터 구조 명확화
3. **관계 관리 용이**: 모델 간 관계 설정 및 조인 간편화
4. **SQL 인젝션 방지**: ORM이 자동으로 파라미터 이스케이핑
5. **데이터베이스 독립성**: 다른 DB로 전환 시 최소한의 변경
6. **마이그레이션 관리**: 데이터베이스 스키마 버전 관리 가능

## 📚 참고 자료

- [Sequelize 공식 문서](https://sequelize.org/docs/v6/)
- [Sequelize CLI](https://github.com/sequelize/cli)

## ⚠️ 주의사항

- 기존 `database.js` 파일은 `database.js.backup`으로 백업되었습니다.
- 모든 컨트롤러가 ORM 방식으로 변경되었으므로 기존 방식과 혼용하지 마세요.
- 데이터베이스 스키마가 모델 정의와 일치하는지 확인하세요.
