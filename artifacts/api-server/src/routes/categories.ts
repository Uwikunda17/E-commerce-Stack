import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  try {
    const categories = await db.select().from(categoriesTable);
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list categories" });
  }
});

export default router;
