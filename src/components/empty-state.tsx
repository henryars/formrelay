import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    href: string;
    primary?: boolean;
  }>;
}

export function EmptyState({ icon: Icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#ececee] bg-white/50 py-16 px-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f4f4f5]">
        <Icon className="h-6 w-6 text-[#a1a1aa]" />
      </div>
      <p className="text-base font-bold text-[#09090b]">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-[1.65] text-[#71717a]">{description}</p>
      {actions && actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                action.primary
                  ? "inline-flex items-center gap-1.5 rounded-full bg-[#09090b] px-5 py-2.5 text-sm font-semibold text-white"
                  : "inline-flex items-center gap-1.5 rounded-full border border-[#d4d4d8] bg-white px-5 py-2.5 text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors"
              }
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
