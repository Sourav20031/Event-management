const db = require('./config/database');

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // Check if admin user exists
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE user_id = ?',
      ['admin1']
    );
    
    if (existing.length > 0) {
      console.log('Admin user already exists, updating password...');
      const [result] = await db.execute(
        'UPDATE users SET password_hash = ? WHERE user_id = ?',
        ['$2a$10$6K/G0ndv0G.I.K9zchgHfuP29VN7olI4kr7GpAHeBeKD.ZeOh/QAy', 'admin1']
      );
      console.log('✅ Password updated!');
    } else {
      console.log('Creating admin user...');
      const [result] = await db.execute(
        'INSERT INTO users (user_id, password_hash, email, name, role, active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin1', '$2a$10$6K/G0ndv0G.I.K9zchgHfuP29VN7olI4kr7GpAHeBeKD.ZeOh/QAy', 'admin@event.com', 'Admin User', 'Admin', true]
      );
      console.log('✅ Admin user created!');
    }
    
    console.log('\n═════════════════════════════════════');
    console.log('✅ Setup Complete!');
    console.log('═════════════════════════════════════');
    console.log('Login Credentials:');
    console.log('User ID: admin1');
    console.log('Password: Admin@123');
    console.log('Role: Admin');
    console.log('═════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminUser();
