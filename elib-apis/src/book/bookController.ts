import { NextFunction, Request, Response } from "express";
import cloudinary from "./../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModels from "./bookModels";
import fs from "node:fs";
import mongoose from "mongoose";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
   const { title, genre, description } = req.body;
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

      // console.log("bookFileUploadResult", bookFileUploadResult);
      // console.log("uploadresult", uploadResult);
      // // @ts-ignore
      // console.log("userId", req.userId);

      const _req = req as AuthRequest;
      //create new book
      const newBook = await bookModels.create({
         title,
         description,
         genre,
         author: _req.userId,
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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
   const { title, genre } = req.body;
   const bookId = req.params.bookId;

   const book = await bookModels.findOne({ _id: bookId });

   if (!book) {
      return next(createHttpError(404, "Book not Found"));
   }

   const _req = req as AuthRequest;
   //Access checking
   if (book.author.toString() != _req.userId) {
      return next(createHttpError(403, "You can not update others book"));
   }

   //check if image field is exists
   const files = req.files as { [fieldName: string]: Express.Multer.File[] };
   let completeCoverImage = "";
   if (files.coverImage) {
      const fileName = files.coverImage[0].filename;
      const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);

      //send files to cloudniary

      const filePath = path.resolve(
         __dirname,
         "../../public/data/uploads/" + fileName
      );

      completeCoverImage = fileName;
      const uploadResult = await cloudinary.uploader.upload(filePath, {
         filename_override: completeCoverImage,
         folder: "book-covers",
         format: converMimeType,
      });

      completeCoverImage = uploadResult.secure_url;
      await fs.promises.unlink(filePath);
   }

   //check if file field is exists
   let completeFileName = "";
   if (files.file) {
      const bookFilePath = path.resolve(
         __dirname,
         "../../public/data/uploads" + files.file[0].filename
      );

      const bookFileName = files.file[0].filename;
      completeFileName = bookFileName;

      const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
         resource_type: "raw",
         filename_override: completeFileName,
         folder: "book-pdfs",
         format: "pdf",
      });

      completeFileName = uploadResultPdf.secure_url;
      await fs.promises.unlink(bookFilePath);
   }

   const updateBook = await bookModels.findOneAndUpdate(
      {
         _id: bookId,
      },
      {
         title: title,
         genre: genre,
         coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
         file: completeFileName ? completeFileName : book.file,
      },
      { new: true }
   );

   res.json(updateBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
   try {
      //todo add pagination
      const book = await bookModels.find().populate("author", "name");
      res.json({ book });
   } catch (error) {
      console.error(error);
      return next(createHttpError(500, "Error while getting a book"));
   }
};

const getSingleBook = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const { bookId } = req.params;

   // Validate bookId
   if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next(createHttpError(400, "Invalid book ID format."));
   }

   try {
      const book = await bookModels.findById(bookId).populate("author", "name");

      if (!book) {
         return next(createHttpError(404, "Book not found."));
      }

      res.json({ book });
   } catch (error) {
      console.error("Error fetching book:", error);
      return next(
         createHttpError(500, "Internal server error while fetching the book.")
      );
   }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
   const { bookId } = req.params;

   // Validate bookId
   if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return next(createHttpError(400, "Invalid book ID format."));
   }

   const book = await bookModels.findById(bookId);

   if (!book) {
      return next(createHttpError(404, "Book not found."));
   }

   //check access
   const _req = req as AuthRequest;
   if (book.author.toString() != _req.userId) {
      return next(createHttpError(403, "You can not update others book"));
   }

   //for png image
   const coverFileSplit = book.coverImage.split("/");

   const coverImagePublicId =
      coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split(".").at(-2);

   // await cloudinary.uploader.destroy()
   // console.log("coverImagePublicId", coverImagePublicId);

   //for pdf file
   const bookFileSplits = book.file.split("/");
   const bookFiledPublicId =
      bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
   // console.log("bookFiledPublicId", bookFiledPublicId);
   //todo: add try catch block
   await cloudinary.uploader.destroy(coverImagePublicId);
   await cloudinary.uploader.destroy(bookFiledPublicId, {
      resource_type: "raw",
   });

   await bookModels.deleteOne({ _id: bookId });

   // res.json({ id: bookId });
   res.sendStatus(204);
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
