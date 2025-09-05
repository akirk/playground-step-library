import { runPHP } from './runPHP.js';
import type { BlueprintStep } from '../../types.js';

describe('runPHP', () => {
    it('should create a runPHP step with the provided code', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: '<?php echo "Hello World"; ?>'
            }
        };
        
        const result = runPHP(step);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('runPHP');
        expect(result[0].code).toBe('<?php echo "Hello World"; ?>');
    });

    it('should handle empty code', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: ''
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe('');
    });

    it('should handle multiline PHP code', () => {
        const code = `<?php
$users = get_users();
foreach ($users as $user) {
    echo $user->user_login . "\n";
}
?>`;
        
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: code
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe(code);
    });

    it('should handle PHP code without opening/closing tags', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: 'wp_insert_post(array("post_title" => "Test Post"));'
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe('wp_insert_post(array("post_title" => "Test Post"));');
    });

    it('should handle PHP code with special characters', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: '<?php echo "Hello \"World\" & \'PHP\'"; ?>'
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe('<?php echo "Hello \"World\" & \'PHP\'"; ?>');
    });

    it('should handle PHP code with WordPress functions', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: '<?php update_option("blog_name", "My WordPress Site"); ?>'
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe('<?php update_option("blog_name", "My WordPress Site"); ?>');
    });

    it('should handle PHP code with HTML', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: '<?php echo "<h1>Welcome to WordPress</h1>"; ?>'
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBe('<?php echo "<h1>Welcome to WordPress</h1>"; ?>');
    });

    it('should handle undefined code gracefully', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {}
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBeUndefined();
    });

    it('should handle null code', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: null
            }
        };
        
        const result = runPHP(step);
        
        expect(result[0].code).toBeNull();
    });

    it('should have correct metadata', () => {
        expect(runPHP.description).toBe('Run code in the context of WordPress.');
        expect(runPHP.builtin).toBe(true);
        expect(Array.isArray(runPHP.vars)).toBe(true);
        expect(runPHP.vars).toHaveLength(1);
        
        const codeVar = runPHP.vars[0];
        expect(codeVar.name).toBe('code');
        expect(codeVar.description).toBe('The code to run');
        expect(codeVar.type).toBe('textarea');
        expect(codeVar.required).toBe(true);
        expect(Array.isArray(codeVar.samples)).toBe(true);
    });

    it('should return a valid WordPress Playground step', () => {
        const step: BlueprintStep = {
            step: 'runPHP',
            vars: {
                code: '<?php wp_insert_post(array("post_title" => "Test")); ?>'
            }
        };
        
        const result = runPHP(step);
        
        // Validate the structure matches WordPress Playground step format
        expect(result[0]).toHaveProperty('step');
        expect(result[0]).toHaveProperty('code');
        expect(typeof result[0].step).toBe('string');
        expect(result[0].step).toBe('runPHP');
    });
});