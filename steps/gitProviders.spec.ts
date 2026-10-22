import { parseGitUrl, gitProviders } from './gitProviders.js';

describe( 'parseGitUrl', () => {
	it.each( Object.values( gitProviders ).filter( provider => provider.domains.length > 0 ) )(
		'preserves slash-containing branches at the repository root for $name',
		provider => {
			const url = `https://${provider.domains[0]}/org/repo${provider.branchPathPrefix}feature/nested/branch//`;
			expect( parseGitUrl( url ) ).toMatchObject( {
				branch: 'feature/nested/branch',
				directory: '',
			} );
		}
	);

	it.each( [
		[ 'main/', 'main', '' ],
		[ 'feature/branch/', 'feature/branch', '' ],
		[ 'main/packages/components/', 'main', 'packages/components' ],
		[ 'feature/nested/branch//packages/components/', 'feature/nested/branch', 'packages/components' ],
	] )( 'parses %s with trailing slashes', ( path, branch, directory ) => {
		expect( parseGitUrl( `https://github.com/org/repo/tree/${path}` ) ).toMatchObject( {
			branch,
			directory,
		} );
	} );
} );
