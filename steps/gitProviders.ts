/**
 * Git provider configurations for different hosting services.
 * This allows the step library to support GitHub, GitLab, Codeberg, and other git hosts
 * without needing separate step files for each provider.
 */

export interface GitProvider {
	name: string;
	domains: string[];
	branchPathPrefix: string;
	prPath: string;
	prRefFormat: ( prNumber: string ) => string;
	releaseUrlFormat: ( repo: string, tag: string, filename: string ) => string;
	supportsPlaygroundExport?: boolean;
	requiresGitSuffix?: boolean;
}

export const gitProviders: Record<string, GitProvider> = {
	github: {
		name: 'GitHub',
		domains: ['github.com'],
		branchPathPrefix: '/tree/',
		prPath: '/pull/',
		prRefFormat: ( prNumber ) => `refs/pull/${prNumber}/head`,
		releaseUrlFormat: ( repo, tag, filename ) =>
			`https://github.com/${repo}/releases/download/${tag}/${filename}`,
		supportsPlaygroundExport: true,
	},
	gitlab: {
		name: 'GitLab',
		domains: ['gitlab.com'],
		branchPathPrefix: '/-/tree/',
		prPath: '/-/merge_requests/',
		prRefFormat: ( prNumber ) => `refs/merge-requests/${prNumber}/head`,
		releaseUrlFormat: ( repo, tag, filename ) =>
			`https://gitlab.com/${repo}/-/releases/${tag}/downloads/${filename}`,
		requiresGitSuffix: true,
	},
	codeberg: {
		name: 'Codeberg',
		domains: ['codeberg.org'],
		branchPathPrefix: '/src/branch/',
		prPath: '/pulls/',
		prRefFormat: ( prNumber ) => `refs/pull/${prNumber}/head`,
		releaseUrlFormat: ( repo, tag, filename ) =>
			`https://codeberg.org/${repo}/releases/download/${tag}/${filename}`,
	},
	gitea: {
		name: 'Gitea',
		domains: [],
		branchPathPrefix: '/src/branch/',
		prPath: '/pulls/',
		prRefFormat: ( prNumber ) => `refs/pull/${prNumber}/head`,
		releaseUrlFormat: ( repo, tag, filename ) =>
			`https://{domain}/${repo}/releases/download/${tag}/${filename}`,
	},
};

const excludedDomains = [
	'wordpress.org',
	'www.wordpress.org',
	'wordpress.com',
	'www.wordpress.com',
];

/**
 * Check if a string looks like a short-form GitHub reference (org/repo).
 */
function isShortFormGitHubUrl( url: string ): boolean {
	if ( url.includes( '://' ) ) {
		return false;
	}
	const parts = url.split( '/' );
	if ( parts.length < 2 ) {
		return false;
	}
	if ( parts[0].includes( '.' ) ) {
		return false;
	}
	return /^[a-zA-Z0-9_.-]+$/.test( parts[0] ) && /^[a-zA-Z0-9_.-]+$/.test( parts[1] );
}

/**
 * Detect the git provider from a URL.
 * Returns the provider config and extracted URL parts.
 */
export function detectGitProvider( url: string ): {
	provider: GitProvider;
	domain: string;
	org: string;
	repo: string;
	remainder: string;
} | null {
	let normalizedUrl = url.trim();

	if ( isShortFormGitHubUrl( normalizedUrl ) ) {
		const parts = normalizedUrl.split( '/' );
		return {
			provider: gitProviders.github,
			domain: 'github.com',
			org: parts[0],
			repo: parts[1],
			remainder: '/' + parts.slice( 2 ).join( '/' ),
		};
	}

	if ( ! normalizedUrl.includes( '://' ) ) {
		normalizedUrl = 'https://' + normalizedUrl;
	}

	let parsed: URL;
	try {
		parsed = new URL( normalizedUrl );
	} catch {
		return null;
	}

	const domain = parsed.hostname;

	if ( excludedDomains.includes( domain ) ) {
		return null;
	}

	const pathname = parsed.pathname;
	const pathParts = pathname.split( '/' ).filter( Boolean );

	if ( pathParts.length < 2 ) {
		return null;
	}

	const org = pathParts[0];
	const repo = pathParts[1];

	const repoPathEnd = pathname.indexOf( repo ) + repo.length;
	const remainder = pathname.substring( repoPathEnd ) || '/';

	for ( const key in gitProviders ) {
		const provider = gitProviders[key];
		if ( provider.domains.includes( domain ) ) {
			return { provider, domain, org, repo, remainder };
		}
	}

	return null;
}

