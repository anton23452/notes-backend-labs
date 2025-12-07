const authModel = require('../../src/models/auth.model');

describe('Auth Model', () => {
    describe('register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'newuser@test.com',
                password: 'testpass123',
                role: 'user'
            };

            const result = await authModel.register(userData);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', 'Test User');
            expect(result).toHaveProperty('email', 'newuser@test.com');
            expect(result).toHaveProperty('role', 'user');
            expect(result).not.toHaveProperty('password');
        });

        it('should not register user with duplicate email', async () => {
            const userData = {
                name: 'Duplicate',
                email: 'admin@example.com',
                password: 'pass123',
                role: 'user'
            };

            const result = await authModel.register(userData);

            expect(result).toHaveProperty('error');
            expect(result.error).toContain('уже существует');
        });

        it('should default to user role if not specified', async () => {
            const userData = {
                name: 'Default Role User',
                email: 'defaultrole@test.com',
                password: 'pass123'
            };

            const result = await authModel.register(userData);

            expect(result.role).toBe('user');
        });
    });

    describe('findByEmail', () => {
        it('should find existing user by email', () => {
            const user = authModel.findByEmail('admin@example.com');

            expect(user).toBeDefined();
            expect(user.email).toBe('admin@example.com');
            expect(user.role).toBe('admin');
        });

        it('should return undefined for non-existent email', () => {
            const user = authModel.findByEmail('nonexistent@test.com');

            expect(user).toBeUndefined();
        });
    });

    describe('findById', () => {
        it('should find user by id', () => {
            const user = authModel.findById(1);

            expect(user).toBeDefined();
            expect(user.id).toBe(1);
            expect(user.email).toBe('admin@example.com');
        });

        it('should return undefined for non-existent id', () => {
            const user = authModel.findById(9999);

            expect(user).toBeUndefined();
        });
    });

    describe('verifyPassword', () => {
        it('should verify correct password', async () => {
            const user = authModel.findByEmail('admin@example.com');
            const isValid = await authModel.verifyPassword('admin123', user.password);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const user = authModel.findByEmail('admin@example.com');
            const isValid = await authModel.verifyPassword('wrongpassword', user.password);

            expect(isValid).toBe(false);
        });
    });
});
