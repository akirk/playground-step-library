import { describe, expect, it } from 'vitest';
import { installPlugin } from './installPlugin.js';
import { wpapp } from './wpapp.js';
import { v1ToV2Fallback } from './types.js';

describe( 'wpapp', () => {
	it( 'adds wp-app and its autoloader before activating the app', () => {
		const result = wpapp( { step: 'wpapp', vars: { url: 'https://github.com/donnchawp/travel-steps' } } ).toV1();
		expect( result.steps?.map( ( step: any ) => step.step ) ).toEqual( [ 'installPlugin', 'installPlugin', 'mkdir', 'writeFile', 'activatePlugin' ] );
		expect( result.steps?.[0] ).toMatchObject( {
			pluginData: { url: 'https://github.com/donnchawp/travel-steps', ref: 'HEAD' },
			options: { activate: false, targetFolderName: 'travel-steps' },
		} );
		expect( result.steps?.[1] ).toMatchObject( {
			pluginData: { url: 'https://github.com/akirk/wp-app', path: 'src', ref: 'main' },
			options: { activate: false, targetFolderName: 'travel-steps/vendor/akirk/wp-app' },
		} );
		expect( result.steps?.[3] ).toMatchObject( {
			path: '/wordpress/wp-content/plugins/travel-steps/vendor/autoload.php',
			data: expect.stringContaining( "require_once __DIR__ . '/akirk/wp-app/functions.php'" ),
		} );
		expect( result.steps?.[4] ).toEqual( { step: 'activatePlugin', pluginPath: 'travel-steps/travel-steps.php' } );
	} );

	it( 'reuses installPlugin Git directory resolution for the app and dependency', () => {
		const url = 'https://github.com/example/app/tree/main//packages/travel';
		const result = wpapp( { step: 'wpapp', vars: { url } } ).toV1();
		const app = installPlugin( { step: 'installPlugin', vars: { url, pluginSlug: 'travel' } } ).toV1().steps?.[0] as any;
		const dependency = installPlugin( {
			step: 'installPlugin',
			vars: { url: 'https://github.com/akirk/wp-app/tree/main//src', pluginSlug: 'travel/vendor/akirk/wp-app' },
		} ).toV1().steps?.[0] as any;
		expect( result.steps?.[0] ).toEqual( { ...app, options: { ...app.options, activate: false } } );
		expect( result.steps?.[1] ).toEqual( { ...dependency, options: { ...dependency.options, activate: false } } );
		expect( result.steps?.[4] ).toEqual( { step: 'activatePlugin', pluginPath: 'travel/travel.php' } );
	} );

	it.each( [
		[ 'https://github.com/donnchawp/travel-steps/pull/12', 'refs/pull/12/head', 'refname' ],
		[ 'https://github.com/donnchawp/travel-steps/tree/feature/preview', 'feature/preview', 'branch' ],
	] )( 'preserves the ref from %s', ( url, ref, refType ) => {
		const result = wpapp( { step: 'wpapp', vars: { url, pluginSlug: 'travel-app' } } ).toV1();
		expect( result.steps?.[0] ).toMatchObject( { pluginData: { ref, refType }, options: { targetFolderName: 'travel-app' } } );
		expect( result.steps?.[3] ).toMatchObject( { path: '/wordpress/wp-content/plugins/travel-app/vendor/autoload.php' } );
		expect( result.steps?.[4] ).toEqual( { step: 'activatePlugin', pluginPath: 'travel-app/travel-app.php' } );
	} );

	it( 'supports v2 using the same installation sequence', () => {
		const result = wpapp( { step: 'wpapp', vars: { url: 'donnchawp/travel-steps' } } );
		expect( result.toV2() ).toEqual( v1ToV2Fallback( result.toV1() ) );
	} );

	it.each( [ '', 'invalid', 'https://gitlab.com/example/app' ] )( 'ignores invalid or non-GitHub URLs: %s', ( url ) => {
		expect( wpapp( { step: 'wpapp', vars: { url } } ).toV1() ).toEqual( { steps: [] } );
	} );

	it( 'allows an entry filename different from the folder name', () => {
		const result = wpapp( { step: 'wpapp', vars: { url: 'example/app', pluginSlug: 'preview', pluginFile: 'app.php' } } ).toV1();
		expect( result.steps?.[4] ).toEqual( { step: 'activatePlugin', pluginPath: 'preview/app.php' } );
	} );

	it( 'rejects entry file traversal', () => {
		expect( wpapp( { step: 'wpapp', vars: { url: 'example/app', pluginFile: '../app.php' } } ).toV1() ).toEqual( { steps: [] } );
	} );

	it( 'rejects plugin folder traversal', () => {
		expect( wpapp( { step: 'wpapp', vars: { url: 'donnchawp/travel-steps', pluginSlug: '../outside' } } ).toV1() ).toEqual( { steps: [] } );
	} );
} );
