import { Request, Response } from "express";

export const signIn = (req: Request, res: Response): void => {
  console.log("body", req.body);
  res.json({ message: "Source API is working with TypeScript 24!" });
};
