import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  Star, Monitor, Gamepad2, Smartphone, Cpu, HardDrive,
  MemoryStick, MonitorCheck, Download, ShieldCheck, Loader2, ArrowLeft, Play, X, ShoppingCart, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
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
  const { addToCart, isInCart } = useCart();
  const queryClient = useQueryClient();
  const [showVideo, setShowVideo] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const { data: pendingPurchase } = useQuery({
    queryKey: ["pending-purchase", id, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("game_id", id)
        .eq("payment_status", "pending")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
    refetchInterval: (query) => query.state.data ? 5000 : false,
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

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add games to cart");
      return;
    }
    if (!game) return;
    addToCart({
      gameId: game.id,
      title: game.title,
      price: game.price,
      coverImage: game.cover_image || "/placeholder.svg",
      platform: game.platforms?.name || "PC",
      genre: game.genre || "Action",
    });
  };

  const handleDirectDownload = async (link: any) => {
    setDownloading(link.id);
    try {
      const response = await fetch(
        `https://uyeuoexdbivbgqwsmewd.supabase.co/functions/v1/download-proxy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({ linkId: link.id }),
        }
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Download failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${game.title} - ${link.label || "Download"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(null);
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
  const inCart = isInCart(game.id);
  const isPending = !!pendingPurchase;

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      {/* Video Modal */}
      {showVideo && game.gameplay_video_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
          onClick={() => setShowVideo(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden neon-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 text-foreground hover:text-primary transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <video
              src={game.gameplay_video_url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
            />
          </motion.div>
        </motion.div>
      )}

      <main className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4">
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
              <img src={game.cover_image || "/placeholder.svg"} alt={game.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

              {game.gameplay_video_url && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm border-2 border-primary flex items-center justify-center neon-border group-hover:bg-primary/30 transition-colors"
                  >
                    <Play className="h-8 w-8 text-primary fill-primary ml-1" />
                  </motion.div>
                  <p className="font-ui text-xs font-bold text-primary mt-2 text-center tracking-wider">
                    WATCH GAMEPLAY
                  </p>
                </button>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-ui">{game.platforms?.name}</Badge>
                <Badge variant="outline" className="border-border font-ui">{game.genre}</Badge>
                {game.is_featured && (
                  <Badge className="bg-secondary text-secondary-foreground font-ui border-0">⚡ FEATURED</Badge>
                )}
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-black text-foreground neon-text mb-2">{game.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-neon-yellow">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-ui text-lg font-bold">{(game.rating || 0).toFixed(1)}</span>
                </div>
                <span className="font-display text-2xl font-black text-primary">
                  {game.price === 0 ? "FREE" : `KSH ${game.price.toFixed(2)}`}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl border border-border p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">ABOUT THIS GAME</h2>
                <p className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">
                  {game.description || "No description available."}
                </p>
              </motion.div>

              {game.gameplay_video_url && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">GAMEPLAY</h2>
                  <div
                    onClick={() => setShowVideo(true)}
                    className="relative rounded-xl overflow-hidden border border-border cursor-pointer group hover:neon-border transition-all"
                  >
                    <div className="aspect-video relative">
                      <img src={game.cover_image || "/placeholder.svg"} alt="Gameplay" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center group-hover:bg-background/30 transition-colors">
                        <motion.div whileHover={{ scale: 1.1 }} className="w-16 h-16 rounded-full bg-primary/30 backdrop-blur-sm border-2 border-primary flex items-center justify-center neon-border">
                          <Play className="h-7 w-7 text-primary fill-primary ml-0.5" />
                        </motion.div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <p className="font-ui text-sm font-bold text-primary tracking-wider">▶ WATCH GAMEPLAY</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {images.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
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

              {specs.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <h2 className="font-display text-lg font-bold text-foreground mb-4">SYSTEM REQUIREMENTS</h2>
                  <Tabs defaultValue={specs[0]?.spec_type || "minimum"}>
                    <TabsList className="bg-muted/50 border border-border">
                      {specs.map((spec: any) => (
                        <TabsTrigger key={spec.spec_type} value={spec.spec_type} className="font-ui text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                          {specLabels[spec.spec_type] || spec.spec_type}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {specs.map((spec: any) => (
                      <TabsContent key={spec.spec_type} value={spec.spec_type}>
                        <div className="glass rounded-xl border border-border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {spec.os && <SpecRow icon={<MonitorCheck className="h-5 w-5 text-primary mt-0.5" />} label="OS" value={spec.os} />}
                          {spec.processor && <SpecRow icon={<Cpu className="h-5 w-5 text-primary mt-0.5" />} label="PROCESSOR" value={spec.processor} />}
                          {spec.memory && <SpecRow icon={<MemoryStick className="h-5 w-5 text-primary mt-0.5" />} label="MEMORY" value={spec.memory} />}
                          {spec.graphics && <SpecRow icon={<Monitor className="h-5 w-5 text-primary mt-0.5" />} label="GRAPHICS" value={spec.graphics} />}
                          {spec.storage && <SpecRow icon={<HardDrive className="h-5 w-5 text-primary mt-0.5" />} label="STORAGE" value={spec.storage} />}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </motion.div>
              )}
            </div>

            {/* Right column - purchase/cart */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-xl border border-border p-6 sticky top-24 space-y-6"
              >
                <div className="text-center space-y-2">
                  <p className="font-display text-3xl font-black text-primary">
                    {game.price === 0 ? "FREE" : `KSH ${game.price.toFixed(2)}`}
                  </p>
                  <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider">
                    {game.platforms?.name} Edition
                  </p>
                </div>

                {hasPurchased ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-ui text-sm font-bold justify-center">
                      <ShieldCheck className="h-5 w-5" /> PURCHASED
                    </div>
                    {driveLinks?.length ? (
                      <div className="space-y-2">
                        {driveLinks.map((link: any) => (
                          <Button
                            key={link.id}
                            onClick={() => handleDirectDownload(link)}
                            disabled={downloading === link.id}
                            className="w-full font-ui font-bold neon-border gap-2"
                            size="lg"
                          >
                            {downloading === link.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Download className="h-5 w-5" />
                            )}
                            {link.label || "Download"}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground text-sm font-body">
                        Download links will be available soon.
                      </p>
                    )}
                  </div>
                ) : isPending ? (
                  <div className="space-y-4 text-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                    <p className="font-ui text-sm font-bold text-muted-foreground">
                      Waiting payment confirmation to generate download link...
                    </p>
                  </div>
                ) : inCart ? (
                  <div className="space-y-3">
                    <Button disabled className="w-full font-ui text-base font-bold py-6 gap-2" size="lg">
                      <Check className="h-5 w-5" /> IN CART
                    </Button>
                    <Link to="/profile" className="block">
                      <Button variant="outline" className="w-full font-ui text-sm font-bold border-border gap-2">
                        <ShoppingCart className="h-4 w-4" /> Go to Cart & Checkout
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="w-full font-ui text-base font-bold py-6 neon-border gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {game.price === 0 ? "ADD TO CART (FREE)" : "ADD TO CART"}
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

const SpecRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    {icon}
    <div>
      <p className="font-ui text-xs font-bold text-muted-foreground">{label}</p>
      <p className="font-body text-sm text-foreground">{value}</p>
    </div>
  </div>
);

export default GameDetail;
