import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import GameCard from "./GameCard";
import { Loader2, Flame } from "lucide-react";

const FeaturedGames = () => {
  const { data: games, isLoading } = useQuery({
    queryKey: ["featured-games"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("games")
        .select("*, platforms(name)")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!games?.length) return null;

  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-10"
        >
          <Flame className="h-8 w-8 text-neon-pink" />
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            FEATURED <span className="text-primary neon-text">GAMES</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game: any, i: number) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
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
      </div>
    </section>
  );
};

export default FeaturedGames;
