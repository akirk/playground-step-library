import { createUser } from './createUser.js';
import type { CreateUserStep } from './types.js';

describe('createUser', () => {
    describe('toV1()', () => {
    it('should create a basic user', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'editor'
        };
        
        const result = createUser(step).toV1();
        
        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('runPHP');
        expect(result.steps[0].code).toContain("'user_login' => 'testuser'");
        expect(result.steps[0].code).toContain("'user_pass' => 'testpass'");
        expect(result.steps[0].code).toContain("'role' => 'editor'");
    });

    it('should include display name when provided', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'administrator',
            display_name: 'Test User'
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps[0].code).toContain("'display_name' => 'Test User'");
    });

    it('should include email when provided', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'subscriber',
            email: 'test@example.com'
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps[0].code).toContain("'user_email' => 'test@example.com'");
    });

    it('should include both display name and email when provided', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'author',
            display_name: 'Test Author',
            email: 'author@example.com'
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps[0].code).toContain("'display_name' => 'Test Author'");
        expect(result.steps[0].code).toContain("'user_email' => 'author@example.com'");
    });

    it('should add login step when login is true', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'administrator',
            login: true
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps).toHaveLength(2);
        expect(result.steps[0].step).toBe('runPHP');
        expect(result.steps[1].step).toBe('login');
        expect(result.steps[1].username).toBe('testuser');
        expect(result.steps[1].password).toBe('testpass');
        expect(result.landingPage).toBe('/wp-admin/');
    });

    it('should not add login step when login is false', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass',
            role: 'subscriber',
            login: false
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('runPHP');
        expect(result.landingPage).toBeUndefined();
    });

    it('should return empty blueprint when username is missing', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            password: 'testpass',
            role: 'subscriber'
        };

        const result = createUser(step).toV1();

        expect(result.steps).toBeUndefined();
    });

    it('should return empty blueprint when password is missing', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            role: 'subscriber'
        };

        const result = createUser(step).toV1();

        expect(result.steps).toBeUndefined();
    });

    it('should return empty blueprint when role is missing', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'testuser',
            password: 'testpass'
        };

        const result = createUser(step).toV1();

        expect(result.steps).toBeUndefined();
    });

    it('should handle missing required fields', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: '',
            password: '',
            role: ''
        };

        const result = createUser(step).toV1();

        expect(result.steps).toBeUndefined();
    });

    it('should handle undefined required fields', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: undefined as any,
            password: undefined as any,
            role: undefined as any
        };

        const result = createUser(step).toV1();

        expect(result.steps).toBeUndefined();
    });

    it('should generate proper PHP code structure', () => {
        const step: CreateUserStep = {
            step: 'createUser',
            username: 'admin',
            password: 'secret',
            role: 'administrator'
        };
        
        const result = createUser(step).toV1();
        
        expect(result.steps[0].code).toMatch(/^<\?php require_once '\/wordpress\/wp-load\.php';/);
        expect(result.steps[0].code).toContain('wp_insert_user( $data )');
        expect(result.steps[0].code).toContain('?>');
    });
    });

    it('should have correct metadata', () => {
        expect(createUser.description).toBe('Create a new user.');
        expect(Array.isArray(createUser.vars)).toBe(true);
        expect(createUser.vars).toHaveLength(6);
        
        const usernameVar = createUser.vars.find(v => v.name === 'username');
        expect(usernameVar).toBeDefined();
        expect(usernameVar.required).toBe(true);
        
        const passwordVar = createUser.vars.find(v => v.name === 'password');
        expect(passwordVar).toBeDefined();
        expect(passwordVar.required).toBe(true);
        
        const roleVar = createUser.vars.find(v => v.name === 'role');
        expect(roleVar).toBeDefined();
        expect(roleVar.required).toBe(true);
        
        const displayNameVar = createUser.vars.find(v => v.name === 'display_name');
        expect(displayNameVar).toBeDefined();
        expect(displayNameVar.required).toBeUndefined(); // Optional field
        
        const emailVar = createUser.vars.find(v => v.name === 'email');
        expect(emailVar).toBeDefined();
        expect(emailVar.required).toBeUndefined(); // Optional field
        
        const loginVar = createUser.vars.find(v => v.name === 'login');
        expect(loginVar).toBeDefined();
        expect(loginVar.type).toBe('boolean');
        expect(loginVar.required).toBeUndefined(); // Optional field
    });
});