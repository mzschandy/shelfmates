import { serverClient } from "@/utils/server";
import EbookReader from "@/components/reader/ebook-reader";

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

  return (
    <div>
       <EbookReader session={session.data.session} bookUrl={session.data.epubUrl.signedUrl} />
    </div>
  );
}
