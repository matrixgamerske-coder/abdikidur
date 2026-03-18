import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Save, X, Loader2, Shield,
  Monitor, Gamepad2, Smartphone, Upload, Video, ImagePlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import MatrixRain from "@/components/MatrixRain";

interface GameForm {
  title: string;
  description: string;
  genre: string;
  price: string;
  rating: string;
  platform_id: string;
  cover_image: string;
  is_featured: boolean;
  gameplay_video_url: string;
}

const emptyForm: GameForm = {
  title: "", description: "", genre: "Action", price: "0",
  rating: "0", platform_id: "", cover_image: "", is_featured: false,
  gameplay_video_url: "",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<GameForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });

  const { data: platforms } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("platforms").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: games, isLoading } = useQuery({
    queryKey: ["admin-games"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("games")
        .select("*, platforms(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("game-covers")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("game-covers")
        .getPublicUrl(fileName);

      setForm((prev) => ({ ...prev, cover_image: publicUrl }));
      toast.success("Cover image uploaded!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (gameData: GameForm & { id?: string }) => {
      const payload = {
        title: gameData.title,
        description: gameData.description,
        genre: gameData.genre,
        price: parseFloat(gameData.price) || 0,
        rating: parseFloat(gameData.rating) || 0,
        platform_id: gameData.platform_id || null,
        cover_image: gameData.cover_image || null,
        is_featured: gameData.is_featured,
        gameplay_video_url: gameData.gameplay_video_url || null,
      };

      if (gameData.id) {
        const { error } = await (supabase as any)
          .from("games").update(payload).eq("id", gameData.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("games").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success("Game saved successfully!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("games").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-games"] });
      toast.success("Game deleted!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const startEdit = (game: any) => {
    setForm({
      title: game.title,
      description: game.description || "",
      genre: game.genre || "Action",
      price: String(game.price),
      rating: String(game.rating || 0),
      platform_id: game.platform_id || "",
      cover_image: game.cover_image || "",
      is_featured: game.is_featured || false,
      gameplay_video_url: game.gameplay_video_url || "",
    });
    setEditingId(game.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    saveMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  const platformIcon: Record<string, React.ReactNode> = {
    PC: <Monitor className="h-4 w-4" />,
    PlayStation: <Gamepad2 className="h-4 w-4" />,
    Mobile: <Smartphone className="h-4 w-4" />,
  };

  return (
    <div className="relative min-h-screen matrix-grid">
      <MatrixRain />
      <Navbar />

      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl font-black text-foreground">
                ADMIN <span className="text-primary neon-text">PANEL</span>
              </h1>
            </div>
            <Button
              onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}
              className="font-ui font-bold neon-border gap-2"
            >
              <Plus className="h-4 w-4" /> Add Game
            </Button>
          </div>

          {/* Game Form Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="glass rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto neon-border"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      {editingId ? "EDIT GAME" : "ADD NEW GAME"}
                    </h2>
                    <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Title</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-muted/50 border-border font-body" />
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Description</Label>
                      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-muted/50 border-border font-body" />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Genre</Label>
                      <Select value={form.genre} onValueChange={(v) => setForm({ ...form, genre: v })}>
                        <SelectTrigger className="bg-muted/50 border-border font-body">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Action", "RPG", "Shooter", "Racing", "Strategy", "Adventure", "Simulation", "Fighting", "MMORPG", "Arcade", "Card Game", "Survival", "Action RPG", "Puzzle", "Sports"].map((g) => (
                            <SelectItem key={g} value={g}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Platform</Label>
                      <Select value={form.platform_id} onValueChange={(v) => setForm({ ...form, platform_id: v })}>
                        <SelectTrigger className="bg-muted/50 border-border font-body">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Price (KSH)</Label>
                      <Input type="number" step="1" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-muted/50 border-border font-body" />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Rating (0-5)</Label>
                      <Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="bg-muted/50 border-border font-body" />
                    </div>

                    {/* Cover Image Upload */}
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <ImagePlus className="h-4 w-4" /> Cover Image
                      </Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="flex gap-3 items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="font-ui text-sm border-border gap-2"
                        >
                          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploading ? "Uploading..." : "Upload Image"}
                        </Button>
                        {form.cover_image && (
                          <img src={form.cover_image} alt="Cover preview" className="h-16 w-12 rounded-md object-cover border border-border" />
                        )}
                      </div>
                      {form.cover_image && (
                        <p className="font-body text-xs text-muted-foreground truncate">{form.cover_image}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <Label className="font-ui text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Video className="h-4 w-4" /> Gameplay Video URL (Cloudinary)
                      </Label>
                      <Input value={form.gameplay_video_url} onChange={(e) => setForm({ ...form, gameplay_video_url: e.target.value })} placeholder="https://res.cloudinary.com/..." className="bg-muted/50 border-border font-body" />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-3">
                      <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                      <Label className="font-ui text-sm font-semibold text-muted-foreground">Featured Game</Label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button onClick={handleSave} disabled={saveMutation.isPending} className="flex-1 font-ui font-bold neon-border gap-2">
                      {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingId ? "Update Game" : "Create Game"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)} className="font-ui font-bold border-border">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Games List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {games?.map((game: any) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/30 transition-colors"
                >
                  <img
                    src={game.cover_image || "/placeholder.svg"}
                    alt={game.title}
                    className="w-14 h-18 rounded-md object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-sm font-bold text-foreground truncate">{game.title}</h3>
                      {game.is_featured && <Badge className="bg-secondary text-secondary-foreground font-ui text-[10px] border-0">⚡</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="font-ui text-[10px] border-border gap-1">
                        {platformIcon[game.platforms?.name] || null}
                        {game.platforms?.name}
                      </Badge>
                      <span className="font-ui text-muted-foreground">{game.genre}</span>
                      <span className="font-display text-primary font-bold">
                        {game.price === 0 ? "FREE" : `KSH ${game.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => startEdit(game)} className="font-ui text-xs border-border gap-1">
                      <Edit3 className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Delete this game?")) deleteMutation.mutate(game.id);
                      }}
                      className="font-ui text-xs border-destructive/50 text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
