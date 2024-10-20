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
      console.error("Error while getting user:", error);
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
      console.error("Error in createUser:", error);
      return next(createHttpError(500, "Error While creating user"));
   }

   //token generation
   try {
      const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
         expiresIn: "7d",
         algorithm: "HS256",
      });
      //response
      res.status(201).json({ accessToken: token });
   } catch (error) {
      console.error("Error in signin the jwt token:", error);
      return next(createHttpError(500, "Error while signing the jwt token"));
   }
};

// const loginUser = async (req: Request, res: Response, next: NextFunction) => {
//    const { email, password } = req.body;

//    //validation
//    if (!email || !password) {
//       const err = createHttpError(400, "All Fields are required");
//       return next(err);
//    }

//    //check users exists i db or not

//    const user = await userModel.findOne({ email });

//    if (!user) {
//       return next(createHttpError(404, "User not found!"));
//    }

//    const isMatch = await bcrypt.compare(password, user.password);
//    if (!isMatch) {
//       return next(createHttpError(400, "Username or password incorrect"));
//    }

//    //create accesstoekn
//    const token = sign({ sub: user._id }, config.jwtSecret as string, {
//       expiresIn: "7d",
//       algorithm: "HS256",
//    });
//    //response
//    res.json({ accessToken: token });
// };

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
   const { email, password } = req.body;

   // Validation
   if (!email || !password) {
      return next(createHttpError(400, "All Fields are required"));
   }

   try {
      // Check if user exists in the database
      const userExists = await userModel.findOne({ email });

      if (!userExists) {
         return next(createHttpError(404, "User not found!"));
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, userExists.password);
      if (!isMatch) {
         return next(createHttpError(400, "Username or password incorrect"));
      }

      // Create access token
      const token = sign({ sub: userExists._id }, config.jwtSecret as string, {
         expiresIn: "7d",
         algorithm: "HS256",
      });

      // Successful response
      res.status(200).json({ accessToken: token });
   } catch (error) {
      console.error("Error during login process:", error);
      return next(createHttpError(500, "Internal Server Error"));
   }
};

export { createUser, loginUser };
