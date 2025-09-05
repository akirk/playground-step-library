import { createUser } from './createUser.js';
import type { BlueprintStep } from '../types.js';

describe('createUser', () => {
    it('should create a basic user', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'editor'
            }
        };
        
        const result = createUser(step);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('runPHP');
        expect(result[0].code).toContain("'user_login' => 'testuser'");
        expect(result[0].code).toContain("'user_pass' => 'testpass'");
        expect(result[0].code).toContain("'role' => 'editor'");
    });

    it('should include display name when provided', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'administrator',
                display_name: 'Test User'
            }
        };
        
        const result = createUser(step);
        
        expect(result[0].code).toContain("'display_name' => 'Test User'");
    });

    it('should include email when provided', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'subscriber',
                email: 'test@example.com'
            }
        };
        
        const result = createUser(step);
        
        expect(result[0].code).toContain("'user_email' => 'test@example.com'");
    });

    it('should include both display name and email when provided', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'author',
                display_name: 'Test Author',
                email: 'author@example.com'
            }
        };
        
        const result = createUser(step);
        
        expect(result[0].code).toContain("'display_name' => 'Test Author'");
        expect(result[0].code).toContain("'user_email' => 'author@example.com'");
    });

    it('should add login step when login is true', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'administrator',
                login: true
            }
        };
        
        const result = createUser(step);
        
        expect(result).toHaveLength(2);
        expect(result[0].step).toBe('runPHP');
        expect(result[1].step).toBe('login');
        expect(result[1].username).toBe('testuser');
        expect(result[1].password).toBe('testpass');
        expect(result.landingPage).toBe('/wp-admin/');
    });

    it('should not add login step when login is false', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass',
                role: 'subscriber',
                login: false
            }
        };
        
        const result = createUser(step);
        
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('runPHP');
        expect(result.landingPage).toBeUndefined();
    });

    it('should return empty array when username is missing', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                password: 'testpass',
                role: 'subscriber'
            }
        };
        
        const result = createUser(step);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when password is missing', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                role: 'subscriber'
            }
        };
        
        const result = createUser(step);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when role is missing', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'testuser',
                password: 'testpass'
            }
        };
        
        const result = createUser(step);
        
        expect(result).toEqual([]);
    });

    it('should handle empty vars object', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {}
        };
        
        const result = createUser(step);
        
        expect(result).toEqual([]);
    });

    it('should handle undefined vars', () => {
        const step: BlueprintStep = {
            step: 'createUser'
        };
        
        const result = createUser(step);
        
        expect(result).toEqual([]);
    });

    it('should generate proper PHP code structure', () => {
        const step: BlueprintStep = {
            step: 'createUser',
            vars: {
                username: 'admin',
                password: 'secret',
                role: 'administrator'
            }
        };
        
        const result = createUser(step);
        
        expect(result[0].code).toMatch(/^<\?php require_once '\/wordpress\/wp-load\.php';/);
        expect(result[0].code).toContain('wp_insert_user( $data )');
        expect(result[0].code).toContain('?>');
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