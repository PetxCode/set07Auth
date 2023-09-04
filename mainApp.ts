import express, { Application, Request, Response } from "express";
import cors from "cors";
import user from "./router/userRouter";

export const mainApp = (app: Application) => {
  app.use(express.json());
  app.use(cors());

  app.set("view engine", "ejs");

  app.use("/api/v1", user);

  app.get("/", (req: Request, res: Response) => {
    try {
      const data = {
        name: "Paul",
        email: "peter@test.com",
        url: "https//google.com",
      };
      return res.status(200).render("index", data);
    } catch (error) {
      return res.status(404).json({
        message: "Error Found",
      });
    }
  });
};
