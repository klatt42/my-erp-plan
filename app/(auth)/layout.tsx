import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
      <div className="mb-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl">My-ERP-Plan</span>
        </Link>
      </div>
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
