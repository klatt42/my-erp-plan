import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Verify your email - My-ERP-Plan",
  description: "Check your email to verify your account",
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a verification link to
          {searchParams.email && (
            <span className="block font-medium text-foreground mt-2">
              {searchParams.email}
            </span>
          )}
        </p>
      </div>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to verify your account and get started.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </div>
    </div>
  );
}