/**
 * Parse a git URL to extract branch, directory, and PR/MR information.
 *
 * Branch/directory parsing rules:
 * - `//` is an explicit separator between branch and directory
 * - If no `//`, only treat path segments as directory if there are 2+ slashes
 *   (nested path like `trunk/packages/components` -> branch=trunk, dir=packages/components)
 * - A single slash is part of the branch name (e.g., `feature/branch`)
 */
export function parseGitUrl( url: string ): {
	provider: GitProvider;
	domain: string;
	org: string;
	repo: string;
	branch: string | null;
	directory: string;
	prNumber: string | null;
	repoUrl: string;
} | null {
	const detected = detectGitProvider( url );
	if ( ! detected ) {
		return null;
	}

	const { provider, domain, org, repo, remainder } = detected;
	const repoUrl = `https://${domain}/${org}/${repo}`;

	let branch: string | null = null;
	let directory = '';
	let prNumber: string | null = null;

	const prRegex = new RegExp( escapeRegex( provider.prPath ) + '(\\d+)' );
	const prMatch = remainder.match( prRegex );
	if ( prMatch ) {
		prNumber = prMatch[1];
		return { provider, domain, org, repo, branch, directory, prNumber, repoUrl };
	}

	if ( remainder.startsWith( provider.branchPathPrefix ) ) {
		let branchAndDir = remainder.slice( provider.branchPathPrefix.length );
		branchAndDir = branchAndDir.replace( /\/+$/, '' );

		const doubleSlashIndex = branchAndDir.indexOf( '//' );
		if ( doubleSlashIndex !== -1 ) {
			branch = branchAndDir.substring( 0, doubleSlashIndex );
			directory = branchAndDir.substring( doubleSlashIndex + 2 );
		} else {
			const firstSlashIndex = branchAndDir.indexOf( '/' );
			if ( firstSlashIndex !== -1 ) {
				const potentialDir = branchAndDir.substring( firstSlashIndex + 1 );
				if ( potentialDir.includes( '/' ) ) {
					directory = potentialDir;
					branch = branchAndDir.substring( 0, firstSlashIndex );
				} else {
					branch = branchAndDir;
				}
			} else {
				branch = branchAndDir;
			}
		}
	}

	return { provider, domain, org, repo, branch, directory, prNumber, repoUrl };
}

/**
 * Parse a release URL to extract version and filename.
 */
export function parseReleaseUrl( url: string ): {
	provider: GitProvider;
	domain: string;
	org: string;
	repo: string;
	version: string;
	filename: string;
} | null {
	const detected = detectGitProvider( url );
	if ( ! detected ) {
		return null;
	}

	const { provider, domain, org, repo, remainder } = detected;

	const githubReleasePattern = /\/releases\/download\/([^\/]+)\/([^\/]+)$/;
	const gitlabReleasePattern = /\/-\/releases\/([^\/]+)\/downloads\/([^\/]+)$/;

	let match = remainder.match( githubReleasePattern );
	if ( match ) {
		return { provider, domain, org, repo, version: match[1], filename: match[2] };
	}

	match = remainder.match( gitlabReleasePattern );
	if ( match ) {
		return { provider, domain, org, repo, version: match[1], filename: match[2] };
	}

	return null;
}

function escapeRegex( str: string ): string {
	return str.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}
