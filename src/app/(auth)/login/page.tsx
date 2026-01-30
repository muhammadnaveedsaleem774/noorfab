import { LoginForm } from "@/components/shared/LoginForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Sign in</h1>
      <LoginForm />
    </div>
  );
}
