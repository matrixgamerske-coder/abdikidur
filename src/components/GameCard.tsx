import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Star, Monitor, Gamepad2, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GameCardProps {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  genre: string;
  rating: number;
  platform: string;
  isFeatured?: boolean;
}

const platformIcon: Record<string, React.ReactNode> = {
  PC: <Monitor className="h-3 w-3" />,
  PlayStation: <Gamepad2 className="h-3 w-3" />,
  Mobile: <Smartphone className="h-3 w-3" />,
};

const GameCard = ({ id, title, coverImage, price, genre, rating, platform, isFeatured }: GameCardProps) => {
  return (
    <Link to={`/game/${id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative rounded-lg overflow-hidden bg-card border border-border hover:neon-border transition-all duration-500 cursor-pointer"
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />

          {/* Featured badge */}
          {isFeatured && (
            <Badge className="absolute top-3 left-3 bg-secondary text-secondary-foreground font-ui text-xs font-bold border-0">
              ⚡ FEATURED
            </Badge>
          )}

          {/* Platform badge */}
          <Badge
            variant="outline"
            className="absolute top-3 right-3 border-primary/50 text-primary font-ui text-xs gap-1"
          >
            {platformIcon[platform]}
            {platform}
          </Badge>

          {/* Rating */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-neon-yellow font-ui text-sm font-bold">
            <Star className="h-3.5 w-3.5 fill-current" />
            {rating.toFixed(1)}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-display text-sm font-bold text-foreground truncate group-hover:neon-text transition-all">
            {title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="font-ui text-xs text-muted-foreground uppercase tracking-wider">{genre}</span>
            <span className="font-display text-lg font-bold text-primary">
              {price === 0 ? "FREE" : `KSH ${price.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Hover glow line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </Link>
  );
};

export default GameCard;
