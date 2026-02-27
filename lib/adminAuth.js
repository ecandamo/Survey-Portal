import bcrypt from "bcryptjs";

export async function verifyAdmin(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  if (!hash) return false;
  return bcrypt.compare(password || "", hash);
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}
