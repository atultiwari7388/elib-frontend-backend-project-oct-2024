import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
   const { name, email, password } = req.body;

   //validation
   if (!name || !email || !password) {
      const err = createHttpError(400, "All Fields are required");
      return next(err);
   }

   //database call
   try {
      const user = await userModel.findOne({ email });
      if (user) {
         const error = createHttpError(
            400,
            "User Already exists with this email"
         );
         return next(error);
      }
   } catch (error) {
      return next(createHttpError(500, "Error while getting user"));
   }

   //password-hashed
   const hashedPassword = await bcrypt.hash(password, 10);
   let newUser: User;
   try {
      newUser = await userModel.create({
         name,
         email,
         password: hashedPassword,
      });
   } catch (error) {
      return next(createHttpError(500, "Error While creating user"));
   }

   //token generation
   try {
      const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
         expiresIn: "7d",
         algorithm: "HS256",
      });
      //response
      res.json({ accessToken: token });
   } catch (error) {
      return next(createHttpError(500, "Error while signing the jwt token"));
   }
};

export { createUser };
