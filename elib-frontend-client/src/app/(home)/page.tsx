import Banner from "@/app/(home)/components/Banner";
import BookList from "./components/BookList";

export default async function Home() {
  // Log to check if the backend URL is correctly set
  console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);

  // Fetching data from backend
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/books`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("An Error Occurred while fetching the books");
  }

  const data = await response.json();

  console.log("Full API response:", data);

  return (
    <>
      <Banner />
      <BookList books={data} />
    </>
  );
}
