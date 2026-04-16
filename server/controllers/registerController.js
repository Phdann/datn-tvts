const { User, Role, Candidate } = require('../models/index');
const bcrypt = require('bcryptjs');
const db = require('../models/index');

const registerCandidate = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { email, password, name, phone } = req.body;

        if (!email || !password || !name) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
        }

        const existingUser = await User.findOne({ where: { email }, transaction });
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống' });
        }

        const [candidateRole] = await Role.findOrCreate({ 
            where: { name: 'CANDIDATE' },
            defaults: { name: 'CANDIDATE' },
            transaction
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role_id: candidateRole.id
        }, { transaction });

        const candidate = await Candidate.create({
            user_id: user.id,
            name,
            email,
            phone
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            message: 'Tài khoản thí sinh đã được tạo thành công',
            user: {
                id: user.id,
                email: user.email,
                candidate_id: candidate.id
            }
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Register candidate error:', error);
        res.status(500).json({ message: error.message });
    }
};

const registerAdmin = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ message: 'Secret key không hợp lệ' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã tồn tại trong hệ thống' });
        }

        const [adminRole] = await Role.findOrCreate({ 
            where: { name: 'Admin' },
            defaults: { name: 'Admin' }
        });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role_id: adminRole.id
        });

        res.status(201).json({
            message: 'Tài khoản admin đã được tạo thành công',
            user: {
                id: user.id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register admin error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerAdmin, registerCandidate };
