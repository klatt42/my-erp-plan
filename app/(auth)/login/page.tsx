import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in - My-ERP-Plan",
  description: "Sign in to your My-ERP-Plan account",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
