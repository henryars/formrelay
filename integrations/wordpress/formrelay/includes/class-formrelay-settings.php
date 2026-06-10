<?php
defined( 'ABSPATH' ) || exit;

class FormRelay_Settings {

	const OPTION_KEY = 'formrelay_settings';

	public static function activate() {
		add_option( self::OPTION_KEY, array(
			'endpoint_url' => '',
			'enabled'      => true,
		) );
	}

	public static function get( string $key, $default = null ) {
		$settings = get_option( self::OPTION_KEY, array() );
		return $settings[ $key ] ?? $default;
	}

	public static function get_endpoint_url(): string {
		return trim( (string) self::get( 'endpoint_url', '' ) );
	}

	public static function is_enabled(): bool {
		return (bool) self::get( 'enabled', true );
	}

	public static function init_admin() {
		add_options_page(
			__( 'FormRelay', 'formrelay' ),
			__( 'FormRelay', 'formrelay' ),
			'manage_options',
			'formrelay',
			array( __CLASS__, 'render_settings_page' )
		);
	}

	public static function register_settings() {
		register_setting(
			'formrelay_settings_group',
			self::OPTION_KEY,
			array( __CLASS__, 'sanitize_settings' )
		);

		add_settings_section(
			'formrelay_main',
			__( 'Connection', 'formrelay' ),
			null,
			'formrelay'
		);

		add_settings_field(
			'endpoint_url',
			__( 'Form Endpoint URL', 'formrelay' ),
			array( __CLASS__, 'render_endpoint_field' ),
			'formrelay',
			'formrelay_main'
		);

		add_settings_field(
			'enabled',
			__( 'Forwarding', 'formrelay' ),
			array( __CLASS__, 'render_enabled_field' ),
			'formrelay',
			'formrelay_main'
		);
	}

	public static function sanitize_settings( $input ): array {
		return array(
			'endpoint_url' => esc_url_raw( trim( $input['endpoint_url'] ?? '' ) ),
			'enabled'      => ! empty( $input['enabled'] ),
		);
	}

	public static function render_endpoint_field() {
		$value = esc_attr( self::get_endpoint_url() );
		echo '<input type="url" name="' . esc_attr( self::OPTION_KEY ) . '[endpoint_url]" value="' . $value . '" class="regular-text" placeholder="https://formrelay.app/f/fm_xxxxxxxx" />';
		echo '<p class="description">' . esc_html__( 'Paste your FormRelay endpoint URL. Find it on the form\'s detail page in the FormRelay dashboard.', 'formrelay' ) . '</p>';
	}

	public static function render_enabled_field() {
		$checked = checked( self::is_enabled(), true, false );
		echo '<label><input type="checkbox" name="' . esc_attr( self::OPTION_KEY ) . '[enabled]" value="1" ' . $checked . ' /> ' . esc_html__( 'Forward submissions to FormRelay', 'formrelay' ) . '</label>';
	}

	public static function render_settings_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'FormRelay Settings', 'formrelay' ); ?></h1>
			<p><?php echo esc_html__( 'Connect your WordPress forms to FormRelay for spam filtering, email delivery, and submission analytics.', 'formrelay' ); ?></p>
			<form method="post" action="options.php">
				<?php
				settings_fields( 'formrelay_settings_group' );
				do_settings_sections( 'formrelay' );
				submit_button( __( 'Save Settings', 'formrelay' ) );
				?>
			</form>
			<hr />
			<h2><?php echo esc_html__( 'Supported Form Plugins', 'formrelay' ); ?></h2>
			<ul style="list-style:disc;padding-left:1.5em;">
				<li>Contact Form 7</li>
				<li>WPForms</li>
				<li>Gravity Forms</li>
			</ul>
			<p><?php echo esc_html__( 'Submissions from all active, supported form plugins are automatically forwarded once an endpoint URL is saved.', 'formrelay' ); ?></p>
		</div>
		<?php
	}
}

add_action( 'admin_menu', array( 'FormRelay_Settings', 'init_admin' ) );
add_action( 'admin_init', array( 'FormRelay_Settings', 'register_settings' ) );
