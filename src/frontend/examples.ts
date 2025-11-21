/**
 * Blueprint Examples
 * Pre-defined step configurations for common use cases
 */

export interface ExampleStep {
	step: string;
	vars: Record<string, any>;
}

export type Examples = Record<string, ExampleStep[]>;

export const examples: Examples = {
	'Interactivity API Todo list MVC': [
		{
			'step': 'addPage',
			'vars': {
				'postTitle': '',
				'postContent': '<!-- wp:to-do-mvc/to-do-mvc /-->',
				'homepage': true
			}
		},
		{
			'step': 'githubPluginRelease',
			'vars': {
				'repo': 'ryanwelcher/interactivity-api-todomvc',
				'release': 'v0.1.3',
				'filename': 'to-do-mvc.zip'
			}
		},
		{
			'step': 'login',
			'vars': {
				'username': 'admin',
				'password': 'password',
				'landingPage': false
			}
		}
	],
	'ActivityPub plugin preview': [
		{
			'step': 'installPlugin',
			'vars': {
				'url': 'activitypub',
				'permalink': true
			}
		},
		{
			'step': 'showAdminNotice',
			'vars': {
				'text': 'Welcome to this demo of the ActivityPub plugin',
				'type': 'info',
				'dismissible': false
			}
		},
		{
			'step': 'setSiteName',
			'vars': {
				'sitename': 'ActivityPub Demo',
				'tagline': 'Trying out WordPress Playground.'
			}
		},
		{
			'step': 'createUser',
			'vars': {
				'username': 'demo',
				'password': 'password',
				'role': 'administrator',
				'display_name': 'Demo User',
				'email': '',
				'login': true
			}
		},
		{
			'step': 'setLandingPage',
			'vars': {
				'landingPage': '/wp-admin/admin.php?page=activitypub'
			}
		}
	],
	'Load Feeds into the Friends plugin': [
		{
			'step': 'setLandingPage',
			'vars': {
				'landingPage': '/friends/'
			}
		},
		{
			'step': 'installPlugin',
			'vars': {
				'url': 'friends'
			}
		},
		{
			'step': 'importFriendFeeds',
			'vars': {
				'opml': 'https://alex.kirk.at Alex Kirk\nhttps://adamadam.blog Adam Zieliński'
			}
		}
	],
	"Show the available PHP extensions + PHPinfo": [
		{
			"step": "addFilter",
			"vars": {
				"filter": "init",
				"code": "$e = get_loaded_extensions(); sort( $e ); echo '<div style=\"float:left; margin-left: 1em\">AvailableExtensions:<ul><li>', implode('</li><li>', $e ), '</li></ul></div>'; phpinfo()",
				"priority": "10"
			}
		}
	]
};
