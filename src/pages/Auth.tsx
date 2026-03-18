import { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Gamepad2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import MatrixRain from "@/components/MatrixRain";
import Navbar from "@/components/Navbar";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp && !acceptedTerms) {
      setError("You must accept the Terms & Conditions and Privacy Policy to create an account.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl border border-border p-8 neon-border">
            <div className="text-center mb-8">
              <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-foreground">
                {isSignUp ? "JOIN THE ARENA" : "WELCOME BACK"}
              </h1>
              <p className="font-body text-sm text-muted-foreground mt-2">
                {isSignUp ? "Create your gamer account" : "Sign in to your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-ui text-sm font-semibold text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your gamer tag"
                    required={isSignUp}
                    className="bg-muted/50 border-border focus:neon-border font-body"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-ui text-sm font-semibold text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gamer@arena.com"
                  required
                  className="bg-muted/50 border-border focus:neon-border font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-ui text-sm font-semibold text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="bg-muted/50 border-border focus:neon-border font-body pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions checkbox - only on signup */}
              {isSignUp && (
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="font-body text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>,{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{" "}
                    <span className="text-primary">Acceptable Use Policy</span>.
                  </label>
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-destructive text-sm font-body"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-ui text-base font-bold py-6 neon-border"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSignUp ? (
                  "CREATE ACCOUNT"
                ) : (
                  "ENTER ARENA"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); setAcceptedTerms(false); }}
                className="font-body text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Join now"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
