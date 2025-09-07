const bcrypt = require('bcryptjs');

async function testPassword() {
    const password = 'password123';
    const oldHash = '$2a$10$K.0HwpsoPDGaB/atFBmmXOGTw4ceeg33.WrxJx/FeC9.gCyYvIbs6';
    
    // Test old hash
    const isMatch = await bcrypt.compare(password, oldHash);
    console.log('Old hash matches password123:', isMatch);
    
    // Generate new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash for password123:', newHash);
    
    // Test new hash
    const newMatch = await bcrypt.compare(password, newHash);
    console.log('New hash matches password123:', newMatch);
}

testPassword().catch(console.error);