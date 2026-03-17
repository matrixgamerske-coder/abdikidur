import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(160 100% 50% / 0.1) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 60, -40, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(280 100% 60% / 0.1) 0%, transparent 70%)",
          }}
        />
        <motion.div
          animate={{
            x: [0, 50, -80, 0],
            y: [0, -60, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(200 100% 55% / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Glitch title */}
          <div className="space-y-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6"
            >
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-ui text-sm font-semibold text-primary tracking-wider">
                NEXT-GEN GAMING STORE
              </span>
            </motion.div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black leading-none tracking-tight">
              <span className="neon-text text-primary">MATRIX</span>
              <br />
              <span className="text-foreground">GAMERS</span>
              <br />
              <span className="neon-text-purple text-secondary">ARENA</span>
            </h1>
          </div>

          <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter the arena. Discover, purchase, and download the hottest games
            across PC, PlayStation, and Mobile — all in one electrifying hub.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/games">
              <Button
                size="lg"
                className="font-ui text-lg font-bold px-8 py-6 neon-border group"
              >
                Browse Games
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button
                size="lg"
                variant="outline"
                className="font-ui text-lg font-bold px-8 py-6 border-secondary/50 text-secondary hover:bg-secondary/10 hover:neon-border-purple"
              >
                Join the Arena
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Floating game cards preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 flex justify-center gap-4"
        >
          {[
            { color: "from-neon-green/20 to-transparent", delay: 0 },
            { color: "from-neon-purple/20 to-transparent", delay: 0.5 },
            { color: "from-neon-blue/20 to-transparent", delay: 1 },
          ].map((card, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, delay: card.delay, repeat: Infinity, ease: "easeInOut" }}
              className={`w-32 sm:w-44 h-48 sm:h-64 rounded-lg bg-gradient-to-b ${card.color} border border-border/50 backdrop-blur-sm`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
