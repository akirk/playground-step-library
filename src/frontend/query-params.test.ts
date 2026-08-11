import { describe, it, expect, afterEach } from 'vitest';
import { getBlueprintUrlParam, parseQueryParamsForBlueprint, rewriteGitHubUrlToRaw } from './query-params';

describe( 'query params', () => {
	afterEach( () => {
		window.history.pushState( {}, '', '/' );
	} );

	describe( 'rewriteGitHubUrlToRaw', () => {
		it( 'rewrites GitHub blob file URLs to raw GitHub URLs', () => {
			expect(
				rewriteGitHubUrlToRaw( 'https://github.com/example/repo/blob/main/blueprint.json' )
			).toBe( 'https://raw.githubusercontent.com/example/repo/main/blueprint.json' );
		} );

		it( 'rewrites nested GitHub blob file URLs and preserves query params', () => {
			expect(
				rewriteGitHubUrlToRaw( 'https://github.com/example/repo/blob/trunk/path/to/blueprint.json?raw=1' )
			).toBe( 'https://raw.githubusercontent.com/example/repo/trunk/path/to/blueprint.json?raw=1' );
		} );

		it( 'rewrites GitHub raw file URLs to raw.githubusercontent.com URLs', () => {
			expect(
				rewriteGitHubUrlToRaw( 'https://github.com/example/repo/raw/main/blueprint.json' )
			).toBe( 'https://raw.githubusercontent.com/example/repo/main/blueprint.json' );
		} );

		it( 'leaves non-GitHub URLs unchanged', () => {
			const url = 'https://example.com/blueprint.json';
			expect( rewriteGitHubUrlToRaw( url ) ).toBe( url );
		} );

		it( 'leaves data URLs unchanged', () => {
			const url = 'data:application/json;base64,eyJzdGVwcyI6W119';
			expect( rewriteGitHubUrlToRaw( url ) ).toBe( url );
		} );
	} );

	describe( 'getBlueprintUrlParam', () => {
		it( 'returns a rewritten GitHub blueprint-url parameter', () => {
			const githubUrl = 'https://github.com/example/repo/blob/main/blueprint.json';
			window.history.pushState( {}, '', `/?blueprint-url=${encodeURIComponent( githubUrl )}` );

			expect( getBlueprintUrlParam() ).toBe(
				'https://raw.githubusercontent.com/example/repo/main/blueprint.json'
			);
		} );
	} );

	describe( 'parseQueryParamsForBlueprint', () => {
		it( 'preserves WordPress.org plugin slugs while expanding URL-like values', () => {
			window.history.pushState(
				{},
				'',
				'/?redir=1&step%5B0%5D=installPlugin&url%5B0%5D=advanced-custom-fields&step%5B1%5D=installPlugin&url%5B1%5D=github.com/akirk/family-wiki/tree/add-gedcom-import-export'
			);

			expect( parseQueryParamsForBlueprint() ).toEqual( {
				steps: [
					{
						step: 'installPlugin',
						vars: {
							url: 'advanced-custom-fields'
						}
					},
					{
						step: 'installPlugin',
						vars: {
							url: 'https://github.com/akirk/family-wiki/tree/add-gedcom-import-export'
						}
					}
				],
				redir: 1
			} );
		} );

		it( 'preserves short-form GitHub repository references', () => {
			window.history.pushState(
				{},
				'',
				'/?step%5B0%5D=installPlugin&url%5B0%5D=akirk/blueprint-recorder'
			);

			expect( parseQueryParamsForBlueprint()?.steps[0].vars.url ).toBe( 'akirk/blueprint-recorder' );
		} );
	} );
} );
