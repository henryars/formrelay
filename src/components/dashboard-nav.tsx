import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/onboarding", label: "Onboarding" },
  { href: "/dashboard/websites", label: "Websites" },
  { href: "/dashboard/websites/new", label: "Add website" },
  { href: "/dashboard/forms", label: "Forms" },
  { href: "/dashboard/forms/new", label: "Create form" },
  { href: "/dashboard/submissions", label: "Submissions" },
  { href: "/dashboard/spam", label: "Spam" },
  { href: "/dashboard/security", label: "Security" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardNav() {
  return (
    <nav className="flex flex-wrap gap-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-full border border-stone-edge/35 bg-white px-4 py-2 text-sm font-medium text-midnight-ink"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
