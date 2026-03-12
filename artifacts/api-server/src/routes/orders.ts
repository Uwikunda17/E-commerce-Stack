import { Router, type IRouter } from "express";
import { db, ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.post("/orders", async (req, res) => {
  try {
    const {
      sessionId,
      customerEmail,
      customerName,
      shippingAddress,
      shippingCity,
      shippingZip,
      shippingCountry,
      paymentMethod,
    } = req.body;

    const cartItems = await db
      .select()
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (cartItems.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    const items = cartItems.map((i) => ({
      productId: i.cart_items.productId,
      productName: i.products?.name ?? "",
      productBrand: i.products?.brand ?? "",
      productImage: ((i.products?.images as string[]) ?? [])[0] ?? "",
      price: parseFloat(i.cart_items.price as string),
      size: i.cart_items.size,
      color: i.cart_items.color,
      quantity: i.cart_items.quantity,
    }));

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const total = Math.round(subtotal * 100) / 100;

    const [order] = await db
      .insert(ordersTable)
      .values({
        sessionId,
        customerEmail,
        customerName,
        shippingAddress,
        shippingCity,
        shippingZip,
        shippingCountry,
        paymentMethod,
        status: "confirmed",
        subtotal: subtotal.toFixed(2),
        total: total.toFixed(2),
        items,
      })
      .returning();

    await db
      .delete(cartItemsTable)
      .where(eq(cartItemsTable.sessionId, sessionId));

    res.status(201).json({
      id: order.id,
      sessionId: order.sessionId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingZip: order.shippingZip,
      shippingCountry: order.shippingCountry,
      paymentMethod: order.paymentMethod,
      status: order.status,
      subtotal: parseFloat(order.subtotal as string),
      total: parseFloat(order.total as string),
      items: order.items as typeof items,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (result.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const o = result[0];
    res.json({
      id: o.id,
      sessionId: o.sessionId,
      customerEmail: o.customerEmail,
      customerName: o.customerName,
      shippingAddress: o.shippingAddress,
      shippingCity: o.shippingCity,
      shippingZip: o.shippingZip,
      shippingCountry: o.shippingCountry,
      paymentMethod: o.paymentMethod,
      status: o.status,
      subtotal: parseFloat(o.subtotal as string),
      total: parseFloat(o.total as string),
      items: o.items,
      createdAt: o.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get order" });
  }
});

export default router;
