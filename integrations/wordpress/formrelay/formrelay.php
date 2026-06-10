<?php
/**
 * Plugin Name: FormRelay
 * Plugin URI:  https://formrelay.app
 * Description: Route WordPress form submissions to your FormRelay inbox for spam filtering, email delivery, and analytics.
 * Version:     1.0.0
 * Author:      FormRelay
 * Author URI:  https://formrelay.app
 * License:     GPL-2.0-or-later
 * Text Domain: formrelay
 */

defined( 'ABSPATH' ) || exit;

define( 'FORMRELAY_VERSION', '1.0.0' );
define( 'FORMRELAY_PLUGIN_FILE', __FILE__ );
define( 'FORMRELAY_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

require_once FORMRELAY_PLUGIN_DIR . 'includes/class-formrelay-settings.php';
require_once FORMRELAY_PLUGIN_DIR . 'includes/class-formrelay-sender.php';
require_once FORMRELAY_PLUGIN_DIR . 'includes/class-formrelay-cf7.php';
require_once FORMRELAY_PLUGIN_DIR . 'includes/class-formrelay-wpforms.php';
require_once FORMRELAY_PLUGIN_DIR . 'includes/class-formrelay-gravityforms.php';

add_action( 'plugins_loaded', function () {
	FormRelay_CF7::init();
	FormRelay_WPForms::init();
	FormRelay_GravityForms::init();
} );

register_activation_hook( __FILE__, array( 'FormRelay_Settings', 'activate' ) );
