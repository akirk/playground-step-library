# `importFriendFeeds` Step

Add subscriptions to the Friends plugin.

**[View Source](../../steps/importFriendFeeds.ts)**

## Type
⚡ **Custom Step**

**Compiles to:** [`runPHP`](../builtin-step-usage.md#runphp)

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `opml` | textarea | ✅ Yes | An OPML file, or a list of RSS feed URLs, one per line. |


## Examples

### Basic Usage
```json
    {
          "step": "importFriendFeeds",
          "opml": ""
    }
```

## Compiled Output

### V1 (Imperative)

```json
{
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

### V2 (Declarative)

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
          "opml": ""
    }
  ]
};

const compiled = compiler.compile(blueprint);
```

