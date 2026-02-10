const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const { sequelize } = require('../models/sequelize');

async function createAdminUser() {
    try {
        await sequelize.sync();

        // 기존 admin 계정이 있는지 확인
        const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });

        if (existingAdmin) {
            console.log('⚠️  관리자 계정이 이미 존재합니다.');
            console.log('   아이디: admin');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('1234', 10);

        const admin = await Admin.create({
            username: 'admin',
            password: hashedPassword,
            name: '관리자'
        });

        console.log('✅ 관리자 계정 생성 완료!');
        console.log('   아이디: admin');
        console.log('   비밀번호: 1234');
        process.exit(0);
    } catch (error) {
        console.error('❌ 관리자 계정 생성 실패:', error);
        process.exit(1);
    }
}

createAdminUser();