import { Request, Response, NextFunction } from "express";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "luxe-admin-2024";

export function generateAdminToken(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    return Buffer.from(`luxe:${ADMIN_PASSWORD}:admin`).toString("base64");
  }
  return null;
}

export function validateAdminToken(token: string): boolean {
  const expected = Buffer.from(`luxe:${ADMIN_PASSWORD}:admin`).toString("base64");
  return token === expected;
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["x-admin-token"] as string;
  if (!token || !validateAdminToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
