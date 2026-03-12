# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4

## Project: Luxury Fashion E-Commerce Store (LUXE)

A full-stack luxury fashion e-commerce website selling clothing, shoes, and luxury accessories.

### Features
- Homepage with hero section, featured products, and category navigation
- Product listing page with advanced filtering (category, brand, size, color, price range)
- Product detail page with image carousel, size/color selector, add to cart
- Shopping cart (slide-out drawer) with quantity controls
- Checkout flow with customer info, shipping, and payment method
- Order confirmation page
- 16 seeded luxury products across 4 categories (Women, Men, Shoes, Accessories)

### Database Tables
- `categories` - Product categories (Women, Men, Shoes, Accessories)
- `products` - All product info with JSON arrays for images/sizes/colors/tags
- `cart_items` - Session-based cart items
- `orders` - Completed orders with snapshot of items

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── luxury-store/       # React + Vite frontend (served at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## API Routes (all under /api)

- `GET /api/healthz` — Health check
- `GET /api/products` — List products (filters: category, brand, minPrice, maxPrice, size, color, search, featured)
- `GET /api/products/:id` — Get single product
- `GET /api/categories` — List all categories
- `GET /api/cart?sessionId=` — Get cart
- `POST /api/cart/items` — Add item to cart
- `PUT /api/cart/items/:itemId` — Update cart item quantity
- `DELETE /api/cart/items/:itemId?sessionId=` — Remove cart item
- `POST /api/orders` — Create order from cart
- `GET /api/orders/:id` — Get order details

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API client & Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
