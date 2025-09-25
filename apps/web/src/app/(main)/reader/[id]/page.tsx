import Epub, { Book } from "epubjs";
import { serverClient } from "@/utils/server";
import EbookReader from "@/components/reader/ebook-reader";

// type ReaderSessionResponse = { error: string } | {data: }

const getReaderSession = async (sessionId: string) => {
  const res = await serverClient.api.reader[":id"].$get({
    param: {
      id: sessionId,
    },
  });

  if (!res.ok) {
    throw new Error("Could not get reader");
  }

  const session = await res.json();

  if ("error" in session) {
    throw new Error("Could not get session");
  }

  return { session };
};

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const {session} = await getReaderSession(id);
  console.log("readerSession", session.data);
  // const bookUrl = readerSession?.data?.epubUrl;

  // if (!bookUrl) {
  //   throw new Error("error");
  // }
  // const book = new Book(bookUrl.signedUrl);
  // const rendition = book.renderTo('area', {width: 600, height: 400})
  // const displayed = rendition.display();
  return (
    <div>
      <div>This is the reader</div>
       <EbookReader session={session.data.session} bookUrl={session.data.epubUrl.signedUrl} />
    </div>
  );
}
