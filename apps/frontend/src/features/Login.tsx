import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/api/auth/queries";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoggingIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    login(
      { email, password },
      {
        onSuccess: () => {
          toast.success('Welcome back!');
          navigate('/dashboard');
        },
        onError: (error) => {
          console.error(error);
          toast.error(error.message || 'Invalid credentials');
        },
      }
    );
  };

  return (
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
          <h1 className="mb-2 text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            {'Sign in to continue to Workstack'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-xl flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="demo@workstack.app"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full"
            >
              {isLoggingIn ? 'Please wait...' : 'Sign in'}
            </Button>
          </form>

          <Separator />

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-center text-xs">Demo Account</p>
            <div className="flex flex-col gap-1 bg-muted border border-border rounded p-2">
              <p className="text-muted-foreground text-xs">Email: <span className="font-medium">demo@workstack.app</span></p>
              <p className="text-muted-foreground text-xs">Password: <span className="font-medium">demo@123</span></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Login;
