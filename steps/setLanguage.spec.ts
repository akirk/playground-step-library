import { setLanguage } from './setLanguage.js';
import type { SetLanguageStep } from './types.js';

describe('setLanguage', () => {
    it('should set language using locale mapping', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'de'
        };
        
        const result = setLanguage(step);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(result[0].step).toBe('setSiteLanguage');
        expect(result[0].language).toBe('de_DE');
    });

    it('should map French correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'fr'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('fr_FR');
    });

    it('should map Spanish correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'es'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('es_ES');
    });

    it('should map Italian correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'it'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('it_IT');
    });

    it('should map Japanese correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'ja'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('ja');
    });

    it('should map Polish correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'pl'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('pl_PL');
    });

    it('should map Arabic correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'ar'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('ar');
    });

    it('should use original language when not in mapping', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'en_US'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('en_US');
    });

    it('should handle full locale codes directly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'pt_BR'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('pt_BR');
    });

    it('should return empty array when language is missing', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: ''
        };
        
        const result = setLanguage(step);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when language is empty string', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: ''
        };
        
        const result = setLanguage(step);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when language is null', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: null as any
        };
        
        const result = setLanguage(step);
        
        expect(result).toEqual([]);
    });

    it('should return empty array when language is undefined', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: undefined as any
        };
        
        const result = setLanguage(step);
        
        expect(result).toEqual([]);
    });

    it('should handle custom locale formats', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'zh_CN'
        };
        
        const result = setLanguage(step);
        
        expect(result[0].language).toBe('zh_CN');
    });

    it('should have correct metadata', () => {
        expect(setLanguage.description).toBe('Set the WordPress site language.');
        expect(Array.isArray(setLanguage.vars)).toBe(true);
        expect(setLanguage.vars).toHaveLength(1);
        
        const languageVar = setLanguage.vars[0];
        expect(languageVar.name).toBe('language');
        expect(languageVar.description).toBe('A valid WordPress language slug');
        expect(languageVar.required).toBe(true);
        expect(Array.isArray(languageVar.samples)).toBe(true);
        expect(languageVar.samples).toEqual(['de', 'fr', 'es', 'it', 'pl', 'ar']);
    });

    it('should return a valid WordPress Playground step', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage',
            language: 'fr'
        };
        
        const result = setLanguage(step);
        
        // Validate the structure matches WordPress Playground step format
        expect(result[0]).toHaveProperty('step');
        expect(result[0]).toHaveProperty('language');
        expect(typeof result[0].step).toBe('string');
        expect(typeof result[0].language).toBe('string');
        expect(result[0].step).toBe('setSiteLanguage');
    });
});