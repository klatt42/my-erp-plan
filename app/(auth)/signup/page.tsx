import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "Sign up - My-ERP-Plan",
  description: "Create your My-ERP-Plan account",
};

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">
          Get started with your emergency planning
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
