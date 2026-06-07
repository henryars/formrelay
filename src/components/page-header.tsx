import { cn } from "@/lib/utils";

type PageHeaderProps = {
  label?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({ label, title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        {label && (
          <p className="text-xs font-medium uppercase tracking-widest text-[#0098f2] mb-1">{label}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-[#09090b]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#71717a]">{description}</p>
        )}
      </div>
      {children && <div className="mt-4 flex items-center gap-2 sm:mt-0">{children}</div>}
    </div>
  );
}
