VITE_SUPABASE_URL=https://qllvyqdzpxgubiuujhbm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_secret_HW2rBXhHBSoVd3UGhPZ0lA_I9CCsywd
VITE_GEN_E_API_URL=https://nugens-api.onrender.com
```
Get these from Supabase → Settings → API.

---

**The flow now works correctly:**
```
/gene  → marketing page → "Launch Gen-E AI" button
           ↓
        /gen-e → ProtectedRoute checks Supabase session
           ↓ not logged in         ↓ logged in
        /auth (AuthPage)        GenEChat app ✓
           ↓ after login
        /gen-e ✓