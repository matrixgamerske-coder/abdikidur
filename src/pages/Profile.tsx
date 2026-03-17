import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User, GamepadIcon, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import { Link, Navigate } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: purchases } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("purchases")
        .select("*, games(title, cover_image, genre, platforms(name))")
        .eq("user_id", user!.id)
        .eq("payment_status", "completed")
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-border p-8 mb-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-primary neon-border">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{profile?.username || "Gamer"}</h1>
                <p className="font-body text-sm text-muted-foreground">{user.email}</p>
                <p className="font-ui text-xs text-muted-foreground mt-1">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Purchased games */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-6">
              MY <span className="text-primary neon-text">LIBRARY</span>
            </h2>

            {!purchases?.length ? (
              <div className="glass rounded-xl border border-border p-12 text-center">
                <GamepadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-display text-lg text-muted-foreground mb-2">No games yet</p>
                <p className="font-body text-sm text-muted-foreground mb-6">Start building your library!</p>
                <Link to="/games">
                  <Button className="font-ui font-bold neon-border">Browse Games</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p: any) => (
                  <Link key={p.id} to={`/game/${p.game_id}`}>
                    <div className="glass rounded-xl border border-border p-4 flex items-center gap-4 hover:neon-border transition-all cursor-pointer group">
                      <img
                        src={p.games?.cover_image || "/placeholder.svg"}
                        alt={p.games?.title}
                        className="w-16 h-20 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-bold text-foreground truncate group-hover:neon-text transition-all">
                          {p.games?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-ui text-xs border-border">{p.games?.platforms?.name}</Badge>
                          <Badge variant="outline" className="font-ui text-xs border-border">{p.games?.genre}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-sm font-bold text-primary">${p.amount?.toFixed(2)}</p>
                        <p className="font-ui text-xs text-muted-foreground">
                          {new Date(p.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
