customSteps.importFriendFeeds = function( step, blueprint ) {
	let opml = step.vars.opml;
	if ( ! opml.match(/<opml/) ) {
		opml = `<?xml version="1.0" encoding="utf-8"?><opml version="2.0">
	<head>
		<title>Subscriptions</title>
	</head>
	<body>
		<outline text="Subscriptions" title="Subscriptions">
			${opml.split('\n').map( line => {
				if ( ! line ) {
					return '';
				}
				const parts = line.split(/\s+/);
				const url = parts.shift();
				const title = (parts.join( ' ' ) || url).replace(/https?:\/\//, '').replace(/\/$/, '');
				return `<outline type="rss" text="${title}" title="${title}" xmlUrl="${url}" htmlUrl="${url}" />`;
			} ).join('\n')}
		</outline>
	</body>
</opml>`;
	}
	opml = opml.replace(/\"/g, '\\"');
	let steps = [
		{
			"step": "runPHP",
			"code": `
<?php require_once 'wordpress/wp-load.php';
if ( class_exists('Friends\\Import')) {
Friends\\Import::opml("${opml}");
}
	`
		}
	];
	let hasFriendsPlugin = false;
	let hasCorsProxy = false;
	for ( const i in blueprint.steps ) {
		if ( blueprint.steps[i].step === 'installPlugin' && blueprint.steps[i]?.vars?.plugin === 'friends' ) {
			hasFriendsPlugin = true;
		}
		if ( blueprint.steps[i].step === 'githubPlugin' && blueprint.steps[i]?.vars?.repo === 'akirk/friends' ) {
			hasFriendsPlugin = true;
		}
		if ( blueprint.steps[i].step === 'addCorsProxy' ) {
			hasCorsProxy = true;
		}
	}
	if ( ! hasFriendsPlugin ) {
		steps = customSteps.installPlugin( { vars: { plugin: 'friends', permalink: true }} ).concat( steps );
	}
	if ( ! hasCorsProxy ) {
		steps = customSteps.addCorsProxy( {} ).concat( steps );
		steps.features = {
			networking: true
		};
	}
	return steps;
};
customSteps.importFriendFeeds.info = "Add subscriptions to the Friends plugin.";
customSteps.importFriendFeeds.vars = [
	{
		"name": "opml",
		"description": "An OPML file, or a list of RSS feed URLs, one per line.",
		"type": "textarea",
		"required": true,
		"samples": [ "", 'https://alex.kirk.at Alex Kirk', '<?xml version="1.0" encoding="utf-8"?><opml version="2.0"><head><title>Alex Kirk&#039; Subscriptions</title></head><body><outline text="Feeds"><outline text="Alex Kirk" htmlUrl="https://alex.kirk.at/" title="Alex Kirk" type="rss" xmlUrl="https://alex.kirk.at/feed/"/></outline></body></opml>' ]
	}
];
