import type { StepFunction, ImportFriendFeedsStep, StepResult, V2SchemaFragments } from './types.js';
import { installPlugin } from './installPlugin.js';


export const importFriendFeeds: StepFunction<ImportFriendFeedsStep> = (step: ImportFriendFeedsStep, blueprint: any): StepResult => {
	return {
		toV1() {
	let opml = step.opml || '';
	let phpCode = '';

	if ( ! opml.match(/<opml/) ) {
		const feeds = opml.split('\n').map( line => {
			if ( ! line ) {
				return null;
			}
			const parts = line.split(/\s+/);
			const urls = parts.filter( part => part.match(/^https?:\/\//) );
			if ( urls.length === 0 ) {
				return null;
			}
			let title = line.replace(urls.join(' '), '').trim();
			const url = urls.length === 1 ? urls[0] : urls[1];
			const htmlUrl = urls[0];
			if ( ! title ) {
				title = htmlUrl.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim();
			}

			return {
				title: title.replace(/\\/g, '\\\\').replace(/'/g, "\\'"),
				url: url,
				htmlUrl: htmlUrl
			};
		} ).filter( feed => feed !== null );

		const feedsArrayPhp = feeds.map( feed =>
			`	array( '${feed.url}', '${feed.title}' )`
		).join(",\n");

		phpCode = `
<?php require_once '/wordpress/wp-load.php';
if ( class_exists('Friends\\Import') ) {
	$feeds = array(
${feedsArrayPhp}
	);

	$x = new SimpleXMLElement('<opml/>');
	$a = 'addAttribute';
	$c = 'addChild';
	$x->$a('version', '2.0');
	$h = $x->$c('head');
	$h->$c('title', 'Subscriptions');
	$b = $x->$c('body');
	$s = $b->$c('outline');
	$s->$a('text', 'Subscriptions');
	$s->$a('title', 'Subscriptions');

	foreach ( $feeds as $f ) {
		list( $u, $t ) = $f;
		$o = $s->$c('outline');
		$o->$a('type', 'rss');
		$o->$a('text', $t);
		$o->$a('title', $t);
		$o->$a('xmlUrl', $u);
		$o->$a('htmlUrl', $u);
	}

	Friends\\Import::opml($x->asXML());
}
`.replace(/\s+/g, ' ').replace(/\s*([(){};,=])\s*/g, '$1').replace(/\s+(as)\s+/g, ' $1 ');
	} else {
		opml = opml.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
		phpCode = `
<?php require_once '/wordpress/wp-load.php';
if ( class_exists('Friends\\Import') ) {
	Friends\\Import::opml("${opml}");
}
`;
	}

	let steps: any[] = [
		{
			"step": "runPHP",
			"code": phpCode,
			"progress": {
				"caption": "Importing feeds to Friends plugin"
			}
		}
	];
	let hasFriendsPlugin = false;
	for ( const i in blueprint.steps ) {
		if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.url === 'friends' ) {
			hasFriendsPlugin = true;
		}
		if ( blueprint.steps[i].step === 'githubPlugin' && blueprint.steps[i]?.vars?.repo === 'akirk/friends' ) {
			hasFriendsPlugin = true;
		}
	}
	if ( ! hasFriendsPlugin ) {
		steps = installPlugin( { step: 'installPlugin', url: 'friends', permalink: true } ).toV1().concat( steps );
	}
	(steps as any).landingPage = '/friends/?refresh&welcome';
	return steps;
		},

		toV2(): V2SchemaFragments {
			const v1Steps = this.toV1();
			if (v1Steps.length === 0) {
				return {};
			}
			return {
				additionalSteps: v1Steps
			};
		}
	};
};

importFriendFeeds.description = "Add subscriptions to the Friends plugin.";
importFriendFeeds.vars = [
	{
		name: "opml",
		description: "An OPML file, or a list of RSS feed URLs, one per line.",
		type: "textarea",
		language: "markup",
		required: true,
		samples: [ "", 'https://alex.kirk.at Alex Kirk', '<?xml version="1.0" encoding="utf-8"?><opml version="2.0"><head><title>Alex Kirk&#039; Subscriptions</title></head><body><outline text="Feeds"><outline text="Alex Kirk" htmlUrl="https://alex.kirk.at/" title="Alex Kirk" type="rss" xmlUrl="https://alex.kirk.at/feed/"/></outline></body></opml>' ]
	}
];