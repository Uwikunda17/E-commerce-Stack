import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, ordersTable, cartItemsTable } from "@workspace/db";
import { eq, desc, sql, count } from "drizzle-orm";
import { adminAuth, generateAdminToken } from "../middlewares/adminAuth";

const router: IRouter = Router();

// ─── Auth ────────────────────────────────────────────────────────────────────

router.post("/admin/auth", (req, res) => {
  const { password } = req.body;
  const token = generateAdminToken(password);
  if (!token) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  res.json({ token });
});

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

router.get("/admin/stats", adminAuth, async (_req, res) => {
  try {
    const [productsCount, categoriesCount, ordersResult] = await Promise.all([
      db.select({ count: count() }).from(productsTable),
      db.select({ count: count() }).from(categoriesTable),
      db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(100),
    ]);

    const totalRevenue = ordersResult.reduce(
      (sum, o) => sum + parseFloat(o.total as string),
      0
    );
    const recentOrders = ordersResult.slice(0, 5).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: parseFloat(o.total as string),
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      itemCount: (o.items as unknown[]).length,
    }));

    const lowStock = await db
      .select()
      .from(productsTable)
      .where(sql`${productsTable.stockCount} <= 3 AND ${productsTable.inStock} = true`);

    res.json({
      totalProducts: Number(productsCount[0].count),
      totalCategories: Number(categoriesCount[0].count),
      totalOrders: ordersResult.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      recentOrders,
      lowStockCount: lowStock.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── Products ─────────────────────────────────────────────────────────────────

router.get("/admin/products", adminAuth, async (_req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .orderBy(desc(productsTable.createdAt));

    res.json(
      products.map((p) => ({
        id: p.products.id,
        name: p.products.name,
        brand: p.products.brand,
        price: parseFloat(p.products.price as string),
        originalPrice: p.products.originalPrice
          ? parseFloat(p.products.originalPrice as string)
          : null,
        categoryId: p.products.categoryId,
        categoryName: p.categories?.name ?? "",
        images: p.products.images,
        sizes: p.products.sizes,
        colors: p.products.colors,
        material: p.products.material,
        inStock: p.products.inStock,
        stockCount: p.products.stockCount,
        featured: p.products.featured,
        rating: p.products.rating ? parseFloat(p.products.rating as string) : null,
        reviewCount: p.products.reviewCount,
        tags: p.products.tags,
        createdAt: p.products.createdAt.toISOString(),
        description: p.products.description,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/admin/products", adminAuth, async (req, res) => {
  try {
    const {
      name, brand, description, price, originalPrice, categoryId,
      images, sizes, colors, material, inStock, stockCount, featured,
      rating, reviewCount, tags,
    } = req.body;

    const [product] = await db
      .insert(productsTable)
      .values({
        name, brand, description,
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        categoryId: Number(categoryId),
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        material: material || null,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        stockCount: Number(stockCount) || 0,
        featured: Boolean(featured),
        rating: rating ? String(rating) : null,
        reviewCount: Number(reviewCount) || 0,
        tags: tags || [],
      })
      .returning();

    res.status(201).json({ ...product, price: parseFloat(product.price as string) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      name, brand, description, price, originalPrice, categoryId,
      images, sizes, colors, material, inStock, stockCount, featured,
      rating, reviewCount, tags,
    } = req.body;

    const [product] = await db
      .update(productsTable)
      .set({
        name, brand, description,
        price: String(price),
        originalPrice: originalPrice ? String(originalPrice) : null,
        categoryId: Number(categoryId),
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        material: material || null,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        stockCount: Number(stockCount) || 0,
        featured: Boolean(featured),
        rating: rating ? String(rating) : null,
        reviewCount: Number(reviewCount) || 0,
        tags: tags || [],
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json({ ...product, price: parseFloat(product.price as string) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// ─── Orders ──────────────────────────────────────────────────────────────────

router.get("/admin/orders", adminAuth, async (_req, res) => {
  try {
    const orders = await db
      .select()
      .from(ordersTable)
      .orderBy(desc(ordersTable.createdAt));

    res.json(
      orders.map((o) => ({
        id: o.id,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        shippingCity: o.shippingCity,
        shippingCountry: o.shippingCountry,
        paymentMethod: o.paymentMethod,
        status: o.status,
        total: parseFloat(o.total as string),
        subtotal: parseFloat(o.subtotal as string),
        itemCount: (o.items as unknown[]).length,
        items: o.items,
        createdAt: o.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.put("/admin/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [order] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    res.json({ ...order, total: parseFloat(order.total as string) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// ─── Categories ──────────────────────────────────────────────────────────────

router.get("/admin/categories", adminAuth, async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list categories" });
  }
});

router.post("/admin/categories", adminAuth, async (req, res) => {
  try {
    const { name, slug, description, imageUrl } = req.body;
    const [cat] = await db
      .insert(categoriesTable)
      .values({ name, slug, description, imageUrl })
      .returning();
    res.status(201).json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/admin/categories/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// ─── Inventory ───────────────────────────────────────────────────────────────

router.get("/admin/inventory", adminAuth, async (_req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(productsTable.stockCount);

    res.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        stockCount: p.stockCount,
        inStock: p.inStock,
        price: parseFloat(p.price as string),
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get inventory" });
  }
});

router.patch("/admin/inventory/:id", adminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { stockCount, inStock } = req.body;
    const [product] = await db
      .update(productsTable)
      .set({ stockCount: Number(stockCount), inStock: Boolean(inStock) })
      .where(eq(productsTable.id, id))
      .returning();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

export default router;
