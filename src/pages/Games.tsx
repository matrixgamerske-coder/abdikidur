import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Monitor, Gamepad2, Smartphone, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameCard from "@/components/GameCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";

const platformFilters = [
  { key: "all", label: "All Games", icon: <SlidersHorizontal className="h-4 w-4" /> },
  { key: "PC", label: "PC", icon: <Monitor className="h-4 w-4" /> },
  { key: "PlayStation", label: "PS", icon: <Gamepad2 className="h-4 w-4" /> },
  { key: "Mobile", label: "Mobile", icon: <Smartphone className="h-4 w-4" /> },
];

const Games = () => {
  const [searchParams] = useSearchParams();
  const initialPlatform = searchParams.get("platform") || "all";
  const [platform, setPlatform] = useState(initialPlatform);
  const [search, setSearch] = useState("");

  const { data: games, isLoading } = useQuery({
    queryKey: ["games", platform, search],
    queryFn: async () => {
      let query = (supabase as any)
        .from("games")
        .select("*, platforms(name)")
        .order("created_at", { ascending: false });

      if (platform !== "all") {
        // Get platform id first
        const { data: plat } = await (supabase as any)
          .from("platforms")
          .select("id")
          .eq("name", platform)
          .single();
        if (plat) {
          query = query.eq("platform_id", plat.id);
        }
      }

      if (search) {
        query = query.ilike("title", `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="font-display text-4xl sm:text-5xl font-black text-foreground mb-2">
              GAME <span className="text-primary neon-text">VAULT</span>
            </h1>
            <p className="font-body text-muted-foreground">
              Explore our collection of premium games
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-border font-body"
              />
            </div>

            <div className="flex gap-2">
              {platformFilters.map((p) => (
                <Button
                  key={p.key}
                  variant={platform === p.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPlatform(p.key)}
                  className={`font-ui text-xs font-bold gap-1.5 ${
                    platform === p.key ? "neon-border" : "border-border"
                  }`}
                >
                  {p.icon}
                  <span className="hidden sm:inline">{p.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Games grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : !games?.length ? (
            <div className="text-center py-20">
              <p className="font-display text-xl text-muted-foreground">No games found</p>
              <p className="font-body text-sm text-muted-foreground mt-2">Try a different search or filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {games.map((game: any, i: number) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GameCard
                    id={game.id}
                    title={game.title}
                    coverImage={game.cover_image}
                    price={game.price}
                    genre={game.genre || "Action"}
                    rating={game.rating || 0}
                    platform={game.platforms?.name || "PC"}
                    isFeatured={game.is_featured}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Games;
