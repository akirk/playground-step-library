import type { StepFunction, InstallAdminerStep , StepResult } from './types.js';
import { v1ToV2Fallback } from './types.js';

export const installAdminer: StepFunction<InstallAdminerStep> = (step: InstallAdminerStep): StepResult => {
	return {
		toV1() {
	const steps: any = [
		{
			"step": "mkdir",
			"path": "/wordpress/wp-content/mu-plugins",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/wp-content/mu-plugins/adminer-link.php",
			"data": `<?php
add_action( 'admin_bar_menu', function( WP_Admin_Bar $wp_menu ) {
    $wp_menu->add_node(
            array(
                    'id'     => 'adminer',
                    'title'  => 'Adminer',
                    'href'   => '/adminer/?sqlite=&username=&db=%2Fwordpress%2Fwp-content%2Fdatabase%2F.ht.sqlite',
            )
);
}, 100 );`
		},
		{
			"step": "mkdir",
			"path": "/wordpress/adminer",
		},
		{
			"step": "writeFile",
			"path": "/wordpress/adminer/index.php",
			"data": `<?php
function adminer_object() {
    class AdminerLoginPasswordLess extends Adminer\\Plugin {
        function login( $login, $password ) {
            return true;
        }

        function head() {
            echo '<style>
                body { margin-top: 32px !important; }
                #wp-admin-bar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 32px;
                    background: #23282d;
                    z-index: 99999;
                    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
                }
                #wp-admin-bar a {
                    color: #a7aaad;
                    text-decoration: none;
                    padding: 0 15px;
                    line-height: 32px;
                    display: inline-block;
                    font-size: 13px;
                }
                #wp-admin-bar a:hover {
                    color: #00b9eb;
                    background: rgba(255,255,255,0.05);
                }
            </style>';
        }

        function loginForm() {
            echo '<div id="wp-admin-bar">
                <a href="/wp-admin/" class="wp-logo">← WordPress Admin</a>
            </div>';
        }

        function homepage() {
            echo '<div id="wp-admin-bar homepage">
                <a href="/wp-admin/" class="wp-logo">← WordPress Admin</a>
            </div>';
        }
    }
    return new Adminer\\Plugins( array( new AdminerLoginPasswordLess() ) );
}
require '/wordpress/adminer/adminer.php';`
		},
		{
			"step": "writeFile",
			"path": "/wordpress/adminer/adminer.php",
			"data": {
				"resource": "url",
				"url": "https://github.com/vrana/adminer/releases/download/v5.3.0/adminer-5.3.0-en.php"
			}
		}
	];
	return steps;
		},

		toV2() {
			return v1ToV2Fallback(this.toV1());
		};
	};
};

installAdminer.description = "Install Adminer with auto login link.";
installAdminer.vars = [];