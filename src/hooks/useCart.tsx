import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";

export interface CartItem {
  gameId: string;
  title: string;
  price: number;
  coverImage: string;
  platform: string;
  genre: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (gameId: string) => void;
  clearCart: () => void;
  isInCart: (gameId: string) => boolean;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "abdikidur_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.gameId === item.gameId)) {
        toast.info("Already in cart");
        return prev;
      }
      toast.success(`${item.title} added to cart!`);
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((gameId: string) => {
    setItems((prev) => prev.filter((i) => i.gameId !== gameId));
    toast.info("Removed from cart");
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (gameId: string) => items.some((i) => i.gameId === gameId),
    [items]
  );

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
