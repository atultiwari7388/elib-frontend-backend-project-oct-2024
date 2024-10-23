import { Book } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const BookCard = ({ book }: { book: Book }) => {
  return (
    <div className="flex gap-5 border p-5 shadow-md rounded">
      <Image
        src={book.coverImage}
        alt={book.title}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "auto", height: "12rem" }}
      />
      <div>
        <h2 className="line-clamp-2 text-lg font-bold text-red-600 text-balance">
          {book.title}
        </h2>
        <p className="font-bold text-red-900 mt-1">{book.author.name}</p>
        <Link
          href={`/book/${book._id}`}
          className="py-1 px-2 rounded text-red-400 font-medium border border-red-600 text-sm mt-4 inline-block hover:border-red-500 hover:bg-red-100 transition"
        >
          Read more
        </Link>
      </div>
    </div>
  );
};
export default BookCard;
