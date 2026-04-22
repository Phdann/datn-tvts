const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { User, Role, sequelize } = require('./models');

async function createAdmin() {
    console.log('--- Start creating admin ---');
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
        console.log('Admin role ensured:', adminRole.id);

        const email = 'a@gmail.com';
        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                password: 'a123456',
                role_id: adminRole.id,
                name: 'System Admin'
            }
        });

        if (created) {
            console.log(' Admin user created successfully!');
        } else {
            console.log(' Admin user already exists. Updating password...');
            await user.update({ password: 'adminpassword', role_id: adminRole.id });
            console.log(' Admin user updated!');
        }
        
        process.exit(0);
    } catch (error) {
        console.error(' Error:', error);
        process.exit(1);
    }
}

createAdmin();
