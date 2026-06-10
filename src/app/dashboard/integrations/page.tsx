import { Puzzle } from "lucide-react";
import { IntegrationCard } from "@/components/integration-card";

export const metadata = { title: "Integrations — FormRelay" };

export type Integration = {
  id: string;
  name: string;
  logoId: string;
  tagline: string;
  description: string;
  type: "plugin" | "snippet" | "docs";
  downloadSlug?: string;
  steps: string[];
  supports?: string[];
};

const integrations: Integration[] = [
  {
    id: "wordpress",
    name: "WordPress",
    logoId: "wordpress",
    tagline: "Contact Form 7, WPForms & Gravity Forms",
    description:
      "Install the FormRelay plugin and every supported form on your site automatically forwards submissions — no code changes needed.",
    type: "plugin",
    downloadSlug: "wordpress",
    steps: [
      "Download the FormRelay plugin zip below.",
      "In your WordPress admin go to Plugins → Add New → Upload Plugin.",
      "Upload the zip, install, and activate.",
      "Go to Settings → FormRelay and paste your form's Endpoint URL.",
      "Submit a test message — it appears in your FormRelay inbox instantly.",
    ],
    supports: ["Contact Form 7", "WPForms", "Gravity Forms"],
  },
  {
    id: "elementor",
    name: "Elementor",
    logoId: "elementor",
    tagline: "Elementor Pro Form widget",
    description:
      "Adds a native FormRelay action to Elementor's Form widget. Set a different endpoint per form — no shared config required.",
    type: "plugin",
    downloadSlug: "elementor",
    steps: [
      "Download the FormRelay for Elementor plugin zip below.",
      "Upload and activate it in WordPress (Plugins → Add New → Upload).",
      "Edit any page in Elementor, open a Form widget, and go to Actions After Submit.",
      'Add the "FormRelay" action — a new settings section appears.',
      "Paste your form's Endpoint URL and publish. Done.",
    ],
    supports: ["Elementor Pro"],
  },
  {
    id: "framer",
    name: "Framer",
    logoId: "framer",
    tagline: "Code override or native webhook",
    description:
      "Two ways to connect: paste your endpoint URL directly into Framer's Form webhook field, or use the Code Override for full control over success states.",
    type: "snippet",
    steps: [
      'Select your Form component in Framer and open the "Interactions" panel.',
      'Set the Submit action to "Send to URL" and paste your Endpoint URL.',
      "Publish your site — submissions go straight to your FormRelay inbox.",
      "Optional: use the Code Override in Assets → Code for custom success messages or redirects.",
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    logoId: "webflow",
    tagline: "Native form webhook",
    description:
      "Webflow's built-in form webhook sends submissions directly to any URL. Point it at your FormRelay endpoint — no plugin needed.",
    type: "docs",
    steps: [
      "Select your Form block in the Webflow designer.",
      'Open Form Settings and enable "Send form data to a webhook URL".',
      "Paste your FormRelay Endpoint URL.",
      "Publish and test — your submissions will appear in the inbox.",
    ],
  },
  {
    id: "wix",
    name: "Wix",
    logoId: "wix",
    tagline: "Wix Forms + Velo webhook",
    description:
      "Use Wix Velo to forward form submissions via a fetch call in the wixForms.onFormSubmit hook.",
    type: "docs",
    steps: [
      "Enable Velo in your Wix site (Dev Mode toggle).",
      "Open the Events & Hooks panel and add a handler for your form's onSubmit event.",
      "Use fetch to POST the form fields to your FormRelay Endpoint URL.",
      "Publish and submit a test entry to confirm delivery.",
    ],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    logoId: "squarespace",
    tagline: "Code injection snippet",
    description:
      "Squarespace doesn't expose native webhooks, but a small code injection script intercepts your form's submit event and mirrors it to FormRelay.",
    type: "docs",
    steps: [
      "Copy your FormRelay Endpoint URL from the form detail page.",
      "In Squarespace go to Settings → Advanced → Code Injection.",
      "Paste the script snippet into the Footer section.",
      "Save and publish, then test your form.",
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="px-5 py-8 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Integrations</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-[#09090b]">Connect your platform</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Pick your website builder or CMS — each one has step-by-step instructions and any required downloads.
        </p>
      </div>

      {/* Plugin downloads — hero row */}
      <div className="grid gap-5 sm:grid-cols-2">
        {integrations
          .filter((i) => i.type === "plugin")
          .map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} featured />
          ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ececee]" />
        <span className="text-xs font-medium text-[#a1a1aa] flex items-center gap-1.5">
          <Puzzle className="h-3.5 w-3.5" />
          No plugin needed
        </span>
        <div className="h-px flex-1 bg-[#ececee]" />
      </div>

      {/* Snippet / docs integrations */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {integrations
          .filter((i) => i.type !== "plugin")
          .map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
      </div>
    </div>
  );
}
