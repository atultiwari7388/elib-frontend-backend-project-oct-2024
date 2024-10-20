import express from "express";
import { createBook } from "./bookController";
import multer from "multer";
import path from "node:path";

const bookRouter = express.Router();

//file store local ->
const upload = multer({
   dest: path.resolve(__dirname, "../../public/data/uploads"),
   //put limit 10 mb
   limits: { fileSize: 1e7 }, //30mb
});

//routes
bookRouter.post(
   "/",
   upload.fields([
      { name: "coverImage", maxCount: 1 },
      { name: "file", maxCount: 1 },
   ]),
   createBook
);

export default bookRouter;