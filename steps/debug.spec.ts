import { describe, it, expect } from 'vitest';
import { debug } from './debug.js';
import type { CompilationContext } from './types.js';

function createMockContext( steps: any[] = [] ): CompilationContext {
	return {
		setQueryParams() {},
		getSteps() { return steps; },
		hasStep( stepName: string, matcher?: Record<string, unknown> ) {
			return steps.some( s => {
				if ( s.step !== stepName ) return false;
				if ( !matcher ) return true;
				for ( const key in matcher ) {
					const stepValue = key === 'url' ? s.vars?.url : s[key];
					if ( stepValue !== matcher[key] ) return false;
				}
				return true;
			} );
		}
	};
}

describe( 'debug', () => {
	describe( 'toV1()', () => {
		it( 'should set WP_DEBUG to true by default', () => {
			const result = debug( { step: 'debug' }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep ).toBeDefined();
			expect( configStep?.consts.WP_DEBUG ).toBe( true );
		} );

		it( 'should set WP_DEBUG_DISPLAY to true by default when WP_DEBUG is enabled', () => {
			const result = debug( { step: 'debug' }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( true );
		} );

		it( 'should allow disabling WP_DEBUG', () => {
			const result = debug( { step: 'debug', vars: { wpDebug: false } }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.WP_DEBUG ).toBe( false );
			expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBeUndefined();
		} );

		it( 'should allow disabling WP_DEBUG_DISPLAY', () => {
			const result = debug( { step: 'debug', vars: { wpDebugDisplay: false } }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.WP_DEBUG ).toBe( true );
			expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( false );
		} );

		it( 'should set SCRIPT_DEBUG when enabled', () => {
			const result = debug( { step: 'debug', vars: { scriptDebug: true } }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.SCRIPT_DEBUG ).toBe( true );
		} );

		it( 'should not set SCRIPT_DEBUG by default', () => {
			const result = debug( { step: 'debug' }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.SCRIPT_DEBUG ).toBeUndefined();
		} );

		it( 'should install Query Monitor plugin by default', () => {
			const result = debug( { step: 'debug' }, createMockContext() ).toV1();

			const installStep = result.steps?.find( r => r.step === 'installPlugin' && r.pluginData?.resource === 'wordpress.org/plugins' );
			expect( installStep ).toBeDefined();
			expect( installStep?.pluginData?.slug ).toBe( 'query-monitor' );
		} );

		it( 'should allow disabling Query Monitor', () => {
			const result = debug( { step: 'debug', vars: { queryMonitor: false } }, createMockContext() ).toV1();

			const installSteps = result.steps?.filter( r => r.step === 'installPlugin' );
			expect( installSteps ).toHaveLength( 0 );
		} );

		it( 'should not install Query Monitor plugin if already present', () => {
			const existingSteps = [
				{ step: 'installPlugin', vars: { url: 'query-monitor' } }
			];
			const result = debug( { step: 'debug' }, createMockContext( existingSteps ) ).toV1();

			const installSteps = result.steps?.filter( r => r.step === 'installPlugin' );
			expect( installSteps ).toHaveLength( 0 );
		} );

		it( 'should combine all settings', () => {
			const result = debug( {
				step: 'debug', vars: {
				wpDebug: true,
				wpDebugDisplay: false,
				scriptDebug: true
			} }, createMockContext() ).toV1();

			const configStep = result.steps?.find( r => r.step === 'defineWpConfigConsts' );
			expect( configStep?.consts.WP_DEBUG ).toBe( true );
			expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( false );
			expect( configStep?.consts.SCRIPT_DEBUG ).toBe( true );

			const installStep = result.steps?.find( r => r.step === 'installPlugin' );
			expect( installStep?.pluginData?.slug ).toBe( 'query-monitor' );
		} );
	} );
} );
