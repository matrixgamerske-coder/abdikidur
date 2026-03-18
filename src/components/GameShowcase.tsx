import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GameShowcase = () => {
  const { data: games } = useQuery({
    queryKey: ["showcase-games"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("games")
        .select("id, title, cover_image, price, rating")
        .order("rating", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  if (!games?.length) return null;

  // Duplicate for seamless infinite loop
  const row1 = [...games, ...games];
  const row2 = [...games.slice().reverse(), ...games.slice().reverse()];

  return (
    <div className="w-full overflow-hidden py-8 space-y-4">
      {/* Row 1 - scrolls left */}
      <div className="showcase-row">
        <div className="showcase-track animate-scroll-left">
          {row1.map((game: any, i: number) => (
            <Link
              key={`r1-${i}`}
              to={`/game/${game.id}`}
              className="showcase-card group"
            >
              <img
                src={game.cover_image || "/placeholder.svg"}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-display text-[10px] sm:text-xs font-bold text-foreground truncate neon-text">
                    {game.title}
                  </p>
                  <p className="font-ui text-[9px] sm:text-xs text-primary font-bold">
                    {game.price === 0 ? "FREE" : `KSH ${game.price}`}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 border border-transparent group-hover:border-primary/50 rounded-lg transition-colors duration-300 group-hover:neon-border" />
            </Link>
          ))}
        </div>
      </div>

      {/* Row 2 - scrolls right */}
      <div className="showcase-row">
        <div className="showcase-track animate-scroll-right">
          {row2.map((game: any, i: number) => (
            <Link
              key={`r2-${i}`}
              to={`/game/${game.id}`}
              className="showcase-card group"
            >
              <img
                src={game.cover_image || "/placeholder.svg"}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="font-display text-[10px] sm:text-xs font-bold text-foreground truncate neon-text">
                    {game.title}
                  </p>
                  <p className="font-ui text-[9px] sm:text-xs text-primary font-bold">
                    {game.price === 0 ? "FREE" : `KSH ${game.price}`}
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 border border-transparent group-hover:border-primary/50 rounded-lg transition-colors duration-300 group-hover:neon-border" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameShowcase;
