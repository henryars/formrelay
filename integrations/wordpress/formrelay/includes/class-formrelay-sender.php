<?php
defined( 'ABSPATH' ) || exit;

class FormRelay_Sender {

	/**
	 * Forward an array of fields to the configured FormRelay endpoint.
	 *
	 * @param array  $fields      Flat key/value pairs from the form submission.
	 * @param string $source_url  The page URL the form was submitted from (optional).
	 */
	public static function send( array $fields, string $source_url = '' ): bool {
		if ( ! FormRelay_Settings::is_enabled() ) {
			return false;
		}

		$endpoint = FormRelay_Settings::get_endpoint_url();

		if ( empty( $endpoint ) ) {
			return false;
		}

		// Remove empty values so they don't inflate field counts on the server.
		$fields = array_filter( $fields, fn( $v ) => $v !== '' && $v !== null );

		if ( $source_url ) {
			$fields['_source_url'] = $source_url;
		}

		$response = wp_remote_post( $endpoint, array(
			'timeout'     => 10,
			'redirection' => 0,
			'headers'     => array(
				'Content-Type' => 'application/x-www-form-urlencoded',
				'X-Source'     => 'wordpress-plugin/' . FORMRELAY_VERSION,
			),
			'body'        => $fields,
		) );

		if ( is_wp_error( $response ) ) {
			error_log( '[FormRelay] Delivery failed: ' . $response->get_error_message() );
			return false;
		}

		$status = wp_remote_retrieve_response_code( $response );
		if ( $status !== 200 ) {
			error_log( '[FormRelay] Unexpected status ' . $status . ' from endpoint.' );
			return false;
		}

		return true;
	}
}
