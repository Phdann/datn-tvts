const { User, Role, sequelize } = require('./models');

async function createAdmin() {
    console.log('--- Start creating admin ---');
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' } });
        console.log('Admin role ensured:', adminRole.id);

        const email = 'admin1@uni.edu.vn';
        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                password: 'adminpassword',
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
