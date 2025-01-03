import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization as unknown as string;

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload) {
      //@ts-ignore
      req.id = payload.id;
    }
  } catch (error) {
    res.status(500).json({
      message: "You are not loged in",
    });

    return;
  }

  next();
};
