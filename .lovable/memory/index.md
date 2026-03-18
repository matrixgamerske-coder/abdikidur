Matrix Gamers Arena - Game store website with cyberpunk/neon aesthetic

## Design System
- Fonts: Orbitron (display), Space Grotesk (body), Rajdhani (UI)
- Primary: HSL 160 100% 50% (neon green)
- Secondary: HSL 280 100% 60% (neon purple)
- Accent: HSL 200 100% 55% (neon blue)
- Background: HSL 240 10% 4% (near black)
- Matrix rain canvas animation, glass morphism, neon glow effects

## Architecture
- Auth: Supabase auth with profiles auto-created via trigger
- Roles: user_roles table with app_role enum (admin, user)
- Games stored with platform, specs, images, Google Drive links
- Drive links only accessible after purchase (RLS enforced)
- Payments: Direct purchase flow (future: integrate Stripe)
- Admin panel at /admin (hidden, admin-role gated)
- Gameplay videos stored as Cloudinary URLs in games.gameplay_video_url
- Direct downloads via download-proxy edge function (no redirect)
- Auto-scrolling game showcase on homepage (CSS animation, 2 rows)

## Tables
profiles, platforms, games (incl. gameplay_video_url), game_images, game_specs, game_drive_links, purchases, user_roles

## Edge Functions
- download-proxy: Proxies Google Drive downloads, verifies purchase via service role
