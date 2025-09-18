"use client";

import Link from "next/link";

export default function BookClub({
  club,
}: {
  club: {
    id: string;
    title: string;
    createdAt: string;
    description: string | null;
    isPublic: boolean;
    creatorId: string;
    threadId: string[];
  };
}) {
  console.log("Club data:", club);

  if (!club) {
    return <div>Error displaying club</div>;
  }

  const createParam = () => {
    const title = club.title.toLowerCase().split(" ");
    if (title.length > 1) {
      return title.join("-");
    }
    return title;
  };

  console.log("create params", createParam());

  return (
    <Link href={`/club/${createParam()}`} className="no-underline">
      <div className="border rounded-sm p-4 w-auto flex flex-col">
        <div className="size-48 bg-gray-500"></div>
        <div className="flex flex-col mt-2">
          <div className="text-xs text-gray-500">
            {club.creatorId} is hosting
          </div>
          <div className="text-lg font-bold">{club.title}</div>
          <div className="text-sm text-gray-500">
            {club.description || "No description available"}
          </div>
        </div>
      </div>
    </Link>
  );
}
