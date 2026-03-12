import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, and, gte, lte, like, sql, inArray } from "drizzle-orm";

const router: IRouter = Router();

router.get("/products", async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      search,
      featured,
      limit = "20",
      offset = "0",
    } = req.query as Record<string, string>;

    const conditions: ReturnType<typeof eq>[] = [];

    if (category) {
      const cat = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(eq(categoriesTable.slug, category))
        .limit(1);
      if (cat.length > 0) {
        conditions.push(eq(productsTable.categoryId, cat[0].id));
      }
    }

    if (brand) {
      conditions.push(like(productsTable.brand, `%${brand}%`));
    }

    if (minPrice) {
      conditions.push(gte(productsTable.price, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(productsTable.price, maxPrice));
    }

    if (search) {
      conditions.push(
        sql`(${productsTable.name} ILIKE ${"%" + search + "%"} OR ${productsTable.brand} ILIKE ${"%" + search + "%"} OR ${productsTable.description} ILIKE ${"%" + search + "%"})`
      );
    }

    if (featured === "true") {
      conditions.push(eq(productsTable.featured, true));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [products, totalResult] = await Promise.all([
      db
        .select()
        .from(productsTable)
        .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
        .where(where)
        .limit(parseInt(limit))
        .offset(parseInt(offset)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(productsTable)
        .where(where),
    ]);

    let filtered = products;
    if (size) {
      filtered = filtered.filter((p) =>
        (p.products.sizes as string[]).includes(size)
      );
    }
    if (color) {
      filtered = filtered.filter((p) =>
        (p.products.colors as string[]).some((c) =>
          c.toLowerCase().includes(color.toLowerCase())
        )
      );
    }

    const result = filtered.map((p) => ({
      id: p.products.id,
      name: p.products.name,
      brand: p.products.brand,
      description: p.products.description,
      price: parseFloat(p.products.price as string),
      originalPrice: p.products.originalPrice ? parseFloat(p.products.originalPrice as string) : null,
      categoryId: p.products.categoryId,
      categoryName: p.categories?.name ?? "",
      images: p.products.images as string[],
      sizes: p.products.sizes as string[],
      colors: p.products.colors as string[],
      material: p.products.material,
      inStock: p.products.inStock,
      stockCount: p.products.stockCount,
      featured: p.products.featured,
      rating: p.products.rating ? parseFloat(p.products.rating as string) : null,
      reviewCount: p.products.reviewCount,
      tags: p.products.tags as string[],
      createdAt: p.products.createdAt.toISOString(),
    }));

    res.json({
      products: result,
      total: Number(totalResult[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db
      .select()
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (result.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const p = result[0];
    res.json({
      id: p.products.id,
      name: p.products.name,
      brand: p.products.brand,
      description: p.products.description,
      price: parseFloat(p.products.price as string),
      originalPrice: p.products.originalPrice ? parseFloat(p.products.originalPrice as string) : null,
      categoryId: p.products.categoryId,
      categoryName: p.categories?.name ?? "",
      images: p.products.images as string[],
      sizes: p.products.sizes as string[],
      colors: p.products.colors as string[],
      material: p.products.material,
      inStock: p.products.inStock,
      stockCount: p.products.stockCount,
      featured: p.products.featured,
      rating: p.products.rating ? parseFloat(p.products.rating as string) : null,
      reviewCount: p.products.reviewCount,
      tags: p.products.tags as string[],
      createdAt: p.products.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get product" });
  }
});

export default router;
