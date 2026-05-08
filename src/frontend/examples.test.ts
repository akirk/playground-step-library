import { describe, expect, it } from 'vitest';
import { examples, examplesBySlug } from './examples';

describe( 'examples', () => {
	it( 'indexes examples by filename slug', () => {
		const example = examplesBySlug['theme-review-environment'];

		expect( example ).toBeDefined();
		expect( example.title ).toBe( 'Theme Review Environment' );
		expect( example.slug ).toBe( 'theme-review-environment' );
		expect( example.extraLibraries ).toEqual( ['wp-cli'] );
		expect( example.steps[0].step ).toBe( 'installTheme' );
	} );

	it( 'keeps the title index pointing to the same example state', () => {
		expect( examples['Theme Review Environment'] ).toBe( examplesBySlug['theme-review-environment'] );
	} );
} );
