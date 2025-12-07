// Quick script to generate password hashes
const bcrypt = require('bcryptjs');

(async () => {
    const admin = await bcrypt.hash('admin123', 10);
    const user = await bcrypt.hash('user123', 10);

    console.log('admin123 hash:', admin);
    console.log('user123 hash:', user);
})();
