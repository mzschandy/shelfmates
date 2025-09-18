"use client";

export default function Thread() {
  return (
    <>
      <div className="flex flex-col border border-gray-300 bg-gray-300 rounded-sm p-4 mb-4 cursor-pointer">
        <div className="text-lg">General Discussion</div>
        <div className="">
          Username: This is an initial comment that serves as a preview of
          sorts. You are not meant to see the whole thing
        </div>
        <div className="text-sm">52 Comments</div>
      </div>
    </>
  );
}
