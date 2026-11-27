# SYSTEM:// BLIK.EXE — Complete Portfolio

Interactive cyberpunk terminal portfolio with full Supabase CMS + admin.

## Quick start
```bash
cd frontend && npx serve .
```
Works offline with local fallbacks.

## Supabase setup
1. SQL Editor → run **entire** `supabase/schema.sql`
2. Authentication → create your email/password user
3. Storage → create **public** buckets: `covers`, `avatars`
4. Edit `frontend/js/config.js`:
   - `supabaseUrl`, `supabaseAnonKey`
   - Optional: `groqApiKey` / `openRouterApiKey` for AI guide + Prompt Lab

## Admin `/admin/`
| Tab | Features |
|-----|----------|
| Projects | CRUD, publish, drag reorder, cover URL/upload |
| Skills / Timeline / Socials | Full edit |
| Blog | Posts CMS (title, slug, body, cover, locale, draft) |
| Site copy | Bio, SEO, photo URL, theme pack |
| Analytics | Privacy-first visit totals |
| Activity log | Your admin changes |
| System | Reset defaults, secondary passphrase lock, avatar upload |

## Public features
- Terminal UI + theme packs + dark/light + i18n (EN/TW)
- Projects with tags filter
- Blog section (auto-hides if empty)
- AI tour guide (live project catalog + boundaries)
- Prompt Lab (live or offline)
- Contact (Netlify Forms)
- Visit bump (counts only)

## Netlify
Publish directory: **`frontend`**

## Security notes
- Anon key is public; RLS protects data
- Never put service-role key in the frontend
- Optional secondary admin passphrase (System tab)
- AI API keys in browser are visible — use free-tier limits or proxy later
