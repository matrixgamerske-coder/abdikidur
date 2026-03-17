import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Star, Monitor, Gamepad2, Smartphone, Cpu, HardDrive,
  MemoryStick, MonitorCheck, Download, ShieldCheck, Loader2, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const specLabels: Record<string, string> = {
  minimum: "Minimum",
  recommended: "Recommended",
  smooth: "Ultra / Smooth",
};

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [purchasing, setPurchasing] = useState(false);

  const { data: game, isLoading } = useQuery({
    queryKey: ["game", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("games")
        .select("*, platforms(name), game_images(*), game_specs(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: purchase } = useQuery({
    queryKey: ["purchase", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_id", id)
        .eq("payment_status", "completed")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: driveLinks } = useQuery({
    queryKey: ["drive-links", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("game_drive_links")
        .select("*")
        .eq("game_id", id);
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!purchase,
  });

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase games");
      return;
    }
    setPurchasing(true);
    try {
      const { error } = await (supabase as any)
        .from("purchases")
        .insert({
          user_id: user.id,
          game_id: id,
          amount: game.price,
          payment_status: "completed",
        });
      if (error) throw error;
      toast.success("Purchase successful! Download links are now available.");
      // Refetch
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-display text-xl text-muted-foreground">Game not found</p>
      </div>
    );
  }

  const images = game.game_images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
  const specs = game.game_specs || [];
  const hasPurchased = !!purchase;

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <main className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link to="/games" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 font-ui text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Games
          </Link>

          {/* Hero banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden mb-10"
          >
            <div className="aspect-video sm:aspect-[21/9] relative">
              <img
                src={game.cover_image || "/placeholder.svg"}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-ui">{game.platforms?.name}</Badge>
                <Badge variant="outline" className="border-border font-ui">{game.genre}</Badge>
                {game.is_featured && (
                  <Badge className="bg-secondary text-secondary-foreground font-ui border-0">⚡ FEATURED</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black text-foreground neon-text mb-2">
                {game.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-neon-yellow">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-ui text-lg font-bold">{(game.rating || 0).toFixed(1)}</span>
                </div>
                <span className="font-display text-2xl font-black text-primary">
                  {game.price === 0 ? "FREE" : `$${game.price.toFixed(2)}`}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-xl border border-border p-6"
              >
                <h2 className="font-display text-lg font-bold text-foreground mb-4">ABOUT THIS GAME</h2>
                <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">
                  {game.description || "No description available."}
                </p>
              </motion.div>

              {/* Screenshots */}
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="font-display text-lg font-bold text-foreground">SCREENSHOTS</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img: any) => (
                      <div key={img.id} className="rounded-lg overflow-hidden border border-border hover:neon-border transition-all">
                        <img src={img.image_url} alt="" className="w-full aspect-video object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* System Requirements */}
              {specs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">SYSTEM REQUIREMENTS</h2>
                  <Tabs defaultValue={specs[0]?.spec_type || "minimum"}>
                    <TabsList className="bg-muted/50 border border-border">
                      {specs.map((spec: any) => (
                        <TabsTrigger
                          key={spec.spec_type}
                          value={spec.spec_type}
                          className="font-ui text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          {specLabels[spec.spec_type] || spec.spec_type}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {specs.map((spec: any) => (
                      <TabsContent key={spec.spec_type} value={spec.spec_type}>
                        <div className="glass rounded-xl border border-border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {spec.os && (
                            <div className="flex items-start gap-3">
                              <MonitorCheck className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-ui text-xs font-bold text-muted-foreground">OS</p>
                                <p className="font-body text-sm text-foreground">{spec.os}</p>
                              </div>
                            </div>
                          )}
                          {spec.processor && (
                            <div className="flex items-start gap-3">
                              <Cpu className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-ui text-xs font-bold text-muted-foreground">PROCESSOR</p>
                                <p className="font-body text-sm text-foreground">{spec.processor}</p>
                              </div>
                            </div>
                          )}
                          {spec.memory && (
                            <div className="flex items-start gap-3">
                              <MemoryStick className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-ui text-xs font-bold text-muted-foreground">MEMORY</p>
                                <p className="font-body text-sm text-foreground">{spec.memory}</p>
                              </div>
                            </div>
                          )}
                          {spec.graphics && (
                            <div className="flex items-start gap-3">
                              <Monitor className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-ui text-xs font-bold text-muted-foreground">GRAPHICS</p>
                                <p className="font-body text-sm text-foreground">{spec.graphics}</p>
                              </div>
                            </div>
                          )}
                          {spec.storage && (
                            <div className="flex items-start gap-3">
                              <HardDrive className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="font-ui text-xs font-bold text-muted-foreground">STORAGE</p>
                                <p className="font-body text-sm text-foreground">{spec.storage}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </motion.div>
              )}
            </div>

            {/* Right column - purchase */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-xl border border-border p-6 sticky top-24 space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="font-display text-3xl font-black text-primary">
                    {game.price === 0 ? "FREE" : `$${game.price.toFixed(2)}`}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider">
                    {game.platforms?.name} Edition
                  </p>
                </div>

                {hasPurchased ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-ui text-sm font-bold justify-center">
                      <ShieldCheck className="h-5 w-5" />
                      PURCHASED
                    </div>
                    {driveLinks?.length ? (
                      <div className="space-y-2">
                        {driveLinks.map((link: any) => (
                          <a
                            key={link.id}
                            href={link.google_drive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              className="w-full font-ui font-bold neon-border gap-2"
                              size="lg"
                            >
                              <Download className="h-5 w-5" />
                              Download ({link.platform})
                            </Button>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground text-sm font-body">
                        Download links will be available soon.
                      </p>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full font-ui text-base font-bold py-6 neon-border"
                    size="lg"
                  >
                    {purchasing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : game.price === 0 ? (
                      "GET FOR FREE"
                    ) : (
                      "BUY NOW"
                    )}
                  </Button>
                )}

                {!user && (
                  <p className="text-center text-muted-foreground text-xs font-body">
                    <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to purchase
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GameDetail;
