import type { StepFunction, SampleContentStep , StepResult, V2SchemaFragments } from './types.js';

export const sampleContent: StepFunction<SampleContentStep> = (): StepResult => {
	return {
		toV1() {
    const steps = [
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Hello Sample Content', 'post_status' => 'publish')); ?>",
            "progress": {
                "caption": "Creating sample content (1/5)"
            }
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Second Sample Content', 'post_status' => 'publish')); ?>",
            "progress": {
                "caption": "Creating sample content (2/5)"
            }
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Third Sample Content', 'post_status' => 'publish')); ?>",
            "progress": {
                "caption": "Creating sample content (3/5)"
            }
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fourth Sample Content', 'post_status' => 'publish')); ?>",
            "progress": {
                "caption": "Creating sample content (4/5)"
            }
        },
        {
            "step": "runPHP",
            "code": "<?php require_once '/wordpress/wp-load.php'; wp_insert_post(array('post_title' => 'Fifth Sample Content', 'post_status' => 'publish')); ?>",
            "progress": {
                "caption": "Creating sample content (5/5)"
            }
        }
    ];
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

sampleContent.count = 5;
sampleContent.description = "Inserts sample pages to the site.";