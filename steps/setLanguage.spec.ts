import { setLanguage } from './setLanguage.js';
import type { SetLanguageStep } from './types.js';

describe('setLanguage', () => {
    it('should set language using locale mapping', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'de'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(Array.isArray(result.steps)).toBe(true);
        expect(result.steps).toHaveLength(1);
        expect(result.steps[0].step).toBe('setSiteLanguage');
        expect(result.steps[0].language).toBe('de_DE');
    });

    it('should map French correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'fr'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('fr_FR');
    });

    it('should map Spanish correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'es'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('es_ES');
    });

    it('should map Italian correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'it'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('it_IT');
    });

    it('should map Japanese correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'ja'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('ja');
    });

    it('should map Polish correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'pl'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('pl_PL');
    });

    it('should map Arabic correctly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'ar'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('ar');
    });

    it('should use original language when not in mapping', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'en_US'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('en_US');
    });

    it('should handle full locale codes directly', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'pt_BR'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('pt_BR');
    });

    it('should return empty steps when language is missing', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: ''
        } };

        const result = setLanguage(step).toV1();

        expect(result).toEqual({ steps: [] });
    });

    it('should return empty steps when language is empty string', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: ''
        } };

        const result = setLanguage(step).toV1();

        expect(result).toEqual({ steps: [] });
    });

    it('should return empty steps when language is null', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: null as any
        } };

        const result = setLanguage(step).toV1();

        expect(result).toEqual({ steps: [] });
    });

    it('should return empty steps when language is undefined', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: undefined as any
        } };

        const result = setLanguage(step).toV1();

        expect(result).toEqual({ steps: [] });
    });

    it('should handle custom locale formats', () => {
        const step: SetLanguageStep = {
            step: 'setLanguage', vars: {
            language: 'zh_CN'
        } };
        
        const result = setLanguage(step).toV1();
        
        expect(result.steps[0].language).toBe('zh_CN');
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
            step: 'setLanguage', vars: {
            language: 'fr'
        } };
        
        const result = setLanguage(step).toV1();
        
        // Validate the structure matches WordPress Playground step format
        expect(result.steps[0]).toHaveProperty('step');
        expect(result.steps[0]).toHaveProperty('language');
        expect(typeof result.steps[0].step).toBe('string');
        expect(typeof result.steps[0].language).toBe('string');
        expect(result.steps[0].step).toBe('setSiteLanguage');
    });
});