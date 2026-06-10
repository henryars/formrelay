<?php
defined( 'ABSPATH' ) || exit;

/**
 * WPForms integration.
 * Fires after WPForms has processed and validated a submission.
 */
class FormRelay_WPForms {

	public static function init() {
		add_action( 'wpforms_process_complete', array( __CLASS__, 'on_submission' ), 10, 4 );
	}

	/**
	 * @param array $fields     Processed field data (keyed by field ID).
	 * @param array $entry      Raw posted data.
	 * @param array $form_data  Form settings.
	 * @param int   $entry_id   Saved entry ID (0 if entries disabled).
	 */
	public static function on_submission( $fields, $entry, $form_data, $entry_id ) {
		$flat = array();

		foreach ( $fields as $field ) {
			$label = sanitize_key( $field['name'] ?? 'field_' . $field['id'] );
			$value = $field['value'] ?? '';
			$flat[ $label ] = is_array( $value ) ? implode( ', ', $value ) : (string) $value;
		}

		$source_url = sanitize_url( $entry['page_url'] ?? '' );

		FormRelay_Sender::send( $flat, $source_url );
	}
}
