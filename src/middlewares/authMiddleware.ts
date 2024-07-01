import { NextFunction, Request, Response } from "express";
import { CustomError } from "./error";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const ad_access = req.cookies.ad_access;
  if (!ad_access) {
    throw new CustomError(401, "You are not authenticated!");
  }
  try {
    const decoded = jwt.verify(ad_access, process.env.JWT_SECRET as string);
    req.userId = (decoded as JwtPayload)._id;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
