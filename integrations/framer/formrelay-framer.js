/**
 * FormRelay — Framer Integration
 *
 * Usage (Framer Code Override):
 *   1. In Framer, open the Assets panel → Code → + New File
 *   2. Paste this file's contents.
 *   3. Replace ENDPOINT_URL with your FormRelay endpoint URL.
 *   4. Apply the `withFormRelay` override to your Form component.
 *
 * The override intercepts the form's submit event, serialises all fields,
 * and POSTs them to your FormRelay endpoint instead of (or in addition to)
 * Framer's built-in form handler.
 */

import { addPropertyControls, ControlType } from "framer"

const ENDPOINT_URL = "https://formrelay.app/f/fm_xxxxxxxx" // ← replace this

// ---------------------------------------------------------------------------
// Core sender — works for any plain HTML <form> on the page as well.
// ---------------------------------------------------------------------------

/**
 * Sends form fields to FormRelay.
 *
 * @param {Record<string, string>} fields
 * @returns {Promise<boolean>}
 */
export async function sendToFormRelay(fields, endpointUrl = ENDPOINT_URL) {
    const body = new URLSearchParams()

    for (const [key, value] of Object.entries(fields)) {
        if (value !== "" && value !== null && value !== undefined) {
            body.append(key, String(value))
        }
    }

    // Always include the current page URL for source tracking.
    body.append("_source_url", window.location.href)

    const res = await fetch(endpointUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "X-Source": "framer-integration/1.0.0",
        },
        body: body.toString(),
    })

    return res.ok
}

// ---------------------------------------------------------------------------
// Framer Code Override — wraps a Form component.
// ---------------------------------------------------------------------------

/**
 * Apply this override to a Framer Form component to forward its submissions
 * to FormRelay.
 *
 * Properties are editable in the Framer properties panel:
 *   - Endpoint URL  (overrides the constant above per-component)
 *   - On success    ("redirect" | "message")
 *   - Redirect URL  (used when On success = "redirect")
 *   - Success message
 */
export function withFormRelay(Component) {
    return function FormRelayWrapper(props) {
        const {
            framerEndpointUrl = ENDPOINT_URL,
            framerOnSuccess = "message",
            framerRedirectUrl = "",
            framerSuccessMessage = "Thanks! Your message has been sent.",
            ...rest
        } = props

        async function handleSubmit(event) {
            event.preventDefault()

            const form = event.currentTarget
            const data = new FormData(form)
            const fields = {}

            for (const [key, value] of data.entries()) {
                if (typeof value === "string") {
                    fields[key] = value
                }
            }

            try {
                const ok = await sendToFormRelay(fields, framerEndpointUrl)

                if (ok) {
                    if (framerOnSuccess === "redirect" && framerRedirectUrl) {
                        window.location.href = framerRedirectUrl
                    } else {
                        // Swap the form for a success message.
                        form.style.display = "none"
                        const msg = document.createElement("p")
                        msg.textContent = framerSuccessMessage
                        msg.style.cssText =
                            "margin:0;font-size:inherit;color:inherit;text-align:center;"
                        form.parentNode?.insertBefore(msg, form)
                    }
                } else {
                    console.error("[FormRelay] Submission failed.")
                }
            } catch (err) {
                console.error("[FormRelay] Network error:", err)
            }
        }

        return (
            <Component
                {...rest}
                onSubmit={handleSubmit}
            />
        )
    }
}

addPropertyControls(withFormRelay, {
    framerEndpointUrl: {
        type: ControlType.String,
        title: "Endpoint URL",
        defaultValue: ENDPOINT_URL,
        placeholder: "https://formrelay.app/f/fm_xxxxxxxx",
    },
    framerOnSuccess: {
        type: ControlType.Enum,
        title: "On success",
        defaultValue: "message",
        options: ["message", "redirect"],
        optionTitles: ["Show message", "Redirect"],
    },
    framerSuccessMessage: {
        type: ControlType.String,
        title: "Success message",
        defaultValue: "Thanks! Your message has been sent.",
        hidden: (props) => props.framerOnSuccess !== "message",
    },
    framerRedirectUrl: {
        type: ControlType.String,
        title: "Redirect URL",
        defaultValue: "",
        placeholder: "https://your-site.com/thank-you",
        hidden: (props) => props.framerOnSuccess !== "redirect",
    },
})
