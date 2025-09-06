// ESM helper that works with your CommonJS models
import bcrypt from "bcryptjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const User = require("../models/User");

export default async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠ ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin creation");
    return;
  }

  let user = await User.findOne({ email });
  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      name: "Admin",
      email,
      password: hashed,
      role: "admin",
      isVerified: true,
      status: "ACTIVE",
    });
    console.log("✔ Admin user created:", email);
  } else {
    let changed = false;
    if (user.role !== "admin") { user.role = "admin"; changed = true; }
    if (!user.isVerified) { user.isVerified = true; changed = true; }
    if (user.status !== "ACTIVE") { user.status = "ACTIVE"; changed = true; }
    if (changed) { await user.save(); console.log("✔ Admin user normalized:", email); }
    else { console.log("✔ Admin user present:", email); }
  }
}
