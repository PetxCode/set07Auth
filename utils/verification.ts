import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

export const verification = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (token) {
      const realToken = token.split(" ")[1];
      if (realToken) {
        jwt.verify(realToken, "secret", (err, payload: any) => {
          if (err) {
            return res.status(404).json({
              message: "Error found",
              data: err,
            });
          } else {
            if (payload.email === "peter@test.com") {
              next();
            } else {
              return res.status(404).json({
                message: "You right is limited",
              });
            }
          }
        });
      } else {
        return res.status(404).json({
          message: "Invalid token!!!",
        });
      }
    } else {
      return res.status(404).json({
        message: "Please check your Token, something could be wrong with it!!!",
      });
    }
  } catch (error) {
    return res.status(404).json({
      message: "You do not have access to this part",
    });
  }
};
