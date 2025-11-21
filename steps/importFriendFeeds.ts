import type { StepFunction, ImportFriendFeedsStep, StepResult, StepLibraryBlueprintDeclaration } from './types.js';
import type { BlueprintV1Declaration } from '@wp-playground/blueprints';
import { v1ToV2Fallback } from './types.js';


export const importFriendFeeds: StepFunction<ImportFriendFeedsStep> = (step: ImportFriendFeedsStep): StepResult => {
	return {
		toV1() {
			let opml = step.opml || '';
			let phpCode = '';

			if (!opml.match(/<opml/)) {
				const feeds = opml.split('\n').map(line => {
					if (!line) {
						return null;
					}
					const parts = line.split(/\s+/);
					const urls = parts.filter(part => part.match(/^https?:\/\//));
					if (urls.length === 0) {
						return null;
					}
					let title = line.replace(urls.join(' '), '').trim();
					const url = urls.length === 1 ? urls[0] : urls[1];
					const htmlUrl = urls[0];
					if (!title) {
						title = htmlUrl.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9]+/g, ' ').trim();
					}

					return {
						title: title.replace(/\\/g, '\\\\').replace(/'/g, "\\'"),
						url: url,
						htmlUrl: htmlUrl
					};
				}).filter(feed => feed !== null);

				const feedsArrayPhp = feeds.map(feed =>
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

			const result: BlueprintV1Declaration = {
				steps: [
					{
						"step": "runPHP",
						"code": phpCode,
						"progress": {
							"caption": "Importing feeds to Friends plugin"
						}
					}
				],
				landingPage: '/friends/?refresh&welcome'
			};
			return result;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
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
		samples: ["", 'https://alex.kirk.at Alex Kirk', '<?xml version="1.0" encoding="utf-8"?><opml version="2.0"><head><title>Alex Kirk&#039; Subscriptions</title></head><body><outline text="Feeds"><outline text="Alex Kirk" htmlUrl="https://alex.kirk.at/" title="Alex Kirk" type="rss" xmlUrl="https://alex.kirk.at/feed/"/></outline></body></opml>']
	}
];