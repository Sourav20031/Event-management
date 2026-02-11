const db = require('./config/database');

async function updatePassword() {
  try {
    const newHash = '$2a$10$6K/G0ndv0G.I.K9zchgHfuP29VN7olI4kr7GpAHeBeKD.ZeOh/QAy';
    
    const [result] = await db.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [newHash, 'admin1']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Password updated successfully!');
      console.log('Admin credentials:');
      console.log('User ID: admin1');
      console.log('Password: Admin@123');
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    process.exit(1);
  }
}

updatePassword();
