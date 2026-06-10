<?php
/**
 * Plugin Name: FormRelay for Elementor
 * Plugin URI:  https://formrelay.app
 * Description: Adds a FormRelay action to Elementor Pro's Form widget — route submissions to your FormRelay inbox.
 * Version:     1.0.0
 * Author:      FormRelay
 * Author URI:  https://formrelay.app
 * License:     GPL-2.0-or-later
 * Text Domain: formrelay-elementor
 * Requires Plugins: elementor
 */

defined( 'ABSPATH' ) || exit;

define( 'FORMRELAY_ELEMENTOR_VERSION', '1.0.0' );
define( 'FORMRELAY_ELEMENTOR_DIR', plugin_dir_path( __FILE__ ) );

add_action( 'elementor_pro/init', function () {
	require_once FORMRELAY_ELEMENTOR_DIR . 'includes/class-action-formrelay.php';

	$action = new FormRelay_Elementor_Action();
	\ElementorPro\Plugin::instance()->modules_manager->get_modules( 'forms' )->add_form_action(
		$action->get_name(),
		$action
	);
} );
