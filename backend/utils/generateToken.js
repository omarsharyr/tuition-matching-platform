// backend/utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateToken = (payload, secret, expiresIn = "7d") =>
  jwt.sign(payload, secret, { expiresIn });
