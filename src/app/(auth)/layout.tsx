import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold text-[#0d111b]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0098f2]">
            <Zap className="h-4 w-4 text-white" />
          </span>
          FormRelay
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>
      <footer className="px-6 py-4 text-center text-xs text-[#a1a1aa]">
        &copy; {new Date().getFullYear()} FormRelay
      </footer>
    </div>
  );
}
