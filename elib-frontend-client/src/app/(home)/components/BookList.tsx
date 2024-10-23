import { Book } from "@/types";
import React from "react";
import BookCard from "./BookCard";

const BookList = ({ books }: { books: { book: Book[] } }) => {
  console.log("Recieved Books ", books);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-7xl mx-auto">
      {books.book.map((book) => (
        <BookCard key={book._id} book={book} />
      ))}
    </div>
  );
};

export default BookList;
