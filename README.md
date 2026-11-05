# LMG MARKETS — secure educational website starter

This project combines member registration/login, a separate administrator dashboard, and a server-side Twelve Data market-data connection.

## Included
- Member sign-up and sign-in using Supabase Auth.
- Member passwords are handled by Supabase Auth; LMG administrators cannot view or retrieve them.
- Server-checked admin role using trusted `app_metadata.role === "admin"`.
- Admin dashboard to replace the Twelve Data API key. It shows only configured/masked status; the secret is encrypted at rest in Supabase and never sent back to the browser.
- AES-256-GCM encryption for the stored provider key.
- Read-only market-data endpoint for XAU/USD, EUR/USD, GBP/USD and USD/JPY.
- Responsive black/gold starter and risk disclaimer.

## Required setup
1. Create a Supabase project.
2. Run `supabase/setup.sql` in Supabase SQL Editor.
3. Configure these environment variables in Vercel (and locally in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
   - `SECRETS_ENCRYPTION_KEY` (server-only, base64-encoded 32-byte random key)
   - Optional fallback `TWELVE_DATA_API_KEY` (server-only; recommended to set the key through the admin panel after deployment)
4. Generate a 32-byte random encryption key and base64-encode it. Keep it safe; losing it makes stored encrypted provider keys unreadable. Never use a `NEXT_PUBLIC_` prefix for secrets.
5. Deploy to Vercel. Set the Supabase Auth site URL and redirect URLs to your deployed domain.
6. Create the administrator account through Supabase Auth. Then assign `app_metadata.role = "admin"` using a trusted server-side Supabase Admin API process. Do not allow public sign-up or editable user metadata to grant admin privileges.
7. Log in at `/login`, then open `/admin`. Enter the Twelve Data API key in the provider settings. The key is stored encrypted server-side and is not displayed again.
8. Test `/api/market?symbol=XAU/USD&interval=15min`.

## Security notes
- The admin username/password shared in chat are not embedded in this project. Treat them as exposed and replace them with fresh credentials before deployment.
- The API key supplied in chat is not embedded. Rotate/regenerate it with Twelve Data before use.
- Never expose the Supabase service-role key or encryption key to browser code or GitHub.
- The admin page masks the API key. Admins may replace it but cannot read the stored key.
- Use HTTPS, enable email confirmation, password reset, MFA, and Supabase Auth rate limits.
- The server-side key storage uses a Supabase service-role client; protect Vercel access and restrict who can edit environment variables.
- No live trading, broker order execution, payment processing, or guaranteed-profit features are included. All trading material must remain educational/demo-only.
- Do not claim Singapore incorporation or financial regulatory approval without official evidence.
