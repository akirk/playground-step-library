import { describe, it, expect } from 'vitest';
import { debug } from './debug.js';

describe( 'debug', () => {
	it( 'should set WP_DEBUG to true by default', () => {
		const result = debug( { step: 'debug' }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep ).toBeDefined();
		expect( configStep?.consts.WP_DEBUG ).toBe( true );
	} );

	it( 'should set WP_DEBUG_DISPLAY to true by default when WP_DEBUG is enabled', () => {
		const result = debug( { step: 'debug' }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( true );
	} );

	it( 'should allow disabling WP_DEBUG', () => {
		const result = debug( { step: 'debug', wpDebug: false }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.WP_DEBUG ).toBe( false );
		expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBeUndefined();
	} );

	it( 'should allow disabling WP_DEBUG_DISPLAY', () => {
		const result = debug( { step: 'debug', wpDebugDisplay: false }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.WP_DEBUG ).toBe( true );
		expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( false );
	} );

	it( 'should set SCRIPT_DEBUG when enabled', () => {
		const result = debug( { step: 'debug', scriptDebug: true }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.SCRIPT_DEBUG ).toBe( true );
	} );

	it( 'should not set SCRIPT_DEBUG by default', () => {
		const result = debug( { step: 'debug' }, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.SCRIPT_DEBUG ).toBeUndefined();
	} );

	it( 'should install Query Monitor plugin by default', () => {
		const result = debug( { step: 'debug' }, { steps: [] } ).toV1();

		const installStep = result.find( r => r.step === 'installPlugin' && r.pluginData?.resource === 'wordpress.org/plugins' );
		expect( installStep ).toBeDefined();
		expect( installStep?.pluginData?.slug ).toBe( 'query-monitor' );
	} );

	it( 'should allow disabling Query Monitor', () => {
		const result = debug( { step: 'debug', queryMonitor: false }, { steps: [] } ).toV1();

		const installSteps = result.filter( r => r.step === 'installPlugin' );
		expect( installSteps ).toHaveLength( 0 );
	} );

	it( 'should not install Query Monitor plugin if already present', () => {
		const blueprint = {
			steps: [
				{ step: 'installPlugin', vars: { url: 'query-monitor' } }
			]
		};
		const result = debug( { step: 'debug' }, blueprint ).toV1();

		const installSteps = result.filter( r => r.step === 'installPlugin' );
		expect( installSteps ).toHaveLength( 0 );
	} );

	it( 'should combine all settings', () => {
		const result = debug( {
			step: 'debug',
			wpDebug: true,
			wpDebugDisplay: false,
			scriptDebug: true
		}, { steps: [] } ).toV1();

		const configStep = result.find( r => r.step === 'defineWpConfigConsts' );
		expect( configStep?.consts.WP_DEBUG ).toBe( true );
		expect( configStep?.consts.WP_DEBUG_DISPLAY ).toBe( false );
		expect( configStep?.consts.SCRIPT_DEBUG ).toBe( true );

		const installStep = result.find( r => r.step === 'installPlugin' );
		expect( installStep?.pluginData?.slug ).toBe( 'query-monitor' );
	} );
} );
