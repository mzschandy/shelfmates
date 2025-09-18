"use client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { getBookContent, getBookQuery } from "@/lib/open-library";

export interface BookProps {
  title: string;
  author: string;
  description?: string;
}

export default function SessionMetadata({
  bookProps,
}: {
  bookProps: BookProps;
}) {
  const { data: bookData, isLoading } = useQuery({
    queryKey: ["session", bookProps.title],
    queryFn: async () => {
      const data = await getBookQuery(bookProps.title, bookProps.author);
      if (!data || !data.docs) {
        return null;
      }

      const key = data.docs[0]?.key;
      if (!key) {
        return null;
      }

      const bookContent = await getBookContent(key);
      if (!bookContent) {
        return null;
      }

      return bookContent;
    },
  });

  if (isLoading) {
    return <div>Loading Book Information</div>;
  }

  if (!bookData) {
    return <div>Could not fetch book data</div>;
  }

  return (
    <>
      <div>
        <div>
          <div className="text-xs">Our Rating: 3/5</div>
          <div className="text-3xl">{bookData?.title}</div>
          <div className="text-sm">{bookProps.author}</div>
          <div className="w-[200px] h-[310px] bg-gray-600"></div>
        </div>
        <div className="mt-2">
          <Button className="w-full">Read</Button>
        </div>
      </div>
      <div className="ml-8">
        <div className="text-lg font-bold">Description</div>
        <div>
          {bookData?.description ? bookData.description : bookProps.description}
        </div>
      </div>
    </>
  );
}
