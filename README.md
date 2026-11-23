# SERAVOLT — Modular Handbags (Custom Shopify OS 2.0 Theme)

A pixel-faithful Shopify Liquid implementation of the **SERAVOLT — Modular Handbags** Framer UI architecture (`MzPPSL1697QtEj9Ss4Mp`).

## Architecture Highlights
- **Shopify OS 2.0 + Modern Liquid**: JSON templates, Header/Footer Section Groups, reusable `blocks/` with `{% doc %}` annotations, Metafields (`seravolt.*`), and Section Rendering API.
- **Native Web Components (`assets/seravolt-components.js`)**: `<sv-mode-switcher>`, `<sv-cart-drawer>`, `<sv-product-form>`, `<sv-variant-picker>`, `<sv-header-menu>`.
- **Raw WebGL Shader (`assets/seravolt-webgl.js`)**: `<sv-brass-stage>` renders an interactive architectural blueprint grid with Brushed Volt Brass anisotropic cursor sheen and zero external 3D bundle weight.
- **GSAP 3 + ScrollTrigger (`assets/seravolt-motion.js`)**: Smooth silhouette morphing and scroll reveals honoring `prefers-reduced-motion` and Shopify Theme Editor reloads.
- **GitHub + Shopify CI**: Preconfigured `.github/workflows/shopify-theme-check.yml`, `.theme-check.yml`, `.shopifyignore`, and `shopify.theme.toml`.

## Deploy to GitHub & Connect to Shopify

```bash
# 1. Initialize repo and push to GitHub
git init
git add .
git commit -m "feat: initial SERAVOLT Modular Handbags Shopify OS 2.0 theme"
git branch -M main
git remote add origin https://github.com/<your-username>/seravolt-shopify-theme.git
git push -u origin main
```

### Connect via Shopify Admin (Automatic GitHub Sync)
1. Open **Shopify Admin → Online Store → Themes**.
2. Click **Add theme → Connect from GitHub**.
3. Select `seravolt-shopify-theme` and the `main` branch.

### Or Preview Locally with Shopify CLI v3
```bash
shopify theme dev --store your-store.myshopify.com
```

## Recommended Product Metafields (`seravolt.*`)
Create the following Product Metafield definitions in **Shopify Admin → Settings → Custom data → Products**:
- `seravolt.edition_badge` (Single line text — e.g. `CORE CHASSIS` or `MODULE`)
- `seravolt.metadata` (Single line text — e.g. `SV-001 · OBSIDIAN CALF · SADDLE COGNAC`)
- `seravolt.dimensions` (Single line text — e.g. `380 × 290 × 125 mm`)
- `seravolt.specification` (Single line text)
- `seravolt.engineering_notes` (Multi-line text)
- `seravolt.care` (Multi-line text)
- `seravolt.leather_swatch` (Color — e.g. `#141413`)

You can also import `seravolt-edition-01-products.csv` directly in **Shopify Admin → Products → Import** to seed all 6 Edition 01 items.
