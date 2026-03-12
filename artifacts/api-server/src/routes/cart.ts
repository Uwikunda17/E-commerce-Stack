import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";

const router: IRouter = Router();

async function buildCart(sessionId: string) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const cartItems = items.map((i) => ({
    id: i.cart_items.id,
    productId: i.cart_items.productId,
    productName: i.products?.name ?? "",
    productBrand: i.products?.brand ?? "",
    productImage: ((i.products?.images as string[]) ?? [])[0] ?? "",
    price: parseFloat(i.cart_items.price as string),
    size: i.cart_items.size,
    color: i.cart_items.color,
    quantity: i.cart_items.quantity,
  }));

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    sessionId,
    items: cartItems,
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}

router.get("/cart", async (req, res) => {
  try {
    const { sessionId } = req.query as { sessionId: string };
    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }
    const cart = await buildCart(sessionId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get cart" });
  }
});

router.post("/cart/items", async (req, res) => {
  try {
    const { sessionId, productId, size, color, quantity } = req.body;

    const product = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, productId))
      .limit(1);

    if (product.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const existing = await db
      .select()
      .from(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.sessionId, sessionId),
          eq(cartItemsTable.productId, productId),
          eq(cartItemsTable.size, size),
          eq(cartItemsTable.color, color)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(cartItemsTable)
        .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
        .where(eq(cartItemsTable.id, existing[0].id));
    } else {
      await db.insert(cartItemsTable).values({
        sessionId,
        productId,
        size,
        color,
        quantity,
        price: product[0].price,
      });
    }

    const cart = await buildCart(sessionId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

router.put("/cart/items/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { sessionId, quantity } = req.body;

    if (quantity <= 0) {
      await db
        .delete(cartItemsTable)
        .where(
          and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId))
        );
    } else {
      await db
        .update(cartItemsTable)
        .set({ quantity, updatedAt: new Date() })
        .where(
          and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId))
        );
    }

    const cart = await buildCart(sessionId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update cart item" });
  }
});

router.delete("/cart/items/:itemId", async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { sessionId } = req.query as { sessionId: string };

    await db
      .delete(cartItemsTable)
      .where(
        and(eq(cartItemsTable.id, itemId), eq(cartItemsTable.sessionId, sessionId))
      );

    const cart = await buildCart(sessionId);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove cart item" });
  }
});

export default router;
