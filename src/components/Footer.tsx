import { Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold neon-text">MATRIX ARENA</span>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-xs">
              Your ultimate destination for PC, PlayStation, and Mobile games. Enter the arena.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-foreground tracking-wider">BROWSE</h4>
            <div className="space-y-2">
              <Link to="/games?platform=PC" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">PC Games</Link>
              <Link to="/games?platform=PlayStation" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">PS Games</Link>
              <Link to="/games?platform=Mobile" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">Mobile Games</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-foreground tracking-wider">ACCOUNT</h4>
            <div className="space-y-2">
              <Link to="/auth" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">Login</Link>
              <Link to="/auth?mode=signup" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">Create Account</Link>
              <Link to="/profile" className="block font-ui text-sm text-muted-foreground hover:text-primary transition-colors">My Profile</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="font-ui text-xs text-muted-foreground">
            © {new Date().getFullYear()} Matrix Gamers Arena. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
