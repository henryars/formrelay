<?php
defined( 'ABSPATH' ) || exit;

use ElementorPro\Modules\Forms\Classes\Action_Base;
use ElementorPro\Modules\Forms\Classes\Form_Record;
use ElementorPro\Modules\Forms\Classes\Ajax_Handler;

class FormRelay_Elementor_Action extends Action_Base {

	public function get_name(): string {
		return 'formrelay';
	}

	public function get_label(): string {
		return esc_html__( 'FormRelay', 'formrelay-elementor' );
	}

	/**
	 * Render the action's settings panel inside the Elementor Form widget.
	 */
	public function register_settings_section( $widget ) {
		$widget->start_controls_section(
			'section_formrelay',
			array(
				'label'     => esc_html__( 'FormRelay', 'formrelay-elementor' ),
				'condition' => array(
					'submit_actions' => $this->get_name(),
				),
			)
		);

		$widget->add_control(
			'formrelay_endpoint_url',
			array(
				'label'       => esc_html__( 'Endpoint URL', 'formrelay-elementor' ),
				'type'        => \Elementor\Controls_Manager::TEXT,
				'input_type'  => 'url',
				'placeholder' => 'https://formrelay.app/f/fm_xxxxxxxx',
				'description' => esc_html__( 'Paste your FormRelay endpoint URL. Find it on the form\'s detail page in your FormRelay dashboard.', 'formrelay-elementor' ),
				'label_block' => true,
			)
		);

		$widget->end_controls_section();
	}

	public function on_export( $component ) {}

	/**
	 * Run after Elementor validates the form and fires all other actions.
	 */
	public function run( $record, $ajax_handler ) {
		$settings = $record->get( 'form_settings' );
		$endpoint = trim( $settings['formrelay_endpoint_url'] ?? '' );

		if ( empty( $endpoint ) ) {
			return;
		}

		$raw_fields = $record->get( 'fields' );
		$fields     = array();

		foreach ( $raw_fields as $id => $field ) {
			$label          = sanitize_key( $field['title'] ?: $id );
			$fields[ $label ] = is_array( $field['value'] )
				? implode( ', ', $field['value'] )
				: (string) $field['value'];
		}

		// Attach the page URL for source tracking.
		$fields['_source_url'] = sanitize_url( wp_get_referer() ?: '' );

		$response = wp_remote_post( $endpoint, array(
			'timeout'     => 10,
			'redirection' => 0,
			'headers'     => array(
				'Content-Type' => 'application/x-www-form-urlencoded',
				'X-Source'     => 'elementor-plugin/' . FORMRELAY_ELEMENTOR_VERSION,
			),
			'body'        => $fields,
		) );

		if ( is_wp_error( $response ) ) {
			error_log( '[FormRelay] Delivery failed: ' . $response->get_error_message() );
		}
	}
}
