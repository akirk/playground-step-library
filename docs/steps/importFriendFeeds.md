# `importFriendFeeds` Step

Add subscriptions to the Friends plugin.

🚀 **[Use this step in the Step Library Web UI](https://akirk.github.io/playground-step-library/?step[0]=importFriendFeeds)**

[View Source](../../steps/importFriendFeeds.ts) to understand how this step is implemented.

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Variables

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `opml` | textarea | ✅ Yes | An OPML file, or a list of RSS feed URLs, one per line. |


## Examples

### Basic Usage
```json
    {
          "step": "importFriendFeeds",
          "vars": {
                "opml": "https://alex.kirk.at Alex Kirk"
          }
    }
```

## Compiled Output

### Blueprint V1

```json
{
  "landingPage": "/friends/?refresh&welcome",
  "steps": [
    {
      "step": "runPHP",
      "code": "<?php require_once '/wordpress/wp-load.php';if(class_exists('Friends\\Import...",
      "progress": {
        "caption": "Importing feeds to Friends plugin"
      }
    }
  ]
}
```

### Blueprint V2

```json
{
  "version": 2,
  "additionalStepsAfterExecution": [
    {
      "step": "runPHP",
      "code": {
        "filename": "code.php",
        "content": " <?php require_once '/wordpress/wp-load.php';if(class_exists('Friends\\Import')){$feeds=array();$x=new SimpleXMLElement('<opml/>');$a='addAttribute';$c='addChild';$x->$a('version','2.0');$h=$x->$c('head');$h->$c('title','Subscriptions');$b=$x->$c('body');$s=$b->$c('outline');$s->$a('text','Subscriptions');$s->$a('title','Subscriptions');foreach($feeds as $f){list($u,$t)=$f;$o=$s->$c('outline');$o->$a('type','rss');$o->$a('text',$t);$o->$a('title',$t);$o->$a('xmlUrl',$u);$o->$a('htmlUrl',$u);}Friends\\Import::opml($x->asXML());}"
      },
      "progress": {
        "caption": "Importing feeds to Friends plugin"
      }
    }
  ],
  "applicationOptions": {
    "wordpress-playground": {
      "landingPage": "/friends/?refresh&welcome"
    }
  }
}
```

## Usage with Library

```javascript
const PlaygroundStepLibrary = require('playground-step-library');
const compiler = new PlaygroundStepLibrary();

const blueprint = {
  steps: [
        {
          "step": "importFriendFeeds",
          "vars": {
                "opml": "https://alex.kirk.at Alex Kirk"
          }
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

