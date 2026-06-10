<?php
defined( 'ABSPATH' ) || exit;

/**
 * Contact Form 7 integration.
 * Fires after CF7 has validated and is about to send its own email.
 */
class FormRelay_CF7 {

	public static function init() {
		// wpcf7_mail_sent fires only on successful validation, after CF7 sends its own email.
		add_action( 'wpcf7_mail_sent', array( __CLASS__, 'on_submission' ) );
	}

	public static function on_submission( $contact_form ) {
		$submission = WPCF7_Submission::get_instance();

		if ( ! $submission ) {
			return;
		}

		$posted = $submission->get_posted_data();
		$unit_tag = $submission->get_unit_tag();

		// Strip internal CF7 meta keys (prefixed with _).
		$fields = array();
		foreach ( $posted as $key => $value ) {
			if ( strpos( $key, '_' ) === 0 ) {
				continue;
			}
			// CF7 returns arrays for multi-value fields; join them.
			$fields[ $key ] = is_array( $value ) ? implode( ', ', $value ) : (string) $value;
		}

		$source_url = $submission->get_meta( 'url' ) ?? '';

		FormRelay_Sender::send( $fields, $source_url );
	}
}
