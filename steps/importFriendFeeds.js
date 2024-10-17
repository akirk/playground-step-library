customSteps.importFriendFeeds = function( step ) {
	let opml = step.vars.opml;
	// if it's a list of links, generate the opml file
	// if it's an opml file, use it

	if ( !opml.match(/<opml/) ) {
		opml = `<?xml version="1.0" encoding="utf-8"?><opml version="2.0">
	<head>
		<title>Subscriptions</title>
	</head>
	<body>
		<outline text="Subscriptions" title="Subscriptions">
			${opml.split('\n').map( line => {
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
	return [
		{
			"step": "runPHP",
			"code": `
<?php require_once 'wordpress/wp-load.php';
if ( class_exists('Friends\\Import')) {
Friends\\Import::opml("${opml}");
do_action( 'cron_friends_refresh_feeds' );
}
	`
		}
	];
};
customSteps.importFriendFeeds.info = "Provide useful additional info.";
customSteps.importFriendFeeds.vars = [
	{
		"name": "opml",
		"description": "An OPML file, or a list of RSS feed URLs, one per line.",
		"type": "textarea",
		"required": true,
		"samples": [ "", 'https://alex.kirk.at Alex Kirk' ]
	}
];
