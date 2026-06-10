<?php
defined( 'ABSPATH' ) || exit;

/**
 * Gravity Forms integration.
 * Fires after Gravity Forms has validated and saved a submission.
 */
class FormRelay_GravityForms {

	public static function init() {
		add_action( 'gform_after_submission', array( __CLASS__, 'on_submission' ), 10, 2 );
	}

	/**
	 * @param array $entry  The entry object just saved.
	 * @param array $form   The form object.
	 */
	public static function on_submission( $entry, $form ) {
		$flat = array();

		foreach ( $form['fields'] as $field ) {
			$field_id = $field->id;
			$label    = sanitize_key( $field->label ?? 'field_' . $field_id );

			if ( $field->type === 'name' || $field->type === 'address' ) {
				// Multi-part fields: concatenate non-empty inputs.
				$parts = array();
				foreach ( $field->inputs as $input ) {
					$part_value = rgar( $entry, (string) $input['id'] );
					if ( $part_value !== '' && $part_value !== null ) {
						$parts[] = $part_value;
					}
				}
				$flat[ $label ] = implode( ' ', $parts );
			} elseif ( $field->type === 'checkbox' ) {
				// Checkbox: collect all checked values.
				$checked = array();
				foreach ( $field->inputs as $input ) {
					$val = rgar( $entry, (string) $input['id'] );
					if ( $val !== '' && $val !== null ) {
						$checked[] = $val;
					}
				}
				$flat[ $label ] = implode( ', ', $checked );
			} else {
				$flat[ $label ] = (string) rgar( $entry, (string) $field_id );
			}
		}

		$source_url = rgar( $entry, 'source_url' );

		FormRelay_Sender::send( $flat, $source_url );
	}
}
