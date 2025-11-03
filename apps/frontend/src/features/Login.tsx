import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckSquare, AlertCircle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/api/auth/queries";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useErrorHandler } from "@/components/ErrorBoundary";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const { login, isLoggingIn, loginError } = useAuth();
  const { handleError } = useErrorHandler();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      login(
        { email, password },
        {
          onSuccess: () => {
            toast.success("Welcome back!");
            navigate("/dashboard");
          },
          onError: (error) => {
            handleError(error, "Login");
            toast.error(error.message || "Invalid credentials");
          },
        },
      );
    } catch (error) {
      handleError(error as Error, "Login form submission");
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-w-screen min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                <CheckSquare className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-foreground text-2xl">Workstack</span>
            </div>
            <h1 className="mb-2 text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              {"Sign in to continue to Workstack"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 shadow-xl flex flex-col gap-4">
            {loginError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-destructive text-sm">{loginError.message}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="Enter your email"
                  required
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-destructive text-sm"
                    role="alert"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="Enter your password"
                    required
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-destructive text-sm"
                    role="alert"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoggingIn}
                className="w-full"
                aria-describedby="login-status"
              >
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
              <div id="login-status" className="sr-only" aria-live="polite">
                {isLoggingIn ? "Signing in, please wait" : "Ready to sign in"}
              </div>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                If you don't have an account, use these demo credentials:
              </p>
              <div className="mt-2 inline-block text-left text-xs text-muted-foreground px-2 py-1 border rounded-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium w-16">email:</span>{" "}
                  <code className="bg-transparent text-muted-foreground">
                    demo@workstack.app
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium w-16">password:</span>{" "}
                  <code className="bg-transparent text-muted-foreground">
                    demo@123
                  </code>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
};

export default Login;
