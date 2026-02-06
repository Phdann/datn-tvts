const { User, Role } = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ 
            where: { email },
            include: [{ 
                model: Role,
                required: false
            }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Email không tồn tại trong hệ thống' });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch && password !== user.password) { 
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        await user.update({ last_login: new Date() });

        const token = jwt.sign(
            { id: user.id, role: user.Role?.name || 'CANDIDATE' },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.Role?.name || 'CANDIDATE',
                status: user.status
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = { login };
