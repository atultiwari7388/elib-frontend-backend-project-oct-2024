import { NextFunction, Request, Response } from "express";
import cloudinary from "./../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModels from "./bookModels";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
   const { title, genre } = req.body;
   //  console.log("files", req.files);

   const files = req.files as { [fieldName: string]: Express.Multer.File[] };

   const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
   const fileName = files.coverImage[0].filename;
   const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
   );

   try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
         filename_override: fileName,
         folder: "book-covers",
         format: coverImageMimeType,
      });

      const bookFileName = files.file[0].filename;
      const bookFilePath = path.resolve(
         __dirname,
         "../../public/data/uploads",
         bookFileName
      );

      const bookFileUploadResult = await cloudinary.uploader.upload(
         bookFilePath,
         {
            resource_type: "raw",
            filename_override: bookFileName,
            folder: "book-pdfs",
            format: "pdf",
         }
      );

      console.log("bookFileUploadResult", bookFileUploadResult);
      console.log("uploadresult", uploadResult);

      //create new book
      const newBook = await bookModels.create({
         title,
         genre,
         author: "6714ae3f110cb54c5e83ce04",
         coverImage: uploadResult.secure_url,
         file: bookFileUploadResult.secure_url,
      });

      try {
         //delete temp files
         await fs.promises.unlink(filePath);
         await fs.promises.unlink(bookFilePath);
      } catch (error) {
         console.log(error);
         return next(createHttpError(500, "Delete temp file issue"));
      }

      res.status(201).json({ id: newBook._id });
   } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error While Uploading the files"));
   }
};

export { createBook };