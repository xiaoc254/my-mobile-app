import jwt from "jsonwebtoken";
import { config } from "../../env.config.js";

export function signToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}
