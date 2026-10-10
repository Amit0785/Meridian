import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_JWT_SECRET =
  process.env.REFRESH_JWT_SECRET || "your-refresh-secret-key";

export interface Payload {
  id: string;
  email: string;
}

export const generateToken = (
  user: { _id: string; email: string },
  expiresIn: jwt.SignOptions["expiresIn"] = "15m",
): string => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn,
  });
};

export const generateRefreshToken = (user: {
  _id: string;
  email: string;
}): string => {
  return jwt.sign({ id: user._id, email: user.email }, REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): Payload => {
  return jwt.verify(token, JWT_SECRET) as Payload;
};

export const verifyRefreshToken = (token: string): Payload => {
  return jwt.verify(token, REFRESH_JWT_SECRET) as Payload;
};
