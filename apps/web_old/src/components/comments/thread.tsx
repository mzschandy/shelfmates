"use client";

import Link from "next/link";

export default function Thread({
  id,
  title,
  clubTitle,
  description,
  comments,
}: {
  id: string;
  title: string;
  clubTitle: string;
  description: string | null;
  comments: number;
}) {
  const createParam = () => {
    const title = clubTitle.toLowerCase().split(" ");
    if (title.length > 1) {
      return title.join("-");
    }
    return title;
  };
  return (
    <Link
      href={`/club/${createParam()}/thread/${id}`}
      className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer"
    >
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">{title}</div>
        <div className="">{description ?? ""}</div>
        <div className="text-sm">{comments} Comments</div>
      </div>
    </Link>
  );
}
