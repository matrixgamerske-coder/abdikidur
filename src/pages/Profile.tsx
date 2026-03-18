import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  User, GamepadIcon, Loader2, ShoppingCart, Trash2, X,
  Download, ShieldCheck, CreditCard, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MatrixRain from "@/components/MatrixRain";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  const { user, loading } = useAuth();
  const { items: cartItems, removeFromCart, clearCart, totalPrice, itemCount } = useCart();
  const queryClient = useQueryClient();
  const [checkingOut, setCheckingOut] = useState(false);
  const [pesapalIframeUrl, setPesapalIframeUrl] = useState<string | null>(null);
  const [merchantRef, setMerchantRef] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const { data: pendingPurchases } = useQuery({
    queryKey: ["pending-purchases", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("purchases")
        .select("*, games(title, cover_image, genre, platforms(name))")
        .eq("user_id", user!.id)
        .eq("payment_status", "pending")
        .order("purchased_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: pesapalIframeUrl ? 5000 : false,
  });

  const handleCheckout = async () => {
    if (!user) return;
    if (!cartItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    setCheckingOut(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const callbackUrl = window.location.origin + "/profile";

      const res = await fetch(
        `https://uyeuoexdbivbgqwsmewd.supabase.co/functions/v1/pesapal-pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems,
            callbackUrl,
            phone,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initiation failed");

      setPesapalIframeUrl(data.redirect_url);
      setMerchantRef(data.merchant_reference);
      clearCart();
      toast.success("Payment initiated! Complete payment below.");

      queryClient.invalidateQueries({ queryKey: ["pending-purchases"] });
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleDirectDownload = async (purchase: any) => {
    setDownloading(purchase.id);
    try {
      const { data: links, error } = await (supabase as any)
        .from("game_drive_links")
        .select("*")
        .eq("game_id", purchase.game_id);

      if (error) throw error;
      if (!links?.length) {
        toast.info("Download links not yet available");
        return;
      }

      for (const link of links) {
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
        a.download = `${purchase.games?.title} - ${link.label || "Download"}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(null);
    }
  };

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
        <div className="container mx-auto px-4 max-w-5xl">
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

          {/* Tabs: Cart, Library, Pending */}
          <Tabs defaultValue="cart" className="space-y-6">
            <TabsList className="bg-muted/50 border border-border">
              <TabsTrigger value="cart" className="font-ui text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <ShoppingCart className="h-3.5 w-3.5" /> Cart ({itemCount})
              </TabsTrigger>
              <TabsTrigger value="library" className="font-ui text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                <GamepadIcon className="h-3.5 w-3.5" /> Library ({purchases?.length || 0})
              </TabsTrigger>
              {(pendingPurchases?.length || 0) > 0 && (
                <TabsTrigger value="pending" className="font-ui text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
                  <Clock className="h-3.5 w-3.5" /> Pending ({pendingPurchases?.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Cart Tab */}
            <TabsContent value="cart">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {pesapalIframeUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-xl font-bold text-foreground">
                        COMPLETE <span className="text-primary neon-text">PAYMENT</span>
                      </h2>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPesapalIframeUrl(null)}
                        className="font-ui text-xs border-border gap-1"
                      >
                        <X className="h-3 w-3" /> Close
                      </Button>
                    </div>
                    <div className="glass rounded-xl border border-border overflow-hidden neon-border">
                      <iframe
                        src={pesapalIframeUrl}
                        className="w-full h-[600px] border-0"
                        title="Pesapal Payment"
                      />
                    </div>
                    <p className="font-body text-sm text-muted-foreground text-center">
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Waiting for payment confirmation to generate download links...
                    </p>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="glass rounded-xl border border-border p-12 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-display text-lg text-muted-foreground mb-2">Your cart is empty</p>
                    <p className="font-body text-sm text-muted-foreground mb-6">Browse games and add them to your cart!</p>
                    <Link to="/games">
                      <Button className="font-ui font-bold neon-border">Browse Games</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      YOUR <span className="text-primary neon-text">CART</span>
                    </h2>

                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.gameId} className="glass rounded-xl border border-border p-4 flex items-center gap-4">
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="w-16 h-20 rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-sm font-bold text-foreground truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="font-ui text-xs border-border">{item.platform}</Badge>
                              <Badge variant="outline" className="font-ui text-xs border-border">{item.genre}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-display text-sm font-bold text-primary">
                              {item.price === 0 ? "FREE" : `KSH ${item.price.toFixed(2)}`}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.gameId)}
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Checkout Section */}
                    <div className="glass rounded-xl border border-border p-6 neon-border space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-lg font-bold text-foreground">TOTAL</span>
                        <span className="font-display text-2xl font-black text-primary">
                          KSH {totalPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-ui text-sm font-semibold text-muted-foreground">
                          Phone Number (for M-Pesa STK Push)
                        </Label>
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 254712345678"
                          className="bg-muted/50 border-border font-body"
                        />
                      </div>

                      <Button
                        onClick={handleCheckout}
                        disabled={checkingOut}
                        className="w-full font-ui text-base font-bold py-6 neon-border gap-2"
                        size="lg"
                      >
                        {checkingOut ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                        {checkingOut ? "Processing..." : "PAY WITH PESAPAL"}
                      </Button>
                      <p className="font-body text-xs text-muted-foreground text-center">
                        Secure payment via Pesapal • M-Pesa, Visa, Mastercard & more
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  MY <span className="text-primary neon-text">LIBRARY</span>
                </h2>

                {!purchases?.length ? (
                  <div className="glass rounded-xl border border-border p-12 text-center">
                    <GamepadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-display text-lg text-muted-foreground mb-2">No games yet</p>
                    <p className="font-body text-sm text-muted-foreground mb-6">Purchase games to see them here!</p>
                    <Link to="/games">
                      <Button className="font-ui font-bold neon-border">Browse Games</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {purchases.map((p: any) => (
                      <div key={p.id} className="glass rounded-xl border border-border p-4 flex items-center gap-4 hover:neon-border transition-all">
                        <Link to={`/game/${p.game_id}`}>
                          <img
                            src={p.games?.cover_image || "/placeholder.svg"}
                            alt={p.games?.title}
                            className="w-16 h-20 rounded-md object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/game/${p.game_id}`}>
                            <h3 className="font-display text-sm font-bold text-foreground truncate hover:neon-text transition-all">
                              {p.games?.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="font-ui text-xs border-border">{p.games?.platforms?.name}</Badge>
                            <Badge variant="outline" className="font-ui text-xs border-border">{p.games?.genre}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            <span className="font-ui text-primary font-bold">PURCHASED</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-display text-sm font-bold text-primary">KSH {p.amount?.toFixed(2)}</p>
                            <p className="font-ui text-xs text-muted-foreground">
                              {new Date(p.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDirectDownload(p)}
                            disabled={downloading === p.id}
                            className="font-ui text-xs font-bold neon-border gap-1"
                          >
                            {downloading === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* Pending Payments Tab */}
            <TabsContent value="pending">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  PENDING <span className="text-primary neon-text">PAYMENTS</span>
                </h2>
                <div className="space-y-3">
                  {pendingPurchases?.map((p: any) => (
                    <div key={p.id} className="glass rounded-xl border border-border p-4 flex items-center gap-4">
                      <img
                        src={p.games?.cover_image || "/placeholder.svg"}
                        alt={p.games?.title}
                        className="w-16 h-20 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-sm font-bold text-foreground truncate">
                          {p.games?.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-ui text-xs border-border">{p.games?.platforms?.name}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-ui text-xs font-bold">Awaiting payment...</span>
                      </div>
                      <p className="font-display text-sm font-bold text-primary">KSH {p.amount?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
